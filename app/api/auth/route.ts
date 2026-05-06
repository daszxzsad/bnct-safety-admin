import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();
  const adminPass = process.env.ADMIN_PASSWORD || "";
  if (!adminPass) {
    return NextResponse.json({ error: "관리자 비밀번호 미설정" }, { status: 500 });
  }
  if (password !== adminPass) {
    return NextResponse.json({ error: "비밀번호 불일치" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
