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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'List categories' })
  @ApiOkResponse({
    description: 'Categories returned with parent/children data.',
  })
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @ApiOperation({ summary: 'Get a category by id' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Category returned with products.' })
  @ApiNotFoundResponse({ description: 'Category not found.' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a category as admin or agent' })
  @ApiCreatedResponse({ description: 'Category created.' })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid, or expired JWT.' })
  @ApiForbiddenResponse({ description: 'Requires admin or agent role.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Agent)
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a category as admin or agent' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Category updated.' })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid, or expired JWT.' })
  @ApiForbiddenResponse({ description: 'Requires admin or agent role.' })
  @ApiNotFoundResponse({
    description: 'Category or parent category not found.',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Agent)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a category as admin or agent' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiOkResponse({ description: 'Category deleted.' })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid, or expired JWT.' })
  @ApiForbiddenResponse({ description: 'Requires admin or agent role.' })
  @ApiNotFoundResponse({ description: 'Category not found.' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Agent)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
