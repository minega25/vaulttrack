import { cookies } from 'next/headers';
import type PocketBase from 'pocketbase';
import type { RecordModel } from 'pocketbase';
import {
  AUTH_COOKIE,
  clientFromCookie,
  newClient,
  serializeAuth,
  type SessionUser,
} from './client';

export {
  AUTH_COOKIE,
  POCKET_BASE_URL,
  authCookieOptions,
  newClient,
  serializeAuth,
} from './client';
export type { SessionUser } from './client';

// ---------------------------------------------------------------- session --

// Request-scoped, auth-loaded client. Safe to call many times in one request.
export function db(): PocketBase {
  return clientFromCookie(cookies().get(AUTH_COOKIE)?.value);
}

export function currentUser(): SessionUser | null {
  const pb = db();
  return pb.authStore.isValid ? (pb.authStore.record as SessionUser) : null;
}

// Every tenant-scoped query goes through this, so a missing session fails
// loudly here instead of silently returning another company's rows.
export function requireUser(): SessionUser {
  const user = currentUser();
  if (!user) throw new Error('Not authenticated');
  return user;
}

function scope() {
  const pb = db();
  const user = requireUser();
  // Only reachable if signup was interrupted between creating the account and
  // attaching the company; better to say so than to query with an empty id.
  if (!user.companyId) {
    throw new Error('Account is not linked to a company');
  }
  return { pb, companyId: user.companyId, user };
}

// PocketBase filter values must be escaped; pb.filter() parameterises them.
function byCompany(pb: PocketBase, companyId: string, extra?: string) {
  const base = pb.filter('company = {:c}', { c: companyId });
  return extra ? `${base} && ${extra}` : base;
}

// ----------------------------------------------------------------- auth ----

export async function authenticate(email: string, password: string) {
  const pb = newClient();
  const result = await pb
    .collection('users')
    .authWithPassword(email, password);
  if (!result?.token) throw new Error('Invalid email or password');
  return { pb, record: result.record };
}

// Signup spans two collections and PocketBase's REST API has no transaction
// across them, so the order is chosen to make every failure recoverable:
//
//   1. create the user     - the usual failure (duplicate email) lands here,
//                            and nothing has been written yet
//   2. sign them in        - needed to authorise steps 3 and 4
//   3. create the company
//   4. attach it to the user
//
// If 3 or 4 fail we delete the user, which the shipped `users` delete rule
// permits for the authenticated account. Creating the company first would
// strand an orphan company instead, because deleting one is admin-only.
export async function registerCompanyAndOwner(input: {
  companyName: string;
  phone?: string;
  email: string;
  password: string;
  passwordConfirm: string;
  firstName: string;
  lastName: string;
}) {
  const pb = newClient();

  const user = await pb.collection('users').create({
    email: input.email,
    password: input.password,
    passwordConfirm: input.passwordConfirm,
    firstName: input.firstName,
    lastName: input.lastName,
    role: 'owner',
    emailVisibility: true,
  });

  await pb.collection('users').authWithPassword(input.email, input.password);

  try {
    const company = await pb.collection('companies').create({
      name: input.companyName,
      phone: input.phone ?? '',
    });

    // Re-save so authStore (and the cookie built from it) carries companyId.
    const updated = await pb
      .collection('users')
      .update(user.id, { companyId: company.id });
    pb.authStore.save(pb.authStore.token, updated);
  } catch (err) {
    await pb
      .collection('users')
      .delete(user.id)
      .catch(() => undefined);
    pb.authStore.clear();
    throw err;
  }

  return pb;
}

// ------------------------------------------------------------- companies --

export async function getCompany() {
  const { pb, companyId } = scope();
  return pb.collection('companies').getOne(companyId);
}

// ------------------------------------------------------------ categories --

export type CategoryInput = {
  name: string;
  description?: string;
  parent?: string;
};

export async function listCategories() {
  const { pb, companyId } = scope();
  return pb.collection('productCategories').getFullList({
    filter: byCompany(pb, companyId),
    sort: 'name',
    expand: 'parent',
  });
}

export async function createCategory(input: CategoryInput) {
  const { pb, companyId } = scope();
  return pb
    .collection('productCategories')
    .create({ ...input, company: companyId });
}

export async function updateCategory(id: string, input: CategoryInput) {
  const { pb, companyId } = scope();
  // A category cannot be its own parent; deeper cycles are prevented by the
  // form, which only offers other categories as parents.
  const parent = input.parent === id ? '' : input.parent;
  return pb
    .collection('productCategories')
    .update(id, { ...input, parent, company: companyId });
}

export async function deleteCategory(id: string) {
  const { pb } = scope();
  return pb.collection('productCategories').delete(id);
}

// How many products point at each category, so the page can warn before a
// delete silently uncategorises them.
export async function categoryUsage() {
  const { pb, companyId } = scope();
  const products = await pb
    .collection('products')
    .getFullList({ filter: byCompany(pb, companyId), fields: 'category' });

  const counts = new Map<string, number>();
  for (const product of products) {
    const key = product.category as string;
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

// -------------------------------------------------------------- products --

export type ProductInput = {
  name: string;
  description?: string;
  unit_price: number;
  reorder_level: number;
  lead_time: number;
  category_id?: string;
  supplier_id?: string;
  sku?: string;
  status?: string;
};

function productPayload(input: ProductInput, companyId: string) {
  return {
    name: input.name,
    description: input.description ?? '',
    unit_price: input.unit_price,
    reorder_level: input.reorder_level,
    lead_time: input.lead_time,
    category: input.category_id || '',
    supplier: input.supplier_id || '',
    sku: input.sku ?? '',
    status: input.status || 'active',
    company: companyId,
  };
}

export async function listProducts(status?: string) {
  const { pb, companyId } = scope();
  const extra =
    status && status !== 'all'
      ? pb.filter('status = {:s}', { s: status })
      : undefined;
  return pb.collection('products').getFullList({
    filter: byCompany(pb, companyId, extra),
    sort: '-created',
    expand: 'category,supplier',
  });
}

export async function getProduct(id: string) {
  const { pb } = scope();
  return pb.collection('products').getOne(id, { expand: 'category,supplier' });
}

export async function createProduct(input: ProductInput) {
  const { pb, companyId } = scope();
  return pb.collection('products').create(productPayload(input, companyId));
}

export async function updateProduct(id: string, input: ProductInput) {
  const { pb, companyId } = scope();
  return pb.collection('products').update(id, productPayload(input, companyId));
}

export async function deleteProduct(id: string) {
  const { pb } = scope();
  return pb.collection('products').delete(id);
}

// ------------------------------------------------------------ warehouses --

export type WarehouseInput = {
  name: string;
  code?: string;
  address?: string;
  city?: string;
  country?: string;
  isActive?: boolean;
};

export async function listWarehouses() {
  const { pb, companyId } = scope();
  return pb.collection('warehouses').getFullList({
    filter: byCompany(pb, companyId),
    sort: 'name',
  });
}

export async function createWarehouse(input: WarehouseInput) {
  const { pb, companyId } = scope();
  return pb
    .collection('warehouses')
    .create({ isActive: true, ...input, company: companyId });
}

export async function updateWarehouse(id: string, input: WarehouseInput) {
  const { pb, companyId } = scope();
  return pb
    .collection('warehouses')
    .update(id, { ...input, company: companyId });
}

export async function deleteWarehouse(id: string) {
  const { pb } = scope();
  return pb.collection('warehouses').delete(id);
}

// ------------------------------------------------------------- suppliers --

export type SupplierInput = {
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  leadTimeDays?: number;
  isActive?: boolean;
};

export async function listSuppliers() {
  const { pb, companyId } = scope();
  return pb.collection('suppliers').getFullList({
    filter: byCompany(pb, companyId),
    sort: 'name',
  });
}

export async function createSupplier(input: SupplierInput) {
  const { pb, companyId } = scope();
  return pb
    .collection('suppliers')
    .create({ isActive: true, ...input, company: companyId });
}

export async function updateSupplier(id: string, input: SupplierInput) {
  const { pb, companyId } = scope();
  return pb
    .collection('suppliers')
    .update(id, { ...input, company: companyId });
}

export async function deleteSupplier(id: string) {
  const { pb } = scope();
  return pb.collection('suppliers').delete(id);
}

// ------------------------------------------------------------- inventory --

export async function listInventory() {
  const { pb, companyId } = scope();
  return pb.collection('inventory').getFullList({
    filter: byCompany(pb, companyId),
    sort: 'product.name',
    expand: 'product,warehouse',
  });
}

async function findInventoryRow(
  pb: PocketBase,
  companyId: string,
  productId: string,
  warehouseId: string
): Promise<RecordModel | null> {
  const rows = await pb.collection('inventory').getFullList({
    filter: byCompany(
      pb,
      companyId,
      pb.filter('product = {:p} && warehouse = {:w}', {
        p: productId,
        w: warehouseId,
      })
    ),
  });
  return rows[0] ?? null;
}

// ------------------------------------------------------- stock movements --

export const MOVEMENT_TYPES = [
  'in',
  'out',
  'adjustment',
  'return',
] as const;
export type MovementType = (typeof MOVEMENT_TYPES)[number];

// A movement's effect on stock. `adjustment` keeps the sign the user typed so
// a correction can go either way; the others are unsigned in the UI.
export function movementDelta(type: MovementType, quantity: number) {
  switch (type) {
    case 'in':
    case 'return':
      return Math.abs(quantity);
    case 'out':
      return -Math.abs(quantity);
    case 'adjustment':
      return quantity;
  }
}

export async function listMovements(limit = 100) {
  const { pb, companyId } = scope();
  return pb.collection('stockMovements').getList(1, limit, {
    filter: byCompany(pb, companyId),
    sort: '-created',
    expand: 'product,warehouse,user',
  });
}

export type MovementInput = {
  product: string;
  warehouse: string;
  type: MovementType;
  quantity: number;
  unitCost?: number;
  reference?: string;
  notes?: string;
};

// Enough to undo a movement if a later step in the same operation fails.
type AppliedMovement = {
  movementId: string;
  inventoryId: string;
  /** null when we created the inventory row, so undo deletes it. */
  previousQuantity: number | null;
};

// Writes the ledger entry, then applies the delta to the inventory row for
// that product/warehouse pair (creating it on first movement).
//
// PocketBase has no multi-record transaction over the REST API, so if the
// inventory update fails the ledger entry is rolled back by hand to keep the
// two from drifting apart.
async function applyMovement(
  pb: PocketBase,
  companyId: string,
  userId: string,
  input: MovementInput,
  extra?: Record<string, unknown>
): Promise<AppliedMovement> {
  const delta = movementDelta(input.type, Number(input.quantity));

  const movement = await pb.collection('stockMovements').create({
    company: companyId,
    product: input.product,
    warehouse: input.warehouse,
    type: input.type,
    quantity: delta,
    unitCost: input.unitCost ?? 0,
    reference: input.reference ?? '',
    notes: input.notes ?? '',
    user: userId,
    occurredAt: new Date().toISOString(),
    ...extra,
  });

  try {
    const row = await findInventoryRow(
      pb,
      companyId,
      input.product,
      input.warehouse
    );

    if (row) {
      const previousQuantity = Number(row.quantity ?? 0);
      await pb
        .collection('inventory')
        .update(row.id, { quantity: previousQuantity + delta });
      return { movementId: movement.id, inventoryId: row.id, previousQuantity };
    }

    const created = await pb.collection('inventory').create({
      company: companyId,
      product: input.product,
      warehouse: input.warehouse,
      quantity: delta,
      reserved: 0,
    });
    return {
      movementId: movement.id,
      inventoryId: created.id,
      previousQuantity: null,
    };
  } catch (err) {
    await pb
      .collection('stockMovements')
      .delete(movement.id)
      .catch(() => undefined);
    throw err;
  }
}

async function reverseMovement(pb: PocketBase, applied: AppliedMovement) {
  if (applied.previousQuantity === null) {
    await pb
      .collection('inventory')
      .delete(applied.inventoryId)
      .catch(() => undefined);
  } else {
    await pb
      .collection('inventory')
      .update(applied.inventoryId, { quantity: applied.previousQuantity })
      .catch(() => undefined);
  }
  await pb
    .collection('stockMovements')
    .delete(applied.movementId)
    .catch(() => undefined);
}

export async function recordMovement(input: MovementInput) {
  const { pb, companyId, user } = scope();
  const applied = await applyMovement(pb, companyId, user.id, input);
  return pb.collection('stockMovements').getOne(applied.movementId);
}

// ------------------------------------------------------------- customers --

export type CustomerInput = {
  name: string;
  email?: string;
  phone?: string;
  billingAddress?: string;
  shippingAddress?: string;
};

export async function listCustomers() {
  const { pb, companyId } = scope();
  return pb.collection('customers').getFullList({
    filter: byCompany(pb, companyId),
    sort: 'name',
  });
}

export async function createCustomer(input: CustomerInput) {
  const { pb, companyId } = scope();
  return pb
    .collection('customers')
    .create({ isActive: true, ...input, company: companyId });
}

export async function updateCustomer(id: string, input: CustomerInput) {
  const { pb, companyId } = scope();
  return pb
    .collection('customers')
    .update(id, { ...input, company: companyId });
}

export async function deleteCustomer(id: string) {
  const { pb } = scope();
  return pb.collection('customers').delete(id);
}

// ----------------------------------------------------------- sales orders --

export const SALES_STATUSES = [
  'draft',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
] as const;
export type SalesStatus = (typeof SALES_STATUSES)[number];

/** Once shipped, stock has already moved, so the lines are frozen. */
export function isSalesOrderEditable(status: string) {
  return status === 'draft' || status === 'confirmed';
}

// Sequential per company: SO-0001, SO-0002, ... Zero padding keeps the string
// sort correct, and the unique (company, orderNumber) index is the real guard
// against two requests picking the same number.
async function nextOrderNumber(pb: PocketBase, companyId: string) {
  const latest = await pb.collection('salesOrders').getList(1, 1, {
    filter: byCompany(pb, companyId),
    sort: '-orderNumber',
  });
  const last = latest.items[0]?.orderNumber as string | undefined;
  const n = last && /^SO-\d+$/.test(last) ? Number(last.slice(3)) : 0;
  return `SO-${String(n + 1).padStart(4, '0')}`;
}

export async function listSalesOrders() {
  const { pb, companyId } = scope();
  return pb.collection('salesOrders').getFullList({
    filter: byCompany(pb, companyId),
    sort: '-created',
    expand: 'customer,warehouse',
  });
}

export async function getSalesOrder(id: string) {
  const { pb } = scope();
  const order = await pb
    .collection('salesOrders')
    .getOne(id, { expand: 'customer,warehouse' });
  const items = await pb.collection('salesOrderItems').getFullList({
    filter: pb.filter('salesOrder = {:o}', { o: id }),
    sort: 'created',
    expand: 'product',
  });
  return { order, items };
}

export type SalesOrderInput = {
  customer: string;
  warehouse?: string;
  status?: SalesStatus;
  orderDate?: string;
  tax?: number;
  shipping?: number;
  discount?: number;
  notes?: string;
};

export async function createSalesOrder(input: SalesOrderInput) {
  const { pb, companyId, user } = scope();

  const attempt = async () =>
    pb.collection('salesOrders').create({
      company: companyId,
      orderNumber: await nextOrderNumber(pb, companyId),
      customer: input.customer,
      warehouse: input.warehouse || '',
      status: input.status || 'draft',
      orderDate: input.orderDate || new Date().toISOString(),
      tax: input.tax ?? 0,
      shipping: input.shipping ?? 0,
      discount: input.discount ?? 0,
      subtotal: 0,
      total: 0,
      notes: input.notes ?? '',
      createdBy: user.id,
    });

  try {
    return await attempt();
  } catch (err) {
    // Lost the race for that number; the next read will see the winner.
    return attempt();
  }
}

export async function updateSalesOrder(id: string, input: SalesOrderInput) {
  const { pb, companyId } = scope();
  await pb.collection('salesOrders').update(id, {
    customer: input.customer,
    warehouse: input.warehouse || '',
    status: input.status,
    tax: input.tax ?? 0,
    shipping: input.shipping ?? 0,
    discount: input.discount ?? 0,
    notes: input.notes ?? '',
    company: companyId,
  });
  return recalculateSalesOrder(id);
}

// Status-only transition, so the detail page doesn't have to resend the whole
// order just to confirm or cancel it. Shipping is deliberately not reachable
// here: it goes through shipSalesOrder(), which also moves the stock.
const ALLOWED_TRANSITIONS: Record<string, SalesStatus[]> = {
  draft: ['confirmed', 'cancelled'],
  confirmed: ['draft', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export function nextStatuses(status: string): SalesStatus[] {
  return ALLOWED_TRANSITIONS[status] ?? [];
}

export async function setSalesOrderStatus(id: string, status: SalesStatus) {
  const { pb } = scope();
  const order = await pb.collection('salesOrders').getOne(id);
  const current = order.status as string;

  if (!nextStatuses(current).includes(status)) {
    throw new Error(`Cannot move an order from ${current} to ${status}`);
  }
  return pb.collection('salesOrders').update(id, { status });
}

export async function deleteSalesOrder(id: string) {
  const { pb } = scope();
  // salesOrderItems cascade-delete with the order.
  return pb.collection('salesOrders').delete(id);
}

// Order totals are derived from the line items, so they are recomputed after
// every change rather than trusted from the client.
async function recalculateSalesOrder(id: string) {
  const { pb } = scope();
  const order = await pb.collection('salesOrders').getOne(id);
  const items = await pb
    .collection('salesOrderItems')
    .getFullList({ filter: pb.filter('salesOrder = {:o}', { o: id }) });

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.lineTotal ?? 0),
    0
  );
  const total =
    subtotal +
    Number(order.tax ?? 0) +
    Number(order.shipping ?? 0) -
    Number(order.discount ?? 0);

  return pb
    .collection('salesOrders')
    .update(id, { subtotal, total: Math.max(0, total) });
}

export type SalesItemInput = {
  product: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
};

function lineTotalOf(input: SalesItemInput) {
  const gross = Number(input.quantity) * Number(input.unitPrice);
  return Math.max(0, gross - Number(input.discount ?? 0));
}

async function assertEditable(pb: PocketBase, orderId: string) {
  const order = await pb.collection('salesOrders').getOne(orderId);
  if (!isSalesOrderEditable(order.status as string)) {
    throw new Error(`A ${order.status} order can no longer be edited`);
  }
  return order;
}

export async function addSalesItem(orderId: string, input: SalesItemInput) {
  const { pb } = scope();
  await assertEditable(pb, orderId);

  await pb.collection('salesOrderItems').create({
    salesOrder: orderId,
    product: input.product,
    quantity: input.quantity,
    unitPrice: input.unitPrice,
    discount: input.discount ?? 0,
    lineTotal: lineTotalOf(input),
  });
  return recalculateSalesOrder(orderId);
}

export async function updateSalesItem(
  orderId: string,
  itemId: string,
  input: SalesItemInput
) {
  const { pb } = scope();
  await assertEditable(pb, orderId);

  await pb.collection('salesOrderItems').update(itemId, {
    product: input.product,
    quantity: input.quantity,
    unitPrice: input.unitPrice,
    discount: input.discount ?? 0,
    lineTotal: lineTotalOf(input),
  });
  return recalculateSalesOrder(orderId);
}

export async function deleteSalesItem(orderId: string, itemId: string) {
  const { pb } = scope();
  await assertEditable(pb, orderId);
  await pb.collection('salesOrderItems').delete(itemId);
  return recalculateSalesOrder(orderId);
}

// Shipping is the point where a sale touches stock: one stock-out movement per
// line, through the same ledger the Movements page shows.
//
// Every line is checked for available stock *before* anything is written, and
// if a later line still fails the earlier ones are reversed, so an order never
// ships half its stock.
export async function shipSalesOrder(id: string) {
  const { pb, companyId, user } = scope();
  const order = await pb.collection('salesOrders').getOne(id);

  if (!isSalesOrderEditable(order.status as string)) {
    throw new Error(`This order is already ${order.status}`);
  }
  if (!order.warehouse) {
    throw new Error('Set a warehouse on the order before shipping');
  }

  const items = await pb.collection('salesOrderItems').getFullList({
    filter: pb.filter('salesOrder = {:o}', { o: id }),
    expand: 'product',
  });
  if (items.length === 0) {
    throw new Error('Add at least one line item before shipping');
  }

  // Several lines can reference the same product, so total the demand per
  // product before comparing against stock.
  const needed = new Map<string, number>();
  for (const item of items) {
    const key = item.product as string;
    needed.set(key, (needed.get(key) ?? 0) + Number(item.quantity ?? 0));
  }

  const shortages: string[] = [];
  for (const [productId, quantity] of Array.from(needed)) {
    const row = await findInventoryRow(
      pb,
      companyId,
      productId,
      order.warehouse as string
    );
    const onHand = Number(row?.quantity ?? 0);
    if (onHand < quantity) {
      const name =
        items.find((i) => i.product === productId)?.expand?.product?.name ??
        'product';
      shortages.push(`${name} (need ${quantity}, have ${onHand})`);
    }
  }
  if (shortages.length > 0) {
    throw new Error(`Not enough stock: ${shortages.join('; ')}`);
  }

  const applied: AppliedMovement[] = [];
  try {
    for (const [productId, quantity] of Array.from(needed)) {
      applied.push(
        await applyMovement(
          pb,
          companyId,
          user.id,
          {
            product: productId,
            warehouse: order.warehouse as string,
            type: 'out',
            quantity,
            reference: order.orderNumber as string,
          },
          { salesOrder: id }
        )
      );
    }

    return await pb.collection('salesOrders').update(id, {
      status: 'shipped',
      shipDate: new Date().toISOString(),
    });
  } catch (err) {
    for (const item of applied.reverse()) {
      await reverseMovement(pb, item);
    }
    throw err;
  }
}

// ------------------------------------------------------------------ stats --

export type DashboardStats = {
  productCount: number;
  warehouseCount: number;
  supplierCount: number;
  totalUnits: number;
  stockValue: number;
  revenue: number;
  openOrderCount: number;
  lowStock: { id: string; name: string; onHand: number; reorderLevel: number }[];
  recentMovements: RecordModel[];
  recentSales: RecordModel[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const { pb, companyId } = scope();

  const [products, warehouses, suppliers, inventory, movements, salesOrders] =
    await Promise.all([
      pb
        .collection('products')
        .getFullList({ filter: byCompany(pb, companyId) }),
      pb
        .collection('warehouses')
        .getFullList({ filter: byCompany(pb, companyId) }),
      pb
        .collection('suppliers')
        .getFullList({ filter: byCompany(pb, companyId) }),
      pb
        .collection('inventory')
        .getFullList({ filter: byCompany(pb, companyId) }),
      pb.collection('stockMovements').getList(1, 8, {
        filter: byCompany(pb, companyId),
        sort: '-created',
        expand: 'product,warehouse',
      }),
      pb.collection('salesOrders').getFullList({
        filter: byCompany(pb, companyId),
        sort: '-created',
        expand: 'customer',
      }),
    ]);

  // Revenue counts orders whose goods have actually left, so drafts and
  // cancellations never inflate it.
  const earned = salesOrders.filter(
    (o) => o.status === 'shipped' || o.status === 'delivered'
  );
  const revenue = earned.reduce((sum, o) => sum + Number(o.total ?? 0), 0);
  const openOrderCount = salesOrders.filter(
    (o) => o.status === 'draft' || o.status === 'confirmed'
  ).length;

  // On-hand per product, summed across every warehouse.
  const onHand = new Map<string, number>();
  for (const row of inventory) {
    const key = row.product as string;
    onHand.set(key, (onHand.get(key) ?? 0) + Number(row.quantity ?? 0));
  }

  let totalUnits = 0;
  let stockValue = 0;
  const lowStock: DashboardStats['lowStock'] = [];

  for (const product of products) {
    const qty = onHand.get(product.id) ?? 0;
    totalUnits += qty;
    stockValue += qty * Number(product.unit_price ?? 0);

    const reorderLevel = Number(product.reorder_level ?? 0);
    if (reorderLevel > 0 && qty <= reorderLevel) {
      lowStock.push({
        id: product.id,
        name: product.name as string,
        onHand: qty,
        reorderLevel,
      });
    }
  }

  lowStock.sort((a, b) => a.onHand - b.onHand);

  return {
    productCount: products.length,
    warehouseCount: warehouses.length,
    supplierCount: suppliers.length,
    totalUnits,
    stockValue,
    revenue,
    openOrderCount,
    lowStock: lowStock.slice(0, 8),
    recentMovements: movements.items,
    recentSales: salesOrders.slice(0, 6),
  };
}
