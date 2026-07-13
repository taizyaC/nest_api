import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'electronics', maxLength: 120 })
  @IsString()
  @MaxLength(120)
  slug!: string;

  @ApiPropertyOptional({ example: 'Devices, accessories, and gadgets.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Optional parent category id for nested categories.',
  })
  @IsOptional()
  @IsInt()
  parentId?: number;
}
