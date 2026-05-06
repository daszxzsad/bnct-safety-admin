import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function checkAuth(req: Request) {
  const adminPass = process.env.ADMIN_PASSWORD || "";
  const headerPass = req.headers.get("x-admin-pass") || "";
  return adminPass && headerPass === adminPass;
}

export async function GET(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_ANON_KEY || ""
  );

  const url = new URL(req.url);
  const isStats = url.searchParams.get("stats") === "1";

  const { data: permits, error } = await supabase
    .from("permits")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (isStats) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonth = (permits || []).filter(
      (p) => new Date(p.created_at) >= monthStart
    ).length;
    const inProgress = (permits || []).filter(
      (p) => p.status === "pending_s3" || p.status === "pending_s4"
    ).length;
    const completed = (permits || []).filter(
      (p) => p.status === "active" || p.status === "completed"
    ).length;

    // 평균 결재 시간 (제출 → s4 서명까지 시간)
    const completedPermits = (permits || []).filter(
      (p) => p.s4_signed_at && p.created_at
    );
    let avgHours = 0;
    if (completedPermits.length > 0) {
      const totalMs = completedPermits.reduce((sum, p) => {
        const start = new Date(p.created_at).getTime();
        const end = new Date(p.s4_signed_at).getTime();
        return sum + (end - start);
      }, 0);
      avgHours = Math.round(totalMs / completedPermits.length / 1000 / 60 / 60 * 10) / 10;
    }

    const recent = (permits || []).slice(0, 5).map((p) => ({
      token: p.token,
      submit_date: p.submit_date,
      project_name: p.project_name,
      company_name: p.company_name,
      status: p.status,
    }));

    return NextResponse.json({
      stats: { thisMonth, inProgress, completed, avgHours, recent },
    });
  }

  // 일반 목록
  return NextResponse.json({
    permits: (permits || []).map((p) => ({
      token: p.token,
      submit_date: p.submit_date,
      created_at: p.created_at,
      project_name: p.project_name,
      company_name: p.company_name,
      worker_count: p.worker_count,
      status: p.status,
      s3_signed_at: p.s3_signed_at,
      s4_signed_at: p.s4_signed_at,
      managers: p.managers,
    })),
  });
}
