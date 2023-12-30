import { Injectable } from '@nestjs/common';
import { getResources } from './resource';

@Injectable()
export class ResourceService {
  async getResources() {
    return getResources();
  }
}
