import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import analyticsApi from "../../api/analyticsApi";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type ConcurrentSource = "redis" | "mongo-fallback";

interface AnalyticsSummary {
  rangeStartUtc: string;
  rangeEndUtc: string;
  generatedAtUtc: string;
  totalUsers: number;
  dailyActiveUsers: number;
  concurrentPlayers: number;
  newUsers: number;
  returningUsers: number;
  concurrentSource: ConcurrentSource;
}

interface TrendPoint {
  label: string;
  totalUsers: number;
  dailyActiveUsers: number;
  newUsers: number;
  returningUsers: number;
}

const CHART_COLORS = {
  totalUsers: "#38bdf8",
  dailyActiveUsers: "#34d399",
  newUsers: "#22c55e",
  returningUsers: "#3b82f6",
};

function toStartOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date: Date, days: number) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function toDateInputValue(date: Date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateInputValue(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

function formatDateDisplay(value: string) {
  const d = parseDateInputValue(value);
  if (!d) return "Select date";
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${d.getUTCFullYear()}`;
}

function isSameUtcDate(a: Date, b: Date) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function monthLabel(year: number, month: number) {
  return new Date(Date.UTC(year, month, 1)).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function toLocaleNumber(value: number) {
  return Number(value || 0).toLocaleString();
}

function toRangeUtc(startDate: string, endDate: string) {
  const startUtc = `${startDate}T00:00:00.000Z`;
  const endUtc = addUtcDays(new Date(`${endDate}T00:00:00.000Z`), 1).toISOString();
  return { startUtc, endUtc };
}

function buildDailyWindows(startUtcIso: string, endUtcIso: string) {
  const start = new Date(startUtcIso);
  const end = new Date(endUtcIso);
  const ranges: Array<{ start: string; end: string; label: string }> = [];

  let cursor = toStartOfUtcDay(start);
  const last = toStartOfUtcDay(end);

  while (cursor < last) {
    const next = addUtcDays(cursor, 1);
    ranges.push({
      start: cursor.toISOString(),
      end: next.toISOString(),
      label: `${String(cursor.getUTCDate()).padStart(2, "0")}/${String(cursor.getUTCMonth() + 1).padStart(2, "0")}`,
    });
    cursor = next;
  }

  return ranges;
}

function AdminAnalyticsDashboard() {
  const AUTO_REFRESH_MS = 30000;
  const now = new Date();
  const todayUtc = toStartOfUtcDay(now);
  const defaultStartUtc = addUtcDays(todayUtc, -13);

  const [startDate, setStartDate] = useState(toDateInputValue(defaultStartUtc));
  const [endDate, setEndDate] = useState(toDateInputValue(todayUtc));
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState("");
  const [overview, setOverview] = useState<AnalyticsSummary | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);

  const loadAnalytics = useCallback(async (startUtcIso: string, endUtcIso: string, silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError("");
    try {
      const windows = buildDailyWindows(startUtcIso, endUtcIso).slice(0, 62);

      const [summaryRes, ...dailyRes] = await Promise.all([
        analyticsApi.getSummary({ startDate: startUtcIso, endDate: endUtcIso }),
        ...windows.map((w) => analyticsApi.getSummary({ startDate: w.start, endDate: w.end })),
      ]);

      const summaryData: AnalyticsSummary = summaryRes.data;
      const trendData: TrendPoint[] = windows.map((w, idx) => {
        const item: AnalyticsSummary = dailyRes[idx].data;
        return {
          label: w.label,
          totalUsers: Number(item.totalUsers || 0),
          dailyActiveUsers: Number(item.dailyActiveUsers || 0),
          newUsers: Number(item.newUsers || 0),
          returningUsers: Number(item.returningUsers || 0),
        };
      });

      setOverview(summaryData);
      setTrend(trendData);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to load analytics data.";
      setError(msg);
    } finally {
      if (!silent) setLoading(false);
      else setRefreshing(false);
    }
  }, []);

  const refreshSummaryOnly = useCallback(async () => {
    if (loading) return;
    const { startUtc, endUtc } = toRangeUtc(startDate, endDate);
    setRefreshing(true);
    try {
      const res = await analyticsApi.getSummary({ startDate: startUtc, endDate: endUtc });
      setOverview(res.data);
      setError("");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to refresh analytics data.";
      setError(msg);
    } finally {
      setRefreshing(false);
    }
  }, [startDate, endDate, loading]);

  useEffect(() => {
    const { startUtc, endUtc } = toRangeUtc(startDate, endDate);
    void loadAnalytics(startUtc, endUtc);
  }, [loadAnalytics]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = window.setInterval(() => {
      void refreshSummaryOnly();
    }, AUTO_REFRESH_MS);
    return () => window.clearInterval(id);
  }, [autoRefresh, refreshSummaryOnly]);

  const handleApply = async () => {
    if (!startDate || !endDate) {
      setError("Please choose both start and end date.");
      return;
    }

    const { startUtc, endUtc } = toRangeUtc(startDate, endDate);

    if (new Date(startUtc) >= new Date(endUtc)) {
      setError("startDate must be earlier than endDate.");
      return;
    }

    await loadAnalytics(startUtc, endUtc);
  };

  const setQuickRange = async (days: number) => {
    const end = toStartOfUtcDay(new Date());
    const start = addUtcDays(end, -(days - 1));
    const startValue = toDateInputValue(start);
    const endValue = toDateInputValue(end);

    setStartDate(startValue);
    setEndDate(endValue);

    const { startUtc, endUtc } = toRangeUtc(startValue, endValue);
    await loadAnalytics(startUtc, endUtc);
  };

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-3xl border border-sky-300/20 bg-gradient-to-r from-[#0b1326] via-[#101f42] to-[#0b2f3f] p-6 sm:p-8">
        <div className="absolute -top-10 right-12 h-44 w-44 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="absolute -bottom-14 -left-10 h-52 w-52 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Analytics Command Center</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-300">
              Monitor player growth and engagement across your selected UTC range with live summary updates.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300">
            <p>Last updated</p>
            <p className="mt-1 font-medium text-slate-100">
              {overview?.generatedAtUtc ? new Date(overview.generatedAtUtc).toLocaleString() : "Loading..."}
            </p>
          </div>
        </div>
      </header>

      <Card className="border border-slate-800 bg-slate-950/60 backdrop-blur">
        <CardContent className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:min-w-[470px]">
              <DateField label="Start Date (UTC)" value={startDate} onChange={setStartDate} />
              <DateField label="End Date (UTC)" value={endDate} onChange={setEndDate} />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => void setQuickRange(7)} disabled={loading}>7D</Button>
              <Button size="sm" variant="outline" onClick={() => void setQuickRange(14)} disabled={loading}>14D</Button>
              <Button size="sm" variant="outline" onClick={() => void setQuickRange(30)} disabled={loading}>30D</Button>
              <Button onClick={handleApply} disabled={loading}>
                {loading ? "Loading..." : "Apply"}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="h-4 w-4 accent-emerald-500"
              />
              Auto refresh every 30s
            </label>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className={`inline-flex h-2.5 w-2.5 rounded-full ${refreshing ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
              {refreshing ? "Refreshing summary..." : "Idle"}
              <Button size="sm" variant="outline" onClick={() => void refreshSummaryOnly()} disabled={refreshing || loading}>
                Refresh now
              </Button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-2">
        <MetricCard title="Total Users" value={overview?.totalUsers} colorClass="text-sky-300" />
        <MetricCard title="Concurrent Players" value={overview?.concurrentPlayers} colorClass="text-amber-300" />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ChartCard title="Total Users">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="4 4" stroke="#1f2937" />
              <XAxis dataKey="label" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid #1f2937", borderRadius: 10 }} />
              <Line type="monotone" dataKey="totalUsers" stroke={CHART_COLORS.totalUsers} strokeWidth={2.8} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Daily Active Users">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="4 4" stroke="#1f2937" />
              <XAxis dataKey="label" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid #1f2937", borderRadius: 10 }} />
              <Line type="monotone" dataKey="dailyActiveUsers" stroke={CHART_COLORS.dailyActiveUsers} strokeWidth={2.8} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="New Users">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trend}>
              <CartesianGrid strokeDasharray="4 4" stroke="#1f2937" />
              <XAxis dataKey="label" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid #1f2937", borderRadius: 10 }} />
              <Bar dataKey="newUsers" fill={CHART_COLORS.newUsers} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="New vs Returning Users">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trend} barCategoryGap="34%" barGap={6}>
              <CartesianGrid strokeDasharray="4 4" stroke="#1f2937" />
              <XAxis dataKey="label" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid #1f2937", borderRadius: 10 }} />
              <Legend />
              <Bar
                dataKey="newUsers"
                name="New Users"
                fill={CHART_COLORS.newUsers}
                stroke="#86efac"
                strokeWidth={1}
                barSize={14}
                minPointSize={2}
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="returningUsers"
                name="Returning Users"
                fill={CHART_COLORS.returningUsers}
                stroke="#93c5fd"
                strokeWidth={1}
                barSize={14}
                minPointSize={2}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>
    </div>
  );
}

function MetricCard({
  title,
  value,
  colorClass,
}: {
  title: string;
  value?: number;
  colorClass: string;
}) {
  return (
    <Card className="border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950/80">
      <CardContent className="space-y-2 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
        </div>
        <p className={`text-2xl font-semibold ${colorClass}`}>{toLocaleNumber(Number(value || 0))}</p>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="border border-slate-800 bg-slate-950/70">
      <CardHeader className="pb-0">
        <CardTitle className="text-base text-slate-100">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const selectedDate = parseDateInputValue(value) || toStartOfUtcDay(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selectedDate.getUTCFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getUTCMonth());

  useEffect(() => {
    const d = parseDateInputValue(value);
    if (!d) return;
    setViewYear(d.getUTCFullYear());
    setViewMonth(d.getUTCMonth());
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  const firstOfMonth = new Date(Date.UTC(viewYear, viewMonth, 1));
  const gridStart = addUtcDays(firstOfMonth, -firstOfMonth.getUTCDay());
  const calendarDays = Array.from({ length: 42 }, (_, idx) => addUtcDays(gridStart, idx));
  const today = toStartOfUtcDay(new Date());

  const changeMonth = (delta: number) => {
    const next = new Date(Date.UTC(viewYear, viewMonth + delta, 1));
    setViewYear(next.getUTCFullYear());
    setViewMonth(next.getUTCMonth());
  };

  return (
    <div>
      <p className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <div ref={wrapperRef} className="group relative">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 px-3 text-sm text-slate-100 shadow-inner outline-none transition hover:border-slate-500 focus:border-sky-400/70 focus:ring-2 focus:ring-sky-500/30"
        >
          <span>{formatDateDisplay(value)}</span>
          <span className="text-xs text-slate-300">Calendar</span>
        </button>

        {isOpen && (
          <div className="z-50 absolute top-[calc(100%+8px)] left-0 rounded-2xl border border-slate-700 bg-slate-950 p-3 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:border-slate-500 hover:text-white"
              >
                Prev
              </button>
              <p className="text-sm font-semibold text-slate-100">{monthLabel(viewYear, viewMonth)}</p>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:border-slate-500 hover:text-white"
              >
                Next
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-1">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div key={d} className="py-1 text-center text-[11px] text-slate-400">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const inMonth = day.getUTCMonth() === viewMonth;
                const selected = isSameUtcDate(day, selectedDate);
                const isToday = isSameUtcDate(day, today);
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => {
                      onChange(toDateInputValue(day));
                      setIsOpen(false);
                    }}
                    className={`h-8 w-8 rounded-md text-xs transition ${
                      selected
                        ? "bg-sky-500 text-white"
                        : isToday
                          ? "border border-emerald-500/70 text-emerald-300"
                          : inMonth
                            ? "text-slate-200 hover:bg-slate-800"
                            : "text-slate-500 hover:bg-slate-900"
                    }`}
                  >
                    {day.getUTCDate()}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const t = toStartOfUtcDay(new Date());
                  onChange(toDateInputValue(t));
                  setViewYear(t.getUTCFullYear());
                  setViewMonth(t.getUTCMonth());
                }}
                className="text-xs text-sky-300 hover:text-sky-200"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAnalyticsDashboard;
