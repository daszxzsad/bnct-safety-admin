// ====================================================
// 📍 GitHub 위치: app/api/permits/[token]/delete/route.ts
// 📌 폴더 경로: bnct-safety-admin/app/api/permits/[token]/delete/
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
  const { error } = await supabase.from("permits").delete().eq("token", ctx.params.token);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
