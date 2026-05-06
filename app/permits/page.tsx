// ====================================================
// 📍 GitHub 위치: app/permits/page.tsx
// 📌 폴더 경로: bnct-safety-admin/app/permits/
// 📝 파일 이름: page.tsx (그대로)
// ====================================================

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function PermitsListPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [permits, setPermits] = useState<any[]>([]);
  const [filter, setFilter] = useState({ status: "all", company: "", from: "", to: "" });

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      setAuthed(true);
      loadPermits();
    } else {
      setErr("비밀번호가 올바르지 않습니다.");
    }
  }

  async function loadPermits() {
    const res = await fetch("/api/permits", {
      headers: { "x-admin-pass": password },
    });
    if (res.ok) {
      const data = await res.json();
      setPermits(data.permits || []);
    }
  }

  // 필터 적용
  const filtered = permits.filter((p) => {
    if (filter.status !== "all" && p.status !== filter.status) return false;
    if (filter.company && !p.company_name?.toLowerCase().includes(filter.company.toLowerCase())) return false;
    if (filter.from && p.submit_date < filter.from) return false;
    if (filter.to && p.submit_date > filter.to) return false;
    return true;
  });

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center grid-bg">
        <div className="bg-white border border-slate-200 shadow-lg w-[420px] p-10">
          <div className="mb-8">
            <div className="bg-navy-900 text-white text-2xl font-black tracking-[6px] px-4 py-3 inline-block">BNCT</div>
            <div className="mt-3 text-xs text-slate-400 tracking-widest font-mono">ADMIN · 자산관리팀 전용</div>
            <h1 className="mt-6 text-2xl font-black text-navy-900">관리자 로그인</h1>
            <p className="mt-2 text-sm text-slate-500">비밀번호를 입력하세요.</p>
          </div>
          <form onSubmit={login}>
            <input type="password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-brand-500" placeholder="비밀번호" />
            {err && <p className="mt-3 text-xs text-red-600 font-medium">{err}</p>}
            <button type="submit" disabled={loading || !password}
              className="mt-4 w-full bg-navy-900 text-white py-3 text-sm font-bold hover:bg-brand-500 transition disabled:bg-slate-300">
              {loading ? "확인 중..." : "로그인"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="bg-navy-900 text-white text-base font-black tracking-[4px] px-3 py-1.5">BNCT</div>
            <div className="text-xs text-slate-400 tracking-widest font-mono">ADMIN · 안전서류 관리자</div>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-slate-500 hover:text-navy-900">대시보드</Link>
            <Link href="/permits" className="font-bold text-navy-900">제출 이력</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-navy-900">제출 이력</h1>
          <p className="mt-1 text-sm text-slate-500">전체 {permits.length}건 / 필터 결과 {filtered.length}건</p>
        </div>

        {/* 필터 */}
        <div className="bg-white border border-slate-200 p-4 mb-4 flex gap-3 flex-wrap items-end">
          <div>
            <label className="text-xs text-slate-400 font-mono tracking-wider block mb-1">STATUS</label>
            <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="border border-slate-300 px-3 py-2 text-sm">
              <option value="all">전체</option>
              <option value="pending_s3">S3 대기</option>
              <option value="pending_s4">S4 대기</option>
              <option value="active">진행 중</option>
              <option value="completed">완료</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-mono tracking-wider block mb-1">COMPANY</label>
            <input type="text" placeholder="업체명 검색" value={filter.company}
              onChange={(e) => setFilter({ ...filter, company: e.target.value })}
              className="border border-slate-300 px-3 py-2 text-sm w-44" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-mono tracking-wider block mb-1">FROM</label>
            <input type="date" value={filter.from} onChange={(e) => setFilter({ ...filter, from: e.target.value })}
              className="border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-mono tracking-wider block mb-1">TO</label>
            <input type="date" value={filter.to} onChange={(e) => setFilter({ ...filter, to: e.target.value })}
              className="border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <button onClick={() => setFilter({ status: "all", company: "", from: "", to: "" })}
            className="border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">초기화</button>
        </div>

        {/* 테이블 */}
        <div className="bg-white border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 font-mono tracking-wider">
                <th className="px-4 py-3 text-left font-bold">제출일</th>
                <th className="px-4 py-3 text-left font-bold">공사명</th>
                <th className="px-4 py-3 text-left font-bold">업체</th>
                <th className="px-4 py-3 text-center font-bold">인원</th>
                <th className="px-4 py-3 text-left font-bold">상태</th>
                <th className="px-4 py-3 text-left font-bold">결재 시간</th>
                <th className="px-4 py-3 text-right font-bold">상세</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">데이터가 없습니다.</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.token} className="border-b border-slate-100 row-hover">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{p.submit_date}</td>
                  <td className="px-4 py-3 text-navy-900 font-medium">{p.project_name}</td>
                  <td className="px-4 py-3 text-slate-600">{p.company_name}</td>
                  <td className="px-4 py-3 text-center text-slate-600">{p.worker_count}명</td>
                  <td className="px-4 py-3"><StatusPill status={p.status} /></td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-mono">{calcDuration(p)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/permits/${p.token}`}
                      className="text-brand-500 hover:underline text-xs font-bold">보기 →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function calcDuration(p: any) {
  if (!p.s4_signed_at) return "-";
  const start = new Date(p.created_at).getTime();
  const end = new Date(p.s4_signed_at).getTime();
  const hours = Math.round((end - start) / 1000 / 60 / 60 * 10) / 10;
  return `${hours}h`;
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending_s3: { label: "S3 대기", cls: "bg-amber-50 text-amber-700" },
    pending_s4: { label: "S4 대기", cls: "bg-blue-50 text-blue-700" },
    active: { label: "진행 중", cls: "bg-emerald-50 text-emerald-700" },
    completed: { label: "완료", cls: "bg-slate-100 text-slate-700" },
  };
  const s = map[status] || { label: status, cls: "bg-slate-100" };
  return <span className={`inline-block px-2 py-0.5 text-[11px] font-bold ${s.cls}`}>{s.label}</span>;
}
