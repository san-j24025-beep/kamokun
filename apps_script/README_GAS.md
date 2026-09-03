# Google Apps Script (GAS) デプロイ手順 — kamokun

このフォルダの `Code.gs` は、クライアントが期待する API 形式 (`{ action, data }` を POST) を処理するサンプル実装です。

手順:
1. Google ドライブで新しい Google Apps Script プロジェクトを作成。
2. `Code.gs` の内容をコピーして貼り付ける（既存のコードを置き換える）。
3. メニューから「デプロイ」→「新しいデプロイ」を選択。
   - 種類: Web アプリ
   - 実行するユーザー: 自分（Me）
   - アクセスできるユーザー: Anyone
4. デプロイ後に表示される「Web アプリの URL」をコピーする。
5. ローカルの `Database.html` にある `this.gasUrl = "...";` を、取得した Web アプリ URL に置き換える。
   - 例: `this.gasUrl = "https://script.google.com/macros/s/XXXXXXXX/exec";`
6. クライアントからは `POST` で `Content-Type: text/plain` を指定し、
   本コードで扱う JSON 文字列 (`{"action":"createUser","data":{...}}`) を `body` に渡してください。

注意事項:
- パスワードは本サンプルでは SHA-256 でハッシュ化していますが、本番では bcrypt のような適切なアルゴリズムを推奨します。
- ストレージは `PropertiesService` を使った簡易実装です。データ量が増える場合はスプレッドシートや外部データベースを使用してください。
- 削除等の権限制御はサーバー側で必ずチェックしてください（この実装では `deleteReview` の際に `data.requester` を期待しています）。

検証方法:
- `curl` で以下のようにリクエストを投げて動作を確認できます（例）:

```bash
curl -X POST "<GAS_URL>" -H "Content-Type: text/plain" --data '{"action":"createUser","data":{"studentId":"t123","password":"pass"}}'
```

- デプロイ後、`Database.html` の `this.gasUrl` を更新すればクライアント側が本番 GAS に接続するようになります。

何か代行でデプロイしてほしい場合は、GASプロジェクトのソースか、デプロイ先のアクセス情報（非公開情報は共有不可）を教えてください。