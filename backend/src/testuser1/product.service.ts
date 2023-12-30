import { Injectable } from '@nestjs/common';
import { TestUser1Product } from './product';

@Injectable()
export class ProductService {
  products: TestUser1Product[] = [
    {
      code: '1-00-1',
      name: 'TestUser1Product 1',
    },
    {
      code: '1-00-2',
      name: 'TestUser1Product 2',
    },
    {
      code: '1-00-3',
      name: 'TestUser1Product 3',
    },
    {
      code: '1-00-4',
      name: 'TestUser1Product 4',
    },
    {
      code: '1-00-5',
      name: 'TestUser1Product 5',
    },
  ];

  async update(code: string, product: TestUser1Product) {
    this.products = this.products.map((p) => {
      if (p.code === code) {
        return product;
      } else {
        return p;
      }
    });
  }

  async deleteByCode(code: string) {
    this.products = this.products.filter((p) => p.code !== code);
    return this.products;
  }

  async create(product: TestUser1Product) {
    this.products = [...this.products, product];
  }

  async findByCode(code: string) {
    return this.products.find((p) => p.code === code);
  }

  async findAll() {
    return this.products;
  }
}
