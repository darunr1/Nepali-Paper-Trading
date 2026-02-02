# Nepali Paper Trading

A paper trading dashboard for the Nepal Stock Exchange (NEPSE). This project is
built as a learning-focused trading simulator that lets users explore market
snapshots, place paper orders, and track a virtual portfolio without risk.

![Nepali Paper Trading](./public/og.png)

## Highlights

- **Market snapshot** experience for a curated list of NEPSE symbols.
- **Paper trading ticket** with market and limit order support.
- **Portfolio tracking** including cash, equity, positions, and recent fills.
- **Clean UI** built with the Next.js App Router and component-driven layout.

## How it works

The dashboard reads a static market snapshot and simulates orders in-memory. A
trade updates the cash balance, positions, and the list of recent fills. The
server routes under `/api/market` and `/api/orders` return the market snapshot
and portfolio state respectively.

> ⚠️ **Important:** The current data store is in-memory only. When the server
> restarts, the portfolio resets. This makes the project perfect for demos,
> hackathons, and initial UX exploration, but it is not production-ready yet.

## Project structure

```
src/
  app/
    api/
      market/route.ts     # Market snapshot endpoint
      orders/route.ts     # Portfolio + order placement endpoint
    page.tsx              # Landing page
  components/
    Dashboard.tsx         # Main trading UI
  lib/
    nepse.ts              # Static NEPSE data
    store.ts              # In-memory trading engine
```

## Getting started

Install dependencies and run the development server:

Then open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev      # Start local dev server
npm run build    # Build production assets
npm run start    # Run production server
```

## Roadmap ideas

- Add authentication and per-user portfolios.
- Persist orders/positions in a database.
- Live market data ingestion or scheduled snapshots.
- Order lifecycle simulation (pending, partial fills, cancels).
- Portfolio analytics (equity curve, P/L breakdowns).

## Contributing

Contributions are welcome! If you'd like to help:

1. Fork the repo.
2. Create a feature branch.
3. Submit a pull request with a clear description of your change.
```bash
npm install
npm run dev

## License

MIT
