import { useMemo, useState } from "react";
import { ChefHat, RefreshCw, CalendarIcon } from "lucide-react";
import { addDays, addMonths, addWeeks, format, startOfWeek, subDays, subMonths, subWeeks } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsProvider } from "@/lib/settings";
import { getDayData, todayDate, yesterdayDate } from "@/lib/mockData";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { SettingsDrawer } from "@/components/dashboard/SettingsDrawer";
import { PeriodNav } from "@/components/dashboard/PeriodNav";
import { DailyYesterday } from "@/components/dashboard/views/DailyYesterday";
import { DailyToday } from "@/components/dashboard/views/DailyToday";
import { WeeklyLast } from "@/components/dashboard/views/WeeklyLast";
import { WeeklyThis } from "@/components/dashboard/views/WeeklyThis";
import { MonthlyLast } from "@/components/dashboard/views/MonthlyLast";
import { MonthlyThis } from "@/components/dashboard/views/MonthlyThis";

const MAX_FUTURE_WEEKS = 4;
const MAX_FUTURE_MONTHS = 4;
const MAX_FUTURE_DAYS = 28;

const Index = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [primary, setPrimary] = useState("daily");
  const [dailySub, setDailySub] = useState("yesterday");
  const [weeklySub, setWeeklySub] = useState("last");
  const [monthlySub, setMonthlySub] = useState("last");
  const today = todayDate();
  const yesterday = yesterdayDate();

  // Daily — Yesterday: any past date up to actual yesterday
  const [yesterdayDrill, setYesterdayDrill] = useState<Date>(yesterday);
  // Daily — Today: offset days forward from real today (0..28)
  const [todayOffset, setTodayOffset] = useState(0);
  const todayDrill = useMemo(() => addDays(today, todayOffset), [today, todayOffset]);

  // Weekly — Last Week: weeks back from "last week" anchor (>=0)
  const lastWeekBase = useMemo(() => subWeeks(today, 1), [today]);
  const [lastWeekOffset, setLastWeekOffset] = useState(0); // 0 = last week
  const lastWeekAnchor = useMemo(() => subWeeks(lastWeekBase, lastWeekOffset), [lastWeekBase, lastWeekOffset]);

  // Weekly — This Week: offset weeks forward from current week (0..4)
  const [thisWeekOffset, setThisWeekOffset] = useState(0);
  const thisWeekAnchor = useMemo(() => addWeeks(today, thisWeekOffset), [today, thisWeekOffset]);

  // Monthly — Last Month: months back from "last month" anchor (>=0)
  const lastMonthBase = useMemo(() => subMonths(new Date(), 1), []);
  const [lastMonthOffset, setLastMonthOffset] = useState(0);
  const lastMonthAnchor = useMemo(() => subMonths(lastMonthBase, lastMonthOffset), [lastMonthBase, lastMonthOffset]);

  // Monthly — This Month: months forward (0..4)
  const [thisMonthOffset, setThisMonthOffset] = useState(0);
  const thisMonthAnchor = useMemo(() => addMonths(new Date(), thisMonthOffset), [thisMonthOffset]);

  const lastRefresh = useMemo(() => new Date(), [refreshKey]);

  const yData = getDayData(yesterday);
  const yPyData = getDayData(subDays(yesterday, 365));
  const todayWeather = getDayData(today).weather;
  const tomorrowWeather = getDayData(new Date(today.getTime() + 86400000)).weather;

  // Period labels
  const yesterdayLabel = format(yesterdayDrill, "EEE, MMM d, yyyy");
  const todayLabel = todayOffset === 0
    ? `Today — ${format(todayDrill, "EEE, MMM d")}`
    : `${format(todayDrill, "EEE, MMM d, yyyy")} — Based on Last Year`;

  const lwStart = startOfWeek(lastWeekAnchor, { weekStartsOn: 1 });
  const lwEnd = addDays(lwStart, 6);
  const lastWeekLabel = `Week of ${format(lwStart, "MMM d")} – ${format(lwEnd, "MMM d, yyyy")}`;

  const twStart = startOfWeek(thisWeekAnchor, { weekStartsOn: 1 });
  const twEnd = addDays(twStart, 6);
  const thisWeekLabel = thisWeekOffset === 0
    ? `Week of ${format(twStart, "MMM d")} – ${format(twEnd, "MMM d, yyyy")}`
    : `Week of ${format(twStart, "MMM d")} – ${format(twEnd, "MMM d, yyyy")} — Based on Last Year`;

  const lastMonthLabel = format(lastMonthAnchor, "MMMM yyyy");
  const thisMonthLabel = thisMonthOffset === 0
    ? format(thisMonthAnchor, "MMMM yyyy")
    : `${format(thisMonthAnchor, "MMMM yyyy")} — Based on Last Year`;

  return (
    <SettingsProvider>
      <div className="min-h-screen bg-background">
        <header className="bg-sidebar text-sidebar-foreground border-b border-sidebar-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-sidebar-accent flex items-center justify-center">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold leading-tight">Bigger's Kitchen</h1>
                <p className="text-[11px] text-sidebar-foreground/60">Operations Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden md:block text-[11px] text-sidebar-foreground/60 mr-1">
                Updated {format(lastRefresh, "h:mm a")}
              </span>
              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                className="inline-flex items-center gap-1.5 px-3 h-9 rounded-md bg-sidebar-accent hover:bg-sidebar-accent/80 text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <SettingsDrawer />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-4">
          <Tabs value={primary} onValueChange={setPrimary}>
            <TabsList className="grid grid-cols-3 w-full sm:w-auto">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>

            <div className="mt-3">
              <AlertBanner
                yesterday={yData}
                yesterdayPriorYear={yPyData}
                todayWeather={todayWeather}
                tomorrowWeather={tomorrowWeather}
              />
            </div>

            <TabsContent value="daily" className="mt-4 space-y-4">
              <Tabs value={dailySub} onValueChange={setDailySub}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <TabsList>
                    <TabsTrigger value="yesterday">Yesterday</TabsTrigger>
                    <TabsTrigger value="today">Today</TabsTrigger>
                  </TabsList>
                  {dailySub === "yesterday" && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          {format(yesterdayDrill, "EEE, MMM d, yyyy")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={yesterdayDrill}
                          onSelect={(d) => d && setYesterdayDrill(d)}
                          disabled={(d) => d > yesterday}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                </div>

                <TabsContent value="yesterday" className="mt-3 space-y-4">
                  <PeriodNav
                    label={yesterdayLabel}
                    onPrev={() => setYesterdayDrill((d) => subDays(d, 1))}
                    onNext={() => setYesterdayDrill((d) => (d < yesterday ? addDays(d, 1) : d))}
                    nextDisabled={yesterdayDrill >= yesterday}
                  />
                  <DailyYesterday date={yesterdayDrill} key={`${refreshKey}-${yesterdayDrill.toDateString()}`} />
                </TabsContent>

                <TabsContent value="today" className="mt-3 space-y-4">
                  <PeriodNav
                    label={todayLabel}
                    onPrev={() => setTodayOffset((o) => Math.max(0, o - 1))}
                    onNext={() => setTodayOffset((o) => Math.min(MAX_FUTURE_DAYS, o + 1))}
                    prevDisabled={todayOffset === 0}
                    nextDisabled={todayOffset >= MAX_FUTURE_DAYS}
                  />
                  <DailyToday date={todayDrill} future={todayOffset > 0} key={`${refreshKey}-${todayOffset}`} />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="weekly" className="mt-4 space-y-4">
              <Tabs value={weeklySub} onValueChange={setWeeklySub}>
                <TabsList>
                  <TabsTrigger value="last">Last Week</TabsTrigger>
                  <TabsTrigger value="this">This Week</TabsTrigger>
                </TabsList>

                <TabsContent value="last" className="mt-3 space-y-4">
                  <PeriodNav
                    label={lastWeekLabel}
                    onPrev={() => setLastWeekOffset((o) => o + 1)}
                    onNext={() => setLastWeekOffset((o) => Math.max(0, o - 1))}
                    nextDisabled={lastWeekOffset === 0}
                  />
                  <WeeklyLast
                    weekAnchor={lastWeekAnchor}
                    onDayClick={(d) => {
                      setYesterdayDrill(d);
                      setPrimary("daily");
                      setDailySub("yesterday");
                    }}
                    key={`${refreshKey}-${lastWeekOffset}`}
                  />
                </TabsContent>

                <TabsContent value="this" className="mt-3 space-y-4">
                  <PeriodNav
                    label={thisWeekLabel}
                    onPrev={() => setThisWeekOffset((o) => o - 1)}
                    onNext={() => setThisWeekOffset((o) => Math.min(MAX_FUTURE_WEEKS, o + 1))}
                    nextDisabled={thisWeekOffset >= MAX_FUTURE_WEEKS}
                  />
                  <WeeklyThis weekAnchor={thisWeekAnchor} future={thisWeekOffset > 0} key={`${refreshKey}-${thisWeekOffset}`} />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="monthly" className="mt-4 space-y-4">
              <Tabs value={monthlySub} onValueChange={setMonthlySub}>
                <TabsList>
                  <TabsTrigger value="last">Last Month</TabsTrigger>
                  <TabsTrigger value="this">This Month</TabsTrigger>
                </TabsList>

                <TabsContent value="last" className="mt-3 space-y-4">
                  <PeriodNav
                    label={lastMonthLabel}
                    onPrev={() => setLastMonthOffset((o) => o + 1)}
                    onNext={() => setLastMonthOffset((o) => Math.max(0, o - 1))}
                    nextDisabled={lastMonthOffset === 0}
                  />
                  <MonthlyLast monthAnchor={lastMonthAnchor} key={`${refreshKey}-${lastMonthOffset}`} />
                </TabsContent>

                <TabsContent value="this" className="mt-3 space-y-4">
                  <PeriodNav
                    label={thisMonthLabel}
                    onPrev={() => setThisMonthOffset((o) => o - 1)}
                    onNext={() => setThisMonthOffset((o) => Math.min(MAX_FUTURE_MONTHS, o + 1))}
                    nextDisabled={thisMonthOffset >= MAX_FUTURE_MONTHS}
                  />
                  <MonthlyThis monthAnchor={thisMonthAnchor} future={thisMonthOffset > 0} key={`${refreshKey}-${thisMonthOffset}`} />
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </SettingsProvider>
  );
};

export default Index;
