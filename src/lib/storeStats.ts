// Real store stats — for now there is no live order/analytics integration,
// so every metric is honestly zero until real data is wired in.
// Never fabricate numbers here; show what actually happened.
export interface StoreStats {
  revenue30d: number;
  netProfit30d: number;
  margin: number;
  orders: number;
  customers: number;
  avgOrderValue: number;
  views30d: number;
  conversion: number;
  rating: number; // 0-100 honest score
  topProduct: { name: string; revenue: number; units: number } | null;
}

export function getStoreStats(): StoreStats {
  // No real analytics source connected yet → return zeros (no fake numbers).
  return {
    revenue30d: 0,
    netProfit30d: 0,
    margin: 0,
    orders: 0,
    customers: 0,
    avgOrderValue: 0,
    views30d: 0,
    conversion: 0,
    rating: 0,
    topProduct: null,
  };
}

export function fmtMoney(n: number) {
  return `$${n.toLocaleString('en-US')}`;
}
