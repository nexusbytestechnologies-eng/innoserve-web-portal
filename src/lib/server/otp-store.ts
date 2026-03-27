// In-memory OTP store — valid for 5 minutes
const store = new Map<string, { otp: string; expires: number }>();

export function saveOtp(email: string, otp: string) {
  store.set(email.toLowerCase(), { otp, expires: Date.now() + 5 * 60 * 1000 });
}

export function verifyOtp(email: string, otp: string): boolean {
  const entry = store.get(email.toLowerCase());
  if (!entry) return false;
  if (Date.now() > entry.expires) { store.delete(email.toLowerCase()); return false; }
  if (entry.otp !== otp) return false;
  store.delete(email.toLowerCase());
  return true;
}
