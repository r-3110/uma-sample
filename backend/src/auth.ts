import { Issuer } from 'openid-client';
import { join } from 'path';
import axios from 'axios';
import { KeycloakConfigService } from './config/keycloak-service';

/**
 * パーミッションチケット作成
 */
export type CreatePermissionTicket = {
  resource_id: string;
  resource_scopes: string[];
};

/**
 * サービスディスカバリーエンドポイントからIssuerを取得する
 */
export const getIssuer = async () => {
  const { authServerUrl, realm } =
    new KeycloakConfigService().createKeycloakConnectOptions();
  const serviceDiscoveryEndpoint = join(
    authServerUrl,
    `/realms/${realm}/.well-known/uma2-configuration`,
  );
  return await Issuer.discover(serviceDiscoveryEndpoint);
};

/**
 * Isuuerクライアント取得
 */
const getIssuerClient = async () => {
  const issuer = await getIssuer();
  const { clientId, secret } =
    new KeycloakConfigService().createKeycloakConnectOptions();
  return new issuer.Client({
    client_id: clientId,
    client_secret: secret,
    token_endpoint_auth_method: 'client_secret_basic',
  });
};

/**
 * PAT取得
 */
export const getPAT = async () => {
  const client = await getIssuerClient();
  return await client
    .grant({ grant_type: 'client_credentials' })
    .then((res) => res.access_token);
};

/**
 * axiosクライアント取得
 */
export const getAxiosClient = async () => {
  const PAT = await getPAT();
  return axios.create({
    headers: {
      Authorization: `Bearer ${PAT}`,
    },
  });
};

/**
 * パーミッションチケット作成
 */
export const createPermission = async (param: CreatePermissionTicket) => {
  const issuer = await getIssuer();
  const endpoint = issuer.metadata.permission_endpoint as string;
  const axios = await getAxiosClient();
  return await axios
    .post<{ ticket: string }>(endpoint, [param])
    .then((res) => res.data)
    .catch((err) => {
      console.error(err);
      return err.data;
    });
};

/**
 * RPTのイントロスペクション
 */
export const introspectRPT = async (token: string) => {
  const client = await getIssuerClient();
  return await client.introspect(token, 'requesting_party_token');
};
