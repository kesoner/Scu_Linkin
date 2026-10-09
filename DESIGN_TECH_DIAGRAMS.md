# 東吳 LinkIn：設計與技術架構圖

> 版本：0.1（概念設計）  
> 狀態：供 Phase 0 討論使用；SSO 串接暫不納入 MVP。資料授權、雲端服務與 LINE 管理權責仍待確認。

## 1. 產品資訊架構

```mermaid
flowchart TB
    Home[東吳 LinkIn 網站]
    Home --> Community[校友社群]
    Home --> Opportunity[個人化機會中心]
    Home --> Account[帳號與個人設定]
    Home --> Admin[管理後台]

    Community --> Profile[校友／學生檔案]
    Community --> Posts[貼文與互動]
    Community --> Events[活動發布與報名]
    Community --> Jobs[徵才／實習／合作機會]
    Community --> Connection[交流邀請]

    Opportunity --> Feed[資訊列表]
    Opportunity --> Filter[關鍵字搜尋與基礎篩選]
    Opportunity --> Bookmark[收藏與期限追蹤]
    Opportunity --> Detail[活動／獎學金／職缺詳情]

    Account --> Preferences[興趣、系所與通知偏好]
    Account --> LineBind[LINE 帳號綁定]
    Account --> Privacy[個資與公開範圍]

    Admin --> Content[內容發布、審核與下架]
    Admin --> Reports[檢舉與停權處理]
    Admin --> Taxonomy[分類、標籤與單位管理]
    Admin --> Notification[推播排程與紀錄]
```

## 2. MVP 主要使用流程

```mermaid
flowchart LR
    Start([使用者開啟網站]) --> Login[登入或建立帳號]
    Login --> Pref[設定角色、系所、興趣與通知偏好]
    Pref --> Browse[瀏覽機會中心]
    Browse --> Match{找到有興趣的資訊？}
    Match -- 否 --> Filter[調整分類、標籤或截止日篩選]
    Filter --> Browse
    Match -- 是 --> Detail[查看詳情、來源與截止日]
    Detail --> Action{下一步}
    Action --> Save[收藏並設定提醒]
    Action --> Apply[前往站內／官方頁面報名或申請]
    Action --> Share[分享給其他使用者]
    Save --> Notify[LINE／站內通知]
    Notify --> Detail
```

## 3. 校友交流流程

```mermaid
sequenceDiagram
    actor Student as 學生
    participant Site as 東吳 LinkIn
    actor Alumni as 校友

    Student->>Site: 依系所／產業搜尋校友
    Student->>Site: 送出交流邀請與簡短說明
    Site->>Alumni: 站內或 LINE 通知
    Alumni->>Site: 接受、拒絕或忽略
    alt 接受
        Site->>Student: 通知交流邀請已接受
        Student->>Alumni: 開始私訊交流
    else 拒絕或忽略
        Site->>Student: 不開啟私訊；不揭露聯絡方式
    end
```

## 4. 初步技術架構

```mermaid
flowchart TB
    User[學生／校友／校內單位] --> Web[東吳 LinkIn 網站]
    User --> Line[LINE 官方帳號]
    Line --> Web

    Web --> Auth[帳號與校友驗證層]
    Auth --> AlumniVerify[校友單位核對身分]
    AlumniVerify -. 不公開原始名冊 .-> Auth
    Web --> API[應用程式 API]
    API --> DB[(平台資料庫)]
    API --> Storage[附件與圖片儲存]
    API --> Scheduler[排程與通知服務]
    Scheduler --> LineAPI[LINE Messaging API]

    Official[官方資料來源]
    Official --> Career[職涯／實習／徵才]
    Official --> Scholarship[獎學金]
    Official --> Alumni[校友服務]
    Career -. 授權後匯入或串接 .-> API
    Scholarship -. 授權後匯入或串接 .-> API
    Alumni -. 授權後驗證或串接 .-> API

    Admin[管理後台] --> API
    API --> Audit[審核、檢舉與稽核紀錄]
```

## 5. 初步資料流與責任界線

```mermaid
flowchart LR
    Source[官方單位／已驗證發布者] -->|提供或發布資料| Review[審核與分類]
    Review --> Platform[網站公開資訊]
    Platform --> User[學生／校友使用者]
    User -->|收藏、報名、交流邀請| Platform
    Platform -->|僅向已同意者| Push[LINE 推播]
    User -->|檢舉、封鎖、資料更正| Review

    Owner[資料責任人]
    Owner -. 更新、撤回、確認 .-> Review
```

## 6. 尚未定案的技術決策

| 決策項目 | 目前設計假設 | 確認條件 |
| --- | --- | --- |
| 身分登入 | MVP 不串接校方 SSO | 未來如需導入，再由資訊單位提供串接資格、協定及安全要求 |
| 校友驗證 | 由校友單位核對，平台不公開原始名冊 | 校友單位確認可用欄位、同意與審核流程 |
| 官方資料匯入 | 先採授權人工發布或定期匯入，再評估 API | 資料單位同意來源、頻率、欄位與撤回機制 |
| LINE 推播 | 網站觸發、LINE 導回詳情頁 | 確認帳號歸屬、預算、推播頻率與同意流程 |
| 技術堆疊 | Web 前端、API、關聯式資料庫與排程服務 | K 依校方環境、資安與維運資源定案 |
