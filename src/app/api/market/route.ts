import { NextResponse } from "next/server";
import { getMarketSnapshot } from "@/lib/store";

export const GET = () => NextResponse.json(getMarketSnapshot());
