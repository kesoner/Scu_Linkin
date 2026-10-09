"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { campuses, departments } from "@/lib/opportunities";
import { defaultProfile, getSocialIdentity, profileKey, readProfile, type CredentialEntry, type ExperienceEntry, type Profile } from "@/lib/profile";

const createExperience = (): ExperienceEntry => ({ id: crypto.randomUUID(), organization: "", title: "", period: "", description: "" });
const createCredential = (): CredentialEntry => ({ id: crypto.randomUUID(), type: "證照", name: "", issuerOrLevel: "", date: "" });

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [message, setMessage] = useState("");
  const socialIdentity = getSocialIdentity(profile);

  useEffect(() => {
    const timer = window.setTimeout(() => setProfile(readProfile()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const update = <K extends keyof Profile>(key: K, value: Profile[K]) => setProfile((current) => ({ ...current, [key]: value }));
  const updateExperience = (id: string, key: keyof ExperienceEntry, value: string) => update("experiences", profile.experiences.map((item) => item.id === id ? { ...item, [key]: value } : item));
  const updateCredential = (id: string, key: keyof CredentialEntry, value: string) => update("credentials", profile.credentials.map((item) => item.id === id ? { ...item, [key]: value } : item));

  function save() {
    localStorage.setItem(profileKey, JSON.stringify(profile));
    setMessage("個人檔案已儲存。此版本只保存在目前瀏覽器，尚未公開或同步至校友資料。");
  }

  function uploadAvatar(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setMessage("請上傳圖片檔案。");
    if (file.size > 2 * 1024 * 1024) return setMessage("頭像檔案請小於 2 MB。");
    const reader = new FileReader();
    reader.onload = () => update("avatarDataUrl", typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
    setMessage("頭像已載入；按下儲存個人檔案後會保存在目前瀏覽器。");
  }

  return <main className="min-h-screen bg-[#fffafa] text-[#2a1618]">
    <header className="border-b border-rose-100 bg-white"><div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4"><div><p className="text-lg font-bold text-[#8f1024]">東吳 LinkIn</p><p className="text-xs text-stone-500">我的檔案</p></div><Link href="/" className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-medium text-[#8f1024] hover:bg-rose-50">← 機會中心</Link></div></header>
    <section className="mx-auto max-w-4xl px-5 py-10"><div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200 sm:p-8">
      <p className="text-sm font-semibold tracking-[0.15em] text-[#a5162a]">PROFESSIONAL PROFILE</p><h1 className="mt-2 text-3xl font-bold text-[#8f1024]">編輯我的專屬經歷</h1><p className="mt-3 leading-7 text-stone-600">彙整你的學習背景、跨域能力與實務經驗。未完成校友或學生驗證前，資料只保存在本機瀏覽器，不會公開給企業。</p>
      <ProfileSection title="基本與學業資料">
        <div className="flex flex-wrap items-center gap-5 rounded-xl bg-rose-50/60 p-4"><div className="grid size-20 place-items-center overflow-hidden rounded-full bg-[#a5162a] text-2xl font-bold text-white" style={profile.avatarDataUrl ? { backgroundImage: `url(${profile.avatarDataUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>{profile.avatarDataUrl ? <span className="sr-only">已上傳頭像</span> : profile.displayName.trim().charAt(0) || "？"}</div><div><p className="font-semibold text-[#8f1024]">個人頭像</p><label className="mt-2 inline-block cursor-pointer rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-medium text-[#8f1024] hover:bg-rose-50">上傳圖片<input type="file" accept="image/*" onChange={(event) => uploadAvatar(event.target.files?.[0])} className="sr-only" /></label>{profile.avatarDataUrl && <button type="button" onClick={() => update("avatarDataUrl", "")} className="ml-3 text-sm font-medium text-rose-700 hover:underline">移除</button>}<p className="mt-2 text-xs text-stone-500">JPG、PNG、WebP，最大 2 MB。</p></div></div>
        <label className="mt-5 flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-4"><input type="checkbox" checked={profile.visibilityMode === "隱身"} onChange={(event) => update("visibilityMode", event.target.checked ? "隱身" : "公開")} className="mt-1 size-4 accent-[#a5162a]" /><span><span className="block font-semibold text-[#8f1024]">隱身模式</span><span className="mt-1 block text-sm leading-6 text-stone-600">啟用時，社群不會顯示你的姓名、個人資料或上傳頭像；只會以共通系所頭像與系所名稱發言，也不會出現在企業搜尋或人才推薦中。</span></span></label>
        <aside className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-rose-200 bg-rose-50/50 p-4"><div className="grid size-12 shrink-0 place-items-center rounded-full bg-[#a5162a] text-xs font-bold text-white" style={!socialIdentity.usesDepartmentAvatar && profile.avatarDataUrl ? { backgroundImage: `url(${profile.avatarDataUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>{socialIdentity.usesDepartmentAvatar ? socialIdentity.avatarLabel : profile.avatarDataUrl ? <span className="sr-only">個人頭像</span> : socialIdentity.avatarLabel}</div><div><p className="text-xs font-semibold tracking-wide text-[#a5162a]">社群顯示預覽</p><p className="mt-1 font-semibold text-[#8f1024]">{socialIdentity.label}</p><p className="mt-1 text-sm text-stone-600">{socialIdentity.usesDepartmentAvatar ? "共通系所頭像 · 匿名發言" : "公開姓名與個人頭像"}</p></div></aside>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="顯示名稱"><input value={profile.displayName} onChange={(event) => update("displayName", event.target.value)} placeholder="例如：王小明" /></Field><Field label="身分"><select value={profile.role} onChange={(event) => update("role", event.target.value as Profile["role"])}><option>學生</option><option>校友</option><option>教職員</option></select></Field>
          <Field label="性別（選填）"><select value={profile.gender} onChange={(event) => update("gender", event.target.value as Profile["gender"])}><option>未填寫</option><option>女性</option><option>男性</option><option>非二元／其他</option><option>不願透露</option></select></Field><Field label="兵役狀態（選填）"><select value={profile.militaryService} onChange={(event) => update("militaryService", event.target.value as Profile["militaryService"])}><option>未填寫</option><option>不適用</option><option>免役</option><option>役畢</option><option>服役中</option><option>待役</option></select></Field>
          <Field label="學制／部別"><select value={profile.studyProgram} onChange={(event) => update("studyProgram", event.target.value as Profile["studyProgram"])}><option>未填寫</option><option>日間部</option><option>進修部</option><option>碩士在職專班</option><option>其他</option></select></Field><Field label="主修系所"><select value={profile.department} onChange={(event) => update("department", event.target.value)}><option value="">請選擇</option>{departments.slice(1).map((item) => <option key={item}>{item}</option>)}</select></Field>
          <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3"><Field label="進階修讀類別"><select value={profile.secondaryStudyType} onChange={(event) => setProfile((current) => ({ ...current, secondaryStudyType: event.target.value as Profile["secondaryStudyType"], secondaryStudyName: event.target.value === "無" ? "" : current.secondaryStudyName }))}><option>無</option><option>雙主修</option><option>輔系</option></select></Field><Field label={profile.secondaryStudyType === "無" ? "修讀名稱" : `${profile.secondaryStudyType}名稱`}><input disabled={profile.secondaryStudyType === "無"} value={profile.secondaryStudyName} onChange={(event) => update("secondaryStudyName", event.target.value)} placeholder={profile.secondaryStudyType === "無" ? "請先選擇類別" : "例如：會計學系"} className="disabled:cursor-not-allowed disabled:bg-stone-100" /></Field></div>
          <Field label="學程／跨域課程"><input value={profile.program} onChange={(event) => update("program", event.target.value)} placeholder="例如：金融科技學程" /></Field><Field label="校區"><select value={profile.campus} onChange={(event) => update("campus", event.target.value)}><option value="">請選擇</option>{campuses.slice(1).map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="畢業年／預計畢業年"><input value={profile.graduationYear} onChange={(event) => update("graduationYear", event.target.value)} placeholder="例如：2028" /></Field>
        </div>
      </ProfileSection>
      <ProfileSection title="企業與職涯資訊"><div className="grid gap-5 sm:grid-cols-2"><Field label="職涯興趣／目標職務"><input value={profile.careerInterest} onChange={(event) => update("careerInterest", event.target.value)} placeholder="例如：法遵、金融法務、產品企劃" /></Field><Field label="機會狀態"><select value={profile.opportunityStatus} onChange={(event) => update("opportunityStatus", event.target.value as Profile["opportunityStatus"])}><option>開放實習機會</option><option>開放正職機會</option><option>探索中</option><option>暫不開放</option></select></Field></div>
        <EntryHeader title="經歷" description="每筆可填入實習、工作、社團幹部、專案或志工經驗。" onAdd={() => update("experiences", [...profile.experiences, createExperience()])} addLabel="新增經歷" />
        <div className="space-y-4">{profile.experiences.length === 0 ? <EmptyEntry>尚未新增經歷。</EmptyEntry> : profile.experiences.map((entry, index) => <div key={entry.id} className="rounded-xl border border-rose-100 bg-rose-50/40 p-4"><div className="flex items-center justify-between"><p className="font-semibold text-[#8f1024]">經歷 {index + 1}</p><Remove onClick={() => update("experiences", profile.experiences.filter((item) => item.id !== entry.id))} /></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="組織／公司"><input value={entry.organization} onChange={(event) => updateExperience(entry.id, "organization", event.target.value)} placeholder="例如：○○銀行" /></Field><Field label="職稱／角色"><input value={entry.title} onChange={(event) => updateExperience(entry.id, "title", event.target.value)} placeholder="例如：法遵實習生" /></Field></div><Field label="期間"><input value={entry.period} onChange={(event) => updateExperience(entry.id, "period", event.target.value)} placeholder="例如：2025/07–2025/08" /></Field><Field label="內容與成果"><textarea value={entry.description} onChange={(event) => updateExperience(entry.id, "description", event.target.value)} placeholder="說明主要工作、專案成果或使用的技能。" /></Field></div>)}</div>
        <EntryHeader title="證照／語言能力" description="請將每一張證照或每一項語言能力分開新增。" onAdd={() => update("credentials", [...profile.credentials, createCredential()])} addLabel="新增項目" />
        <div className="space-y-4">{profile.credentials.length === 0 ? <EmptyEntry>尚未新增證照或語言能力。</EmptyEntry> : profile.credentials.map((entry, index) => <div key={entry.id} className="rounded-xl border border-rose-100 bg-rose-50/40 p-4"><div className="flex items-center justify-between"><p className="font-semibold text-[#8f1024]">項目 {index + 1}</p><Remove onClick={() => update("credentials", profile.credentials.filter((item) => item.id !== entry.id))} /></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="類別"><select value={entry.type} onChange={(event) => updateCredential(entry.id, "type", event.target.value)}><option>證照</option><option>語言能力</option></select></Field><Field label="名稱"><input value={entry.name} onChange={(event) => updateCredential(entry.id, "name", event.target.value)} placeholder={entry.type === "證照" ? "例如：金融常識與職業道德" : "例如：英文"} /></Field><Field label={entry.type === "證照" ? "發證單位" : "程度／分數"}><input value={entry.issuerOrLevel} onChange={(event) => updateCredential(entry.id, "issuerOrLevel", event.target.value)} placeholder={entry.type === "證照" ? "例如：金融研訓院" : "例如：TOEIC 850"} /></Field><Field label={entry.type === "證照" ? "取得日期" : "測驗日期"}><input value={entry.date} onChange={(event) => updateCredential(entry.id, "date", event.target.value)} placeholder="例如：2026-06" /></Field></div></div>)}</div>
        <Field label="技能"><input value={profile.skills} onChange={(event) => update("skills", event.target.value)} placeholder="例如：資料分析、Excel、簡報、Python、行銷企劃" /></Field><Field label="個人簡介"><textarea value={profile.bio} onChange={(event) => update("bio", event.target.value)} placeholder="可簡短介紹你的學習、職涯或交流興趣。" /></Field>
      </ProfileSection>
      {message && <p className="mt-5 rounded-xl bg-rose-50 p-4 text-sm leading-6 text-[#8f1024]">{message}</p>}<button onClick={save} className="mt-6 rounded-xl bg-[#a5162a] px-5 py-3 font-bold text-white hover:bg-[#8f1024]">儲存個人檔案</button>
    </div></section>
  </main>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-medium">{label}<span className="mt-2 block [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-stone-300 [&_input]:px-4 [&_input]:py-3 [&_input]:outline-none [&_input]:focus:border-[#a5162a] [&_input]:focus:ring-2 [&_input]:focus:ring-rose-100 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-stone-300 [&_select]:px-4 [&_select]:py-3 [&_textarea]:min-h-28 [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-stone-300 [&_textarea]:px-4 [&_textarea]:py-3">{children}</span></label>; }
function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mt-8 border-t border-rose-100 pt-7"><h2 className="text-xl font-bold text-[#8f1024]">{title}</h2><div className="mt-5 space-y-5">{children}</div></section>; }
function EntryHeader({ title, description, onAdd, addLabel }: { title: string; description: string; onAdd: () => void; addLabel: string }) { return <div className="mt-7 flex flex-wrap items-end justify-between gap-3"><div><h3 className="font-bold text-[#8f1024]">{title}</h3><p className="mt-1 text-sm text-stone-600">{description}</p></div><button type="button" onClick={onAdd} className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-[#8f1024] hover:bg-rose-50">＋ {addLabel}</button></div>; }
function EmptyEntry({ children }: { children: React.ReactNode }) { return <p className="rounded-xl border border-dashed border-stone-300 p-4 text-sm text-stone-500">{children}</p>; }
function Remove({ onClick }: { onClick: () => void }) { return <button type="button" onClick={onClick} className="text-sm font-medium text-rose-700 hover:underline">移除</button>; }
