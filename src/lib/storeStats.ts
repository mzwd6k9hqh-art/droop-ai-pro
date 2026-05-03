// Centralized store stats — used by Voice Call insights and dashboards
// so numbers stay consistent across the app.
export interface StoreStats {
  revenue30d: number;
  netProfit30d: number;
  margin: number;
  orders: number;
  customers: number;
  avgOrderValue: number;
  views30d: number;
  conversion: number;
  topProduct: { name: string; revenue: number; units: number };
}

export function getStoreStats(): StoreStats {
  // Numbers mirror /earnings + /analytics so the user sees coherent data everywhere.
  return {
    revenue30d: 12486,
    netProfit30d: 7318,
    margin: 58,
    orders: 324,
    customers: 241,
    avgOrderValue: Math.round((12486 / 324) * 100) / 100,
    views30d: 18420,
    conversion: 4.2,
    topProduct: { name: 'Premium Gift Box', revenue: 3210, units: 84 },
  };
}

export function fmtMoney(n: number) {
  return `$${n.toLocaleString('en-US')}`;
}
