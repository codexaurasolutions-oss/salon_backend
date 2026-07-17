import { useState, useEffect, useCallback } from "react";
import { ResponsiveDashboardLayout } from "@/components/dashboard/ResponsiveDashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Banknote,
  Clock,
  MessageSquare,
  PieChart as PieIcon,
  Loader2,
  Activity,
  Zap,
  Scissors
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from "recharts";
import { useSalon } from "@/hooks/useSalon";
import { Badge } from "@/components/ui/badge";
import api from "@/services/api";
import { format } from "date-fns";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = Number(payload[0].value);
    const monthStr = label.includes('-') ? format(new Date(label + '-01'), 'MMMM yyyy') : label;

    return (
      <div className="relative mb-4">
        <div className="bg-[#111827]/95 backdrop-blur-md px-5 py-3 rounded-[12px] border border-white/5 shadow-2xl min-w-[150px]">
          <p className="text-[#94a3b8] text-[10px] font-bold uppercase tracking-[0.1em] mb-1">{monthStr.toUpperCase()}</p>
          <div className="space-y-1">
            <p className="text-white font-bold text-[13px] tracking-tight flex justify-between gap-4">
              Revenue: <span className="text-[#0ea5e9]">MYR {value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value.toLocaleString()}</span>
            </p>
            {payload[1] && (
              <p className="text-white font-bold text-[13px] tracking-tight flex justify-between gap-4">
                Profit: <span className="text-emerald-400">MYR {Number(payload[1].value) >= 1000 ? (Number(payload[1].value) / 1000).toFixed(1) + 'k' : Number(payload[1].value).toLocaleString()}</span>
              </p>
            )}
          </div>
        </div>
        {/* Triangle Pointer */}
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#111827]/95" />
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const { currentSalon, loading: salonLoading } = useSalon();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("Yearly");
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!currentSalon) {
      if (!salonLoading) setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await api.salons.getAnalytics(currentSalon.id);
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [currentSalon]);

  const handleDownload = () => {
    if (!analytics || !analytics.revenue_monthly) return;

    const headers = ["Month", "Revenue (MYR)"];
    const csvContent = [
      headers.join(","),
      ...analytics.revenue_monthly.map((row: any) => `${row.month},${row.revenue}`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `revenue_report_${format(new Date(), 'yyyy_MM_dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading || !analytics) {
    return (
      <ResponsiveDashboardLayout showBackButton={true}>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-accent" />
          <p className="text-muted-foreground font-bold text-lg">Generating Analytical Dossier...</p>
        </div>
      </ResponsiveDashboardLayout>
    );
  }

  // Adaptive data pipeline: Determine start date from analytics or default to 12 months ago
  const chartData = [];
  const now = new Date();

  // Find earliest month with data
  let start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  if (analytics.revenue_monthly.length > 0) {
    const earliest = new Date(analytics.revenue_monthly[0].month + '-01');
    if (earliest < start) start = earliest;
  }

  // Generate continuous timeline from start to now
  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 1);

  while (current <= end) {
    const key = format(current, 'yyyy-MM');
    const existing = analytics.revenue_monthly.find((r: any) => r.month === key);
    chartData.push({
      month: key,
      revenue: existing ? Number(existing.revenue) : 0,
      profit: existing ? Number(existing.profit) : 0
    });
    current.setMonth(current.getMonth() + 1);
  }

  // Handle Time Range Grouping
  let displayData = [...chartData];
  if (timeRange === 'Quarterly') {
    const quarters: any = {};
    chartData.forEach(d => {
      const date = new Date(d.month + '-01');
      const q = `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
      quarters[q] = quarters[q] || { revenue: 0, profit: 0 };
      quarters[q].revenue += Number(d.revenue);
      quarters[q].profit += Number(d.profit);
    });
    displayData = Object.entries(quarters).map(([q, stats]: any) => ({ month: q, ...stats }));
  } else if (timeRange === 'Yearly') {
    const years: any = {};
    chartData.forEach(d => {
      const date = new Date(d.month + '-01');
      const year = date.getFullYear().toString();
      years[year] = years[year] || { revenue: 0, profit: 0 };
      years[year].revenue += Number(d.revenue);
      years[year].profit += Number(d.profit);
    });
    displayData = Object.entries(years).map(([y, stats]: any) => ({ month: y, ...stats }));
  }

  const lifetimeRevenue = analytics.revenue_monthly.reduce((sum: number, r: any) => sum + Number(r.revenue), 0);
  const lifetimeProfit = analytics.revenue_monthly.reduce((sum: number, r: any) => sum + Number(r.profit), 0);

  // Dynamic Period Totals
  const getPeriodStats = () => {
    const now = new Date();
    const currentMonthStr = format(now, 'yyyy-MM');
    const currentYearStr = now.getFullYear().toString();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;

    if (timeRange === 'Monthly') {
      const mData = chartData.find(d => d.month === currentMonthStr);
      return {
        total: mData ? Number(mData.revenue) : 0,
        profit: mData ? Number(mData.profit) : 0,
        label: "This Month"
      };
    } else if (timeRange === 'Quarterly') {
      const qStats = chartData
        .filter(d => {
          const dt = new Date(d.month + '-01');
          return dt.getFullYear() === now.getFullYear() && (Math.floor(dt.getMonth() / 3) + 1) === currentQuarter;
        })
        .reduce((acc, d) => ({
          revenue: acc.revenue + Number(d.revenue),
          profit: acc.profit + Number(d.profit)
        }), { revenue: 0, profit: 0 });
      return { total: qStats.revenue, profit: qStats.profit, label: "This Quarter" };
    } else {
      const yStats = chartData
        .filter(d => d.month.startsWith(currentYearStr))
        .reduce((acc, d) => ({
          revenue: acc.revenue + Number(d.revenue),
          profit: acc.profit + Number(d.profit)
        }), { revenue: 0, profit: 0 });
      return { total: yStats.revenue, profit: yStats.profit, label: "This Year" };
    }
  };

  const { total: periodTotal, profit: periodProfit, label: periodLabel } = getPeriodStats();

  const totalBookings = analytics.popular_treatments.reduce((sum: number, s: any) => sum + Number(s.count), 0);
  const totalCustomers = analytics.customer_ratio.reduce((sum: number, r: any) => sum + Number(r.customer_count), 0);

  // Dynamic axis calculation
  const maxVal = Math.max(...displayData.map((d: any) => Number(d.revenue)), 100);
  let yAxisMax, tickInterval;

  if (maxVal < 1000) {
    yAxisMax = Math.ceil(maxVal / 100) * 100 || 500;
    tickInterval = yAxisMax / 4;
  } else {
    yAxisMax = Math.ceil(maxVal / 2000) * 2000 || 8000;
    tickInterval = yAxisMax / 4;
  }

  const dynamicTicks = [0, tickInterval, tickInterval * 2, tickInterval * 3, yAxisMax];

  // Dynamic Growth Calculation (Current vs Previous recorded point)
  let growth = 0;
  const activeMonths = analytics.revenue_monthly.filter((r: any) => Number(r.revenue) > 0);
  if (activeMonths.length >= 2) {
    const latest = Number(activeMonths[activeMonths.length - 1].revenue);
    const previous = Number(activeMonths[activeMonths.length - 2].revenue);
    growth = ((latest - previous) / previous) * 100;
  } else if (activeMonths.length === 1) {
    growth = 100;
  }

  return (
    <ResponsiveDashboardLayout showBackButton={true}>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-card border border-border/50 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 blur-[120px] rounded-full" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 bg-accent/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-accent/20 text-accent">
                <BarChart3 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight text-foreground">Intelligence Hub</h1>
                <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">Data-Driven Salon Optimization</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Button onClick={fetchAnalytics} variant="outline" className="bg-accent/5 border-accent/20 text-accent hover:bg-accent/10 font-bold h-12 rounded-xl transition-all">
                <Calendar className="w-4 h-4 mr-2" /> REFRESH FEED
              </Button>
            </div>
          </div>
        </div>

        {/* Global Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Gross Volume", value: `MYR ${lifetimeRevenue.toLocaleString()}`, icon: Banknote, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/10" },
            { label: "Net Profit", value: `MYR ${lifetimeProfit.toLocaleString()}`, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/10" },
            { label: "Visit Count", value: totalBookings, icon: Scissors, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/10" },
            { label: "Total Reach", value: totalCustomers, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/10" },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm bg-card rounded-3xl p-6 group hover:shadow-xl transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest leading-none">{stat.label}</p>
                  <p className="text-2xl font-black text-foreground mt-3 truncate max-w-[150px]">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border group-hover:scale-110 transition-transform ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-muted p-1.5 rounded-[1.5rem] w-full md:w-auto h-auto grid grid-cols-2 md:inline-flex">
            <TabsTrigger value="overview" className="rounded-2xl py-3 px-8 data-[state=active]:bg-card data-[state=active]:shadow-lg font-black text-xs uppercase tracking-widest">Performance Dashboard</TabsTrigger>
            <TabsTrigger value="customers" className="rounded-2xl py-3 px-8 data-[state=active]:bg-card data-[state=active]:shadow-lg font-black text-xs uppercase tracking-widest">Demographic Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Revenue Area Chart */}
              <Card className="lg:col-span-2 border-none shadow-xl bg-card rounded-[2.5rem] overflow-hidden relative border border-border/50">
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 relative z-10 px-10 pt-10 gap-6">
                  <div className="space-y-1.5">
                    <CardTitle className="text-[1.5rem] font-black text-foreground tracking-tighter">Revenue Trajectory</CardTitle>
                    <CardDescription className="text-muted-foreground font-bold uppercase tracking-widest text-[11px]">Historical Performance Flow</CardDescription>
                  </div>
                  <div className="flex items-center gap-1.5 bg-muted/50 p-1.5 rounded-2xl border border-border backdrop-blur-md">
                    {['Monthly', 'Quarterly', 'Yearly'].map((range) => (
                      <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-5 py-2 text-[11px] font-black uppercase transition-all tracking-wider rounded-xl ${timeRange === range
                          ? "text-white bg-accent shadow-lg tracking-widest"
                          : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        {range}
                      </button>
                    ))}
                    <div className="w-px h-5 bg-border mx-2" />
                    <div className="flex gap-1 pr-1">
                      <button
                        onClick={handleDownload}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>

                <div className="h-[400px] w-full px-6 relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={displayData.length > 0 ? displayData : [
                        { month: format(new Date(), 'MMM'), revenue: 0, profit: 0 }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#fff" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#fff" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="5" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="4 4"
                        vertical={false}
                        stroke="#fff"
                        strokeOpacity={0.3}
                      />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600 }}
                        dy={20}
                        interval={timeRange === 'Monthly' ? 1 : 0}
                        tickFormatter={(val) => {
                          if (val.includes('-')) {
                            const date = new Date(val + '-01');
                            return format(date, 'MMM');
                          }
                          return val;
                        }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600 }}
                        dx={-15}
                        ticks={dynamicTicks}
                        domain={[0, yAxisMax]}
                        tickFormatter={(val) => {
                          const num = Number(val);
                          if (num >= 100000) return `MYR ${(num / 100000).toFixed(1)}L`;
                          if (num >= 1000) return `MYR ${(num / 1000).toFixed(1)}k`;
                          return `MYR ${num}`;
                        }}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ stroke: '#fff', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                        animationDuration={200}
                        offset={-20}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{ paddingTop: '0px', paddingRight: '20px' }}
                        content={({ payload }) => (
                          <div className="flex gap-6 justify-end items-center mb-4">
                            {payload?.map((entry: any, index: number) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">{entry.value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke="#fff"
                        strokeWidth={4}
                        fill="url(#revenueGradient)"
                        filter="url(#glow)"
                        activeDot={{
                          r: 9,
                          fill: "#55402f",
                          stroke: "#fff",
                          strokeWidth: 4,
                          className: "shadow-[0_0_25px_rgba(255,255,255,0.9)]"
                        }}
                        dot={{ r: 4, fill: "#fff", strokeWidth: 0 }}
                        animationDuration={3000}
                      />
                      <Area
                        type="monotone"
                        dataKey="profit"
                        name="Profit"
                        stroke="#10b981"
                        strokeWidth={3}
                        fill="url(#profitGradient)"
                        activeDot={{
                          r: 7,
                          fill: "#10b981",
                          stroke: "#fff",
                          strokeWidth: 3,
                        }}
                        dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
                        animationDuration={3000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="px-12 pb-14 pt-8 flex items-center justify-between mt-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2.5 px-4 py-2 rounded-full border shadow-[0_0_30px_rgba(16,185,129,0.3)] bg-white/20 border-white/30 backdrop-blur-md`}>
                      {growth >= 0 ? (
                        <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-b-[11px] border-b-emerald-500 mb-0.5" />
                      ) : (
                        <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[11px] border-t-red-500 mt-0.5" />
                      )}
                      <span className={`font-black text-2xl tracking-tighter ${growth >= 0 ? 'text-emerald-300' : 'text-red-300'
                        }`}>
                        {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-baseline gap-4">
                      <p className="text-white text-[23px] font-black tracking-tighter leading-none">
                        MYR {periodTotal >= 1000 ? `${(periodTotal / 1000).toFixed(1)}k` : periodTotal.toLocaleString()}
                      </p>
                      <span className="text-xl font-black text-white tracking-tight">
                        Revenue {periodLabel}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-4 mt-1">
                      <p className="text-emerald-400 text-[18px] font-black tracking-tighter leading-none">
                        MYR {periodProfit >= 1000 ? `${(periodProfit / 1000).toFixed(1)}k` : periodProfit.toLocaleString()}
                      </p>
                      <span className="text-sm font-black text-emerald-300 tracking-tight uppercase">
                        Net Profit
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Popular Treatments Bar Chart */}
              <Card className="border-none shadow-sm bg-card rounded-[2.5rem] p-8">
                <h3 className="text-2xl font-black text-foreground tracking-tight leading-none mb-2">Service Ranking</h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-8">Most popular treatments</p>
                <div className="space-y-6">
                  {analytics.popular_treatments.slice(0, 5).map((service: any, i: number) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center text-sm font-black">
                        <span className="text-foreground truncate w-32">{service.name}</span>
                        <div className="flex flex-col items-end">
                          <span className="text-accent">{service.count} Visits</span>
                          <span className="text-emerald-500 text-[10px]">MYR {Number(service.total_profit).toLocaleString()} Profit</span>
                        </div>
                      </div>
                      <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent transition-all duration-1000 rounded-full"
                          style={{ width: `${(service.count / (analytics.popular_treatments[0]?.count || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {analytics.popular_treatments.length === 0 && <p className="text-center py-20 text-muted-foreground font-bold">No sessions logged.</p>}
                </div>
              </Card>
            </div>

            {/* Customer Activity Logs */}
            <Card className="border-none shadow-sm bg-card rounded-[2.5rem] p-8">
              <div className="flex items-center gap-3 mb-8">
                <Activity className="w-6 h-6 text-accent" />
                <h3 className="text-2xl font-black text-foreground tracking-tight">Activity Stream</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.recent_activity.map((activity: any, i: number) => (
                  <div key={i} className="p-5 rounded-3xl bg-muted/30 border border-transparent hover:border-border transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-card shadow-sm flex items-center justify-center text-foreground font-black text-xs">
                        {activity.full_name?.[0] || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-foreground truncate uppercase text-[11px] tracking-widest">{activity.full_name}</p>
                        <p className="text-xs font-bold text-muted-foreground mt-0.5 truncate">{activity.service_name}</p>
                      </div>
                      <Badge className={`rounded-lg font-black text-[9px] uppercase ${activity.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                        }`}>
                        {activity.status}
                      </Badge>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-[10px] font-black text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {format(new Date(activity.booking_date), "MMM dd")}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {format(new Date(activity.created_at), "h:mm a")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* New vs Existing Pie Chart */}
              <Card className="border-none shadow-sm bg-card rounded-[2.5rem] p-8">
                <div className="mb-8">
                  <h3 className="text-2xl font-black text-foreground tracking-tight leading-none">Retention Ratio</h3>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">New vs Existing Client Base</p>
                </div>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.customer_ratio}
                        dataKey="customer_count"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={120}
                        paddingAngle={8}
                        stroke="none"
                      >
                        {analytics.customer_ratio.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: '20px', border: 'none', background: '#b07d62', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Service Distribution */}
              <Card className="border-none shadow-sm bg-card rounded-[2.5rem] p-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <PieIcon className="w-64 h-64" />
                </div>
                <h3 className="text-2xl font-black text-foreground tracking-tight leading-none mb-8">Profit Sources</h3>
                <div className="space-y-6 relative z-10">
                  {analytics.popular_treatments.map((service: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 transition-all hover:scale-[1.02]">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <p className="font-black text-foreground">{service.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-foreground">MYR {Number(service.total_earned).toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Contribution</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveDashboardLayout>
  );
}
