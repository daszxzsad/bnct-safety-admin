// ====================================================
// 📍 GitHub 위치: app/api/permits/[token]/resend/route.ts
// 📌 폴더 경로: bnct-safety-admin/app/api/permits/[token]/resend/
// 📝 파일 이름: route.ts (그대로)
// ====================================================

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

function checkAuth(req: Request) {
  const adminPass = process.env.ADMIN_PASSWORD || "";
  return adminPass && req.headers.get("x-admin-pass") === adminPass;
}

export async function POST(req: Request, ctx: { params: { token: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: "인증 실패" }, { status: 401 });

  const supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_ANON_KEY || "");
  const { data: permit, error } = await supabase.from("permits").select("*").eq("token", ctx.params.token).single();
  if (error || !permit) return NextResponse.json({ error: "찾을 수 없음" }, { status: 404 });

  const baseUrl = process.env.SAFETY_BASE_URL || "https://bnct-safety.vercel.app";
  const ccEmail = process.env.CC_EMAIL || "";

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });

  let to: string = "";
  let role: string = "";
  let toName: string = "";

  if (permit.status === "pending_s3") {
    const managers = JSON.parse(permit.managers || "[]");
    const mgr = managers[0] || {};
    if (!mgr.email) return NextResponse.json({ error: "담당자 이메일 없음" }, { status: 400 });
    to = mgr.email;
    toName = mgr.name;
    role = "s3";
  } else if (permit.status === "pending_s4") {
    to = process.env.APPROVER_EMAIL || "";
    toName = process.env.APPROVER_NAME || "승인담당자";
    role = "s4";
    if (!to) return NextResponse.json({ error: "승인담당자 이메일 미설정" }, { status: 400 });
  } else {
    return NextResponse.json({ error: "재발송 불가 상태 (이미 완료)" }, { status: 400 });
  }

  const url = `${baseUrl}/sign?token=${permit.token}&role=${role}`;

  const mailOpts: any = {
    from: `"BNCT 안전서류 시스템" <${process.env.GMAIL_USER}>`,
    to: `"${toName}" <${to}>`,
    subject: `[BNCT 전자결재 · 재발송] ${permit.project_name} - ${permit.company_name} ${role === "s3" ? "Section 3" : "Section 4"} 서명 요청`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#003087,#1565c0);padding:24px 32px;">
          <div style="color:white;font-size:26px;font-weight:900;letter-spacing:4px;">BNCT</div>
          <div style="color:rgba(255,255,255,0.75);font-size:13px;margin-top:4px;">안전서류 전자결재 · 재발송</div>
        </div>
        <div style="background:white;padding:32px;border:1px solid #e0e0e0;border-top:none;">
          <p style="font-size:15px;color:#333;">
            안녕하세요, <strong>${toName}</strong>님.<br>
            아래 작업허가서의 ${role === "s3" ? "Section 3" : "Section 4"} 서명을 요청드립니다 (재발송).
          </p>
          <table style="width:100%;border-collapse:collapse;font-size:13px;margin:16px 0;">
            <tr style="background:#f5f7fa;"><td style="padding:10px 16px;font-weight:700;width:110px;border:1px solid #e0e0e0;">공사명</td><td style="padding:10px 16px;border:1px solid #e0e0e0;">${permit.project_name}</td></tr>
            <tr><td style="padding:10px 16px;font-weight:700;border:1px solid #e0e0e0;">업체명</td><td style="padding:10px 16px;border:1px solid #e0e0e0;">${permit.company_name}</td></tr>
            <tr style="background:#f5f7fa;"><td style="padding:10px 16px;font-weight:700;border:1px solid #e0e0e0;">제출일시</td><td style="padding:10px 16px;border:1px solid #e0e0e0;">${permit.submit_date || "-"}</td></tr>
          </table>
          <div style="margin:20px 0;padding:16px;border:1px solid #ccc;background:#f9f9f9;">
            <div style="font-size:14px;font-weight:700;color:#000;margin-bottom:8px;">✏️ 서명하러 가기</div>
            <a href="${url}" style="font-size:13px;color:#003087;word-break:break-all;">${url}</a>
          </div>
          <p style="font-size:11px;color:#aaa;text-align:center;">본 메일은 BNCT 자산관리팀 관리자 페이지에서 재발송되었습니다.</p>
        </div>
      </div>`,
  };
  if (ccEmail) mailOpts.cc = ccEmail;

  try {
    await transporter.sendMail(mailOpts);
    return NextResponse.json({ success: true, sentTo: to });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
