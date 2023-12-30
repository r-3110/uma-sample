import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { introspectRPT } from '../auth';

type RequestPayload = {
  accessTokenJWT: string;
};

type IntrospectResponse = IntrospectValied | IntrospectInValied;

type IntrospectValied = {
  exp: number;
  nbf: number;
  iat: number;
  jti: string;
  aud: string;
  typ: string;
  permissions: [
    {
      scopes: string[];
      rsid: string;
      rsname: string;
      resource_scopes: string[];
      resource_id: string;
    },
  ];
  active: true;
};

type IntrospectInValied = {
  active: false;
};

/**
 * RPTのScopeを検証する
 */
@Injectable()
export class ScopeGuardGuard implements CanActivate {
  private readonly scopes: string[];

  public constructor(
    private readonly resourceName: string,
    ...scopes: string[]
  ) {
    this.scopes = scopes;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rpt = context
      .switchToHttp()
      .getRequest<RequestPayload>().accessTokenJWT;
    const result = await introspectRPT(rpt)
      .then<IntrospectResponse | boolean>((res) => {
        if (res.active) {
          return res as IntrospectInValied;
        }
        return false;
      })
      .catch(() => false);

    if (!result) {
      return false;
    }

    const {
      permissions: [{ scopes, rsname }],
    } = result as IntrospectValied;

    return this.inspectScopes(rsname, scopes);
  }

  private inspectScopes = (payloadResource: string, payloadScops: string[]) => {
    const results = [];
    results.push(this.resourceName === payloadResource);
    results.push(this.scopes.some((scope) => payloadScops.includes(scope)));

    return results.every((result) => result === true);
  };
}
