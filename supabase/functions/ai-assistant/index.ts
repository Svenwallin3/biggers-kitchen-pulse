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

    // Placeholder mode — no API key yet. Return a deterministic stub
    // so the UI is fully wired and testable.
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({
          answer:
            `[Placeholder response — Anthropic API key not yet configured]\n\n` +
            `Your question: "${question}"\n\n` +
            `Once the ANTHROPIC_API_KEY is added, Claude will answer using the ` +
            `live dashboard data snapshot (today, yesterday, last week, last month, ` +
            `categories, hourly sales, production, labor).`,
          placeholder: true,
        }),
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
