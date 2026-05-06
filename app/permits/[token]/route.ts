// ====================================================
// 📍 GitHub 위치: app/api/permits/[token]/route.ts
// 📌 폴더 경로: bnct-safety-admin/app/api/permits/[token]/
// 📝 파일 이름: route.ts (그대로)
// ⚠️ 폴더 이름은 반드시 [token] (대괄호 포함)
// ====================================================

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function checkAuth(req: Request) {
  const adminPass = process.env.ADMIN_PASSWORD || "";
  return adminPass && req.headers.get("x-admin-pass") === adminPass;
}

export async function GET(req: Request, ctx: { params: { token: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "인증 실패" }, { status: 401 });
  const supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_ANON_KEY || "");
  const { data, error } = await supabase.from("permits").select("*").eq("token", ctx.params.token).single();
  if (error || !data) return NextResponse.json({ error: "찾을 수 없음" }, { status: 404 });
  return NextResponse.json({ permit: data });
}
