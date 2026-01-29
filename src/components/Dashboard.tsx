"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../app/page.module.css";

type Stock = {
  symbol: string;
  name: string;
  last: number;
  change: number;
  changePct: number;
  volume: number;
  dayHigh: number;
  dayLow: number;
  open: number;
  prevClose: number;
};

type MarketSnapshot = {
  market: string;
  currency: string;
  timezone: string;
  session: string;
  isOpen: boolean;
  asOf: string;
  stocks: Stock[];
};

type Order = {
  id: number;
  symbol: string;
  side: "buy" | "sell";
  type: "market" | "limit";
  qty: number;
  price: number;
  status: "filled" | "rejected";
  createdAt: string;
};

type Position = {
  symbol: string;
  qty: number;
  avgPrice: number;
  marketPrice: number;
  marketValue: number;
  unrealizedPnl: number;
};

type PortfolioSnapshot = {
  cash: number;
  orders: Order[];
  positions: Position[];
};

const currency = new Intl.NumberFormat("en-NP", {
  style: "currency",
  currency: "NPR",
  maximumFractionDigits: 2,
});

const number = new Intl.NumberFormat("en-NP", {
  maximumFractionDigits: 2,
});

const percent = new Intl.NumberFormat("en-NP", {
  style: "percent",
  maximumFractionDigits: 2,
});

export default function Dashboard() {
  const [market, setMarket] = useState<MarketSnapshot | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioSnapshot | null>(null);
  const [status, setStatus] = useState<string>("Loading NEPSE snapshot...");
  const [form, setForm] = useState({
    symbol: "NABIL",
    side: "buy" as "buy" | "sell",
    qty: 10,
    type: "market" as "market" | "limit",
    limitPrice: "",
  });

  const equity = useMemo(() => {
    if (!portfolio) return 0;
    const positionValue = portfolio.positions.reduce(
      (sum, position) => sum + position.marketValue,
      0,
    );
    return portfolio.cash + positionValue;
  }, [portfolio]);

  const refresh = async () => {
    try {
      const [marketRes, portfolioRes] = await Promise.all([
        fetch("/api/market", { cache: "no-store" }),
        fetch("/api/orders", { cache: "no-store" }),
      ]);
      const marketData = (await marketRes.json()) as MarketSnapshot;
      const portfolioData = (await portfolioRes.json()) as PortfolioSnapshot;
      setMarket(marketData);
      setPortfolio(portfolioData);
      setStatus("Ready for paper trades.");
    } catch (error) {
      setStatus("Could not load market data. Try again.");
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const submitOrder = async () => {
    setStatus("Sending order...");
    const payload = {
      symbol: form.symbol,
      side: form.side,
      qty: Number(form.qty),
      type: form.type,
      limitPrice: form.type === "limit" ? Number(form.limitPrice) : undefined,
    };

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    setStatus(data.message ?? "Order update received.");
    if (response.ok) {
      await refresh();
    }
  };

  return (
    <div className={styles.shell}>
      <header className={styles.hero}>
        <div>
          <p className={styles.kicker}>Paper Desi Trade ? Nepal MVP</p>
          <h1>Trade NEPSE like a pro, with zero risk.</h1>
          <p className={styles.subhead}>
            A focused paper trading sandbox for Nepal stock markets. Realistic
            fills, configurable rules, and a clean dashboard to learn or test
            strategies.
          </p>
          <div className={styles.heroActions}>
            <button className={styles.primaryButton} onClick={refresh}>
              Refresh Market
            </button>
            <button className={styles.secondaryButton}>View Rules</button>
          </div>
        </div>
        <div className={styles.heroCard}>
          <div className={styles.heroRow}>
            <span>Account Equity</span>
            <strong>{currency.format(equity)}</strong>
          </div>
          <div className={styles.heroRow}>
            <span>Cash Balance</span>
            <strong>{currency.format(portfolio?.cash ?? 0)}</strong>
          </div>
          <div className={styles.heroRow}>
            <span>Open Positions</span>
            <strong>{portfolio?.positions.length ?? 0}</strong>
          </div>
          <div className={styles.heroRow}>
            <span>Market Session</span>
            <strong>
              {market?.session ?? "--"} {market?.isOpen ? "? Open" : "? Closed"}
            </strong>
          </div>
          <div className={styles.heroMeta}>{status}</div>
        </div>
      </header>

      <section className={styles.grid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Market Pulse</h2>
            <p>{market?.market ?? "NEPSE"} Snapshot</p>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Last</th>
                  <th>Change</th>
                  <th>Volume</th>
                  <th>Day Range</th>
                </tr>
              </thead>
              <tbody>
                {market?.stocks.map((stock) => {
                  const isUp = stock.change >= 0;
                  return (
                    <tr key={stock.symbol}>
                      <td>
                        <div className={styles.symbolCell}>
                          <strong>{stock.symbol}</strong>
                          <span>{stock.name}</span>
                        </div>
                      </td>
                      <td>{currency.format(stock.last)}</td>
                      <td className={isUp ? styles.positive : styles.negative}>
                        {isUp ? "+" : ""}
                        {number.format(stock.change)}
                        <span>
                          {" "}
                          ({isUp ? "+" : ""}
                          {percent.format(stock.changePct / 100)})
                        </span>
                      </td>
                      <td>{number.format(stock.volume)}</td>
                      <td>
                        {number.format(stock.dayLow)} -
                        {" "}
                        {number.format(stock.dayHigh)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Trade Ticket</h2>
            <p>Market orders fill immediately at last price.</p>
          </div>
          <div className={styles.formGrid}>
            <label>
              Symbol
              <select
                value={form.symbol}
                onChange={(event) =>
                  setForm({ ...form, symbol: event.target.value })
                }
              >
                {market?.stocks.map((stock) => (
                  <option key={stock.symbol} value={stock.symbol}>
                    {stock.symbol} ? {stock.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Side
              <select
                value={form.side}
                onChange={(event) =>
                  setForm({
                    ...form,
                    side: event.target.value as "buy" | "sell",
                  })
                }
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </label>
            <label>
              Order Type
              <select
                value={form.type}
                onChange={(event) =>
                  setForm({
                    ...form,
                    type: event.target.value as "market" | "limit",
                  })
                }
              >
                <option value="market">Market</option>
                <option value="limit">Limit</option>
              </select>
            </label>
            <label>
              Quantity
              <input
                type="number"
                min={1}
                value={form.qty}
                onChange={(event) =>
                  setForm({ ...form, qty: Number(event.target.value) })
                }
              />
            </label>
            {form.type === "limit" && (
              <label>
                Limit Price (NPR)
                <input
                  type="number"
                  min={1}
                  value={form.limitPrice}
                  onChange={(event) =>
                    setForm({ ...form, limitPrice: event.target.value })
                  }
                />
              </label>
            )}
          </div>
          <button className={styles.primaryButton} onClick={submitOrder}>
            Place Paper Order
          </button>
          <p className={styles.formHint}>{status}</p>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Portfolio</h2>
            <p>Positions update with the latest snapshot.</p>
          </div>
          <div className={styles.summaryGrid}>
            <div>
              <span>Cash</span>
              <strong>{currency.format(portfolio?.cash ?? 0)}</strong>
            </div>
            <div>
              <span>Equity</span>
              <strong>{currency.format(equity)}</strong>
            </div>
            <div>
              <span>Positions</span>
              <strong>{portfolio?.positions.length ?? 0}</strong>
            </div>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Qty</th>
                  <th>Avg Price</th>
                  <th>Market Value</th>
                  <th>Unrealized</th>
                </tr>
              </thead>
              <tbody>
                {portfolio?.positions.length ? (
                  portfolio.positions.map((position) => {
                    const isUp = position.unrealizedPnl >= 0;
                    return (
                      <tr key={position.symbol}>
                        <td>{position.symbol}</td>
                        <td>{number.format(position.qty)}</td>
                        <td>{currency.format(position.avgPrice)}</td>
                        <td>{currency.format(position.marketValue)}</td>
                        <td
                          className={
                            isUp ? styles.positive : styles.negative
                          }
                        >
                          {isUp ? "+" : ""}
                          {currency.format(position.unrealizedPnl)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className={styles.emptyState}>
                      No positions yet. Place a paper order to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2>Recent Fills</h2>
            <p>Latest paper trades executed in this session.</p>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Symbol</th>
                  <th>Side</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {portfolio?.orders.length ? (
                  portfolio.orders.map((order) => (
                    <tr key={order.id}>
                      <td>{new Date(order.createdAt).toLocaleTimeString()}</td>
                      <td>{order.symbol}</td>
                      <td className={styles.tagCell}>
                        <span
                          className={
                            order.side === "buy"
                              ? styles.tagBuy
                              : styles.tagSell
                          }
                        >
                          {order.side.toUpperCase()}
                        </span>
                      </td>
                      <td>{number.format(order.qty)}</td>
                      <td>{currency.format(order.price)}</td>
                      <td>{order.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className={styles.emptyState}>
                      No fills yet. Your next trade will appear here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
