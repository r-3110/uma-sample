import { Injectable } from '@nestjs/common';
import { Product } from './product';

@Injectable()
export class ProductService {
  products: Product[] = [
    {
      code: '1-00-1',
      name: 'Product 1',
    },
    {
      code: '1-00-2',
      name: 'Product 2',
    },
    {
      code: '1-00-3',
      name: 'Product 3',
    },
    {
      code: '1-00-4',
      name: 'Product 4',
    },
    {
      code: '1-00-5',
      name: 'Product 5',
    },
  ];

  async update(code: string, product: Product) {
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

  async create(product: Product) {
    this.products = [...this.products, product];
  }

  async findByCode(code: string) {
    return this.products.find((p) => p.code === code);
  }

  async findAll() {
    return this.products;
  }
}
