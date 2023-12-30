import { useEffect, useState } from "react";
import {
  Container,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  useResouceState,
  getResources,
  getResourceFromResouceServer,
  deleteResourceFromResouceServer,
  getResouceList,
  deleteResouceList,
  findByResouceId,
  AxiosClient,
  getAxiosInstance,
  axiosGet,
  KeycloakResource,
  ResourceRequest,
  Product,
  AxiosConfig,
} from "@/feature/resource";
import { AxiosInstance, AxiosRequestConfig } from "axios";
import { Auth } from "@/hooks/auth";
import Header from "@/components/Header";

const Resource = () => {
  useEffect(() => {
    const auth = new Auth();
    const init = async () => {
      await auth.init();
      setAuth(auth);
      const result = await getResources(auth).then((res) => res.data);
      setKeycloakResources(result);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [auth, setAuth] = useState<Auth>();

  const {
    keycloakResources,
    setKeycloakResources,
    displayResources,
    setDisplayResources,
    resourceServerResources,
    setResourceServerResources,
  } = useResouceState();

  /**
   * 確認ボタン
   * public: 誰でもアクセス可能
   * private: 認証済みのユーザーのみアクセス可能
   * test: testロールを持つユーザーのみアクセス可能
   *
   */
  const checkButton = async (url: string) => {
    const axios = AxiosClient.getInstance(auth).getAxios();
    return await axiosGet(axios, url).then((res) => alert(res.data));
  };

  /**
   * リソースサーバへリクエスト。
   * RPTが取得できたかどうかで処理を分岐する。
   */
  const accessGrantResouceByRPT = async (
    firstCallback: (
      axiosConfig: AxiosConfig,
      auth: Auth,
    ) => Promise<string | boolean | Product>,
    scopeParams: ResourceRequest,
    secondCallback: (
      axios: AxiosInstance,
      params: AxiosRequestConfig,
    ) => Promise<Product>,
    axiosConfig: AxiosRequestConfig,
  ) => {
    const { resource_id, resource_scopes } = scopeParams;
    const result = await firstCallback(
      { url: axiosConfig.url as string, params: { resource_scopes } },
      auth as Auth,
    );

    /**
     * 1 権限がなく申請した（オーナーの承認待ち）
     * 2 権限あるがRPTを持っていない
     * 3 権限がありRPTを持っている => そのままリクエストしてリソース操作ができた
     */
    if (typeof result === "boolean") {
      return;
    } else if (typeof result === "string") {
      const rpt = result;
      const axios = getAxiosInstance({
        headers: { Authorization: `Bearer ${rpt}` },
      });
      const product = await secondCallback(axios, axiosConfig);
      setResourceServerResources(product);
      setDisplayResources(
        findByResouceId(keycloakResources, resource_id) as KeycloakResource,
      );
      return;
    }

    setResourceServerResources(result);
  };

  return (
    <Container>
      <Header auth={auth} {...auth?.loadUserProfile()} />
      <h2>Keycloakリソース</h2>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>name</TableCell>
              <TableCell>uri</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {keycloakResources.map(({ _id, name, uris }, i) => (
              <TableRow key={i}>
                <TableCell>{name}</TableCell>
                <TableCell>{uris}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    onClick={async () =>
                      await accessGrantResouceByRPT(
                        getResourceFromResouceServer,
                        { resource_id: _id, resource_scopes: ["View"] },
                        getResouceList,
                        { method: "get", url: uris[0] },
                      )
                    }
                  >
                    参照
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <h2>リソースサーバリソース</h2>
      <TableContainer>
        <h3>{displayResources.name}</h3>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>code</TableCell>
              <TableCell>name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resourceServerResources.map(({ code, name }) => (
              <TableRow key={code}>
                <TableCell>{code}</TableCell>
                <TableCell>{name}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={async () =>
                      await accessGrantResouceByRPT(
                        deleteResourceFromResouceServer,
                        {
                          resource_id: displayResources._id,
                          resource_scopes: ["Delete"],
                        },
                        deleteResouceList,
                        {
                          method: "delete",
                          url: `${displayResources.uris[0]}/${code}`,
                        },
                      )
                    }
                  >
                    削除
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Resource;
