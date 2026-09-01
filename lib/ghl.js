const BASE = "https://services.leadconnectorhq.com";

export const FIELDS = {
  rating: process.env.GHL_FIELD_RATING,
};

export const REDEEM_TAG = process.env.GHL_REDEEM_TAG || "drink-redeemed";

/** True until real credentials are filled into .env.local. */
export function isDemo() {
  const token = process.env.GHL_TOKEN || "";
  const location = process.env.GHL_LOCATION_ID || "";
  const placeholder = (v) => !v || v.includes("xxxx");
  return placeholder(token) || placeholder(location);
}

const headers = () => ({
  Authorization: `Bearer ${process.env.GHL_TOKEN}`,
  Version: "2021-07-28",
  "Content-Type": "application/json",
});

function customField(contact, id) {
  const list = contact.customFields || contact.customField || [];
  const hit = list.find((f) => f.id === id || f.key === id);
  if (!hit) return "";
  return hit.value ?? hit.field_value ?? "";
}

/** Trim a GHL contact down to what the counter actually needs. */
export function shape(contact) {
  const tags = (contact.tags || []).map((t) => String(t).toLowerCase());

  return {
    id: contact.id,
    name:
      contact.contactName ||
      [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
      contact.email ||
      "Unnamed contact",
    phone: contact.phone || "",
    email: contact.email || "",
    rating: (() => {
      const raw = String(customField(contact, FIELDS.rating) || "");
      return (raw.match(/⭐|★/g) || []).length || parseInt(raw, 10) || 0;
    })(),
    redeemed: tags.includes(REDEEM_TAG),
    createdAt: contact.dateAdded || "",
    tags: contact.tags || [],
  };
}

export async function searchContacts(query) {
  if (isDemo()) return demoSearch(query);

  const res = await fetch(`${BASE}/contacts/search`, {
    method: "POST",
    headers: headers(),
    cache: "no-store",
    body: JSON.stringify({
      locationId: process.env.GHL_LOCATION_ID,
      pageLimit: 10,
      page: 1,
      query,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`GoHighLevel returned ${res.status}. ${detail.slice(0, 200)}`);
  }

  const data = await res.json();
  return (data.contacts || []).map(shape);
}

export async function markRedeemed(contactId) {
  if (isDemo()) return demoRedeem(contactId);

  // Tags are the only persistence needed for this status.
  const res = await fetch(`${BASE}/contacts/${contactId}/tags`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ tags: [REDEEM_TAG] }),
  });

  if (!res.ok) throw new Error(`Could not update the contact (${res.status}).`);

  return {};
}

/* ------------------------------------------------------------------
   Demo data — lets you open the page and see the design before the
   GoHighLevel credentials are in place. Delete once you go live.
------------------------------------------------------------------ */
const DEMO = [
  {
    id: "demo-1",
    name: "Marisol Vega",
    phone: "+1 619 555 0142",
    email: "marisol.vega@gmail.com",
    rating: 5,
    redeemed: false,
    createdAt: "2024-03-11T00:00:00Z",
    tags: ["review-5-star"],
  },
  {
    id: "demo-2",
    name: "Mario Vega",
    phone: "+1 858 555 0199",
    email: "mario@sorrentodesign.co",
    rating: 4,
    redeemed: true,
    createdAt: "2023-07-02T00:00:00Z",
    tags: ["review-4-star", "drink-redeemed"],
  },
  {
    id: "demo-3",
    name: "Danny Ochoa",
    phone: "+1 619 555 0177",
    email: "d.ochoa@outlook.com",
    rating: 0,
    redeemed: false,
    createdAt: "2025-11-20T00:00:00Z",
    tags: [],
  },
];

const demoStore = new Map();

function demoSearch(query) {
  const q = query.toLowerCase();
  return DEMO.filter((c) =>
    [c.name, c.phone, c.email].join(" ").toLowerCase().includes(q)
  ).map((c) => ({ ...c, ...(demoStore.get(c.id) || {}) }));
}

function demoRedeem(contactId) {
  demoStore.set(contactId, { redeemed: true });
  return {};
}
