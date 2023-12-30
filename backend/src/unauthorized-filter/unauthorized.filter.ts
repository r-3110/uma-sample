import {
  Injectable,
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { join } from 'path';
import { KeycloakConfigService } from '../config/keycloak-service';
import { getResourceId } from '../resource/resource';
import { createPermission } from '../auth';

/**
 * RPTがない、無効、スコープがなく、チケットを発行した場合に401を返す
 * 発行できない場合は403を返す
 * @see https://docs.kantarainitiative.org/uma/wg/rec-oauth-uma-grant-2.0.html#permission-success-to-client
 */
@Injectable()
@Catch(UnauthorizedException, ForbiddenException)
export class UnauthorizedFilter implements ExceptionFilter {
  public constructor(
    private readonly resourceName: string,
    private readonly keycloakConfigService = new KeycloakConfigService().createKeycloakConnectOptions(),
  ) {}

  catch(_exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { authServerUrl, realm } = this.keycloakConfigService;
    const asUri = join(authServerUrl, '/auth/realms/', realm);

    const params = request.query;
    console.log(params);
    console.log(this.resourceName);
    getResourceId(this.resourceName).then(([resourceId]) => {
      createPermission({
        resource_id: resourceId,
        resource_scopes: params.resource_scopes as string[],
      })
        .then(({ ticket }) => {
          response
            .status(HttpStatus.UNAUTHORIZED)
            .setHeader(
              'WWW-Authenticate',
              `UMA realm="${realm}",as_uri="${asUri}",ticket="${ticket}"`,
            )
            .setHeader('Access-Control-Expose-Headers', 'WWW-Authenticate')
            .json();
        })
        .catch((err) => {
          console.error(err);
          response
            .status(HttpStatus.FORBIDDEN)
            .setHeader(
              'Warning',
              '199 - "UMA Authorization Server Unreachable"',
            )
            .json();
        });
    });
  }
}
