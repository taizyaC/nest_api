import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from '../common/enums/order-status.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  findAll() {
    return this.ordersRepository.find({
      relations: { items: { product: true } },
      order: { createdAt: 'DESC' },
    });
  }

  findByUser(userId: number) {
    return this.ordersRepository.find({
      where: { userId },
      relations: { items: { product: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: { items: { product: true } },
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async findOneForUser(id: number, userId: number) {
    const order = await this.findOne(id);
    if (order.userId !== userId) {
      throw new ForbiddenException('You can only view your own orders');
    }
    return order;
  }

  async create(userId: number, dto: CreateOrderDto) {
    if (!dto.items.length) {
      throw new BadRequestException('Order must contain at least one item');
    }

    return this.dataSource.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);
      const orderRepo = manager.getRepository(Order);
      const orderItemRepo = manager.getRepository(OrderItem);

      const orderItems: OrderItem[] = [];
      let totalAmount = 0;

      for (const item of dto.items) {
        const product = await productRepo.findOne({
          where: { id: item.productId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product || !product.isActive) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }

        if (product.stockQuantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${product.name}`,
          );
        }

        product.stockQuantity -= item.quantity;
        await productRepo.save(product);

        const unitPrice = Number(product.price);
        totalAmount += unitPrice * item.quantity;

        orderItems.push(
          orderItemRepo.create({
            product,
            quantity: item.quantity,
            unitPrice,
          }),
        );
      }

      const order = orderRepo.create({
        userId,
        status: OrderStatus.PENDING,
        totalAmount,
        shippingAddress: dto.shippingAddress,
        items: orderItems,
      });

      return orderRepo.save(order);
    });
  }

  async update(id: number, userId: number, dto: UpdateOrderDto) {
    const order = await this.findOne(id);

    if (order.userId !== userId) {
      throw new ForbiddenException('You can only update your own orders');
    }

    if (dto.status) {
      if (
        order.status !== OrderStatus.PENDING &&
        dto.status === OrderStatus.CANCELLED
      ) {
        throw new BadRequestException('Only pending orders can be cancelled');
      }
      order.status = dto.status;

      if (dto.status === OrderStatus.CANCELLED) {
        await this.restoreStock(order);
      }
    }

    if (dto.shippingAddress !== undefined) {
      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestException(
          'Shipping address can only be updated for pending orders',
        );
      }
      order.shippingAddress = dto.shippingAddress;
    }

    return this.ordersRepository.save(order);
  }

  async remove(id: number, userId: number) {
    const order = await this.findOne(id);

    if (order.userId !== userId) {
      throw new ForbiddenException('You can only delete your own orders');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Only pending orders can be deleted');
    }

    await this.restoreStock(order);
    return this.ordersRepository.remove(order);
  }

  private async restoreStock(order: Order) {
    for (const item of order.items) {
      const product = await this.productsRepository.findOneBy({
        id: item.product.id,
      });
      if (product) {
        product.stockQuantity += item.quantity;
        await this.productsRepository.save(product);
      }
    }
  }
}
