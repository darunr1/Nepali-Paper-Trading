import { NextResponse } from "next/server";
import { getPortfolioSnapshot, placeOrder } from "@/lib/store";

export const GET = () => NextResponse.json(getPortfolioSnapshot());

export const POST = async (request: Request) => {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { ok: false, message: "Invalid payload." },
      { status: 400 },
    );
  }

  const result = placeOrder({
    symbol: String(body.symbol ?? ""),
    side: body.side === "sell" ? "sell" : "buy",
    qty: Number(body.qty ?? 0),
    type: body.type === "limit" ? "limit" : "market",
    limitPrice: body.limitPrice ? Number(body.limitPrice) : undefined,
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
};
