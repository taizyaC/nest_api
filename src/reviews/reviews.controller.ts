import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
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
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './DTO/create-review.dto';
import { UpdateReviewDto } from './DTO/update-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @ApiOperation({ summary: 'List all reviews' })
  @ApiOkResponse({
    description: 'Reviews returned with product and user data.',
  })
  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  @ApiOperation({ summary: 'List reviews for a product' })
  @ApiParam({ name: 'productId', example: 1 })
  @ApiOkResponse({ description: 'Product reviews returned.' })
  @ApiNotFoundResponse({ description: 'Product not found.' })
  @Get('product/:productId')
  findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewsService.findByProduct(productId);
  }

  @ApiOperation({ summary: 'List reviews for a user' })
  @ApiParam({ name: 'userId', example: 1 })
  @ApiOkResponse({ description: 'User reviews returned.' })
  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.reviewsService.findByUser(userId);
  }

  @ApiOperation({ summary: 'Get a review by id' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Review returned.' })
  @ApiNotFoundResponse({ description: 'Review not found.' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product review as a customer' })
  @ApiCreatedResponse({ description: 'Review created.' })
  @ApiBadRequestResponse({
    description: 'Customer already reviewed this product.',
  })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid, or expired JWT.' })
  @ApiForbiddenResponse({ description: 'Requires customer role.' })
  @ApiNotFoundResponse({ description: 'Product not found.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Customer)
  @Post()
  create(
    @CurrentUser() user: { userId: number },
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(user.userId, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a review owned by the customer' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Review updated.' })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid, or expired JWT.' })
  @ApiForbiddenResponse({
    description: 'Requires customer role and ownership of the review.',
  })
  @ApiNotFoundResponse({ description: 'Review not found.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Customer)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { userId: number },
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, user.userId, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review owned by the customer' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Review deleted.' })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid, or expired JWT.' })
  @ApiForbiddenResponse({
    description: 'Requires customer role and ownership of the review.',
  })
  @ApiNotFoundResponse({ description: 'Review not found.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Customer)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { userId: number },
  ) {
    return this.reviewsService.remove(id, user.userId);
  }
}
