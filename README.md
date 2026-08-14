# Par Aillere

Storefront + seller studio for Par Aillere, a homemade artisan cookie shop. Customers browse
a weekly batch menu, build a box, and check out with GCash/GoTyme (with proof upload) or
cash on pickup. The seller manages the catalogue, batch cycle, stock, and order/payment
verification from `/studio`.

Built with Next.js (App Router) + Neon Postgres + Prisma + Auth.js + Uploadthing, deployed
on Vercel.

## Stack

- **Next.js 16** (App Router, TypeScript, Server Actions)
- **Neon** — serverless Postgres
- **Prisma 6** — ORM + migrations
- **Auth.js (NextAuth v5)** — Credentials provider, single seller account
- **Uploadthing** — product photos, payment QR codes, payment proof uploads
- **Tailwind CSS v4**
- **Vercel** — hosting

## First-time setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Neon project** at [neon.tech](https://neon.tech). From the connection
   details panel, copy both the pooled and direct connection strings.

3. **Copy the env file and fill it in**

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL` — Neon's pooled connection string (`-pooler` in the host), used at runtime.
   - `DIRECT_URL` — Neon's direct connection string, used by `prisma migrate`.
   - `AUTH_SECRET` — generate with `npx auth secret` or `openssl rand -base64 33`.
   - `UPLOADTHING_TOKEN` — from the [Uploadthing dashboard](https://uploadthing.com/dashboard) → API Keys.
   - `SEED_SELLER_EMAIL` / `SEED_SELLER_PASSWORD` — the seller/admin login the seed script
     creates. Change the password before deploying anywhere public.

4. **Run migrations and seed the database**

   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```

   The seed script creates the seller account, an open starter batch, the 5-flavour launch
   menu, a few demo orders, and default GCash/GoTyme payment settings — all matching the
   original design.

5. **Run the app**

   ```bash
   npm run dev
   ```

   - Storefront: [http://localhost:3000](http://localhost:3000)
   - Seller studio: [http://localhost:3000/studio](http://localhost:3000/studio) — sign in
     with `SEED_SELLER_EMAIL` / `SEED_SELLER_PASSWORD`.

## Verifying the flow end to end

1. On the storefront, add a few cookies to the box (menu grid or a product detail page)
   until the minimum order is met, fill in the contact/delivery/payment form, and place the
   order. Cash orders skip proof upload; GCash/GoTyme orders require a payment screenshot.
2. You'll land on `/order/<ref>` with the reference number. Use `/#track` (or the "Track this
   order" link) to look it up with the phone number you entered.
3. Sign in to `/studio` and confirm the order appears on the Dashboard and in Orders. Open it,
   verify or reject the payment, and change the order status — the customer-facing tracker
   reflects it immediately.
4. In `/studio/products`, add a flavour, edit price/stock inline, upload a photo, and toggle
   it hidden — confirm the storefront menu updates.
5. In `/studio/batch`, edit the cutoff/delivery labels and minimum order, then try "Start next
   batch" — batch code increments and every product's stock resets to its planned amount.

## Project structure

```
prisma/
  schema.prisma        Seller, Batch, Product, Order, OrderItem, Counter, Settings
  seed.ts              Seeds the seller account, starter batch, menu, demo orders
src/
  app/
    (site)/            Storefront: home (menu/checkout/track/about/faq/contact),
                        product/[slug], order/[ref] — wrapped with the customer Header
    studio/
      login/            Seller sign-in (public)
      (dashboard)/       Dashboard, products, batch, stock, orders — auth-gated
    api/
      auth/[...nextauth]/  Auth.js route handler
      uploadthing/         Uploadthing file router
  actions/             Server Actions: orders.ts (place/track), products.ts, batch.ts,
                        studio-orders.ts (verify/reject/reopen payment, order status)
  components/          Shared UI, storefront/, studio/
  lib/                 prisma client, auth config, format helpers, constants, uploadthing
  store/cart.ts        Client-side cart (Zustand + localStorage)
  middleware.ts        Protects /studio/** (redirects to /studio/login when signed out)
```

## Notes

- Brand assets (logo, hero/about photography, decorative botanical accents) live in
  `public/assets/`. The hero and about photos can be swapped without touching code — either
  replace the files directly, or upload new ones from `/studio/batch` → Site photos, which
  takes priority over the static defaults. Product photos and payment QR codes work the same
  way, from `/studio/products` and `/studio/batch` respectively.
- `next-auth@beta` (Auth.js v5) is used since NextAuth v4 doesn't support the App Router's
  Server Actions/Route Handlers pattern the same way.
- Payment account name/number defaults live in `Settings` (seeded) and are editable from
  `/studio/batch`.
- Neon's free tier fixes compute auto-suspend at 5 minutes of inactivity, so an occasional
  cold-start delay on the first request after idle is expected. `src/lib/prisma.ts` retries
  once on that specific connection error so it's rarely user-visible.

## Deploying to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket and import it in Vercel.
2. Add the same environment variables from `.env` to the Vercel project (Production and
   Preview).
3. Vercel runs `npm install` then `npm run build`. `@prisma/client`'s own `postinstall`
   hook regenerates the Prisma client automatically, so no extra build step is needed.
4. Run `npx prisma migrate deploy` against the production `DATABASE_URL`/`DIRECT_URL` (from
   your machine or a CI step) before or after the first deploy, then `npm run db:seed` once.
