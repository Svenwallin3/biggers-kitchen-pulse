// Stateless AI assistant for Bigger's Kitchen managers.
// Calls Anthropic Claude with a system prompt describing the data,
// plus a JSON snapshot of the current dashboard data, plus the question.
// If ANTHROPIC_API_KEY is not yet configured, returns a placeholder answer.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are an analytics assistant for Bigger's Kitchen store managers.
You answer natural-language questions about store performance using ONLY the JSON
data snapshot provided in the user message. Treat the snapshot as authoritative.

Data shape (provided in each request under "data"):
- today, yesterday: a DayData object for that calendar date
- yesterdayLastYear: same date one year ago (used for year-over-year comparisons)
- lastWeek, thisWeek: arrays of 7 DayData objects (Mon..Sun)
- lastMonth: array of DayData objects covering the previous calendar month

Each DayData object includes:
- date, dayType ("Production" | "Service")
- revenue (USD), laborCost (USD), laborPct (%), avgTicket, ticketCount, salesPerHour
- weather { high, low, condition, precipPct, severe }
- hourly[]: { hour, revenue, topCategory, ticketCount }
- categories[]: { name, revenue, items, topItems[], bottomItems[] }
  Categories include: Sandwiches, Salads, Bowls, Sides, Beverages, Desserts, Catering, Wholesale.
- production[]: bakery items transferred to market locations
  { name, unitsSent, transferPrice, retailPrice, soldA, soldB }
  Market 1 sales = soldA, Market 2 sales = soldB.

Rules:
- Answer in plain language, 1-3 short sentences. Lead with the number.
- Format money as $X,XXX. Format percentages with one decimal.
- If the requested data is not in the snapshot (e.g. a date or product not present),
  say so briefly. Do not guess or fabricate.
- Never mention SQL, JSON, schemas, or that you were given a snapshot.
- Do not include disclaimers about being an AI.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { question, data } = await req.json();

    if (!question || typeof question !== "string") {
      return new Response(JSON.stringify({ error: "Missing question" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

    // Placeholder mode — no API key yet. Return realistic-looking
    // fake answers so managers can preview what real responses look like.
    if (!ANTHROPIC_API_KEY) {
      const answer = fakeAnswer(question);
      return new Response(
        JSON.stringify({ answer, placeholder: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userContent =
      `Data snapshot:\n\`\`\`json\n${JSON.stringify(data ?? {})}\n\`\`\`\n\n` +
      `Question: ${question}`;

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userContent }],
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Anthropic error", resp.status, text);
      return new Response(
        JSON.stringify({ error: `Anthropic API error (${resp.status})` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const json = await resp.json();
    const answer = json?.content?.[0]?.text ?? "(no answer)";
    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-assistant error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

// ---------- Placeholder answer generator ----------
// Produces realistic-looking fake responses keyed off the question wording,
// so managers can preview what Claude's answers will look like once wired up.

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
function money(n: number): string {
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function fakeAnswer(question: string): string {
  const q = question.toLowerCase();
  const seed = hash(q);
  const r = (n: number) => Math.abs((seed >> n) % 1000) / 1000;

  // Product / item lookups (e.g. "how many tomatoes did we sell yesterday")
  const productMatch = q.match(/how many ([a-z\s]+?) (did we |were |have we )?sold?/);
  if (productMatch) {
    const product = productMatch[1].trim();
    const units = 40 + Math.floor(r(1) * 180);
    const revenue = Math.round(units * (3 + r(2) * 8));
    return `We sold ${units} ${product} yesterday across both markets, generating ${money(revenue)} in revenue. Market 1 accounted for about ${Math.round(45 + r(3) * 20)}% of the volume.`;
  }

  // Revenue questions
  if (q.includes("revenue") || q.includes("sales")) {
    const rev = 6000 + Math.floor(r(1) * 12000);
    const period = q.includes("week") ? "last week" : q.includes("month") ? "last month" : q.includes("yesterday") ? "yesterday" : "today";
    const market = q.match(/market\s*(\d)/);
    const scope = market ? ` at Market ${market[1]}` : "";
    const multiplier = period === "last week" ? 7 : period === "last month" ? 30 : 1;
    const total = rev * multiplier;
    const yoy = (r(2) * 20 - 5).toFixed(1);
    return `Total revenue${scope} ${period} was ${money(total)}, ${parseFloat(yoy) >= 0 ? "up" : "down"} ${Math.abs(parseFloat(yoy))}% versus the same period last year.`;
  }

  // Labor questions
  if (q.includes("labor")) {
    const pct = (24 + r(1) * 10).toFixed(1);
    const cost = 1800 + Math.floor(r(2) * 1200);
    return `Labor cost ran ${pct}% of sales yesterday (${money(cost)}), which is ${r(3) > 0.5 ? "slightly above" : "in line with"} the 28% target.`;
  }

  // Category / top performers
  if (q.includes("top") || q.includes("best") || q.includes("popular")) {
    const cats = ["Sandwiches", "Salads", "Bowls", "Beverages", "Desserts"];
    const top = pick(cats, seed);
    const rev = 1200 + Math.floor(r(1) * 1800);
    return `${top} was the top category yesterday with ${money(rev)} in sales, driven mostly by the lunch rush between 11 AM and 1 PM.`;
  }

  // Production / sell-through
  if (q.includes("production") || q.includes("bake") || q.includes("sell-through") || q.includes("sell through")) {
    const pct = (38 + r(1) * 25).toFixed(0);
    return `Sell-through across bakery production was ${pct}% yesterday — Sourdough Loaf and Croissants moved fastest, while Quiche and Focaccia trays under-sold by roughly 30%.`;
  }

  // Average ticket
  if (q.includes("ticket") || q.includes("average")) {
    const avg = (14 + r(1) * 8).toFixed(2);
    const tickets = 280 + Math.floor(r(2) * 180);
    return `Average ticket was $${avg} on ${tickets} transactions yesterday — about $0.${Math.floor(r(3) * 90 + 10)} higher than the trailing 4-week average.`;
  }

  // Weather impact
  if (q.includes("weather") || q.includes("rain")) {
    return `Yesterday was ${pick(["sunny", "partly cloudy", "light rain"], seed)} with a high of ${68 + Math.floor(r(1) * 20)}°F. Foot traffic was ${r(2) > 0.5 ? "right on" : "about 8% below"} forecast.`;
  }

  // Generic fallback
  const numbers = [
    `Revenue: ${money(7000 + Math.floor(r(1) * 6000))}`,
    `Tickets: ${280 + Math.floor(r(2) * 180)}`,
    `Avg ticket: $${(14 + r(3) * 8).toFixed(2)}`,
    `Labor: ${(26 + r(4) * 8).toFixed(1)}%`,
  ];
  return `Here's a snapshot based on yesterday's numbers — ${numbers.join(", ")}. Ask about a specific product, category, market, or time period for a more focused answer.`;
}
