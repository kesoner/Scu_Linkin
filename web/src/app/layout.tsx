import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "東吳 LinkIn｜機會資訊中心",
  description: "活動、獎學金與實習徵才資訊的搜尋與篩選平台。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="zh-Hant"><body>{children}</body></html>;
}
