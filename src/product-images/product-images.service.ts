import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductImage } from './entities/product-image.entity';
import { Product } from '../products/entities/product.entity';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';

@Injectable()
export class ProductImagesService {
  constructor(
    @InjectRepository(ProductImage)
    private productImagesRepository: Repository<ProductImage>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findByProduct(productId: number) {
    await this.ensureProductExists(productId);
    return this.productImagesRepository.find({
      where: { product: { id: productId } },
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });
  }

  async findOne(id: number) {
    const image = await this.productImagesRepository.findOne({
      where: { id },
      relations: { product: true },
    });
    if (!image) throw new NotFoundException(`Product image ${id} not found`);
    return image;
  }

  async create(productId: number, dto: CreateProductImageDto) {
    const product = await this.ensureProductExists(productId);

    if (dto.isPrimary) {
      await this.productImagesRepository.update(
        { product: { id: productId } },
        { isPrimary: false },
      );
    }

    const image = this.productImagesRepository.create({
      ...dto,
      product,
    });

    return this.productImagesRepository.save(image);
  }

  async update(id: number, dto: UpdateProductImageDto) {
    const image = await this.findOne(id);

    if (dto.isPrimary) {
      await this.productImagesRepository.update(
        { product: { id: image.product.id } },
        { isPrimary: false },
      );
    }

    Object.assign(image, dto);
    return this.productImagesRepository.save(image);
  }

  async remove(id: number) {
    const image = await this.findOne(id);
    return this.productImagesRepository.remove(image);
  }

  private async ensureProductExists(productId: number) {
    const product = await this.productsRepository.findOneBy({ id: productId });
    if (!product) throw new NotFoundException(`Product ${productId} not found`);
    return product;
  }
}
