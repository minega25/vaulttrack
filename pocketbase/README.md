# VaultTrack — PocketBase schema

`pb_schema.json` is an importable collection set for **PocketBase v0.23+**.
Verified end-to-end against **0.39.10**: imported into a clean instance, then
driven through the running app's real signup, CRUD and stock flows.

13 collections, 114 custom fields, 30 relations, 28 indexes.

## Import

1. Start PocketBase (the app expects `http://127.0.0.1:8090`).
2. Open `http://127.0.0.1:8090/_/` → **Settings → Import collections**.
3. Paste the contents of `pb_schema.json`, or use *Load from JSON file*.
4. Leave **"Delete missing collections"** *unchecked*.
5. Review the diff, then **Confirm and import**.

> **Format note.** v0.23 renamed the collection `schema` key to `fields`, moved
> every field option inline, and made `created` / `updated` explicit `autodate`
> fields. A v0.22-style file does not fail loudly on a v0.23+ server — the
> `schema` key is ignored, the table is created with system columns only, and
> the first index then fails with `no such column: <field>`.

> **Import over existing data.** Field IDs here are fixed. If you already
> created `products`, `productCategories`, `companies` or `users` by hand,
> their field IDs differ, so PocketBase drops those columns and recreates them
> — the data in them goes too. Import into a fresh `pb_data/`, or export first.

`users` reuses the built-in auth collection ID (`_pb_users_auth_`), so it
updates the default collection rather than creating a second one. Every auth
option (password auth, OAuth2, MFA, OTP, token durations, email templates) is
carried over from the stock collection untouched. The unused default `name`
field is dropped in favour of `firstName` / `lastName`; `avatar` is kept.

## Entities

```
companies
├── users              companyId → companies          (auth collection)
├── warehouses         company → companies
├── suppliers          company → companies
├── customers          company → companies
├── productCategories  company → companies, parent → productCategories (self)
└── products           company → companies, category → productCategories,
                       supplier → suppliers
     ├── inventory           product →, warehouse →      stock on hand
     ├── stockMovements      product →, warehouse →, user →,
     │                       purchaseOrder →, salesOrder →
     ├── purchaseOrderItems  purchaseOrder →, product →
     └── salesOrderItems     salesOrder →, product →

purchaseOrders  company →, supplier →, warehouse →, createdBy → users
salesOrders     company →, customer →, warehouse →, createdBy → users
```

Collections are ordered so every relation target is created before the
collection pointing at it. `productCategories.parent` is the one
self-reference. Keep that order if you edit the file.

`inventory` is current stock — one row per product per warehouse, enforced by a
unique index. `stockMovements` is the append-only ledger. The app keeps the two
in step in `recordMovement()`; there are no PocketBase hooks.

## API rules

Everything is scoped to the signed-in user's company:

| Collections | Rule |
|---|---|
| all business data | `@request.auth.id != '' && company = @request.auth.companyId` |
| `purchaseOrderItems` / `salesOrderItems` | scoped through the parent order, e.g. `purchaseOrder.company = @request.auth.companyId` |
| `companies` | read/update own company; **create is public** (needed for signup); delete is admin-only |
| `users` | `id = @request.auth.id`; **create is public** (signup) |

Verified: a second company reads zero rows of the first company's products,
warehouses, suppliers and inventory, and cross-tenant writes and deletes are
rejected.

### Why `users.companyId` is optional

Signup spans two collections and PocketBase has no cross-collection transaction
over REST, so the app creates the **user first**, signs in, then creates the
company and attaches it. The usual failure (duplicate email) then happens
before anything is written. If company creation fails, the app deletes the
user, which the `users` delete rule permits for the authenticated account.

Creating the company first would strand an orphan company on every failed
signup, because `companies` delete is admin-only and the cleanup would 403.
`companyId` is therefore not marked required — it is only ever empty inside
that short window. `scope()` in `src/db/index.ts` throws a clear error if it
ever sees a user without one.

## Re-exporting

After changing collections in the admin UI, **Settings → Export collections**
and overwrite `pb_schema.json` so the repo copy stays authoritative.
