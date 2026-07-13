import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ProductImagesService } from './product-images.service';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('product images')
@Controller('products/:productId/images')
export class ProductImagesController {
  constructor(private readonly productImagesService: ProductImagesService) {}

  @ApiOperation({ summary: 'List images for a product' })
  @ApiParam({ name: 'productId', example: 1 })
  @ApiOkResponse({ description: 'Product images returned.' })
  @Get()
  findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.productImagesService.findByProduct(productId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a product image as admin or agent' })
  @ApiParam({ name: 'productId', example: 1 })
  @ApiCreatedResponse({ description: 'Image created for the product.' })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid, or expired JWT.' })
  @ApiForbiddenResponse({ description: 'Requires admin or agent role.' })
  @ApiNotFoundResponse({ description: 'Product not found.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Agent)
  @Post()
  create(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: CreateProductImageDto,
  ) {
    return this.productImagesService.create(productId, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product image as admin or agent' })
  @ApiParam({ name: 'productId', example: 1 })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Image updated.' })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid, or expired JWT.' })
  @ApiForbiddenResponse({ description: 'Requires admin or agent role.' })
  @ApiNotFoundResponse({ description: 'Image not found.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Agent)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductImageDto,
  ) {
    return this.productImagesService.update(id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product image as admin or agent' })
  @ApiParam({ name: 'productId', example: 1 })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Image deleted.' })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid, or expired JWT.' })
  @ApiForbiddenResponse({ description: 'Requires admin or agent role.' })
  @ApiNotFoundResponse({ description: 'Image not found.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Agent)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productImagesService.remove(id);
  }
}
