import { useState } from "react";
import { Bot, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  getDayData,
  getMonthDates,
  getWeekDates,
  todayDate,
  yesterdayDate,
} from "@/lib/mockData";
import { subDays, subMonths, subWeeks } from "date-fns";

function buildSnapshot() {
  const today = todayDate();
  const yesterday = yesterdayDate();
  const lastWeekAnchor = subWeeks(today, 1);
  const lastMonthAnchor = subMonths(today, 1);

  return {
    today: getDayData(today),
    yesterday: getDayData(yesterday),
    yesterdayLastYear: getDayData(subDays(yesterday, 365)),
    thisWeek: getWeekDates(today).map(getDayData),
    lastWeek: getWeekDates(lastWeekAnchor).map(getDayData),
    lastMonth: getMonthDates(lastMonthAnchor).map(getDayData),
  };
}

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function ask() {
    const q = question.trim();
    if (!q || loading) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: { question: q, data: buildSnapshot() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAnswer(data?.answer ?? "(no answer)");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open assistant"
          className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[min(92vw,380px)] rounded-xl border bg-card text-card-foreground shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              <span className="text-sm font-semibold">Ask the Assistant</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="rounded-md p-1 hover:bg-primary-foreground/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 space-y-3">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask();
                }
              }}
              placeholder="e.g. What was total revenue yesterday?"
              className="min-h-[72px] resize-none text-sm"
              disabled={loading}
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={ask} disabled={loading || !question.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Thinking…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Ask
                  </>
                )}
              </Button>
            </div>

            <div className="rounded-md border bg-muted/40 p-3 text-sm min-h-[80px] max-h-[260px] overflow-y-auto whitespace-pre-wrap">
              {loading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Looking it up…
                </div>
              )}
              {!loading && error && <span className="text-destructive">{error}</span>}
              {!loading && !error && answer && <span>{answer}</span>}
              {!loading && !error && !answer && (
                <span className="text-muted-foreground">
                  Ask a question about sales, labor, categories, or production.
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
