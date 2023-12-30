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
import { TestUser1Product } from './product';
import { ProductService } from './product.service';
import { UnauthorizedFilter } from '../unauthorized-filter/unauthorized.filter';
import { ScopeGuardGuard } from '../scope-guard/scope-guard.guard';

@Controller('testuser1')
@Resource(TestUser1Product.name)
@UseFilters(new UnauthorizedFilter(TestUser1Product.name))
export class ProductController {
  constructor(private service: ProductService) {}

  @Get()
  @UseGuards(new ScopeGuardGuard(TestUser1Product.name, 'View'))
  async findAll() {
    return await this.service.findAll();
  }

  @Delete(':code')
  @UseGuards(new ScopeGuardGuard(TestUser1Product.name, 'Delete'))
  async deleteByCode(@Param('code') code: string) {
    return await this.service.deleteByCode(code);
  }

  /**
   * 以下はフロント未実装
   */
  @Post()
  @UseGuards(new ScopeGuardGuard(TestUser1Product.name, 'Create'))
  async create(@Body() product: TestUser1Product) {
    return await this.service.create(product);
  }

  @Put(':code')
  @UseGuards(new ScopeGuardGuard(TestUser1Product.name, 'Edit'))
  async update(@Param('code') code: string, @Body() product: TestUser1Product) {
    return await this.service.update(code, product);
  }
}
