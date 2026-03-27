import { json } from "@sveltejs/kit";
import { verifyOtp } from "$lib/server/otp-store";

export async function POST({ request }) {
  const { email, otp } = await request.json();

  if (!email || !otp) {
    return json({ message: "Email and OTP are required." }, { status: 400 });
  }

  const valid = verifyOtp(email, otp);
  if (!valid) {
    return json({ message: "Invalid or expired OTP." }, { status: 400 });
  }

  return json({ message: "Verified." });
}
