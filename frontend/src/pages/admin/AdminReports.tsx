import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Building2,
  Users,
  Download,
  Activity,
  Zap,
  Banknote,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminLayout } from "@/components/admin/AdminLayout";
import api from "@/services/api";
import { format, subDays, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { formatCompactNumber } from "@/lib/utils";
import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/exportUtils";
import { Badge } from "@/components/ui/badge";
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
  ComposedChart,
  Line,
} from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30");
  const [reportData, setReportData] = useState<any>(null);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const data = await api.admin.getReports(dateRange);
      setReportData(data);
    } catch (error) {
      console.error('Local report sync failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  if (loading || !reportData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <Activity className="w-12 h-12 text-accent animate-pulse" />
        </div>
      </AdminLayout>
    );
  }

  // Process Chart Data based on dateRange
  const chartData = (() => {
    const rawData = reportData.revenue_history || [];
    const end = new Date();
    const rangeDays = parseInt(dateRange) || 30;
    const start = subDays(end, rangeDays);
    const days = eachDayOfInterval({ start, end });

    const filledData = days.map(day => {
      const found = rawData.find((item: any) => isSameDay(parseISO(item.date), day));
      return {
        date: format(day, 'MMM dd'),
        originalDate: format(day, 'yyyy-MM-dd'),
        value: found ? Number(found.value) : 0,
        profit: found ? Number(found.profit) : 0
      };
    });

    return [{ date: '', value: 0, profit: 0 }, ...filledData];
  })();

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent/20 blur-[120px] rounded-full" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 text-accent">
                <BarChart3 className="h-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight">Intelligence</h1>
                <p className="text-white font-bold uppercase tracking-widest text-[10px] mt-2">Aggregated Local Performance Data</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-48 bg-white/10 border-white/10 text-white font-bold h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 168 Hours</SelectItem>
                  <SelectItem value="30">Lunar Cycle (30d)</SelectItem>
                  <SelectItem value="90">Quarterly View</SelectItem>
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-accent text-white font-black rounded-xl h-12 px-8 shadow-lg shadow-accent/20">
                    <Download className="w-4 h-4 mr-2" /> REPORTS & EXPORT
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white">
                  <DropdownMenuItem onClick={() => exportToExcel(reportData.revenue_history || [], 'platform_revenue.csv')}>Excel</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToCSV(reportData.revenue_history || [], 'platform_revenue.csv')}>CSV</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportToPDF()}>PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[
            { label: "Gross Intake", value: reportData.total_revenue ?? 0, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
            { label: "Net Profit", value: reportData.total_profit ?? 0, icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Plan Sales", value: reportData.plan_revenue ?? 0, icon: Zap, color: "text-indigo-500", bg: "bg-indigo-50" },
            { label: "Bookings", value: reportData.total_bookings ?? 0, icon: Calendar, color: "text-amber-500", bg: "bg-amber-50" },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm bg-white rounded-3xl p-6 group hover:shadow-xl transition-all">
              <div className="flex flex-col items-center text-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">{stat.label}</p>
                  <p className="text-xl font-black text-slate-900 mt-2">
                    {stat.label.includes("Intake") || stat.label.includes("Sales") || stat.label.includes("Profit") ? `MYR ${formatCompactNumber(stat.value)}` : formatCompactNumber(stat.value)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-2xl bg-slate-900 rounded-[2.5rem] overflow-hidden relative">
            {/* Background Gradient Effect */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="flex flex-row items-center justify-between pb-2 relative z-10 p-8">
              <div>
                <h3 className="text-2xl font-black text-white">Revenue Projections</h3>
                <p className="text-slate-400 font-medium mt-1">Revenue trend over time</p>
              </div>
              <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/20 font-bold px-4 py-1.5 rounded-xl">Local Host</Badge>
            </div>
            <div className="h-[400px] mt-4 relative z-10 px-8 pb-8">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}
                  margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <defs>
                    <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontWeight: 600, fontSize: 12 }}
                    dy={15}
                    interval={dateRange === '90' ? 6 : dateRange === '30' ? 4 : 0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontWeight: 600, fontSize: 12 }}
                    tickFormatter={(value) => `MYR ${formatCompactNumber(value)}`}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '16px',
                      border: '1px solid #1e293b',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
                      padding: '12px'
                    }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 600, marginBottom: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}
                    formatter={(value: number, name: string) => [
                      `MYR ${formatCompactNumber(value)}`,
                      name === 'value' ? 'Gross Revenue' : 'Net Profit'
                    ]}
                  />
                  <Area type="monotone" dataKey="value" stroke="none" fill="url(#cyanGradient)" fillOpacity={0.4} />
                  <Area type="monotone" dataKey="profit" stroke="none" fill="url(#emeraldGradient)" fillOpacity={0.4} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Revenue"
                    stroke="#06b6d4"
                    strokeWidth={4}
                    dot={{ r: 4, strokeWidth: 2, fill: '#0f172a', stroke: '#06b6d4' }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    name="Profit"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 3, strokeWidth: 2, fill: '#0f172a', stroke: '#10b981' }}
                    activeDot={{ r: 5, strokeWidth: 0, fill: '#fff' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="border-none shadow-sm bg-white rounded-[2.5rem] p-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">Market Share</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 mb-8">Saloon Distribution</p>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={reportData.top_salons || []} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={8}>
                    {(reportData.top_salons || []).map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#b07d62',
                      borderRadius: '12px',
                      border: '1px solid #1e293b',
                      color: '#fff'
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

          </Card>


        </div>
      </div>
    </AdminLayout>
  );
}
