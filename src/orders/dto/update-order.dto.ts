import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../../common/enums/order-status.enum';

export class UpdateOrderDto {
  @ApiPropertyOptional({
    enum: OrderStatus,
    example: OrderStatus.CANCELLED,
    description: 'Customers can cancel pending orders.',
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    example: '456 New Address, Lusaka',
    description: 'Can be changed while the order is still pending.',
  })
  @IsOptional()
  @IsString()
  shippingAddress?: string;
}
