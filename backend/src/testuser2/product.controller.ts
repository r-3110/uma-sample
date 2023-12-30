import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Resource } from 'nest-keycloak-connect';
import { TestUser2Product } from './product';
import { ProductService } from './product.service';
import { UnauthorizedFilter } from '../unauthorized-filter/unauthorized.filter';
import { ScopeGuardGuard } from '../scope-guard/scope-guard.guard';

@Controller('testuser2')
@Resource(TestUser2Product.name)
@UseFilters(new UnauthorizedFilter(TestUser2Product.name))
export class ProductController {
  constructor(private service: ProductService) {}

  @Get()
  @UseGuards(new ScopeGuardGuard(TestUser2Product.name, 'View'))
  async findAll() {
    return await this.service.findAll();
  }

  @Delete(':code')
  @UseGuards(new ScopeGuardGuard(TestUser2Product.name, 'Delete'))
  async deleteByCode(@Param('code') code: string) {
    return await this.service.deleteByCode(code);
  }

  /**
   * 以下はフロント未実装
   */
  @Post()
  @UseGuards(new ScopeGuardGuard(TestUser2Product.name, 'Create'))
  async create(@Body() product: TestUser2Product) {
    return await this.service.create(product);
  }

  @Put(':code')
  @UseGuards(new ScopeGuardGuard(TestUser2Product.name, 'Edit'))
  async update(@Param('code') code: string, @Body() product: TestUser2Product) {
    return await this.service.update(code, product);
  }
}
