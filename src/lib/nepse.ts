export type Stock = {
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

export const nepseStocks: Stock[] = [
  {
    symbol: "NABIL",
    name: "Nabil Bank",
    last: 612.4,
    change: 8.7,
    changePct: 1.44,
    volume: 382140,
    dayHigh: 615,
    dayLow: 603.5,
    open: 606.2,
    prevClose: 603.7,
  },
  {
    symbol: "NLIC",
    name: "Nepal Life Insurance",
    last: 894.2,
    change: -10.6,
    changePct: -1.17,
    volume: 168990,
    dayHigh: 905,
    dayLow: 889.5,
    open: 902.8,
    prevClose: 904.8,
  },
  {
    symbol: "NRIC",
    name: "Nepal Reinsurance",
    last: 1024.5,
    change: 22.8,
    changePct: 2.28,
    volume: 210430,
    dayHigh: 1030,
    dayLow: 1001,
    open: 1006.7,
    prevClose: 1001.7,
  },
  {
    symbol: "ADBL",
    name: "Agricultural Development Bank",
    last: 305.1,
    change: -2.4,
    changePct: -0.78,
    volume: 514820,
    dayHigh: 309.5,
    dayLow: 301.2,
    open: 306.4,
    prevClose: 307.5,
  },
  {
    symbol: "HDL",
    name: "Himalayan Distillery",
    last: 2245,
    change: 54,
    changePct: 2.46,
    volume: 45210,
    dayHigh: 2260,
    dayLow: 2204,
    open: 2210,
    prevClose: 2191,
  },
  {
    symbol: "SCB",
    name: "Standard Chartered Bank",
    last: 455.2,
    change: 4.1,
    changePct: 0.91,
    volume: 92210,
    dayHigh: 458,
    dayLow: 448.5,
    open: 451.5,
    prevClose: 451.1,
  },
  {
    symbol: "UPPER",
    name: "Upper Tamakoshi Hydropower",
    last: 206.7,
    change: -1.9,
    changePct: -0.91,
    volume: 610340,
    dayHigh: 210.2,
    dayLow: 204.1,
    open: 208.8,
    prevClose: 208.6,
  },
  {
    symbol: "CHCL",
    name: "Chilime Hydropower",
    last: 593.4,
    change: 12.2,
    changePct: 2.1,
    volume: 145120,
    dayHigh: 597,
    dayLow: 584.2,
    open: 586.8,
    prevClose: 581.2,
  },
];

export const marketMeta = {
  market: "NEPSE",
  currency: "NPR",
  timezone: "Asia/Kathmandu",
  session: "Regular",
  isOpen: true,
};

export const getStockBySymbol = (symbol: string) =>
  nepseStocks.find((stock) => stock.symbol === symbol);
