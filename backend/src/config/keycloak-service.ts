import { Injectable } from '@nestjs/common';
import {
  KeycloakConnectConfig,
  KeycloakConnectOptionsFactory,
  PolicyEnforcementMode,
  TokenValidation,
} from 'nest-keycloak-connect';

@Injectable()
export class KeycloakConfigService implements KeycloakConnectOptionsFactory {
  createKeycloakConnectOptions(): KeycloakConnectConfig {
    return {
      authServerUrl: 'http://localhost:8080',
      realm: 'uma-test',
      clientId: 'uma-test-backend-client',
      secret: 'dHgCytW0Dm1Eu8Lyrdnj3k7awJgDqlhp',
      cookieKey: 'KEYCLOAK_JWT',
      policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
      tokenValidation: TokenValidation.ONLINE,
    };
  }
}
