# UMAサンプルアプリ

## 概要

Keycloakを使用したUMAの雰囲気を味わえるサンプルアプリです。

※雰囲気を捉えるために要点の実装だけなので、完全に準拠した実装はしていません。

UMA

- https://docs.kantarainitiative.org/uma/wg/rec-oauth-uma-grant-2.0.html
- https://docs.kantarainitiative.org/uma/wg/rec-oauth-uma-federated-authz-2.0.html

## 動作確認環境

- Mac Apple Silicon
- docker 24
- Node.js 18
- yarn 1
- Next.js 14
- Nest.js 10
- Keycloak 22

## 構築手順

1. リポジトリルートで、Keycloakを起動します。

```bash
docker compose up -d
```

2. Keycloakの管理画面(http://localhost:8080)にアクセスしてログインします。

- ユーザー名： admin
  パスワード： password

3. Keycloakの管理画面で、リポジトリ直下のjsonファイル`realm-export.json`でRealmを作成します。
   画面左上のrealm一覧の下に表示される「create realm」から作成します。jsonファイルをドラッグ＆ドロップすると、jsonが読み込まれます。そのまま作成ボタンで作成します。

4. フロントエンドアプリを起動します。ワークスペースはfrontendです。
   `.env.example`をコピーして使ってください。

```bash
cd frontend
cp .env.example .env.local
yarn install
yarn dev
```

5. バックエンドアプリを起動します。ワークスペースはbackendです。

```bash
cd backend
yarn install
yarn start:dev
```

6. ブラウザで、http://localhost:3000 にアクセスします。

7. ログイン画面が表示されるので、ユーザ名とパスワードを入力してログインします。
   下記の3つのユーザが作成されています。まずはtestuser1でログインしてみてください。

- ユーザ名: product-owner
  パスワード: password
- ユーザ名: testuser1
  パスワード: password
- ユーザ名: testuser2
  パスワード: password

ログイン後、http://localhost:3000/resource が表示されます。

初期リソース：

- リソース名： Product

  - オーナー： product-owner
  - スコープ： View, Create, Edit, Delete
  - url： /product

- リソース名： TestUser1Product

  - オーナー： testuser1
  - スコープ： View, Create, Edit, Delete
  - url： /testuser1

- リソース名： TestUser2Product
  - オーナー： testuser2
  - スコープ： View, Create, Edit, Delete
  - url： /testuser2

8. 初期状態では、各ユーザーは自身のリソースにのみアクセスできます。
   　　例えばtestuser1はTestUser1Productにはアクセスできますが、ProductとTestUser2Productへはアクセスできません。
   リソースの参照ボタンをクリックすると、権限の申請が行われます。

9. 申請するとオーナーは申請を承認することができます。
   Keycloak管理画面http://localhost:8080/realms/uma-test/account/へproduct-ownerアカウントでログインします。リソースタブからtestuser1から参照の申請が届いていることを確認します。アクセスを許可するには「Accept」をクリックします。

10. 再度http://localhost:3000/resourceへ、testuser1アカウントでアクセスします。参照ボタンをクリックすると、参照がオーナーに承認されたことにより今度はリソースの参照ができます。

11. 削除も参照と同様のフローで権限をコントロールします。
    また、testuser1以外のユーザーでも上記同様のフローが行えます。

    ※作成と更新はフロント未実装です。よかったら作ってみてください。

# 参考

- [Keycloak](https://www.keycloak.org/docs/22.0.5/authorization_services/)
