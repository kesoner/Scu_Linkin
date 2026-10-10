"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSocialIdentity, readProfile, type Profile } from "@/lib/profile";
import type { CommunityPost, PostKind } from "@/lib/community-store";

const kinds: Array<PostKind | "全部"> = ["全部", "交流", "活動", "徵才"];
const kindStyles: Record<PostKind, string> = { 交流: "bg-sky-100 text-sky-800", 活動: "bg-amber-100 text-amber-800", 徵才: "bg-violet-100 text-violet-800" };

export default function CommunityPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [filter, setFilter] = useState<PostKind | "全部">("全部");
  const [kind, setKind] = useState<PostKind>("交流");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setProfile(readProfile()), 0);
    void fetch("/api/community/posts").then((response) => response.json()).then((data: CommunityPost[]) => setPosts(data)).catch(() => setNotice("暫時無法載入社群動態。"));
    return () => window.clearTimeout(timer);
  }, []);

  const social = getSocialIdentity(profile ?? readProfile());
  const visiblePosts = useMemo(() => filter === "全部" ? posts : posts.filter((post) => post.kind === filter), [posts, filter]);

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile) return;
    const response = await fetch("/api/community/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, title, content, authorName: social.label, authorDepartment: profile.department || "未設定系所", authorRole: profile.role, anonymous: profile.visibilityMode === "隱身" }) });
    if (!response.ok) { setNotice((await response.json() as { error: string }).error); return; }
    const createdPost = await response.json() as CommunityPost;
    setPosts((current) => [createdPost, ...current]);
    setTitle(""); setContent(""); setNotice("貼文已發布。MVP 版本將在後續加入校友驗證與內容審核流程。");
  }

  return <main className="min-h-screen bg-[#fffafa] text-[#2a1618]"><header className="border-b border-rose-100 bg-white"><div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4"><div><p className="text-lg font-bold text-[#8f1024]">東吳 LinkIn 社群</p><p className="text-xs text-stone-500">校友、學生與校園機會的交流空間</p></div><div className="flex gap-3"><Link href="/profile" className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-[#8f1024]">我的檔案</Link><Link href="/" className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-[#8f1024]">← 機會中心</Link></div></div></header><section className="mx-auto grid max-w-5xl gap-6 px-5 py-8 lg:grid-cols-[0.85fr_1.15fr]"><aside><div className="rounded-2xl bg-[#a5162a] p-6 text-white"><p className="text-sm font-bold tracking-[0.15em] text-rose-100">ALUMNI COMMUNITY</p><h1 className="mt-3 text-3xl font-bold leading-tight">讓經驗，成為下一位東吳人的路標。</h1><p className="mt-4 text-sm leading-7 text-rose-50">探索校友分享、活動消息與徵才資訊。即將加入驗證、留言、收藏與檢舉機制。</p></div><div className="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200"><p className="text-sm font-bold text-[#8f1024]">篩選動態</p><div className="mt-3 flex flex-wrap gap-2">{kinds.map((item) => <button key={item} onClick={() => setFilter(item)} className={`rounded-full px-3 py-1.5 text-sm font-medium ${filter === item ? "bg-[#a5162a] text-white" : "bg-stone-100 text-stone-700 hover:bg-rose-50"}`}>{item}</button>)}</div></div></aside><div className="space-y-5"><form onSubmit={publish} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-full bg-[#a5162a] text-xs font-bold text-white">{social.avatarLabel}</div><div><p className="font-bold text-[#8f1024]">以 {social.label} 發布</p><p className="text-xs text-stone-500">{social.hidesPersonalInformation ? "隱身模式：僅顯示共通系所頭像與系所名稱。" : "公開模式：會顯示你的名稱與系所。"}</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-[120px_1fr]"><select value={kind} onChange={(event) => setKind(event.target.value as PostKind)} className="rounded-xl border border-stone-300 px-3 py-3"><option>交流</option><option>活動</option><option>徵才</option></select><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="貼文標題" className="rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#a5162a]" /></div><textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="分享你的經驗、活動或職涯資訊…" className="mt-3 min-h-28 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#a5162a]" />{notice && <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-[#8f1024]">{notice}</p>}<button className="mt-4 rounded-xl bg-[#a5162a] px-5 py-3 font-bold text-white hover:bg-[#8f1024]">發布貼文</button></form><section><div className="flex items-baseline justify-between"><h2 className="text-2xl font-bold text-[#8f1024]">社群動態</h2><span className="text-sm text-stone-500">{visiblePosts.length} 則</span></div><div className="mt-4 space-y-4">{visiblePosts.map((post) => <article key={post.id} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200"><div className="flex items-start gap-3"><div className="grid size-11 shrink-0 place-items-center rounded-full bg-[#a5162a] text-xs font-bold text-white">{post.anonymous ? post.authorDepartment.slice(0, 2) : post.authorName.slice(0, 1)}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-bold">{post.anonymous ? post.authorDepartment : post.authorName}</p>{post.authorVerified && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">已驗證校友</span>}<span className={`rounded-full px-2 py-0.5 text-xs font-bold ${kindStyles[post.kind]}`}>{post.kind}</span></div><p className="mt-1 text-xs text-stone-500">{post.anonymous ? "匿名發言" : `${post.authorDepartment} · ${post.authorRole}`} · {new Date(post.createdAt).toLocaleDateString("zh-TW")}</p></div></div><h3 className="mt-5 text-xl font-bold">{post.title}</h3><p className="mt-3 whitespace-pre-wrap leading-7 text-stone-700">{post.content}</p><div className="mt-5 flex gap-4 border-t border-stone-100 pt-4 text-sm font-medium text-stone-500"><span>♡ 收藏（Phase 2）</span><span>💬 留言（Phase 2）</span><span>⋯ 檢舉</span></div></article>)}</div></section></div></section></main>;
}
