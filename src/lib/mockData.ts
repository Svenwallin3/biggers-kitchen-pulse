// Mock data generator for Bigger's Kitchen dashboard.
// Replace these with live calls to Clover, Homebase, and OpenWeatherMap.

import { addDays, format, startOfWeek, subDays, subYears } from "date-fns";

export type DayType = "Production" | "Service";

export interface Weather {
  high: number;
  low: number;
  condition: string;
  precipPct: number;
  severe?: string | null;
}

export interface CategoryItem {
  name: string;
  revenue: number;
}
export interface CategoryRow {
  name: string;
  revenue: number;
  items: number;
  topItems: CategoryItem[];
  bottomItems: CategoryItem[];
}

export interface HourBar {
  hour: number; // 0-23
  revenue: number;
  topCategory: string;
  ticketCount: number;
  topThree: { name: string; revenue: number }[];
}

export interface ProductionItem {
  name: string;
  unitsSent: number;
  transferPrice: number; // per unit
  retailPrice: number; // per unit
  soldA: number;
  soldB: number;
}

export interface DayData {
  date: Date;
  dayType: DayType;
  weather: Weather;
  revenue: number;
  laborCost: number;
  laborPct: number;
  avgTicket: number;
  avgItems: number;
  salesPerHour: number;
  hourly: HourBar[];
  categories: CategoryRow[];
  production: ProductionItem[];
}

export const CATEGORY_PALETTE: Record<string, string> = {
  Sandwiches: "hsl(25 85% 55%)",
  Salads: "hsl(142 65% 42%)",
  Bowls: "hsl(210 85% 50%)",
  Sides: "hsl(45 90% 50%)",
  Beverages: "hsl(190 70% 45%)",
  Desserts: "hsl(330 65% 55%)",
  Catering: "hsl(260 50% 55%)",
  Wholesale: "hsl(220 25% 45%)",
};

const CATEGORIES = Object.keys(CATEGORY_PALETTE);

export function getDayType(d: Date): DayType {
  const dow = d.getDay(); // 0 Sun .. 6 Sat
  // Mon-Thu = Production, Fri-Sun = Service
  if (dow >= 1 && dow <= 4) return "Production";
  return "Service";
}

// Deterministic pseudo-random based on date string
function seeded(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function genWeather(rand: () => number, season: number): Weather {
  const conditions = ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Rain"];
  const idx = Math.floor(rand() * conditions.length);
  const baseHigh = 60 + season * 25;
  const high = Math.round(baseHigh + rand() * 15);
  const low = high - Math.round(8 + rand() * 10);
  const precipPct = idx >= 3 ? Math.round(40 + rand() * 55) : Math.round(rand() * 25);
  const severe = rand() > 0.92 ? (rand() > 0.5 ? "Thunderstorm" : "Heat Advisory") : null;
  return { high, low, condition: conditions[idx], precipPct, severe };
}

export function getDayData(date: Date): DayData {
  const key = format(date, "yyyy-MM-dd");
  const rand = seeded(key);
  const dayType = getDayType(date);
  const month = date.getMonth();
  const season = Math.sin(((month + 1) / 12) * Math.PI); // 0..1 ish

  const weather = genWeather(rand, season);

  // Revenue: service days higher than production days
  const baseRev = dayType === "Service" ? 8500 : 5200;
  const variance = 0.7 + rand() * 0.6;
  const weatherDrag = weather.precipPct > 50 ? 0.85 : 1;
  const revenue = Math.round(baseRev * variance * weatherDrag);

  const laborCost = Math.round(revenue * (0.26 + rand() * 0.14));
  const laborPct = +((laborCost / revenue) * 100).toFixed(1);

  const ticketCount = dayType === "Service" ? Math.round(280 + rand() * 180) : 0;
  const avgTicket = ticketCount ? +(revenue / ticketCount).toFixed(2) : 0;
  const avgItems = ticketCount ? +(2.1 + rand() * 1.4).toFixed(2) : 0;
  const hoursOpen = 10;
  const salesPerHour = +(revenue / hoursOpen).toFixed(0);

  // Hourly distribution (service days)
  const hourly: HourBar[] = [];
  if (dayType === "Service") {
    const peakA = 12, peakB = 18;
    for (let h = 10; h <= 20; h++) {
      const distA = Math.exp(-Math.pow(h - peakA, 2) / 6);
      const distB = Math.exp(-Math.pow(h - peakB, 2) / 8);
      const w = distA + distB * 0.85;
      const r = rand();
      const hourRev = Math.round((revenue * w) / 6.2 * (0.85 + r * 0.3));
      const shuffled = [...CATEGORIES].sort(() => rand() - 0.5);
      const top3 = shuffled.slice(0, 3).map((name, i) => ({
        name,
        revenue: Math.round(hourRev * (0.45 - i * 0.12)),
      }));
      hourly.push({
        hour: h,
        revenue: hourRev,
        topCategory: top3[0].name,
        ticketCount: Math.round((hourRev / avgTicket) || 0),
        topThree: top3,
      });
    }
  }

  // Categories
  const weights = CATEGORIES.map(() => 0.4 + rand() * 1);
  const wSum = weights.reduce((a, b) => a + b, 0);
  const categories: CategoryRow[] = CATEGORIES.map((name, i) => {
    const rev = Math.round((revenue * weights[i]) / wSum);
    const items = Math.round(rev / (6 + rand() * 8));
    const itemNames = Array.from({ length: 12 }, (_, k) => `${name} Item ${k + 1}`);
    const itemRevs = itemNames
      .map((n) => ({ name: n, revenue: Math.round((rev / 12) * (0.3 + rand() * 1.6)) }))
      .sort((a, b) => b.revenue - a.revenue);
    return {
      name,
      revenue: rev,
      items,
      topItems: itemRevs.slice(0, 5),
      bottomItems: itemRevs.slice(-5).reverse(),
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Production output — kitchen items transferred to market locations.
  // Generated for every day of the week (bakers prep daily, including Fri-Sun).
  const PRODUCTION_ITEMS = [
    { name: "Sourdough Loaf", transferPrice: 4.5, retailPrice: 9.0 },
    { name: "Country Boule", transferPrice: 4.2, retailPrice: 8.5 },
    { name: "Baguette", transferPrice: 2.8, retailPrice: 5.5 },
    { name: "Croissant", transferPrice: 1.6, retailPrice: 3.75 },
    { name: "Pain au Chocolat", transferPrice: 1.9, retailPrice: 4.25 },
    { name: "Cinnamon Roll", transferPrice: 2.4, retailPrice: 5.5 },
    { name: "Focaccia Tray", transferPrice: 6.5, retailPrice: 14.0 },
    { name: "Quiche (whole)", transferPrice: 9.0, retailPrice: 22.0 },
    { name: "Granola 12oz", transferPrice: 5.0, retailPrice: 11.0 },
    { name: "Cookie 4-pack", transferPrice: 3.5, retailPrice: 8.0 },
  ];
  const production: ProductionItem[] = PRODUCTION_ITEMS.map((p) => {
    const baseUnits = 30 + rand() * 90;
    const unitsSent = Math.round(baseUnits);
    // Sell-through rate per location ~ 30-55%, sometimes weak
    const stA = 0.25 + rand() * 0.35;
    const stB = 0.25 + rand() * 0.35;
    const soldA = Math.min(unitsSent, Math.round(unitsSent * stA));
    const soldB = Math.min(unitsSent - soldA, Math.round(unitsSent * stB));
    return { ...p, unitsSent, soldA, soldB };
  });

  return {
    date,
    dayType,
    weather,
    revenue,
    laborCost,
    laborPct,
    avgTicket,
    avgItems,
    salesPerHour,
    hourly,
    categories,
    production,
  };
}

export function aggregateProduction(days: DayData[]): ProductionItem[] {
  const map = new Map<string, ProductionItem>();
  days.forEach((d) =>
    d.production.forEach((p) => {
      const cur = map.get(p.name);
      if (!cur) {
        map.set(p.name, { ...p });
      } else {
        cur.unitsSent += p.unitsSent;
        cur.soldA += p.soldA;
        cur.soldB += p.soldB;
      }
    })
  );
  return Array.from(map.values()).sort((a, b) => b.unitsSent - a.unitsSent);
}

// "Same day last year" using same day-of-week, same relative week
export function priorYearEquivalent(date: Date): Date {
  const lastYear = subYears(date, 1);
  const dowDiff = (date.getDay() - lastYear.getDay() + 7) % 7;
  // Adjust forward to the matching DOW
  return addDays(lastYear, dowDiff);
}

export function getWeekDates(anchor: Date): Date[] {
  const start = startOfWeek(anchor, { weekStartsOn: 1 }); // Monday
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

// Returns Monday..yesterday for the in-progress week containing `today`.
// If today is Monday, returns just [Monday] (so far). Empty if no full day yet.
export function getWeekToDateDates(today: Date): Date[] {
  const start = startOfWeek(today, { weekStartsOn: 1 });
  const out: Date[] = [];
  let cur = start;
  while (cur < today) {
    // strip time when comparing — include all completed days before today
    out.push(new Date(cur));
    cur = addDays(cur, 1);
  }
  return out;
}

export function getMonthDates(anchor: Date): Date[] {
  const y = anchor.getFullYear();
  const m = anchor.getMonth();
  const days = new Date(y, m + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) => new Date(y, m, i + 1));
}

export function aggregate(days: DayData[]) {
  const revenue = days.reduce((s, d) => s + d.revenue, 0);
  const laborCost = days.reduce((s, d) => s + d.laborCost, 0);
  const laborPct = revenue ? +((laborCost / revenue) * 100).toFixed(1) : 0;
  const serviceDays = days.filter((d) => d.dayType === "Service");
  const avgTicket = serviceDays.length
    ? +(serviceDays.reduce((s, d) => s + d.avgTicket, 0) / serviceDays.length).toFixed(2)
    : 0;
  const avgItems = serviceDays.length
    ? +(serviceDays.reduce((s, d) => s + d.avgItems, 0) / serviceDays.length).toFixed(2)
    : 0;

  // Aggregate categories
  const catMap = new Map<string, { revenue: number; items: number }>();
  days.forEach((d) =>
    d.categories.forEach((c) => {
      const cur = catMap.get(c.name) || { revenue: 0, items: 0 };
      catMap.set(c.name, { revenue: cur.revenue + c.revenue, items: cur.items + c.items });
    })
  );
  const totalRev = revenue || 1;
  const categories: CategoryRow[] = Array.from(catMap.entries())
    .map(([name, v]) => {
      // Build aggregate top/bottom items by re-deriving from each day's items
      const itemMap = new Map<string, number>();
      days.forEach((d) => {
        const cat = d.categories.find((c) => c.name === name);
        if (!cat) return;
        [...cat.topItems, ...cat.bottomItems].forEach((it) => {
          itemMap.set(it.name, (itemMap.get(it.name) || 0) + it.revenue);
        });
      });
      const itemArr = Array.from(itemMap.entries())
        .map(([n, r]) => ({ name: n, revenue: r }))
        .sort((a, b) => b.revenue - a.revenue);
      return {
        name,
        revenue: v.revenue,
        items: v.items,
        topItems: itemArr.slice(0, 5),
        bottomItems: itemArr.slice(-5).reverse(),
        pct: +((v.revenue / totalRev) * 100).toFixed(1),
      } as CategoryRow & { pct: number };
    })
    .sort((a, b) => b.revenue - a.revenue);

  return { revenue, laborCost, laborPct, avgTicket, avgItems, categories };
}

export function todayDate(): Date {
  // Use a deterministic "today" so the demo data stays interesting.
  // Replace with `new Date()` once wired to live data.
  return new Date();
}

export function yesterdayDate(): Date {
  return subDays(todayDate(), 1);
}
