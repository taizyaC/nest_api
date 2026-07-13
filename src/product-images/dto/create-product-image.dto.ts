import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateProductImageDto {
  @ApiProperty({
    example: 'https://cdn.example.com/products/wireless-headphones.jpg',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  url!: string;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
