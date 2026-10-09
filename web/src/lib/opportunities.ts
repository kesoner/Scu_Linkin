export type OpportunityCategory = "活動" | "獎學金" | "實習／徵才";

export type Opportunity = {
  id: string;
  title: string;
  category: OpportunityCategory;
  organizer: string;
  updatedAt: string;
  deadline: string;
  campus: string;
  departments: string[];
  tags: string[];
  summary: string;
  eligibility: string;
  sourceUrl: string;
  official: boolean;
};

export const opportunities: Opportunity[] = [
  { id: "finance-law-talk", title: "金融法職涯講座：從校園走進金融業", category: "活動", organizer: "生涯發展中心", updatedAt: "2026-10-09", deadline: "2026-10-23", campus: "雙溪", departments: ["法律學系", "商學院"], tags: ["法律", "金融", "職涯講座"], summary: "邀請金融業校友分享法律背景如何跨入法遵、法務與風險管理領域。", eligibility: "全校學生皆可報名，法律與商學相關系所優先。", sourceUrl: "https://web-ch.scu.edu.tw/index.php/career/web_page/16804", official: true },
  { id: "internship-program", title: "2027 全學期企業實習招募計畫", category: "實習／徵才", organizer: "生涯發展中心", updatedAt: "2026-10-01", deadline: "2026-11-28", campus: "不限", departments: ["全校"], tags: ["實習", "企業", "應屆畢業生"], summary: "提供符合資格的應屆畢業生申請全學期校外實習與相關課程。", eligibility: "須符合全學期實習課程選課資格，詳情依官方公告為準。", sourceUrl: "https://ejob.scu.edu.tw/", official: true },
  { id: "community-scholarship", title: "115 年五育競賽優異獎勵申請", category: "獎學金", organizer: "群育暨美育中心", updatedAt: "2026-10-06", deadline: "2026-10-30", campus: "不限", departments: ["全校"], tags: ["獎學金", "社團", "競賽"], summary: "鼓勵學生參與五育競賽與校園活動的獎勵申請資訊。", eligibility: "依公告所列資格與申請文件辦理。", sourceUrl: "https://web-ch.scu.edu.tw/extracur/file/11714", official: true },
  { id: "international-career", title: "國際生履歷與面試工作坊", category: "活動", organizer: "生涯發展中心", updatedAt: "2026-10-08", deadline: "2026-10-19", campus: "城中", departments: ["全校"], tags: ["國際生", "履歷", "求職"], summary: "協助國際學生準備在臺求職履歷、面試與職涯資源。", eligibility: "本校國際學生優先，名額有限。", sourceUrl: "https://web-ch.scu.edu.tw/index.php/career/web_page/16804", official: true },
  { id: "alumni-hr-intern", title: "校友企業｜人資實習生招募", category: "實習／徵才", organizer: "已驗證校友企業", updatedAt: "2026-10-07", deadline: "2026-10-31", campus: "線上", departments: ["商學院", "外國語文學院", "全校"], tags: ["人資", "實習", "校友企業"], summary: "協助招募具溝通與企劃能力的在學實習生，提供彈性工作安排。", eligibility: "具備基本文書與溝通能力；歡迎對人力資源有興趣的學生。", sourceUrl: "https://ejob.scu.edu.tw/", official: false },
  { id: "social-innovation", title: "社會創新提案競賽說明會", category: "活動", organizer: "課外活動組", updatedAt: "2026-10-05", deadline: "2026-10-25", campus: "雙溪", departments: ["全校"], tags: ["競賽", "社會創新", "團隊"], summary: "認識提案主題、組隊方式與競賽資源，並與學長姐交流。", eligibility: "限本校在學生，可跨系組隊。", sourceUrl: "https://www-ch.scu.edu.tw/", official: true },
];

export const categories: Array<OpportunityCategory | "全部"> = ["全部", "活動", "獎學金", "實習／徵才"];
export const departments = ["全部", "全校", "法律學系", "商學院", "外國語文學院"];
export const campuses = ["全部", "雙溪", "城中", "線上", "不限"];
