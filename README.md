# VaultTrack

A simple inventory management system. Next.js 14 (App Router) on the front,
PocketBase for data and auth.

## Getting started

1. **Start PocketBase** (v0.23+; developed against 0.39.10) on port 8090:

   ```
   ./pocketbase serve
   ```

2. **Import the schema.** Open `http://127.0.0.1:8090/_/`, create your admin
   account, then **Settings → Import collections** and load
   [`pocketbase/pb_schema.json`](pocketbase/pb_schema.json). Leave *Delete
   missing collections* unchecked. See [pocketbase/README.md](pocketbase/README.md)
   for what it creates and why.

3. **Run the app:**

   ```
   npm install
   npm run dev
   ```

4. Visit `http://localhost:3000`. You'll be sent to `/auth/register` — signing
   up creates your company and its first user together.

Set `NEXT_PUBLIC_POCKETBASE_URL` if PocketBase is not on `127.0.0.1:8090`; see
[.env.example](.env.example). It is inlined at build time, so rebuild after
changing it.

## How it fits together

- **Auth** is a `pb_auth` httpOnly cookie holding the PocketBase token and user
  record. `src/middleware.ts` checks the token's expiry locally and redirects
  signed-out visitors to `/auth/login?next=...`. Everything outside `/auth`
  needs a session.
- **Data access** lives in [`src/db/index.ts`](src/db/index.ts). Each request
  builds its own PocketBase client from the cookie — a module-level singleton
  would share `authStore` between concurrent server requests and leak one
  user's session into another's.
- **Tenancy**: every query is filtered by the signed-in user's `companyId`, and
  the PocketBase API rules enforce the same thing server-side, so a bug in the
  app cannot expose another company's rows.
- **Pages** are server components that read through `src/db`; mutations go
  through `src/app/api/*` route handlers, which is the pattern the project
  already used.

## Stock model

`inventory` holds the current quantity per product per warehouse (unique
index). `stockMovements` is the append-only ledger of every change. Recording a
movement writes the ledger entry and applies the delta to the inventory row,
creating it on first movement:

| Type | Effect |
|---|---|
| Stock in, Return | adds the absolute quantity |
| Stock out | subtracts it |
| Adjustment | applies the sign you type, so corrections can go either way |

PocketBase has no multi-record transaction over REST, so if the inventory
update fails the ledger entry is deleted again to stop the two drifting apart.

## Routes

| Path | Purpose |
|---|---|
| `/dashboard` | Stock value, units on hand, low-stock list, recent movements |
| `/dashboard/products` | Catalogue CRUD, filterable by status via `?status=` |
| `/dashboard/inventory` | On-hand per product per warehouse, low-stock badges |
| `/dashboard/movements` | The ledger, newest first |
| `/dashboard/sales` | Sales orders; open one to edit its line items and ship it |
| `/dashboard/customers` | Customers CRUD |
| `/dashboard/categories` | Product categories, nestable via a parent |
| `/dashboard/warehouses` | Stocking locations CRUD |
| `/dashboard/suppliers` | Suppliers CRUD |

## Sales

An order is a draft until you ship it. Line items carry their own unit price,
copied from the product but overridable, so historic orders keep the price they
were actually sold at. Order totals are always recomputed from the lines
server-side, never trusted from the client.

**Shipping is the point where a sale touches stock.** It records one stock-out
movement per product through the same ledger the Movements page shows, then
locks the order's lines. Before writing anything it checks every line against
available stock and refuses the whole order if any of it is short; if a later
write still fails, the earlier movements are reversed, so an order never ships
half its stock. Lines for the same product are summed first, so two lines of
the same widget produce one movement.

Statuses move `draft -> confirmed -> shipped -> delivered`, with `cancelled`
reachable while still editable. Only shipped and delivered orders count toward
dashboard revenue, so drafts and cancellations never inflate it.

## Not built

`purchaseOrders` and `purchaseOrderItems` exist in the schema with working
relations and API rules, but no UI. Restocking is a manual "Stock in" movement
for now.
