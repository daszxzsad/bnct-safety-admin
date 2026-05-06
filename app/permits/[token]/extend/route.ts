// ====================================================
// 📍 GitHub 위치: app/api/permits/[token]/extend/route.ts
// 📌 폴더 경로: bnct-safety-admin/app/api/permits/[token]/extend/
// 📝 파일 이름: route.ts (그대로)
// ====================================================

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function checkAuth(req: Request) {
  const adminPass = process.env.ADMIN_PASSWORD || "";
  return adminPass && req.headers.get("x-admin-pass") === adminPass;
}

export async function POST(req: Request, ctx: { params: { token: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "인증 실패" }, { status: 401 });

  const supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_ANON_KEY || "");
  const { data: permit, error } = await supabase.from("permits").select("expires_at").eq("token", ctx.params.token).single();
  if (error || !permit) return NextResponse.json({ error: "찾을 수 없음" }, { status: 404 });

  const baseDate = permit.expires_at ? new Date(permit.expires_at) : new Date();
  // 만료일이 이미 지났으면 오늘 기준으로 +7일, 아니면 기존 만료일 +7일
  const start = baseDate.getTime() < Date.now() ? new Date() : baseDate;
  const newExpiry = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { error: updateErr } = await supabase.from("permits").update({ expires_at: newExpiry }).eq("token", ctx.params.token);
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ success: true, newExpiry });
}
