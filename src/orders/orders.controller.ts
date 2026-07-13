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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Customer)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'List orders for the logged-in customer' })
  @ApiOkResponse({ description: 'Customer orders returned.' })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid, or expired JWT.' })
  @ApiForbiddenResponse({ description: 'Requires customer role.' })
  @Get()
  findMine(@CurrentUser() user: { userId: number }) {
    return this.ordersService.findByUser(user.userId);
  }

  @ApiOperation({ summary: 'Get one order owned by the logged-in customer' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Order returned.' })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid, or expired JWT.' })
  @ApiForbiddenResponse({
    description: 'Requires customer role and ownership of the order.',
  })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { userId: number },
  ) {
    return this.ordersService.findOneForUser(id, user.userId);
  }

  @ApiOperation({ summary: 'Create an order as a customer' })
  @ApiCreatedResponse({
    description: 'Order created and product stock reduced.',
  })
  @ApiBadRequestResponse({
    description: 'Empty order or insufficient product stock.',
  })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid, or expired JWT.' })
  @ApiForbiddenResponse({ description: 'Requires customer role.' })
  @ApiNotFoundResponse({ description: 'Product not found.' })
  @Post()
  create(@CurrentUser() user: { userId: number }, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.userId, dto);
  }

  @ApiOperation({ summary: 'Update a pending customer order' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Order updated.' })
  @ApiBadRequestResponse({
    description: 'Order cannot be changed in its current status.',
  })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid, or expired JWT.' })
  @ApiForbiddenResponse({
    description: 'Requires customer role and ownership of the order.',
  })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { userId: number },
    @Body() dto: UpdateOrderDto,
  ) {
    return this.ordersService.update(id, user.userId, dto);
  }

  @ApiOperation({ summary: 'Delete a pending customer order' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Order deleted and stock restored.' })
  @ApiBadRequestResponse({ description: 'Only pending orders can be deleted.' })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid, or expired JWT.' })
  @ApiForbiddenResponse({
    description: 'Requires customer role and ownership of the order.',
  })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { userId: number },
  ) {
    return this.ordersService.remove(id, user.userId);
  }
}
