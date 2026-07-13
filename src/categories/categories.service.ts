import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  findAll() {
    return this.categoriesRepository.find({
      relations: { parent: true, children: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number) {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: { parent: true, children: true, products: true },
    });
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const category = this.categoriesRepository.create({
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
    });

    if (dto.parentId) {
      const parent = await this.categoriesRepository.findOneBy({
        id: dto.parentId,
      });
      if (!parent)
        throw new NotFoundException(
          `Parent category ${dto.parentId} not found`,
        );
      category.parent = parent;
    }

    return this.categoriesRepository.save(category);
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
      if (dto.parentId === null || dto.parentId === 0) {
        category.parent = null as unknown as Category;
      } else {
        const parent = await this.categoriesRepository.findOneBy({
          id: dto.parentId,
        });
        if (!parent)
          throw new NotFoundException(
            `Parent category ${dto.parentId} not found`,
          );
        category.parent = parent;
      }
    }

    Object.assign(category, {
      name: dto.name ?? category.name,
      slug: dto.slug ?? category.slug,
      description: dto.description ?? category.description,
    });

    return this.categoriesRepository.save(category);
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    return this.categoriesRepository.remove(category);
  }
}
