import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {
  AuthenticatedUser,
  Public,
  Roles,
  RoleMatchingMode,
} from 'nest-keycloak-connect';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public(false)
  getHello(
    @AuthenticatedUser()
    user: any,
  ): string {
    if (user) {
      return `Hello ${user.preferred_username}`;
    } else {
      return 'Hello world!';
    }
  }

  @Get('private')
  getPrivate() {
    return 'Authenticated only!';
  }

  @Get('test')
  @Roles({ roles: ['test'], mode: RoleMatchingMode.ALL })
  adminRole() {
    return 'test role only!';
  }
}
