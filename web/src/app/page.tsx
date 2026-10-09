"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { campuses, categories, departments, opportunities, type Opportunity, type OpportunityCategory } from "@/lib/opportunities";
import { readPreferences } from "@/lib/preferences";
import { readProfile } from "@/lib/profile";

const categoryStyles: Record<OpportunityCategory, string> = {
  活動: "bg-sky-100 text-sky-800",
  獎學金: "bg-amber-100 text-amber-800",
  "實習／徵才": "bg-violet-100 text-violet-800",
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<OpportunityCategory | "全部">("全部");
  const [department, setDepartment] = useState("全部");
  const [campus, setCampus] = useState("全部");
  const [deadlineRange, setDeadlineRange] = useState("全部");
  const [saved, setSaved] = useState<string[]>([]);
  const [selected, setSelected] = useState<Opportunity | null>(null);
  const [items, setItems] = useState<Opportunity[]>(opportunities);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const preferenceTimer = window.setTimeout(() => {
      const preferences = readPreferences();
      setDisplayName(readProfile().displayName);
      setDepartment(preferences.department);
      setCampus(preferences.campus);
    }, 0);
    void fetch("/api/opportunities")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("無法載入資訊")))
      .then((data: Array<Opportunity & { status: string }>) => setItems(data.filter((item) => item.status === "已發布")))
      .catch(() => undefined);
    return () => window.clearTimeout(preferenceTimer);
  }, []);

  const results = useMemo(() => items.filter((item) => {
    const text = [item.title, item.organizer, item.summary, item.category, ...item.departments, ...item.tags].join(" ").toLowerCase();
    const daysUntilDeadline = Math.ceil((new Date(`${item.deadline}T00:00:00`).getTime() - new Date("2026-10-09T00:00:00").getTime()) / 86_400_000);
    const isDeadlineMatch = deadlineRange === "全部" || (deadlineRange === "7 天內" && daysUntilDeadline <= 7) || (deadlineRange === "30 天內" && daysUntilDeadline <= 30);
    return (!query || text.includes(query.trim().toLowerCase())) &&
      (category === "全部" || item.category === category) &&
      (department === "全部" || item.departments.includes("全校") || item.departments.includes(department)) &&
      (campus === "全部" || item.campus === campus) && isDeadlineMatch;
  }), [items, query, category, department, campus, deadlineRange]);

  const toggleSaved = (id: string) => setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  return <main className="min-h-screen bg-[#fffafa] text-[#2a1618]">
    <header className="border-b border-stone-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
      <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-xl bg-white p-0.5 ring-1 ring-rose-200"><Image src="/linkin-logo.png" alt="東吳 LinkIn 標誌" width={44} height={44} priority /></div><div><p className="text-lg font-bold text-[#8f1024]">東吳 LinkIn</p><p className="text-xs text-stone-500">校園機會資訊中心</p></div></div>
      <div className="flex items-center gap-3"><span className="hidden text-sm text-stone-500 sm:inline">{displayName ? `${displayName}，你好` : "訪客"}</span><Link href="/demo" className="hidden rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-[#8f1024] hover:bg-rose-50 lg:block">MVP Demo</Link><Link href="/profile" className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-[#8f1024] hover:bg-rose-50">我的檔案</Link><Link href="/settings" className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-[#8f1024] hover:bg-rose-50">我的設定</Link><Link href="/admin" className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-[#8f1024] hover:bg-rose-50">管理後台</Link></div>
    </div></header>

    <section className="bg-[#a5162a] text-white"><div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16"><p className="mb-3 text-sm font-semibold tracking-[0.18em] text-rose-100">OPPORTUNITY HUB</p><h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">把重要機會，留給真正需要的人。</h1><p className="mt-5 max-w-xl leading-7 text-rose-50">搜尋校園活動、獎學金與實習徵才資訊；查看資格、截止日與官方申請管道。</p></div></section>

    <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8"><div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-6">
      <label className="block text-sm font-semibold" htmlFor="search">搜尋機會</label><input id="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例如：法律、實習、獎學金、金融…" className="mt-2 w-full rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none placeholder:text-stone-400 focus:border-[#a5162a] focus:ring-2 focus:ring-rose-100" />
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-medium">類別<select value={category} onChange={(event) => setCategory(event.target.value as OpportunityCategory | "全部")} className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5">{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="text-sm font-medium">適用系所<select value={department} onChange={(event) => setDepartment(event.target.value)} className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5">{departments.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="text-sm font-medium">校區／形式<select value={campus} onChange={(event) => setCampus(event.target.value)} className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5">{campuses.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="text-sm font-medium">截止日<select value={deadlineRange} onChange={(event) => setDeadlineRange(event.target.value)} className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5"><option>全部</option><option>7 天內</option><option>30 天內</option></select></label>
      </div>
    </div>
    <div className="mt-8 flex items-baseline justify-between"><div><h2 className="text-2xl font-bold text-[#8f1024]">可探索的機會</h2><p className="mt-1 text-sm text-stone-500">找到 {results.length} 筆符合條件的資訊</p></div><span className="hidden rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-[#8f1024] sm:block">MVP 示範資料</span></div>
    <div className="mt-5 grid gap-4 lg:grid-cols-2">{results.map((item) => <article key={item.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${categoryStyles[item.category]}`}>{item.category}</span><button onClick={() => toggleSaved(item.id)} className="rounded-lg px-2 py-1 text-sm text-stone-600 hover:bg-stone-100">{saved.includes(item.id) ? "已收藏" : "收藏"}</button></div><h3 className="mt-4 text-xl font-bold">{item.title}</h3><p className="mt-2 text-sm text-stone-500">{item.organizer} · {item.official ? "官方發布" : "已驗證發布者"}</p><p className="mt-4 leading-6 text-stone-700">{item.summary}</p><div className="mt-5 flex flex-wrap gap-2">{item.tags.map((tag) => <span key={tag} className="rounded-md bg-stone-100 px-2 py-1 text-xs text-stone-600">#{tag}</span>)}</div><div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4 text-sm"><span className="font-medium text-rose-700">截止 {item.deadline.slice(5).replace("-", "/")}</span><button onClick={() => setSelected(item)} className="font-semibold text-[#a5162a] hover:underline">查看詳情 →</button></div></article>)}</div>
    {results.length === 0 && <div className="mt-5 rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center text-stone-500">找不到符合條件的資訊。請調整關鍵字或篩選條件。</div>}
    </section>

    {selected && <div className="fixed inset-0 z-10 grid place-items-center bg-[#5d0614]/40 p-4" role="dialog" aria-modal="true" aria-labelledby="opportunity-title"><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between gap-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${categoryStyles[selected.category]}`}>{selected.category}</span><button onClick={() => setSelected(null)} className="rounded-lg px-2 py-1 text-stone-500 hover:bg-stone-100" aria-label="關閉詳情">✕</button></div><h2 id="opportunity-title" className="mt-4 text-2xl font-bold sm:text-3xl">{selected.title}</h2><p className="mt-2 text-sm text-stone-500">{selected.organizer} · 最後更新 {selected.updatedAt}</p><dl className="mt-6 grid gap-4 rounded-xl bg-stone-50 p-4 text-sm sm:grid-cols-2"><div><dt className="text-stone-500">截止日</dt><dd className="mt-1 font-semibold text-rose-700">{selected.deadline}</dd></div><div><dt className="text-stone-500">校區／形式</dt><dd className="mt-1 font-semibold">{selected.campus}</dd></div><div><dt className="text-stone-500">適用系所</dt><dd className="mt-1 font-semibold">{selected.departments.join("、")}</dd></div><div><dt className="text-stone-500">發布狀態</dt><dd className="mt-1 font-semibold">{selected.official ? "官方發布" : "已驗證發布者"}</dd></div></dl><section className="mt-6"><h3 className="font-bold">內容說明</h3><p className="mt-2 leading-7 text-stone-700">{selected.summary}</p></section><section className="mt-5"><h3 className="font-bold">適用資格</h3><p className="mt-2 leading-7 text-stone-700">{selected.eligibility}</p></section><div className="mt-8 flex flex-wrap gap-3"><a href={selected.sourceUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-[#a5162a] px-5 py-3 font-bold text-white hover:bg-[#8f1024]">前往官方申請／報名頁</a><button onClick={() => toggleSaved(selected.id)} className="rounded-xl border border-stone-300 px-5 py-3 font-semibold hover:bg-stone-50">{saved.includes(selected.id) ? "取消收藏" : "收藏此資訊"}</button></div></div></div>}
  </main>;
}
