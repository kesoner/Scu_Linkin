"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { campuses, departments } from "@/lib/opportunities";
import { defaultPreferences, preferenceKey, readPreferences, type Preferences } from "@/lib/preferences";

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const preferenceTimer = window.setTimeout(() => setPreferences(readPreferences()), 0);
    return () => window.clearTimeout(preferenceTimer);
  }, []);

  function save() {
    localStorage.setItem(preferenceKey, JSON.stringify(preferences));
    setMessage("設定已儲存。回到機會中心後會自動套用系所與校區篩選。LINE 提醒會在官方帳號串接後啟用。");
  }

  return <main className="min-h-screen bg-[#fffafa] text-[#2a1618]"><header className="border-b border-rose-100 bg-white"><div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4"><div><p className="text-lg font-bold text-[#8f1024]">東吳 LinkIn</p><p className="text-xs text-stone-500">個人設定</p></div><Link href="/" className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-[#8f1024] hover:bg-rose-50">← 機會中心</Link></div></header><section className="mx-auto max-w-3xl px-5 py-10"><div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200 sm:p-8"><p className="text-sm font-semibold tracking-[0.15em] text-[#a5162a]">MY PREFERENCES</p><h1 className="mt-2 text-3xl font-bold text-[#8f1024]">設定你關心的機會</h1><p className="mt-3 leading-7 text-stone-600">設定後，機會中心會優先套用你的系所與校區。興趣標籤會作為後續推薦與推播的基礎。</p><div className="mt-8 grid gap-5 sm:grid-cols-2"><label className="text-sm font-medium">系所<select value={preferences.department} onChange={(event) => setPreferences({ ...preferences, department: event.target.value })} className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3">{departments.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-sm font-medium">常用校區／形式<select value={preferences.campus} onChange={(event) => setPreferences({ ...preferences, campus: event.target.value })} className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3">{campuses.map((item) => <option key={item}>{item}</option>)}</select></label></div><label className="mt-5 block text-sm font-medium">興趣標籤<input value={preferences.interests} onChange={(event) => setPreferences({ ...preferences, interests: event.target.value })} placeholder="例如：法律、金融、實習、國際交流" className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#a5162a] focus:ring-2 focus:ring-rose-100" /></label><p className="mt-2 text-xs text-stone-500">請以頓號或逗號分隔多個標籤。</p><label className="mt-7 flex items-start gap-3 rounded-xl bg-rose-50 p-4"><input type="checkbox" checked={preferences.deadlineReminder} onChange={(event) => setPreferences({ ...preferences, deadlineReminder: event.target.checked })} className="mt-1 size-4 accent-[#a5162a]" /><span><span className="block font-semibold text-[#8f1024]">截止日前提醒</span><span className="mt-1 block text-sm leading-6 text-stone-600">啟用後，未來可透過站內與 LINE 通知接收即將截止的機會提醒。</span></span></label>{message && <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm leading-6 text-[#8f1024]">{message}</p>}<button onClick={save} className="mt-6 rounded-xl bg-[#a5162a] px-5 py-3 font-bold text-white hover:bg-[#8f1024]">儲存設定</button></div></section></main>;
}
