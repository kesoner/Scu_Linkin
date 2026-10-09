"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => { void fetch("/api/auth").then((response) => response.json()).then((data: { configured: boolean; admin: boolean }) => { setConfigured(data.configured); if (data.admin) router.replace(searchParams.get("next") || "/admin"); }); }, [router, searchParams]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (!response.ok) { setMessage("登入失敗，請確認密碼。" ); return; }
    router.replace(searchParams.get("next") || "/admin");
  }

  return <main className="grid min-h-screen place-items-center bg-[#fffafa] p-5"><form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-7 shadow-sm ring-1 ring-rose-100"><p className="text-sm font-semibold tracking-[0.15em] text-[#a5162a]">SCU LINKIN</p><h1 className="mt-2 text-3xl font-bold text-[#8f1024]">管理員登入</h1>{configured === false ? <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">尚未設定管理員帳號。請依 <code>.env.example</code> 建立 <code>.env.local</code>，再重新啟動開發伺服器。</p> : <><label className="mt-6 block text-sm font-medium">管理員密碼<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-[#a5162a] focus:ring-2 focus:ring-rose-100" autoFocus /></label>{message && <p className="mt-3 text-sm text-rose-700">{message}</p>}<button className="mt-6 w-full rounded-xl bg-[#a5162a] px-5 py-3 font-bold text-white hover:bg-[#8f1024]">登入管理後台</button></>}<Link href="/" className="mt-5 block text-center text-sm font-medium text-[#8f1024] hover:underline">回到機會中心</Link></form></main>;
}

export default function LoginPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-[#fffafa] text-sm text-stone-500">正在載入登入頁…</main>}><LoginForm /></Suspense>;
}
