# Caliente — Reward Desk

A one-page staff tool. Search a customer by name, phone, or email; see their
GoHighLevel record and review rating on the same page; mark the free soft drink
as handed over.

Next.js 14 (App Router) + Tailwind. No database, no n8n, no GHL funnel.

---

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. It starts in **sample-data mode** so you can see the
design straight away — search `vega` or `danny`.

## Connect it to GoHighLevel

1. In GHL, create the contact custom fields (Settings → Custom Fields):

   | Field | Type | Holds |
   |---|---|---|
   | `review_rating` | Number | 1–5 stars from the survey |

   Copy the field's ID from the URL when you open it.

   2. **Map the survey to that field.** The star question must write to
   `review_rating`. If it only lands in the submission log, this page will find
   the contact but show no rating.

   The drink redemption state is tracked with the `drink-redeemed` tag; no extra
   custom field is required.
3. Create a Private Integration Token (Settings → Private Integrations) with
   `contacts.readonly` and `contacts.write` scopes.

4. Copy `.env.local.example` to `.env.local` and fill it in:

```bash
cp .env.local.example .env.local
```

5. Restart. The sample-data banner disappears once real credentials are in.

## Deploy

Push to GitHub, import into Vercel, paste the same variables into
Project → Settings → Environment Variables. Free tier is plenty.

## Lock it to staff

The page shows customer names, phones, and emails, so don't leave it on a public
URL. Set `BASIC_AUTH_USER` and `BASIC_AUTH_PASS` and `middleware.js` puts a
browser password prompt in front of the whole site. Leave them blank to disable.

## Files

```
app/page.js            the search page (client component)
app/api/lookup/route.js   POST { query }     → { contacts }
app/api/redeem/route.js   POST { contactId } → { ok: true }
lib/ghl.js             GHL API calls, field mapping, sample data
middleware.js          optional password wall
```

The GHL token only ever lives on the server. Nothing secret reaches the browser.

## Removing the sample data

Delete the `DEMO` array and the `demoSearch` / `demoRedeem` functions at the
bottom of `lib/ghl.js` once you're live.
