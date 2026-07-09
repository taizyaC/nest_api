import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 120, unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @ManyToOne(() => Category, (category) => category.children, { nullable: true })
  parent!: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children!: Category[];

  @OneToMany(() => Product, (product) => product.category)
  products!: Product[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}