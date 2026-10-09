import "server-only";

import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import { opportunities, type Opportunity, type OpportunityCategory } from "@/lib/opportunities";

export type OpportunityStatus = "草稿" | "已發布" | "已下架";
export type ManagedOpportunity = Opportunity & { status: OpportunityStatus };
export type AuditEvent = { id: string; opportunityId: string; opportunityTitle: string; action: string; createdAt: string };

let database: DatabaseSync | undefined;

function getDatabase() {
  if (database) return database;

  const directory = join(process.cwd(), "data");
  mkdirSync(directory, { recursive: true });
  database = new DatabaseSync(join(directory, "linkin.db"));
  database.exec(`
    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      organizer TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deadline TEXT NOT NULL,
      campus TEXT NOT NULL,
      departments TEXT NOT NULL,
      tags TEXT NOT NULL,
      summary TEXT NOT NULL,
      eligibility TEXT NOT NULL,
      source_url TEXT NOT NULL,
      official INTEGER NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      opportunity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id)
    )
  `);

  const count = database.prepare("SELECT COUNT(*) AS count FROM opportunities").get() as { count: number };
  if (count.count === 0) {
    const statement = database.prepare(`INSERT INTO opportunities (
      id, title, category, organizer, updated_at, deadline, campus, departments, tags, summary, eligibility, source_url, official, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const now = new Date().toISOString();
    for (const item of opportunities) {
      statement.run(item.id, item.title, item.category, item.organizer, item.updatedAt, item.deadline, item.campus, JSON.stringify(item.departments), JSON.stringify(item.tags), item.summary, item.eligibility, item.sourceUrl, Number(item.official), "已發布", now);
    }
  }
  return database;
}

type OpportunityRow = {
  id: string; title: string; category: OpportunityCategory; organizer: string; updated_at: string; deadline: string; campus: string;
  departments: string; tags: string; summary: string; eligibility: string; source_url: string; official: number; status: OpportunityStatus;
};

function rowToOpportunity(row: OpportunityRow): ManagedOpportunity {
  return { id: row.id, title: row.title, category: row.category, organizer: row.organizer, updatedAt: row.updated_at, deadline: row.deadline, campus: row.campus, departments: JSON.parse(row.departments), tags: JSON.parse(row.tags), summary: row.summary, eligibility: row.eligibility, sourceUrl: row.source_url, official: Boolean(row.official), status: row.status };
}

function writeAuditEvent(opportunityId: string, action: string) {
  getDatabase().prepare("INSERT INTO audit_events (id, opportunity_id, action, created_at) VALUES (?, ?, ?, ?)")
    .run(randomUUID(), opportunityId, action, new Date().toISOString());
}

function archiveExpiredOpportunities() {
  const today = new Date().toISOString().slice(0, 10);
  const expired = getDatabase().prepare("SELECT id FROM opportunities WHERE status = '已發布' AND deadline < ?").all(today) as Array<{ id: string }>;
  if (expired.length === 0) return;
  const update = getDatabase().prepare("UPDATE opportunities SET status = '已下架', updated_at = ? WHERE id = ?");
  for (const item of expired) {
    update.run(today, item.id);
    writeAuditEvent(item.id, "系統自動下架（已逾期）");
  }
}

export function listOpportunities() {
  archiveExpiredOpportunities();
  const rows = getDatabase().prepare("SELECT * FROM opportunities ORDER BY deadline ASC, created_at DESC").all() as unknown as OpportunityRow[];
  return rows.map(rowToOpportunity);
}

export function createOpportunity(input: Omit<Opportunity, "id" | "updatedAt" | "official">) {
  const now = new Date().toISOString();
  const item: ManagedOpportunity = { ...input, id: randomUUID(), updatedAt: now.slice(0, 10), official: true, status: "草稿" };
  getDatabase().prepare(`INSERT INTO opportunities (
    id, title, category, organizer, updated_at, deadline, campus, departments, tags, summary, eligibility, source_url, official, status, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(item.id, item.title, item.category, item.organizer, item.updatedAt, item.deadline, item.campus, JSON.stringify(item.departments), JSON.stringify(item.tags), item.summary, item.eligibility, item.sourceUrl, 1, item.status, now);
  writeAuditEvent(item.id, "建立草稿");
  return item;
}

export function setOpportunityStatus(id: string, status: OpportunityStatus) {
  const result = getDatabase().prepare("UPDATE opportunities SET status = ?, updated_at = ? WHERE id = ?")
    .run(status, new Date().toISOString().slice(0, 10), id);
  if (result.changes > 0) writeAuditEvent(id, status === "已發布" ? "發布資訊" : status === "草稿" ? "改為草稿" : "下架資訊");
  return result.changes > 0;
}

export function updateOpportunity(id: string, input: Omit<Opportunity, "id" | "updatedAt" | "official">) {
  const result = getDatabase().prepare(`UPDATE opportunities SET
    title = ?, category = ?, organizer = ?, updated_at = ?, deadline = ?, campus = ?, departments = ?, tags = ?, summary = ?, eligibility = ?, source_url = ?
    WHERE id = ?`)
    .run(input.title, input.category, input.organizer, new Date().toISOString().slice(0, 10), input.deadline, input.campus, JSON.stringify(input.departments), JSON.stringify(input.tags), input.summary, input.eligibility, input.sourceUrl, id);
  if (result.changes === 0) return null;
  const row = getDatabase().prepare("SELECT * FROM opportunities WHERE id = ?").get(id) as unknown as OpportunityRow;
  writeAuditEvent(id, "編輯資訊");
  return rowToOpportunity(row);
}

export function listAuditEvents() {
  const rows = getDatabase().prepare(`SELECT audit_events.id, audit_events.opportunity_id, audit_events.action, audit_events.created_at, opportunities.title
    FROM audit_events JOIN opportunities ON opportunities.id = audit_events.opportunity_id
    ORDER BY audit_events.created_at DESC LIMIT 20`).all() as Array<{ id: string; opportunity_id: string; action: string; created_at: string; title: string }>;
  return rows.map((row) => ({ id: row.id, opportunityId: row.opportunity_id, opportunityTitle: row.title, action: row.action, createdAt: row.created_at }));
}
