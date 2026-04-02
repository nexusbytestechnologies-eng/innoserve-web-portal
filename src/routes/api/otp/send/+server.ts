import { json } from "@sveltejs/kit";
import nodemailer from "nodemailer";
import { env } from "$env/dynamic/private";
import { saveOtp } from "$lib/server/otp-store";

type OtpFlow = "customer" | "engineer";

const FETCH_CUSTOMER_EMAILS = `
  query {
    customers {
      email
      secondaryContactEmail
    }
  }
`;

const FETCH_ENGINEER_EMAILS = `
  query {
    engineerProfiles {
      userEmail
    }
  }
`;

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

async function gqlRequest<T>(
  fetchFn: typeof fetch,
  query: string,
): Promise<T> {
  const res = await fetchFn("/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  const payload = (await res.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };

  if (payload.errors?.length) {
    throw new Error(payload.errors[0].message);
  }

  if (!payload.data) {
    throw new Error("GraphQL response did not include data.");
  }

  return payload.data;
}

async function emailExists(
  fetchFn: typeof fetch,
  email: string,
  flow: OtpFlow,
): Promise<boolean> {
  const normalizedEmail = normalizeEmail(email);

  if (flow === "customer") {
    const data = await gqlRequest<{
      customers: Array<{ email: string | null; secondaryContactEmail: string | null }>;
    }>(fetchFn, FETCH_CUSTOMER_EMAILS);

    return data.customers.some(
      (customer) =>
        normalizeEmail(customer.email ?? "") === normalizedEmail ||
        normalizeEmail(customer.secondaryContactEmail ?? "") === normalizedEmail,
    );
  }

  const data = await gqlRequest<{
    engineerProfiles: Array<{ userEmail: string | null }>;
  }>(fetchFn, FETCH_ENGINEER_EMAILS);

  return data.engineerProfiles.some(
    (engineer) => normalizeEmail(engineer.userEmail ?? "") === normalizedEmail,
  );
}

export async function POST({ request, fetch }) {
  const { email, flow } = await request.json() as {
    email?: string;
    flow?: OtpFlow;
  };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ message: "Invalid email address." }, { status: 400 });
  }

  if (flow !== "customer" && flow !== "engineer") {
    return json({ message: "Invalid OTP request." }, { status: 400 });
  }

  if (await emailExists(fetch, email, flow)) {
    return json({ message: "Email ID already exists." }, { status: 409 });
  }

  const otp = generateOtp();
  saveOtp(email, otp);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: env.GMAIL_USER, pass: env.GMAIL_APP_PASSWORD },
  });

  await transporter.sendMail({
    from: `"Innoserve" <${env.GMAIL_USER}>`,
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
