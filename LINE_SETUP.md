# LINE Messaging API 設定

目前專案已具備簽章驗證的 webhook 入口：

`https://你的正式網域/api/line/webhook`

## 憑證放置位置

從根目錄的 `.env.example` 複製欄位，將實際值只寫入 `web/.env.local`（本機）或正式主機的環境變數：

- `LINE_CHANNEL_ID`
- `LINE_CHANNEL_SECRET`
- `LINE_CHANNEL_ACCESS_TOKEN`

`.env.local` 已被 Git 忽略；不要將 secret 或 access token 提交到 GitHub、貼文或聊天室。

## 上線後的設定順序

1. 在伺服器將專案複製下來，於根目錄建立 `web/.env.local`，填入管理員與三個 LINE 變數。
2. 在網域管理處將 `sculinkin.xuyuzu.online` 的 A 紀錄指向伺服器公開 IP；開放防火牆 TCP 80、443。
3. 執行 `docker compose up -d --build`。Caddy 會自動申請與續期 HTTPS 憑證；資料庫會保存在根目錄的 `data/`，容器更新不會遺失資料。
4. 在 LINE Developers Console 的 **Webhook settings** 填入 `https://sculinkin.xuyuzu.online/api/line/webhook`，開啟 **Use webhook**，再按 **Verify**。
5. 驗證成功後，再新增「訂閱活動提醒」與使用者同意後的推播邏輯。

Webhook 會先驗證 LINE 簽章，未驗證的請求不會被接受；目前只安全回應 callback，不會儲存使用者 ID、訊息或其他個資。

## 伺服器檔案位置

- `docker-compose.yml`：啟動應用程式與 HTTPS 代理；應用程式本身僅綁定本機連接埠。
- `web/Dockerfile`：建立可執行 Next.js API 的映像檔。
- `Caddyfile`：處理 `sculinkin.xuyuzu.online` 的 HTTPS 與反向代理。
- `data/`：SQLite 持久化資料夾，應納入伺服器備份；不要放入 Git。
