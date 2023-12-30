import { getIssuer, getAxiosClient } from '../auth';

/**
 * リソース名でリソースを取得する
 */
export const getResourceId = async (resourceName?: string) => {
  const issuer = await getIssuer();
  const endpoint = issuer.metadata.resource_registration_endpoint as string;
  const axios = await getAxiosClient();
  return await axios
    .get<string[]>(endpoint, {
      params: {
        name: resourceName,
        exactName: true,
      },
    })
    .then((res) => res.data);
};

/**
 * リソース一覧取得
 */
export const getResources = async () => {
  const issuer = await getIssuer();
  const endpoint = issuer.metadata.resource_registration_endpoint as string;
  const axios = await getAxiosClient();
  const resourceId = await getResourceId();
  return await Promise.all(
    resourceId.map(async (resourceId) =>
      axios.get<string[]>(`${endpoint}/${resourceId}`).then((res) => res.data),
    ),
  );
};
