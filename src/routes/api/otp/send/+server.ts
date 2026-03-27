import { json } from "@sveltejs/kit";
import nodemailer from "nodemailer";
import { GMAIL_USER, GMAIL_APP_PASSWORD } from "$env/static/private";
import { saveOtp } from "$lib/server/otp-store";

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST({ request }) {
  const { email } = await request.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ message: "Invalid email address." }, { status: 400 });
  }

  const otp = generateOtp();
  saveOtp(email, otp);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });

  await transporter.sendMail({
    from: `"Innoserve" <${GMAIL_USER}>`,
    to: email,
    subject: "Your Verification Code",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#0B182A">Your OTP</h2>
        <p>Use the code below to verify your email address. It expires in <strong>5 minutes</strong>.</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#E87D1F;padding:16px 0">${otp}</div>
        <p style="color:#888;font-size:13px">If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  return json({ message: "OTP sent." });
}
