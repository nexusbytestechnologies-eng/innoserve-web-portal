import { json } from "@sveltejs/kit";

type Flow = "customer" | "engineer";

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

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

async function gqlRequest<T>(fetchFn: typeof fetch, query: string): Promise<T> {
  const res = await fetchFn("/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const payload = (await res.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };

  if (payload.errors?.length) throw new Error(payload.errors[0].message);
  if (!payload.data) throw new Error("No data");

  return payload.data;
}

async function emailExists(
  fetchFn: typeof fetch,
  email: string,
  flow: Flow,
  excludeEmail?: string,
): Promise<boolean> {
  const normalized = normalizeEmail(email);

  if (flow === "customer") {
    const data = await gqlRequest<{
      customers: Array<{ email: string | null; secondaryContactEmail: string | null }>;
    }>(fetchFn, FETCH_CUSTOMER_EMAILS);

    return data.customers.some((c) => {
      const primary = normalizeEmail(c.email ?? "");
      const secondary = normalizeEmail(c.secondaryContactEmail ?? "");
      if (excludeEmail && primary === normalizeEmail(excludeEmail)) return false;
      return primary === normalized || secondary === normalized;
    });
  }

  const data = await gqlRequest<{
    engineerProfiles: Array<{ userEmail: string | null }>;
  }>(fetchFn, FETCH_ENGINEER_EMAILS);

  return data.engineerProfiles.some(
    (e) => normalizeEmail(e.userEmail ?? "") === normalized,
  );
}

export async function POST({ request, fetch }) {
  const body = (await request.json()) as {
    email?: string;
    flow?: Flow;
    excludeEmail?: string;
  };

  const { email, flow, excludeEmail } = body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ exists: false });
  }

  if (flow !== "customer" && flow !== "engineer") {
    return json({ error: "Invalid flow" }, { status: 400 });
  }

  try {
    const exists = await emailExists(fetch, email, flow, excludeEmail);
    return json({ exists });
  } catch {
    return json({ error: "Check failed" }, { status: 500 });
  }
}
