import { restRequest } from "$lib/api/rest";

export interface PayoutRecord {
  id: string;
  ticketId: string;
  ticketNumber?: string;
  engineerId: string;
  engineerName?: string;
  callType: string;
  payoutAmount: number;
  amount: number;
  currency: string;
  status: "pending" | "credited" | "disputed";
  creditedAt?: string;
  createdAt: string;
}

export async function fetchPayouts(params?: {
  engineerId?: string;
  status?: string;
  engineerName?: string;
  from?: string;
  to?: string;
}): Promise<PayoutRecord[]> {
  const qs = new URLSearchParams();
  if (params?.engineerId) qs.set("engineerId", params.engineerId);
  if (params?.status) qs.set("status", params.status);
  if (params?.engineerName) qs.set("engineerName", params.engineerName);
  if (params?.from) qs.set("from", params.from);
  if (params?.to) qs.set("to", params.to);

  const q = qs.toString();
  const rows = await restRequest<Array<Partial<PayoutRecord> & { payoutAmount?: number; amount?: number }>>(
    `/api/payouts${q ? `?${q}` : ""}`,
  );

  return rows.map((row) => {
    const payoutAmount = Number(row.payoutAmount ?? row.amount ?? 0);
    return {
      id: row.id ?? "",
      ticketId: row.ticketId ?? "",
      ticketNumber: row.ticketNumber,
      engineerId: row.engineerId ?? "",
      engineerName: row.engineerName,
      callType: row.callType ?? "",
      payoutAmount,
      amount: payoutAmount,
      currency: row.currency ?? "INR",
      status: (row.status as PayoutRecord["status"]) ?? "pending",
      creditedAt: row.creditedAt,
      createdAt: row.createdAt ?? "",
    };
  });
}
