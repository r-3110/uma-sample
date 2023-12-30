import { useState } from "react";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  CreateAxiosDefaults,
} from "axios";
import { Auth } from "@/hooks/auth";

export type KeycloakResource = {
  _id: string;
  name: string;
  uris: string[];
};

export type Product = {
  code: string;
  name: string;
}[];

export type ResourceRequest = {
  resource_id: string;
  resource_scopes: string[];
};

export type AxiosConfig = Partial<Pick<AxiosRequestConfig, "data" | "params">> &
  Required<Pick<AxiosRequestConfig, "url">>;

type WWWAuthenticateHeaderEncode =
  `UMA realm=${string},as_uri=${string},ticket=${string}`;

/**
 * リソースページの状態管理
 */
export const useResouceState = () => {
  const [keycloakResources, setKeycloakResources] = useState<
    KeycloakResource[]
  >([]);

  const [displayResources, setDisplayResources] = useState<KeycloakResource>({
    _id: "",
    name: "",
    uris: [],
  });

  const [resourceServerResources, setResourceServerResources] =
    useState<Product>([]);

  return {
    keycloakResources,
    setKeycloakResources,
    displayResources,
    setDisplayResources,
    resourceServerResources,
    setResourceServerResources,
  };
};

export class AxiosClient {
  private static instance: AxiosClient;
  private axios: AxiosInstance;

  private constructor(auth?: Auth) {
    this.axios = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
      headers: {
        Authorization: `Bearer ${auth?.getAccessToken()}`,
      },
    });
  }

  public static getInstance(auth?: Auth) {
    if (!AxiosClient.instance) {
      AxiosClient.instance = new AxiosClient(auth);
    }
    return AxiosClient.instance;
  }

  public getAxios() {
    return this.axios;
  }
}

export const getAxiosInstance = (config?: CreateAxiosDefaults) => {
  const instance = axios.create({
    ...config,
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  });
  return instance;
};

/**
 * keycloakに登録しているリソース一覧を取得する
 */
export const getResources = async (auth: Auth) => {
  const axios = AxiosClient.getInstance(auth).getAxios();
  return await axiosGet<KeycloakResource[]>(axios, "resource");
};

/**
 * リソースサーバーからリソース一覧を取得する
 * 権限がない場合はチケットがレスポンスされる
 */
export const getResourceFromResouceServer = async (
  { url, params }: AxiosConfig,
  auth?: Auth,
) => {
  const axiosInstance = getAxiosInstance({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: { Authorization: `Bearer ${auth?.getRPT()}` },
  });
  const result = await axiosInstance
    .get<Product>(url, { params })
    .then((res) => res.data)
    .catch(async (err) => {
      if (
        err.response?.status === 401 &&
        err.response?.headers["www-authenticate"]
      ) {
        return await applyRoleByTicket(err, auth as Auth);
        // return true;
      }
      throw err;
    });
  return result;
};

/**
 * リソースサーバーからリソースを削除する
 * 権限がない場合はチケットがレスポンスされる
 */
export const deleteResourceFromResouceServer = async (
  { url, params }: AxiosConfig,
  auth: Auth,
) => {
  const axiosInstance = getAxiosInstance({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: { Authorization: `Bearer ${auth?.getRPT()}` },
  });
  const result = await axiosInstance
    .delete<Product>(url, { params })
    .then((res) => res.data)
    .catch(async (err) => {
      if (
        err.response?.status === 401 &&
        err.response?.headers["www-authenticate"]
      ) {
        return await applyRoleByTicket(err, auth as Auth);
        // return true;
      }
      throw err;
    });
  return result;
};

/**
 * RPTを使う
 */
export const getResouceList = async (
  axios: AxiosInstance,
  params: AxiosRequestConfig,
) => {
  return await axios<Product>(params).then((res) => {
    alert("リソースを取得しました");
    return res.data;
  });
};

/**
 * リソースサーバのリソースを削除
 * RPTを使う
 */
export const deleteResouceList = async (
  axios: AxiosInstance,
  params: AxiosRequestConfig,
) => {
  return await axios<Product>(params).then((res) => {
    alert("リソースを削除しました");
    return res.data;
  });
};

/**
 * チケットを使って権限申請を行う。
 * 権限がある場合は、RPTが返る。
 */
const applyRoleByTicket = async (err: any, auth: Auth) => {
  const headerValue = getWWWAuthenticateHeader(err);
  const ticket = getTicket(headerValue);
  return await auth?.autorize({ ticket });
};

/**
 * WWW-Authenticateヘッダーをデコードする
 */
const getWWWAuthenticateHeader = (axiosError: AxiosError) => {
  const headerValue: WWWAuthenticateHeaderEncode =
    axiosError.response?.headers["www-authenticate"];
  const decodeHeader = headerValue.split(",").map((attribute) => {
    const [key, value] = attribute.split("=");
    return { key, value };
  });
  return decodeHeader;
};

/**
 * ヘッダからチケットを取得する
 */
const getTicket = (headerValues: { key: string; value: string }[]) => {
  const ticket = headerValues.find((header) => header.key === "ticket");
  return ticket?.value.replace(/^\"|\"$/g, "") as string;
};

/**
 * ストアから選択しているリソースを取得する
 */
export const findByResouceId = (
  store: KeycloakResource[],
  searchResource: string,
) => {
  const item = store.find((header) => header._id === searchResource);
  return item;
};

/**
 * Getリクエスト
 */
export const axiosGet = async <T>(
  axios: AxiosInstance,
  url: string,
  params = {},
) => {
  return await axios.get<T>(url, { params });
};
