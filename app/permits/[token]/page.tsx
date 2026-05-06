// ====================================================
// 📍 GitHub 위치: app/permits/[token]/page.tsx
// 📌 폴더 경로: bnct-safety-admin/app/permits/[token]/
// 📝 파일 이름: page.tsx (그대로)
// ⚠️ 폴더 이름은 반드시 [token] (대괄호 포함)
// ====================================================

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function PermitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [permit, setPermit] = useState<any>(null);
  const [acting, setActing] = useState("");

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
      loadDetail();
    } else {
      setErr("비밀번호가 올바르지 않습니다.");
    }
  }

  async function loadDetail() {
    const res = await fetch(`/api/permits/${token}`, {
      headers: { "x-admin-pass": password },
    });
    if (res.ok) {
      const data = await res.json();
      setPermit(data.permit);
    }
  }

  async function doAction(action: "resend" | "extend" | "delete") {
    if (action === "delete" && !confirm("정말 삭제하시겠습니까? 복구할 수 없습니다.")) return;
    if (action === "resend" && !confirm("결재 링크를 다시 발송합니다. 계속하시겠습니까?")) return;
    if (action === "extend" && !confirm("만료 기간을 7일 연장합니다. 계속하시겠습니까?")) return;

    setActing(action);
    const res = await fetch(`/api/permits/${token}/${action}`, {
      method: "POST",
      headers: { "x-admin-pass": password },
    });
    const data = await res.json();
    setActing("");
    if (!res.ok) {
      alert("실패: " + (data.error || "오류"));
      return;
    }
    if (action === "delete") {
      alert("삭제되었습니다.");
      router.push("/permits");
    } else {
      alert(action === "resend" ? "재발송 완료" : "기간 연장 완료");
      loadDetail();
    }
  }

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center grid-bg">
        <div className="bg-white border border-slate-200 shadow-lg w-[420px] p-10">
          <div className="bg-navy-900 text-white text-2xl font-black tracking-[6px] px-4 py-3 inline-block">BNCT</div>
          <div className="mt-3 text-xs text-slate-400 tracking-widest font-mono">ADMIN · 자산관리팀 전용</div>
          <h1 className="mt-6 text-2xl font-black text-navy-900">관리자 로그인</h1>
          <form onSubmit={login} className="mt-6">
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

  if (!permit) return <div className="p-10 text-slate-400">불러오는 중...</div>;

  const managers = JSON.parse(permit.managers || "[]");
  const formData = JSON.parse(permit.form_fields || "{}");

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
            <Link href="/permits" className="text-slate-500 hover:text-navy-900">제출 이력</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-10">
        <Link href="/permits" className="text-xs text-slate-500 hover:text-navy-900">← 목록으로</Link>

        <div className="mt-4 mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-navy-900">{permit.project_name}</h1>
            <p className="mt-1 text-sm text-slate-500">{permit.company_name} · {permit.worker_count}명 · 제출 {permit.submit_date}</p>
            <div className="mt-3"><StatusPill status={permit.status} /></div>
          </div>
          <div className="flex gap-2">
            {permit.status !== "completed" && (
              <button onClick={() => doAction("resend")} disabled={!!acting}
                className="border border-slate-300 px-3 py-2 text-xs font-bold hover:bg-slate-50">
                {acting === "resend" ? "발송 중..." : "결재 링크 재발송"}
              </button>
            )}
            <button onClick={() => doAction("extend")} disabled={!!acting}
              className="border border-slate-300 px-3 py-2 text-xs font-bold hover:bg-slate-50">
              {acting === "extend" ? "연장 중..." : "+7일 만료 연장"}
            </button>
            <button onClick={() => doAction("delete")} disabled={!!acting}
              className="border border-red-300 text-red-600 px-3 py-2 text-xs font-bold hover:bg-red-50">
              {acting === "delete" ? "삭제 중..." : "삭제"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* 좌측: 결재 타임라인 */}
          <div className="col-span-1">
            <div className="bg-white border border-slate-200 p-6">
              <h2 className="text-sm font-bold text-navy-900 tracking-wide mb-6">결재 타임라인</h2>
              <Timeline permit={permit} />
            </div>
          </div>

          {/* 우측: 정보 */}
          <div className="col-span-2 space-y-6">
            {/* 기본 정보 */}
            <div className="bg-white border border-slate-200 p-6">
              <h2 className="text-sm font-bold text-navy-900 tracking-wide mb-4">기본 정보</h2>
              <InfoTable rows={[
                ["공사명", permit.project_name],
                ["업체명", permit.company_name],
                ["작업 인원", permit.worker_count + "명"],
                ["작업 장소", formData["s1-place"] || "-"],
                ["예상 작업 기간", `${formData["s1-from"] || "-"} ~ ${formData["s1-to"] || "-"}`],
                ["담당자", managers.map((m: any) => m.name).join(", ") || "-"],
                ["만료일", new Date(permit.expires_at).toLocaleString("ko-KR")],
              ]} />
            </div>

            {/* 결재 내역 */}
            <div className="bg-white border border-slate-200 p-6">
              <h2 className="text-sm font-bold text-navy-900 tracking-wide mb-4">결재 내역</h2>
              <div className="grid grid-cols-2 gap-4">
                <SignatureBlock label="Section 2 (외주작업자)"
                  name={formData["s2-name"]} date={formData["s2-date"]} time={formData["s2-time"]}
                  sig={formData["sig2_img"]} />
                <SignatureBlock label="Section 3 (담당자)"
                  name={permit.s3_name} date={permit.s3_date} time={permit.s3_time}
                  sig={permit.s3_sig} signedAt={permit.s3_signed_at} />
                <SignatureBlock label="Section 4 (승인담당자)"
                  name={permit.s4_name} date={permit.s4_date} time={permit.s4_time}
                  sig={permit.s4_sig} signedAt={permit.s4_signed_at} />
              </div>
            </div>

            {/* 결재 링크 */}
            <div className="bg-white border border-slate-200 p-6">
              <h2 className="text-sm font-bold text-navy-900 tracking-wide mb-4">결재 링크 (참고용)</h2>
              <LinkRow label="외주작업자 / 활성 단계" url={`/sign?token=${permit.token}&role=active`} status={permit.status} />
              <LinkRow label="Section 3 (담당자)" url={`/sign?token=${permit.token}&role=s3`} status={permit.status} />
              <LinkRow label="Section 4 (승인담당자)" url={`/sign?token=${permit.token}&role=s4`} status={permit.status} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Timeline({ permit }: { permit: any }) {
  const steps = [
    { label: "외주작업자 제출", date: permit.created_at, done: true },
    { label: "담당자 Section 3 서명", date: permit.s3_signed_at, done: !!permit.s3_signed_at },
    { label: "승인담당자 Section 4 승인", date: permit.s4_signed_at, done: !!permit.s4_signed_at },
    { label: "작업 진행 / 완료", date: null, done: permit.status === "active" || permit.status === "completed" },
  ];
  return (
    <div className="space-y-4">
      {steps.map((s, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full ${s.done ? "bg-brand-500" : "bg-slate-300"}`}></div>
            {i < steps.length - 1 && <div className={`w-px flex-1 mt-1 ${s.done ? "bg-brand-500" : "bg-slate-200"}`} style={{ minHeight: 24 }}></div>}
          </div>
          <div className="flex-1 pb-4">
            <div className={`text-xs font-bold ${s.done ? "text-navy-900" : "text-slate-400"}`}>STEP {i + 1}</div>
            <div className={`text-sm ${s.done ? "text-navy-900" : "text-slate-400"}`}>{s.label}</div>
            {s.date && <div className="text-[11px] text-slate-500 font-mono mt-0.5">{new Date(s.date).toLocaleString("ko-KR")}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function InfoTable({ rows }: { rows: [string, string][] }) {
  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map(([k, v]) => (
          <tr key={k} className="border-b border-slate-100 last:border-0">
            <td className="py-2 text-slate-400 text-xs font-mono w-32">{k}</td>
            <td className="py-2 text-navy-900">{v || "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SignatureBlock({ label, name, date, time, sig, signedAt }: any) {
  return (
    <div className="border border-slate-200 p-3">
      <div className="text-[10px] text-slate-400 font-mono tracking-widest font-bold mb-2">{label}</div>
      <div className="text-xs text-slate-500">이름: <span className="text-navy-900 font-medium">{name || "-"}</span></div>
      <div className="text-xs text-slate-500">일시: <span className="font-mono">{date || "-"} {time || ""}</span></div>
      {sig ? (
        <div className="mt-2 border border-slate-200 bg-white p-1">
          <img src={sig} alt="서명" className="w-full h-12 object-contain" />
        </div>
      ) : (
        <div className="mt-2 border border-dashed border-slate-200 bg-slate-50 h-14 flex items-center justify-center text-[11px] text-slate-400">미서명</div>
      )}
      {signedAt && <div className="text-[10px] text-slate-400 font-mono mt-1">{new Date(signedAt).toLocaleString("ko-KR")}</div>}
    </div>
  );
}

function LinkRow({ label, url, status }: { label: string; url: string; status: string }) {
  const baseUrl = (typeof window !== "undefined" ? window.location.origin : "").replace("admin", "safety").replace("bnct-safety-admin", "bnct-safety");
  const safetyUrl = `https://bnct-safety.vercel.app${url}`;
  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
      <div className="w-40 text-xs text-slate-500">{label}</div>
      <a href={safetyUrl} target="_blank" rel="noreferrer"
        className="flex-1 text-xs font-mono text-brand-500 truncate hover:underline">{safetyUrl}</a>
      <button onClick={() => navigator.clipboard.writeText(safetyUrl)}
        className="text-xs border border-slate-300 px-2 py-1 hover:bg-slate-50">복사</button>
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
  return <span className={`inline-block px-3 py-1 text-xs font-bold ${s.cls}`}>{s.label}</span>;
}
