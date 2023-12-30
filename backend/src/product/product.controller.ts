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
import { Product } from './product';
import { ProductService } from './product.service';
import { UnauthorizedFilter } from '../unauthorized-filter/unauthorized.filter';
import { ScopeGuardGuard } from '../scope-guard/scope-guard.guard';

@Controller('product')
@Resource(Product.name)
@UseFilters(new UnauthorizedFilter(Product.name))
export class ProductController {
  constructor(private service: ProductService) {}

  @Get()
  @UseGuards(new ScopeGuardGuard(Product.name, 'View'))
  async findAll() {
    return await this.service.findAll();
  }

  @Delete(':code')
  @UseGuards(new ScopeGuardGuard(Product.name, 'Delete'))
  async deleteByCode(@Param('code') code: string) {
    return await this.service.deleteByCode(code);
  }

  /**
   * 以下はフロント未実装
   */
  @Post()
  @UseGuards(new ScopeGuardGuard(Product.name, 'Create'))
  async create(@Body() product: Product) {
    return await this.service.create(product);
  }

  @Put(':code')
  @UseGuards(new ScopeGuardGuard(Product.name, 'Edit'))
  async update(@Param('code') code: string, @Body() product: Product) {
    return await this.service.update(code, product);
  }
}
