import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  AuthGuard,
  KeycloakConnectModule,
  ResourceGuard,
  RoleGuard,
} from 'nest-keycloak-connect';
import { KeycloakConfigModule } from './config/module';
import { KeycloakConfigService } from './config/keycloak-service';
import { ProductModule } from './product/product.module';
import { ResourceModule } from './resource/resource.module';
import { TestUser1ProductModule } from './testuser1/product.module';
import { TestUser2ProductModule } from './testuser2/product.module';

@Module({
  imports: [
    KeycloakConnectModule.registerAsync({
      useExisting: KeycloakConfigService,
      imports: [KeycloakConfigModule],
    }),
    ConfigModule.forRoot(),
    ProductModule,
    ResourceModule,
    TestUser1ProductModule,
    TestUser2ProductModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule {}
