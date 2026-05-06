"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function HomePage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [stats, setStats] = useState<any>(null);

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
      loadStats();
    } else {
      setErr("비밀번호가 올바르지 않습니다.");
    }
  }

  async function loadStats() {
    const res = await fetch("/api/permits?stats=1", {
      headers: { "x-admin-pass": password },
    });
    if (res.ok) {
      const data = await res.json();
      setStats(data.stats);
    }
  }

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center grid-bg">
        <div className="bg-white border border-slate-200 shadow-lg w-[420px] p-10">
          <div className="mb-8">
            <div className="bg-navy-900 text-white text-2xl font-black tracking-[6px] px-4 py-3 inline-block">
              BNCT
            </div>
            <div className="mt-3 text-xs text-slate-400 tracking-widest font-mono">
              ADMIN · 자산관리팀 전용
            </div>
            <h1 className="mt-6 text-2xl font-black text-navy-900">
              관리자 로그인
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              비밀번호를 입력하세요.
            </p>
          </div>
          <form onSubmit={login}>
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-brand-500"
              placeholder="비밀번호"
            />
            {err && (
              <p className="mt-3 text-xs text-red-600 font-medium">{err}</p>
            )}
            <button
              type="submit"
              disabled={loading || !password}
              className="mt-4 w-full bg-navy-900 text-white py-3 text-sm font-bold hover:bg-brand-500 transition disabled:bg-slate-300"
            >
              {loading ? "확인 중..." : "로그인"}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-slate-100 text-[10px] text-slate-400 font-mono tracking-widest text-center">
            BNCT-AM-SAFE-ADMIN · v1.0
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="bg-navy-900 text-white text-base font-black tracking-[4px] px-3 py-1.5">
              BNCT
            </div>
            <div className="text-xs text-slate-400 tracking-widest font-mono">
              ADMIN · 안전서류 관리자
            </div>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/" className="font-bold text-navy-900">
              대시보드
            </Link>
            <Link
              href="/permits"
              className="text-slate-500 hover:text-navy-900"
            >
              제출 이력
            </Link>
          </nav>
        </div>
      </header>

      {/* KPI */}
      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-navy-900">대시보드</h1>
          <p className="mt-1 text-sm text-slate-500">
            안전서류 전자결재 진행 현황을 확인합니다.
          </p>
        </div>

        {!stats ? (
          <div className="text-sm text-slate-400">불러오는 중...</div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-4">
              <KpiCard
                label="이번 달 제출"
                value={stats.thisMonth}
                unit="건"
                tone="blue"
              />
              <KpiCard
                label="진행 중"
                value={stats.inProgress}
                unit="건"
                tone="amber"
              />
              <KpiCard
                label="완료"
                value={stats.completed}
                unit="건"
                tone="green"
              />
              <KpiCard
                label="평균 결재 시간"
                value={stats.avgHours}
                unit="시간"
                tone="navy"
              />
            </div>

            <div className="mt-8 bg-white border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-navy-900 tracking-wide">
                  최근 제출 5건
                </h2>
                <Link
                  href="/permits"
                  className="text-xs text-brand-500 hover:underline font-medium"
                >
                  전체 이력 보기 →
                </Link>
              </div>
              <table className="w-full mt-4 text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-400">
                    <th className="py-2 text-left font-medium">제출일</th>
                    <th className="py-2 text-left font-medium">공사명</th>
                    <th className="py-2 text-left font-medium">업체</th>
                    <th className="py-2 text-left font-medium">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats.recent || []).map((r: any) => (
                    <tr key={r.token} className="border-b border-slate-100">
                      <td className="py-3 font-mono text-xs text-slate-600">
                        {r.submit_date}
                      </td>
                      <td className="py-3 text-navy-900 font-medium">
                        {r.project_name}
                      </td>
                      <td className="py-3 text-slate-600">{r.company_name}</td>
                      <td className="py-3">
                        <StatusPill status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function KpiCard({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: number | string;
  unit: string;
  tone: "blue" | "amber" | "green" | "navy";
}) {
  const toneMap: Record<string, string> = {
    blue: "text-brand-500",
    amber: "text-amber-600",
    green: "text-emerald-600",
    navy: "text-navy-900",
  };
  return (
    <div className="bg-white border border-slate-200 p-6">
      <div className="text-xs text-slate-400 font-mono tracking-widest font-medium">
        {label.toUpperCase()}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className={`text-4xl font-black ${toneMap[tone]}`}>{value}</span>
        <span className="text-sm text-slate-400 font-medium">{unit}</span>
      </div>
      <div className="mt-2 text-sm text-slate-600">{label}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending_s3: { label: "S3 대기", cls: "bg-amber-50 text-amber-700" },
    pending_s4: { label: "S4 대기", cls: "bg-blue-50 text-blue-700" },
    active: { label: "진행 중", cls: "bg-emerald-50 text-emerald-700" },
    completed: { label: "완료", cls: "bg-slate-100 text-slate-700" },
  };
  const s = map[status] || { label: status, cls: "bg-slate-100" };
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[11px] font-bold ${s.cls}`}
    >
      {s.label}
    </span>
  );
}
