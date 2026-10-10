"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { categories, opportunities, type Opportunity, type OpportunityCategory } from "@/lib/opportunities";

type Status = "草稿" | "已發布" | "已下架";
type ManagedOpportunity = Opportunity & { status: Status };
type AuditEvent = { id: string; opportunityId: string; opportunityTitle: string; action: string; createdAt: string };

function isExpired(deadline: string) {
  return deadline < new Date().toISOString().slice(0, 10);
}

const initialItems: ManagedOpportunity[] = opportunities.map((item) => ({ ...item, status: "已發布" }));

const emptyForm = {
  title: "",
  category: "活動" as OpportunityCategory,
  organizer: "",
  deadline: "",
  campus: "不限",
  departments: "全校",
  tags: "",
  summary: "",
  eligibility: "",
  sourceUrl: "",
};

export default function AdminPage() {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [statusFilter, setStatusFilter] = useState<Status | "全部">("全部");
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  useEffect(() => {
    void fetch("/api/auth").then((response) => response.json()).then((data: { admin: boolean }) => { if (!data.admin) router.replace("/login?next=/admin"); else setAuthorized(true); });
    void fetch("/api/opportunities")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("無法載入資訊")))
      .then((data: ManagedOpportunity[]) => setItems(data))
      .catch(() => setNotice("目前無法連線資料庫，暫時顯示示範資料。"));
    void fetch("/api/audit").then((response) => response.ok ? response.json() : []).then((data: AuditEvent[]) => setAuditEvents(data));
  }, [router]);

  const visibleItems = statusFilter === "全部" ? items : items.filter((item) => item.status === statusFilter);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title || !form.organizer || !form.deadline || !form.summary || !form.sourceUrl) {
      setNotice("請完成標題、發布單位、截止日、說明與官方來源連結。");
      return;
    }
    const requestBody = {
      title: form.title,
      category: form.category,
      organizer: form.organizer,
      deadline: form.deadline,
      campus: form.campus,
      departments: form.departments.split("、").map((item) => item.trim()).filter(Boolean),
      tags: form.tags.split("、").map((item) => item.trim()).filter(Boolean),
      summary: form.summary,
      eligibility: form.eligibility || "請依官方來源說明確認資格。",
      sourceUrl: form.sourceUrl,
    };
    const response = await fetch(editingId ? `/api/opportunities/${editingId}` : "/api/opportunities", { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(requestBody) });
    if (!response.ok) {
      setNotice(editingId ? "更新資訊失敗，請確認資料後再試一次。" : "建立草稿失敗，請確認資料後再試一次。");
      return;
    }
    const newItem = await response.json() as ManagedOpportunity;
    setItems((current) => editingId ? current.map((item) => item.id === editingId ? newItem : item) : [newItem, ...current]);
    setForm(emptyForm);
    setNotice(editingId ? "資訊已更新。" : "已建立草稿。正式版將保留完整審核紀錄。");
    setEditingId(null);
    void refreshAudit();
  }

  async function updateStatus(id: string, status: Status) {
    const response = await fetch(`/api/opportunities/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!response.ok) {
      setNotice("更新狀態失敗，請稍後再試。");
      return;
    }
    setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    setNotice(`已更新為「${status}」。`);
    void refreshAudit();
  }

  async function refreshAudit() {
    const response = await fetch("/api/audit");
    if (response.ok) setAuditEvents(await response.json() as AuditEvent[]);
  }

  function startEdit(item: ManagedOpportunity) {
    setEditingId(item.id);
    setForm({ title: item.title, category: item.category, organizer: item.organizer, deadline: item.deadline, campus: item.campus, departments: item.departments.join("、"), tags: item.tags.join("、"), summary: item.summary, eligibility: item.eligibility, sourceUrl: item.sourceUrl });
    setNotice(`正在編輯「${item.title}」。`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function logout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.replace("/");
  }

  if (!authorized) return <main className="grid min-h-screen place-items-center bg-[#fffafa] text-sm text-stone-500">正在驗證管理員權限…</main>;

  return <main className="min-h-screen bg-[#fffafa] text-[#2a1618]">
    <header className="border-b border-rose-100 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8"><div><p className="text-lg font-bold text-[#8f1024]">東吳 LinkIn 管理後台</p><p className="text-xs text-stone-500">Phase 1 MVP：本機 SQLite 資料庫與管理員登入</p></div><div className="flex gap-3"><Link href="/" className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-[#8f1024] hover:bg-rose-50">← 機會中心</Link><button onClick={logout} className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium hover:bg-stone-50">登出</button></div></div></header>
    <section className="mx-auto grid max-w-6xl gap-6 px-5 py-8 lg:grid-cols-[0.9fr_1.1fr] sm:px-8">
      <form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200"><h1 className="text-2xl font-bold text-[#8f1024]">{editingId ? "編輯活動資訊" : "新增活動資訊"}</h1><p className="mt-2 text-sm text-stone-500">{editingId ? "修改後會保留目前發布狀態。" : "建立後先存為草稿，再由管理員發布。"}</p>
        <div className="mt-6 grid gap-4"><Field label="標題"><input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></Field><Field label="類別"><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as OpportunityCategory })}>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="發布單位"><input value={form.organizer} onChange={(event) => setForm({ ...form, organizer: event.target.value })} /></Field><Field label="截止日"><input type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} /></Field><Field label="校區／形式"><input value={form.campus} onChange={(event) => setForm({ ...form, campus: event.target.value })} /></Field><Field label="適用系所（以、分隔）"><input value={form.departments} onChange={(event) => setForm({ ...form, departments: event.target.value })} /></Field><Field label="標籤（以、分隔）"><input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} /></Field><Field label="官方來源連結"><input type="url" value={form.sourceUrl} onChange={(event) => setForm({ ...form, sourceUrl: event.target.value })} /></Field><Field label="內容說明"><textarea value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} /></Field><Field label="適用資格"><textarea value={form.eligibility} onChange={(event) => setForm({ ...form, eligibility: event.target.value })} /></Field></div>
        {notice && <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-[#8f1024]">{notice}</p>}<div className="mt-5 flex flex-wrap gap-3"><button className="rounded-xl bg-[#a5162a] px-5 py-3 font-bold text-white hover:bg-[#8f1024]">{editingId ? "儲存修改" : "儲存草稿"}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); setNotice("已取消編輯。"); }} className="rounded-xl border border-stone-300 px-5 py-3 font-semibold hover:bg-stone-50">取消</button>}</div>
      </form>
      <div className="space-y-6"><section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-bold text-[#8f1024]">活動管理</h2><p className="mt-1 text-sm text-stone-500">發布、下架與草稿狀態管理</p></div><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as Status | "全部")} className="rounded-lg border border-stone-300 px-3 py-2 text-sm"><option>全部</option><option>草稿</option><option>已發布</option><option>已下架</option></select></div>
        <div className="mt-5 space-y-3">{visibleItems.map((item) => <article key={item.id} className="rounded-xl border border-stone-200 p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="font-bold">{item.title}</p><p className="mt-1 text-sm text-stone-500">{item.category} · 截止 {item.deadline}{isExpired(item.deadline) ? " · 已逾期" : ""}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.status === "已發布" ? "bg-emerald-100 text-emerald-800" : item.status === "草稿" ? "bg-amber-100 text-amber-800" : "bg-stone-200 text-stone-700"}`}>{item.status}</span></div><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => startEdit(item)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm text-[#8f1024] hover:bg-rose-50">編輯</button><button onClick={() => updateStatus(item.id, "已發布")} className="rounded-lg border border-emerald-200 px-3 py-1.5 text-sm text-emerald-800 hover:bg-emerald-50">發布</button><button onClick={() => updateStatus(item.id, "草稿")} className="rounded-lg border border-amber-200 px-3 py-1.5 text-sm text-amber-800 hover:bg-amber-50">改為草稿</button><button onClick={() => updateStatus(item.id, "已下架")} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50">下架</button></div></article>)}</div>
      </section><section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200"><h2 className="text-xl font-bold text-[#8f1024]">最近操作紀錄</h2><div className="mt-4 space-y-3">{auditEvents.length === 0 ? <p className="text-sm text-stone-500">尚無操作紀錄。</p> : auditEvents.map((event) => <div key={event.id} className="border-l-2 border-rose-200 pl-3"><p className="text-sm font-medium">{event.action}｜{event.opportunityTitle}</p><p className="mt-1 text-xs text-stone-500">{new Date(event.createdAt).toLocaleString("zh-TW")}</p></div>)}</div></section></div>
    </section>
  </main>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium">{label}<span className="mt-1.5 block [&_input]:w-full [&_input]:rounded-lg [&_input]:border [&_input]:border-stone-300 [&_input]:px-3 [&_input]:py-2.5 [&_select]:w-full [&_select]:rounded-lg [&_select]:border [&_select]:border-stone-300 [&_select]:px-3 [&_select]:py-2.5 [&_textarea]:min-h-20 [&_textarea]:w-full [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-stone-300 [&_textarea]:px-3 [&_textarea]:py-2.5">{children}</span></label>;
}
