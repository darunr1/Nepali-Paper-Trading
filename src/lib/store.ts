import { getStockBySymbol, marketMeta, nepseStocks, type Stock } from "./nepse";

export type OrderSide = "buy" | "sell";
export type OrderType = "market" | "limit";

export type Order = {
  id: number;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  qty: number;
  price: number;
  status: "filled" | "rejected";
  createdAt: string;
};

export type Position = {
  symbol: string;
  qty: number;
  avgPrice: number;
  marketPrice: number;
  marketValue: number;
  unrealizedPnl: number;
};

type Store = {
  cash: number;
  orders: Order[];
  positions: Position[];
  nextOrderId: number;
};

const globalForStore = globalThis as typeof globalThis & {
  __paperStore?: Store;
};

const createStore = (): Store => ({
  cash: 1_000_000,
  orders: [],
  positions: [],
  nextOrderId: 1,
});

const store = globalForStore.__paperStore ?? createStore();
if (!globalForStore.__paperStore) {
  globalForStore.__paperStore = store;
}

const buildPositionSnapshot = (positions: Position[]) =>
  positions.map((position) => {
    const stock = getStockBySymbol(position.symbol);
    const marketPrice = stock?.last ?? position.avgPrice;
    const marketValue = marketPrice * position.qty;
    const unrealizedPnl = (marketPrice - position.avgPrice) * position.qty;
    return {
      ...position,
      marketPrice,
      marketValue,
      unrealizedPnl,
    };
  });

const findPosition = (symbol: string) =>
  store.positions.find((position) => position.symbol === symbol);

export const getMarketSnapshot = () => ({
  market: marketMeta.market,
  currency: marketMeta.currency,
  timezone: marketMeta.timezone,
  session: marketMeta.session,
  isOpen: marketMeta.isOpen,
  asOf: new Date().toISOString(),
  stocks: nepseStocks,
});

export const getPortfolioSnapshot = () => ({
  cash: store.cash,
  orders: store.orders,
  positions: buildPositionSnapshot(store.positions),
});

export const placeOrder = ({
  symbol,
  side,
  qty,
  type,
  limitPrice,
}: {
  symbol: string;
  side: OrderSide;
  qty: number;
  type: OrderType;
  limitPrice?: number;
}) => {
  const stock: Stock | undefined = getStockBySymbol(symbol);
  if (!stock) {
    return {
      ok: false,
      message: "Unknown symbol.",
    } as const;
  }

  if (!Number.isFinite(qty) || qty <= 0) {
    return {
      ok: false,
      message: "Quantity must be greater than zero.",
    } as const;
  }

  const price = type === "limit" && limitPrice ? limitPrice : stock.last;
  const notional = price * qty;

  if (side === "buy" && store.cash < notional) {
    return {
      ok: false,
      message: "Insufficient cash balance for this order.",
    } as const;
  }

  const position = findPosition(symbol);
  if (side === "sell" && (!position || position.qty < qty)) {
    return {
      ok: false,
      message: "Not enough shares to sell.",
    } as const;
  }

  const order: Order = {
    id: store.nextOrderId++,
    symbol,
    side,
    type,
    qty,
    price,
    status: "filled",
    createdAt: new Date().toISOString(),
  };

  if (side === "buy") {
    store.cash -= notional;
    if (position) {
      const totalQty = position.qty + qty;
      const avgPrice =
        (position.avgPrice * position.qty + notional) / totalQty;
      position.qty = totalQty;
      position.avgPrice = avgPrice;
    } else {
      store.positions.push({
        symbol,
        qty,
        avgPrice: price,
        marketPrice: price,
        marketValue: notional,
        unrealizedPnl: 0,
      });
    }
  } else {
    store.cash += notional;
    if (position) {
      position.qty -= qty;
      if (position.qty <= 0) {
        store.positions = store.positions.filter(
          (entry) => entry.symbol !== symbol,
        );
      }
    }
  }

  store.orders = [order, ...store.orders].slice(0, 25);

  return {
    ok: true,
    message: "Order filled.",
    order,
  } as const;
};
