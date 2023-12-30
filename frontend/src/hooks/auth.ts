import Keycloak from "keycloak-js";
import KeycloakAuthorization from "keycloak-js/dist/keycloak-authz";
import kcConfig from "@/config/keycloak.json";

/**
 * 認証・認可
 * Keycloakとの連携を行う
 */
export class Auth {
  private keycloak: Keycloak;
  private keycloakAuthz!: KeycloakAuthorization;
  private userProfile!: Keycloak.KeycloakProfile;

  constructor() {
    this.keycloak = new Keycloak(kcConfig);
  }

  public async init() {
    return await this.keycloak
      .init({
        onLoad: "login-required",
        redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI,
        flow: "standard",
      })
      .then(async () => {
        this.userProfile = await this.keycloak.loadUserProfile();
        this.keycloakAuthz = new KeycloakAuthorization(this.keycloak);
        this.keycloakAuthz.init();
      });
  }

  /**
   * ログアウト
   */
  public async logout() {
    return await this.keycloak.logout();
  }

  /**
   * ログインユーザー情報を取得
   */
  public loadUserProfile() {
    return this.userProfile;
  }

  /**
   * web clientのアクセストークンを取得
   */
  public getAccessToken() {
    return this.keycloak.token as string;
  }

  /**
   * RPTを取得
   */
  public getRPT() {
    return this.keycloakAuthz.rpt;
  }

  /**
   * リソースサーバーのトークンエンドポイントへリクエスト。RPT取得を試みる。
   * 権限があればRPTを返し、権限がなければ取得済みのチケットで申請を行う。
   */
  public autorize(authorizationRequest: { ticket?: string }) {
    return new Promise<string | boolean>((resolve, reject) => {
      this.keycloakAuthz.authorize(authorizationRequest).then(
        (rpt) => {
          //権限があればここに来る
          alert("権限があります。\n リソースサーバーへリクエストします。");
          console.log(rpt);
          resolve(rpt);
        },
        () => {
          //権限がなければここに来る
          console.error("403 Deny");
          alert(
            "権限の申請を行いました。\n オーナーが承認するまでお待ちください。",
          );
          resolve(false);
        },
        () => {
          console.error("Error");
          reject();
        },
      );
    });
  }
}
