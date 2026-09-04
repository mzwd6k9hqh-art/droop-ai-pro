// Honest store analytics.
// Every number here comes from data the app actually recorded.
// If nothing happened yet, the value is 0 / empty — never invent numbers.

export interface StoreEvent {
  type: 'view' | 'add_to_cart' | 'checkout' | 'order';
  timestamp: string; // ISO
  source?: string; // e.g. 'direct', 'instagram', 'google', 'tiktok'
  product?: string;
  value?: number; // order value in USD
  customerId?: string;
}

export interface TrafficSource {
  source: string;
  visits: number;
  share: number; // %
}

export interface PeakHour {
  hour: number; // 0-23
  visits: number;
}

export interface ProductPerformance {
  name: string;
  units: number;
  revenue: number;
}

export interface CustomerBehavior {
  addToCartRate: number; // % of views
  checkoutRate: number; // % of add-to-carts
  cartAbandonment: number; // %
  repeatCustomerRate: number; // %
  avgSessionsBeforeOrder: number;
}

export interface StoreStats {
  isPublished: boolean;
  hasData: boolean;
  revenue30d: number;
  netProfit30d: number;
  margin: number;
  orders: number;
  customers: number;
  avgOrderValue: number;
  views30d: number;
  conversion: number;
  rating: number; // 0-100 honest score
  ratingReasons: string[];
  topProduct: ProductPerformance | null;
  trafficSources: TrafficSource[];
  peakHours: PeakHour[];
  bestProducts: ProductPerformance[];
  behavior: CustomerBehavior;
}

const EVENTS_KEY = 'droop_store_events';
const PUBLISHED_KEY = 'droop_store_published';
const CONFIG_KEY = 'droop_store_config';

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Records a real store event (used when the storefront reports activity). */
export function recordStoreEvent(event: StoreEvent) {
  if (typeof window === 'undefined') return;
  const events = readJSON<StoreEvent[]>(EVENTS_KEY, []);
  events.push(event);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events.slice(-5000)));
}

function pct(part: number, total: number) {
  return total > 0 ? (part / total) * 100 : 0;
}

/**
 * Honest store score. Starts at 0 and only earns points for things that are
 * actually true about the store (published, has products, has traffic, sells).
 */
function scoreStore(opts: {
  isPublished: boolean;
  productCount: number;
  views: number;
  orders: number;
  conversion: number;
  repeatRate: number;
}): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  if (opts.isPublished) score += 15;
  else reasons.push('Store is not published yet (0 of 15 points).');

  if (opts.productCount >= 8) score += 15;
  else if (opts.productCount > 0) {
    score += Math.round((opts.productCount / 8) * 15);
    reasons.push(`Only ${opts.productCount} product${opts.productCount === 1 ? '' : 's'} listed — 8+ scores full points.`);
  } else reasons.push('No products added yet (0 of 15 points).');

  if (opts.views >= 1000) score += 20;
  else if (opts.views > 0) {
    score += Math.round((opts.views / 1000) * 20);
    reasons.push(`${opts.views} visits in 30 days — 1,000+ scores full points.`);
  } else reasons.push('No recorded visits (0 of 20 points).');

  if (opts.orders >= 50) score += 25;
  else if (opts.orders > 0) {
    score += Math.round((opts.orders / 50) * 25);
    reasons.push(`${opts.orders} order${opts.orders === 1 ? '' : 's'} in 30 days — 50+ scores full points.`);
  } else reasons.push('No orders yet (0 of 25 points).');

  if (opts.conversion >= 2.5) score += 15;
  else if (opts.conversion > 0) {
    score += Math.round((opts.conversion / 2.5) * 15);
    reasons.push(`Conversion is ${opts.conversion.toFixed(2)}% — 2.5% is a healthy benchmark.`);
  } else reasons.push('No conversions recorded (0 of 15 points).');

  if (opts.repeatRate >= 25) score += 10;
  else if (opts.repeatRate > 0) score += Math.round((opts.repeatRate / 25) * 10);
  else reasons.push('No repeat customers yet (0 of 10 points).');

  return { score: Math.max(0, Math.min(100, score)), reasons };
}

export function getStoreStats(): StoreStats {
  const isPublished =
    typeof window !== 'undefined' && localStorage.getItem(PUBLISHED_KEY) === 'true';
  const config = readJSON<Record<string, unknown>>(CONFIG_KEY, {});
  const productCount = Array.isArray((config as { products?: unknown[] }).products)
    ? ((config as { products: unknown[] }).products.length as number)
    : 0;

  const all = readJSON<StoreEvent[]>(EVENTS_KEY, []);
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const events = all.filter((e) => {
    const t = Date.parse(e.timestamp);
    return !Number.isNaN(t) && t >= cutoff;
  });

  const views = events.filter((e) => e.type === 'view');
  const carts = events.filter((e) => e.type === 'add_to_cart');
  const checkouts = events.filter((e) => e.type === 'checkout');
  const orderEvents = events.filter((e) => e.type === 'order');

  const revenue30d = orderEvents.reduce((sum, e) => sum + (e.value || 0), 0);
  const orders = orderEvents.length;
  const customerIds = new Set(orderEvents.map((e) => e.customerId).filter(Boolean) as string[]);
  const customers = customerIds.size;
  const avgOrderValue = orders > 0 ? revenue30d / orders : 0;
  const conversion = pct(orders, views.length);

  // Traffic sources — only sources actually seen.
  const sourceMap = new Map<string, number>();
  views.forEach((v) => {
    const s = (v.source || 'direct').toLowerCase();
    sourceMap.set(s, (sourceMap.get(s) || 0) + 1);
  });
  const trafficSources: TrafficSource[] = [...sourceMap.entries()]
    .map(([source, visits]) => ({ source, visits, share: pct(visits, views.length) }))
    .sort((a, b) => b.visits - a.visits);

  // Peak hours — only hours with recorded activity.
  const hourMap = new Map<number, number>();
  views.forEach((v) => {
    const h = new Date(v.timestamp).getHours();
    if (!Number.isNaN(h)) hourMap.set(h, (hourMap.get(h) || 0) + 1);
  });
  const peakHours: PeakHour[] = [...hourMap.entries()]
    .map(([hour, visits]) => ({ hour, visits }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 6);

  // Best products — from real orders.
  const productMap = new Map<string, ProductPerformance>();
  orderEvents.forEach((e) => {
    if (!e.product) return;
    const current = productMap.get(e.product) || { name: e.product, units: 0, revenue: 0 };
    current.units += 1;
    current.revenue += e.value || 0;
    productMap.set(e.product, current);
  });
  const bestProducts = [...productMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // Customer behavior.
  const orderCountByCustomer = new Map<string, number>();
  orderEvents.forEach((e) => {
    if (!e.customerId) return;
    orderCountByCustomer.set(e.customerId, (orderCountByCustomer.get(e.customerId) || 0) + 1);
  });
  const repeatCustomers = [...orderCountByCustomer.values()].filter((n) => n > 1).length;
  const repeatCustomerRate = pct(repeatCustomers, customers);

  const behavior: CustomerBehavior = {
    addToCartRate: pct(carts.length, views.length),
    checkoutRate: pct(checkouts.length, carts.length),
    cartAbandonment: carts.length > 0 ? pct(carts.length - orders, carts.length) : 0,
    repeatCustomerRate,
    avgSessionsBeforeOrder: orders > 0 ? views.length / orders : 0,
  };

  const { score, reasons } = scoreStore({
    isPublished,
    productCount,
    views: views.length,
    orders,
    conversion,
    repeatRate: repeatCustomerRate,
  });

  // Net profit is only known when real cost data exists; without it we don't guess.
  const netProfit30d = 0;

  return {
    isPublished,
    hasData: events.length > 0,
    revenue30d,
    netProfit30d,
    margin: 0,
    orders,
    customers,
    avgOrderValue,
    views30d: views.length,
    conversion,
    rating: score,
    ratingReasons: reasons,
    topProduct: bestProducts[0] || null,
    trafficSources,
    peakHours,
    bestProducts,
    behavior,
  };
}

export function fmtMoney(n: number) {
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

export function fmtHour(h: number) {
  const suffix = h < 12 ? 'AM' : 'PM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12} ${suffix}`;
}
