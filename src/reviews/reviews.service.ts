import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Product } from '../products/entities/product.entity';
import { CreateReviewDto } from './DTO/create-review.dto';
import { UpdateReviewDto } from './DTO/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  findAll() {
    return this.reviewsRepository.find({
      relations: { product: true, user: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: { product: true, user: true },
    });
    if (!review) throw new NotFoundException(`Review ${id} not found`);
    return review;
  }

  async findByProduct(productId: number) {
    const product = await this.productsRepository.findOneBy({ id: productId });
    if (!product) throw new NotFoundException(`Product ${productId} not found`);

    return this.reviewsRepository.find({
      where: { product: { id: productId } },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: number) {
    return this.reviewsRepository.find({
      where: { user: { id: userId } },
      relations: { product: true },
      order: { createdAt: 'DESC' },
    });
  }

  async create(userId: number, dto: CreateReviewDto) {
    const product = await this.productsRepository.findOneBy({
      id: dto.productId,
    });
    if (!product)
      throw new NotFoundException(`Product ${dto.productId} not found`);

    const existingReview = await this.reviewsRepository.findOne({
      where: {
        product: { id: dto.productId },
        user: { id: userId },
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product');
    }

    const review = this.reviewsRepository.create({
      rating: dto.rating,
      comment: dto.comment,
      product,
      user: { id: userId },
    });

    return this.reviewsRepository.save(review);
  }

  async update(id: number, userId: number, dto: UpdateReviewDto) {
    const review = await this.findOne(id);

    if (review.user.id !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    Object.assign(review, dto);
    return this.reviewsRepository.save(review);
  }

  async remove(id: number, userId: number) {
    const review = await this.findOne(id);

    if (review.user.id !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    return this.reviewsRepository.remove(review);
  }

  async getAverageRating(productId: number) {
    const result = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .where('review.product_id = :productId', { productId })
      .getRawOne<{ average: string | null }>();

    return result?.average ? parseFloat(result.average) : 0;
  }

  async getReviewCount(productId: number) {
    return this.reviewsRepository.count({
      where: { product: { id: productId } },
    });
  }
}
