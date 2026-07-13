// auth/dto/register.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  MinLength,
  IsString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { UserRole } from '../../common/enums/user-role.enum';

export class RegisterDto {
  @ApiProperty({
    example: 'customer@example.com',
    description: 'Unique email used for login.',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Str0ngPass!',
    minLength: 8,
    description: 'Password must be at least 8 characters.',
  })
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Jane' })
  @IsString()
  first_name!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  last_name!: string;

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.Customer,
    default: UserRole.Customer,
    description: 'Use admin, agent, or customer depending on the account type.',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
