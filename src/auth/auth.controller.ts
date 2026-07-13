import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: 'Register an admin, customer, or agent account',
    description:
      'Creates a new account. If role is omitted the account is created as customer.',
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      customer: {
        summary: 'Customer registration',
        value: {
          email: 'customer@example.com',
          password: 'Str0ngPass!',
          first_name: 'Jane',
          last_name: 'Doe',
          role: 'customer',
        },
      },
      agent: {
        summary: 'Agent registration',
        value: {
          email: 'agent@example.com',
          password: 'Str0ngPass!',
          first_name: 'Alex',
          last_name: 'Agent',
          role: 'agent',
        },
      },
      admin: {
        summary: 'Admin registration',
        value: {
          email: 'admin@example.com',
          password: 'Str0ngPass!',
          first_name: 'Ada',
          last_name: 'Admin',
          role: 'admin',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'User registered and JWT access token returned.',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'customer@example.com',
          first_name: 'Jane',
          last_name: 'Doe',
          role: 'customer',
        },
      },
    },
  })
  @ApiConflictResponse({ description: 'Email already in use.' })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({
    summary: 'Login and receive a role-aware JWT',
    description:
      'Use the returned access_token in Swagger Authorize as a bearer token.',
  })
  @ApiOkResponse({
    description: 'Login successful.',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'customer@example.com',
          first_name: 'Jane',
          last_name: 'Doe',
          role: 'customer',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get the currently authenticated user profile',
  })
  @ApiOkResponse({
    description: 'Profile for the bearer token owner.',
    schema: {
      example: {
        id: 1,
        email: 'customer@example.com',
        first_name: 'Jane',
        last_name: 'Doe',
        is_active: true,
        role: 'customer',
        created_at: '2026-07-10T09:00:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid, or expired JWT.' })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: { userId: number }) {
    return this.authService.getProfile(user.userId);
  }
}
