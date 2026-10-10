import "server-only";

import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

export type PostKind = "交流" | "活動" | "徵才";
export type CommunityPost = {
  id: string;
  kind: PostKind;
  title: string;
  content: string;
  authorName: string;
  authorDepartment: string;
  authorRole: "學生" | "校友" | "教職員";
  authorVerified: boolean;
  anonymous: boolean;
  createdAt: string;
  updatedAt: string;
  status: "已發布" | "草稿" | "已下架";
};

type PostRow = {
  id: string; kind: PostKind; title: string; content: string; author_name: string; author_department: string;
  author_role: CommunityPost["authorRole"]; author_verified: number; anonymous: number; created_at: string; updated_at: string; status: CommunityPost["status"];
};

let database: DatabaseSync | undefined;

function db() {
  if (database) return database;
  const directory = join(process.cwd(), "data");
  mkdirSync(directory, { recursive: true });
  database = new DatabaseSync(join(directory, "linkin.db"));
  database.exec(`CREATE TABLE IF NOT EXISTS community_posts (
    id TEXT PRIMARY KEY, kind TEXT NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL,
    author_name TEXT NOT NULL, author_department TEXT NOT NULL, author_role TEXT NOT NULL,
    author_verified INTEGER NOT NULL, anonymous INTEGER NOT NULL, created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL, status TEXT NOT NULL
  )`);
  const count = database.prepare("SELECT COUNT(*) AS count FROM community_posts").get() as { count: number };
  if (count.count === 0) seed(database);
  return database;
}

function seed(connection: DatabaseSync) {
  const now = new Date().toISOString();
  const insert = connection.prepare(`INSERT INTO community_posts (
    id, kind, title, content, author_name, author_department, author_role, author_verified, anonymous, created_at, updated_at, status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const samples: Array<Omit<CommunityPost, "id" | "createdAt" | "updatedAt" | "status">> = [
    { kind: "交流", title: "給正在探索職涯方向的學弟妹", content: "剛從法律系畢業、目前在金融業法遵工作。很樂意分享從校園到職場的準備方向與實習選擇。", authorName: "陳怡安", authorDepartment: "法律學系", authorRole: "校友", authorVerified: true, anonymous: false },
    { kind: "徵才", title: "法遵實習生招募：歡迎對金融法規有興趣的同學", content: "提供暑期實習名額，包含法規研究、內控制度與跨部門專案觀摩。詳情將由管理員審核後附上正式應徵連結。", authorName: "林先生", authorDepartment: "法律學系", authorRole: "校友", authorVerified: true, anonymous: false },
    { kind: "交流", title: "想請教交換與國際實習的準備方式", content: "正在規劃明年的交換與實習，希望聽聽已完成申請的學長姐建議。", authorName: "東吳同學", authorDepartment: "國際經營與貿易學系", authorRole: "學生", authorVerified: false, anonymous: true },
  ];
  for (const item of samples) insert.run(randomUUID(), item.kind, item.title, item.content, item.authorName, item.authorDepartment, item.authorRole, Number(item.authorVerified), Number(item.anonymous), now, now, "已發布");
}

function toPost(row: PostRow): CommunityPost {
  return { id: row.id, kind: row.kind, title: row.title, content: row.content, authorName: row.author_name, authorDepartment: row.author_department, authorRole: row.author_role, authorVerified: Boolean(row.author_verified), anonymous: Boolean(row.anonymous), createdAt: row.created_at, updatedAt: row.updated_at, status: row.status };
}

export function listCommunityPosts() {
  return (db().prepare("SELECT * FROM community_posts WHERE status = '已發布' ORDER BY created_at DESC").all() as unknown as PostRow[]).map(toPost);
}

export function createCommunityPost(input: Omit<CommunityPost, "id" | "createdAt" | "updatedAt" | "status">) {
  const now = new Date().toISOString();
  const post: CommunityPost = { ...input, id: randomUUID(), createdAt: now, updatedAt: now, status: "已發布" };
  db().prepare(`INSERT INTO community_posts (
    id, kind, title, content, author_name, author_department, author_role, author_verified, anonymous, created_at, updated_at, status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(post.id, post.kind, post.title, post.content, post.authorName, post.authorDepartment, post.authorRole, Number(post.authorVerified), Number(post.anonymous), now, now, post.status);
  return post;
}
