import { useMemo, useState } from "react";
import { ChefHat, RefreshCw, CalendarIcon } from "lucide-react";
import { format, subDays, subWeeks } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsProvider } from "@/lib/settings";
import { getDayData, todayDate, yesterdayDate } from "@/lib/mockData";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { SettingsDrawer } from "@/components/dashboard/SettingsDrawer";
import { DailyYesterday } from "@/components/dashboard/views/DailyYesterday";
import { DailyToday } from "@/components/dashboard/views/DailyToday";
import { WeeklyLast } from "@/components/dashboard/views/WeeklyLast";
import { WeeklyThis } from "@/components/dashboard/views/WeeklyThis";
import { MonthlyLast } from "@/components/dashboard/views/MonthlyLast";
import { MonthlyThis } from "@/components/dashboard/views/MonthlyThis";

const Index = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [primary, setPrimary] = useState("daily");
  const [dailySub, setDailySub] = useState("yesterday");
  const [weeklySub, setWeeklySub] = useState("last");
  const [monthlySub, setMonthlySub] = useState("last");
  const today = todayDate();
  const yesterday = yesterdayDate();
  // Default the "Yesterday" view to the most recent Saturday so the
  // Service-day hourly chart is visible by default in the demo.
  const defaultDrill = useMemo(() => {
    const d = new Date(today);
    const dow = d.getDay(); // 0 Sun..6 Sat
    const back = (dow - 6 + 7) % 7 || 7; // most recent past Saturday
    return subDays(d, back);
  }, [today]);
  const [drillDate, setDrillDate] = useState<Date | null>(defaultDrill);
  const lastWeekAnchor = useMemo(() => subWeeks(today, 1), [today]);
  const lastRefresh = useMemo(() => new Date(), [refreshKey]);

  const yData = getDayData(yesterday);
  const yPyData = getDayData(subDays(yesterday, 365));
  const todayWeather = getDayData(today).weather;
  const tomorrowWeather = getDayData(new Date(today.getTime() + 86400000)).weather;

  return (
    <SettingsProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
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
                <TabsList>
                  <TabsTrigger value="yesterday">Yesterday</TabsTrigger>
                  <TabsTrigger value="today">Today</TabsTrigger>
                </TabsList>
                <TabsContent value="yesterday" className="mt-4">
                  <DailyYesterday date={drillDate || yesterday} key={refreshKey} />
                </TabsContent>
                <TabsContent value="today" className="mt-4">
                  <DailyToday date={today} key={refreshKey} />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="weekly" className="mt-4 space-y-4">
              <Tabs value={weeklySub} onValueChange={setWeeklySub}>
                <TabsList>
                  <TabsTrigger value="last">Last Week</TabsTrigger>
                  <TabsTrigger value="this">This Week</TabsTrigger>
                </TabsList>
                <TabsContent value="last" className="mt-4">
                  <WeeklyLast
                    weekAnchor={lastWeekAnchor}
                    onDayClick={(d) => {
                      setDrillDate(d);
                      setPrimary("daily");
                      setDailySub("yesterday");
                    }}
                    key={refreshKey}
                  />
                </TabsContent>
                <TabsContent value="this" className="mt-4">
                  <WeeklyThis weekAnchor={today} key={refreshKey} />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="monthly" className="mt-4 space-y-4">
              <Tabs value={monthlySub} onValueChange={setMonthlySub}>
                <TabsList>
                  <TabsTrigger value="last">Last Month</TabsTrigger>
                  <TabsTrigger value="this">This Month</TabsTrigger>
                </TabsList>
                <TabsContent value="last" className="mt-4">
                  <MonthlyLast key={refreshKey} />
                </TabsContent>
                <TabsContent value="this" className="mt-4">
                  <MonthlyThis key={refreshKey} />
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
