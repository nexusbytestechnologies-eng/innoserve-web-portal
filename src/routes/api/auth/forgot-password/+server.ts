import { env } from '$env/dynamic/private';
import nodemailer from 'nodemailer';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  const { email } = (await request.json()) as { email?: string };

  if (email) {
    try {
      // Ask the backend to generate a signed reset token (no SMTP from Railway).
      const backendRes = await fetch(
        `${env.PRIVATE_API_BASE_URL}/api/auth/generate-reset-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': env.PRIVATE_INTERNAL_SECRET,
          },
          body: JSON.stringify({ email }),
        },
      );

      if (backendRes.ok) {
        const data = (await backendRes.json()) as {
          found: boolean;
          token?: string;
          name?: string;
          email?: string;
        };

        if (data.found && data.token && data.email) {
          const frontendUrl = env.PRIVATE_FRONTEND_URL ?? 'https://innoserve-web-portal.vercel.app';
          const resetLink = `${frontendUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(data.token)}`;

          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: env.GMAIL_USER,
              pass: env.GMAIL_APP_PASSWORD?.replace(/\s+/g, ''),
            },
          });

          await transporter.sendMail({
            from: `"Innoserve" <${env.GMAIL_USER}>`,
            to: data.email,
            subject: 'Reset your Innoserve password',
            html: passwordResetHtml(data.name ?? 'there', resetLink),
          });
        }
      }
    } catch {
      // Swallow errors — always return 200 to prevent email enumeration.
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'If an active account exists for this email, a reset link has been sent.',
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};

function passwordResetHtml(name: string, resetLink: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#f2f0ed;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f0ed;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <tr><td align="center" style="padding-bottom:24px;">
          <span style="font-size:18px;font-weight:700;color:#0B182A;letter-spacing:-0.3px;">InnoServe</span>
        </td></tr>

        <tr><td style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="height:4px;background:linear-gradient(to right,#0B182A,#021E44);font-size:0;line-height:0;">&nbsp;</td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:36px 40px 32px;">
              <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0B182A;">Reset your password</h1>
              <p style="margin:0 0 20px;font-size:13px;color:#6b7280;line-height:1.6;">
                Hi ${name}, we received a request to reset the password for your Innoserve account.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr><td style="border-radius:10px;background-color:#E87D1F;">
                  <a href="${resetLink}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
                    Set New Password →
                  </a>
                </td></tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr><td style="background-color:#f9fafb;border-radius:8px;padding:14px 16px;">
                  <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.6px;">Or copy this link</p>
                  <p style="margin:0;font-size:12px;color:#0B182A;word-break:break-all;font-family:monospace;">${resetLink}</p>
                </td></tr>
              </table>
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.7;">
                This link expires in <strong style="color:#6b7280;">1 hour</strong>.
                If you did not request a password reset, you can safely ignore this email.
              </p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:24px 0 8px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} Innoserve Techsol. All rights reserved.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
