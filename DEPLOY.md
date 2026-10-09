# 將東吳 LinkIn 發布到 `sculinkin.xuyuzu.online`

此專案已提供 Docker、Caddy HTTPS 與 SQLite 持久化設定。Caddy 會在 DNS 正確指向主機後，自動申請與續期 TLS 憑證。

## 1. 準備伺服器

建議使用 Ubuntu 24.04 LTS、至少 2 GB RAM，安裝 Docker Engine 與 Docker Compose plugin。防火牆只開放 TCP `80`、`443` 和 SSH 管理埠。

## 2. 設定網域

在 `xuyuzu.online` 的 DNS 管理頁建立：

| 類型 | 主機名稱 | 值 |
| --- | --- | --- |
| A | `sculinkin` | 伺服器的公開 IPv4 位址 |

DNS 生效後，`sculinkin.xuyuzu.online` 必須解析到該伺服器，才能讓 Caddy 自動建立 HTTPS。

## 3. 取得程式與設定密鑰

```bash
git clone https://github.com/kesoner/Scu_Linkin.git
cd Scu_Linkin
cp .env.example .env
```

編輯 `.env`，換成長且不重複的管理員密碼與驗證密鑰。

## 4. 啟動

```bash
docker compose up -d --build
docker compose ps
```

完成後開啟 `https://sculinkin.xuyuzu.online`。

## 維護與備份

- 機會資訊 SQLite 資料庫存放於 Docker volume `linkin_data`，重建容器不會遺失。
- 每日備份該 volume；正式營運前應遷移至 PostgreSQL 與物件儲存。
- 更新版本：`git pull && docker compose up -d --build`。
- 不要提交 `.env`、SQLite 資料庫或任何學生／校友原始名冊。
