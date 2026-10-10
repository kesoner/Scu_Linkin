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

1. 將 Next.js 服務部署到可公開存取的主機；GitHub Pages 是靜態網站，不能接收 LINE webhook。
2. 在主機設定三個 LINE 環境變數，重新啟動服務。
3. 在 LINE Developers Console 的 **Webhook settings** 填入 `https://sculinkin.xuyuzu.online/api/line/webhook`（正式網域啟用後），開啟 **Use webhook**，再按 **Verify**。
4. 驗證成功後，再新增「訂閱活動提醒」與使用者同意後的推播邏輯。

Webhook 會先驗證 LINE 簽章，未驗證的請求不會被接受；目前只安全回應 callback，不會儲存使用者 ID、訊息或其他個資。
