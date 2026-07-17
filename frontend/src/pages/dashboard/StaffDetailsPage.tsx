import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Loader2,
    Briefcase,
    Calendar,
    Clock,
    DollarSign,
    Users,
    ChevronRight,
    ArrowRightLeft,
    PieChart,
    Plus,
    User,
    Mail,
    Phone,
    MapPin,
    ArrowLeft,
    Eye,
    EyeOff,
    Trash2,
    Check,
    X,
    Info
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, getDaysInMonth } from "date-fns";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useSalon } from "@/hooks/useSalon";
import { StaffMember } from "@/types/staff";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveDashboardLayout } from "@/components/dashboard/ResponsiveDashboardLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

export default function StaffDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isOwner } = useSalon();

    const [staff, setStaff] = useState<StaffMember | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [recentCustomers, setRecentCustomers] = useState<any[]>([]);
    const [leaves, setLeaves] = useState<any[]>([]);
    const [dailyRevenue, setDailyRevenue] = useState<any[]>([]);
    const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editForm, setEditForm] = useState({
        display_name: "",
        email: "",
        phone: "",
        commission_percentage: 0,
        role: "staff" as any,
        is_active: true,
        password: "",
        assigned_services: [] as string[]
    });
    const [allServices, setAllServices] = useState<any[]>([]);
    const [showPassword, setShowPassword] = useState(false);

    const [selectedLeave, setSelectedLeave] = useState<any>(null);
    const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
    const [isStatusUpdating, setIsStatusUpdating] = useState(false);

    const fetchProfileData = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const staffMember = await api.staff.getById(id);

            if (!staffMember) {
                toast({
                    title: "Error",
                    description: "Staff member not found.",
                    variant: "destructive",
                });
                navigate("/salon/staff");
                return;
            }
            setStaff(staffMember);

            const month = selectedDate.getMonth() + 1;
            const year = selectedDate.getFullYear();

            const statsRes = await api.staff.getProfileStats(id, month, year);
            const leavesRes = await api.staff.getLeaves(id);

            setStats(statsRes.stats);
            setRecentCustomers(statsRes.recent_customers || []);
            setDailyRevenue(statsRes.daily_revenue || []);
            setAttendanceLogs(statsRes.attendance_logs || []);
            setLeaves(leavesRes);

            // Fetch all salon services
            const salonServices = await api.services.getBySalon(staffMember.salon_id);
            setAllServices(salonServices);
        } catch (error: any) {
            console.error("Staff Profile Sync Error:", error);
            toast({
                title: "Data Sync Failed",
                description: error.message || "Could not retrieve comprehensive profile records.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [id, selectedDate, toast, navigate]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const getLeaveBadgeColor = (status: string) => {
        switch (status) {
            case 'approved': return 'border-emerald-500 !text-emerald-900 bg-emerald-50/50';
            case 'rejected': return 'border-rose-500 !text-rose-900 bg-rose-50/50';
            default: return 'border-amber-500 !text-amber-900 bg-amber-50/50';
        }
    };

    const handleEditClick = () => {
        if (!staff) return;
        setEditForm({
            display_name: staff.display_name,
            email: staff.email || "",
            phone: staff.phone || "",
            commission_percentage: staff.commission_percentage || 0,
            role: staff.role || "staff",
            is_active: staff.is_active,
            password: "",
            assigned_services: staff.assigned_services || []
        });
        setIsEditDialogOpen(true);
    };

    const handleLeaveStatusUpdate = async (leaveId: string, status: string) => {
        setIsStatusUpdating(true);
        try {
            await api.staff.updateLeaveStatus(leaveId, status);
            toast({
                title: "Status Synchronized",
                description: `The absence request has been marked as ${status}.`
            });
            fetchProfileData();
        } catch (error: any) {
            toast({
                title: "Sync Failed",
                description: error.message || "Failed to update leave status.",
                variant: "destructive"
            });
        } finally {
            setIsStatusUpdating(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        setIsUpdating(true);
        try {
            await api.staff.update(id, editForm);

            // Sync services separately
            await api.staff.syncServices(id, editForm.assigned_services);

            toast({
                title: "Profile Synchronized",
                description: "The staff record and service assignments have been updated."
            });
            setIsEditDialogOpen(false);
            fetchProfileData();
        } catch (error: any) {
            toast({
                title: "Update Failed",
                description: error.message || "Failed to sync staff records.",
                variant: "destructive"
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        try {
            await api.staff.delete(id);
            toast({
                title: "Profile Terminated",
                description: "The staff record has been permanently removed from the registry."
            });
            navigate("/salon/staff");
        } catch (error: any) {
            toast({
                title: "Deletion Failed",
                description: error.message || "Could not delete staff record.",
                variant: "destructive"
            });
        }
    };

    if (loading && !staff) {
        return (
            <ResponsiveDashboardLayout showBackButton={true}>
                <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-[#55402f]" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Staff Profile Dossier...</p>
                </div>
            </ResponsiveDashboardLayout>
        );
    }

    if (!staff) return null;

    return (
        <ResponsiveDashboardLayout
            showBackButton={true}
        >
            <div className="min-h-screen bg-transparent pb-20">
                {/* Header Profile Section */}
                <div className="bg-slate-900/50 backdrop-blur-md border-b border-white/5">
                    <div className="max-w-[1400px] mx-auto px-6 py-12">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative"
                            >
                                <Avatar className="w-32 h-32 border-4 border-card shadow-2xl ring-1 ring-border/50">
                                    <AvatarImage src={staff.avatar_url || ""} />
                                    <AvatarFallback className="bg-gradient-to-br from-accent to-accent/80 text-white text-4xl font-black">
                                        {staff.display_name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                {staff.is_active && (
                                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 border-4 border-background rounded-full shadow-lg animate-pulse" />
                                )}
                            </motion.div>

                            <div className="flex-1 space-y-4">
                                <div className="flex flex-wrap items-center gap-4">
                                    <h1 className="text-4xl font-black text-foreground tracking-tight">{staff.display_name}</h1>
                                    <Badge variant="outline" className="rounded-full bg-muted/20 border-border/50 text-accent font-black text-[10px] uppercase tracking-widest px-4 py-1">
                                        {staff.role?.replace('_', ' ')}
                                    </Badge>
                                    <Badge className={cn(
                                        "rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-none",
                                        staff.is_active ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-muted text-muted-foreground/60"
                                    )}>
                                        {staff.is_active ? "Active Duty" : "Offline"}
                                    </Badge>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="w-4 h-4 text-accent" />
                                        <span className="text-sm font-bold">{staff.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="w-4 h-4 text-accent" />
                                        <span className="text-sm font-bold">{staff.phone || "(Not Provided)"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Briefcase className="w-4 h-4 text-accent" />
                                        <span className="text-sm font-bold">{staff.commission_percentage}% Commission Rate</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="w-4 h-4 text-accent" />
                                        <span className="text-sm font-bold">Joined {format(new Date(staff.created_at || new Date()), "MMM yyyy")}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex lg:flex-col gap-3">
                                {!isOwner && (
                                    <Button className="h-12 px-8 bg-[#55402f] hover:bg-[#433225] text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-[#55402f]/20 transition-all active:scale-95">
                                        Message Staff
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={handleEditClick}
                                    className="h-12 px-8 border-border/50 text-muted-foreground font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-muted/50 transition-all active:scale-95"
                                >
                                    Edit Profile
                                </Button>

                                {isOwner && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="h-12 px-8 border-rose-500/20 text-rose-500 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-rose-500/10 hover:text-rose-400 transition-all active:scale-95"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete Profile
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="rounded-3xl border border-border/50 shadow-2xl bg-card">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="text-2xl font-black tracking-tight text-foreground">Final Confirmation Required</AlertDialogTitle>
                                                <AlertDialogDescription className="text-muted-foreground/60 font-medium">
                                                    You are about to permanently delete <span className="font-bold text-foreground">{staff.display_name}</span> from the salon. This action will purge all associated profile records and cannot be reversed.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter className="gap-2">
                                                <AlertDialogCancel className="rounded-xl font-bold border-border/50 text-muted-foreground/60">Cancel & Retain</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={handleDelete}
                                                    className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black border-none"
                                                >
                                                    Confirm Deletion
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="max-w-[1400px] mx-auto px-6 mt-8">
                    <Tabs defaultValue="overview" className="space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border/5 bg-card/40 p-2 rounded-2xl shadow-sm backdrop-blur-md gap-4">
                            <TabsList className="bg-transparent h-12 gap-2">
                                {[
                                    { value: 'overview', label: 'Dashboard', icon: PieChart },
                                    { value: 'earnings', label: 'Financials', icon: DollarSign },
                                    { value: 'attendance', label: 'Time Logs', icon: Clock },
                                    { value: 'leaves', label: 'Absences', icon: Calendar },
                                    { value: 'customers', label: 'Clients', icon: Users },
                                ].filter(tab => !isOwner || tab.value !== 'earnings').map(tab => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 data-[state=active]:bg-background data-[state=active]:text-foreground transition-all"
                                    >
                                        <tab.icon className="w-3.5 h-3.5 mr-2" />
                                        {tab.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            <div className="px-4 flex items-center gap-3">
                                <div className="flex bg-muted/20 p-1 rounded-xl items-center border border-border/50">
                                    <button
                                        onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}
                                        className="p-1 px-3 hover:bg-muted rounded-lg transition-all text-accent"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                    </button>
                                    <span className="px-4 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground min-w-[120px] text-center">
                                        {format(selectedDate, "MMMM yyyy")}
                                    </span>
                                    <button
                                        onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
                                        className="p-1 px-3 hover:bg-muted rounded-lg transition-all text-accent"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="min-h-[500px]">
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col items-center justify-center py-20 space-y-4"
                                    >
                                        <Loader2 className="w-8 h-8 animate-spin text-accent" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Updating Visuals...</p>
                                    </motion.div>
                                ) : (
                                    <>
                                        <TabsContent value="overview" className="m-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                            {/* Quick Stats Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                {[
                                                    { label: 'Clients Handled', value: stats?.customers || 0, icon: Users, color: 'bg-blue-500', trend: '+12%' },
                                                    { label: 'Force Output (Hrs)', value: `${stats?.total_hours || 0}h`, icon: Clock, color: 'bg-[#55402f]', trend: '+5h' },
                                                    { label: 'Remaining Leaves', value: stats?.leave_days || 0, icon: Calendar, color: 'bg-rose-500', trend: 'Healthy' },
                                                ].map((stat, i) => (
                                                    <Card key={i} className="rounded-3xl border border-border/50 shadow-sm bg-card overflow-hidden group hover:shadow-xl transition-all duration-300">
                                                        <CardContent className="p-8">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", stat.color)}>
                                                                    <stat.icon className="w-6 h-6" />
                                                                </div>
                                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{stat.trend}</span>
                                                            </div>
                                                            <h3 className="text-3xl font-black text-foreground">{stat.value}</h3>
                                                            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mt-1">{stat.label}</p>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                                {/* Conditionally render Earnings Card for Non-Owners or if required */}
                                                {!isOwner && (
                                                    <Card className="rounded-3xl border border-border/50 shadow-sm bg-card overflow-hidden group hover:shadow-xl transition-all duration-300">
                                                        <CardContent className="p-8">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg bg-emerald-500">
                                                                    <DollarSign className="w-6 h-6" />
                                                                </div>
                                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">+18%</span>
                                                            </div>
                                                            <h3 className="text-3xl font-black text-foreground">MYR {stats?.earnings?.toLocaleString() || 0}</h3>
                                                            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mt-1">Settled Earnings</p>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                                {/* Revenue Distribution Chart (Mock) */}
                                                <Card className="rounded-[2.5rem] border border-border/50 shadow-sm bg-card lg:col-span-2">
                                                    <CardHeader className="p-10 pb-4">
                                                        <CardTitle className="text-sm font-black uppercase tracking-widest text-accent">Revenue Performance</CardTitle>
                                                        <CardDescription className="text-xs font-bold text-muted-foreground/60">Daily business impact throughout the current deployment.</CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="p-10 pt-4">
                                                        <div className="h-64 flex items-end gap-2 pt-8 pb-4 border-b border-white/5">
                                                            {Array.from({ length: getDaysInMonth(selectedDate) }, (_, i) => {
                                                                const day = i + 1;
                                                                const revenueData = dailyRevenue.find(d => Number(d.day) === day);
                                                                const h = revenueData ? Math.min(100, (Number(revenueData.daily_revenue) / (Math.max(...dailyRevenue.map(d => Number(d.daily_revenue)), 1) || 1)) * 100) : 0;
                                                                return (
                                                                    <div key={i} className="flex-1 group relative">
                                                                        <motion.div
                                                                            initial={{ height: 0 }}
                                                                            animate={{ height: `${h || 2}%` }}
                                                                            transition={{ delay: i * 0.01, duration: 0.5 }}
                                                                            className={cn(
                                                                                "w-full rounded-t-lg transition-all cursor-pointer relative",
                                                                                h > 0 ? "bg-accent shadow-[0_0_15px_rgba(242,169,59,0.3)] hover:scale-x-110" : "bg-muted/10 hover:bg-muted/20"
                                                                            )}
                                                                        />
                                                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-white text-[8px] font-black px-2 py-1 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 whitespace-nowrap z-20 pointer-events-none">
                                                                            {h > 0 ? `MYR ${Number(revenueData?.daily_revenue).toLocaleString()}` : 'No Output'}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        <div className="flex justify-between mt-4">
                                                            <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">Phase Alpha</span>
                                                            <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">Mid Term</span>
                                                            <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">Phase Omega</span>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {/* Skill Specializations */}
                                                <Card className="rounded-[2.5rem] border border-border/50 shadow-sm bg-card">
                                                    <CardHeader className="p-10 pb-4">
                                                        <CardTitle className="text-sm font-black uppercase tracking-widest text-accent">Specializations</CardTitle>
                                                        <CardDescription className="text-xs font-bold text-muted-foreground/60">Primary operational skillsets.</CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="p-10 pt-4 space-y-6">
                                                        {['Hair Sculpting', 'Color Dynamics', 'Scalp Therapy', 'Bridal Styling'].map((skill, i) => (
                                                            <div key={skill} className="space-y-2">
                                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                                    <span className="text-foreground/80">{skill}</span>
                                                                    <span className="text-accent">{95 - i * 8}%</span>
                                                                </div>
                                                                <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${95 - i * 8}%` }}
                                                                        className="h-full bg-accent rounded-full"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-foreground mt-4 hover:bg-muted/50 transition-all">
                                                            View Full Skills Registry
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </TabsContent>

                                        {!isOwner && (
                                            <TabsContent value="earnings" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                                    <div className="lg:col-span-1 space-y-6">
                                                        <Card className="rounded-[2.5rem] bg-slate-900 text-white overflow-hidden relative border-none shadow-2xl">
                                                            <div className="absolute top-0 right-0 w-64 h-64 bg-[#55402f]/20 blur-[100px] rounded-full" />
                                                            <CardContent className="p-10 relative z-10 space-y-6">
                                                                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                                                                    <DollarSign className="w-7 h-7 text-[#55402f]" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#55402f] mb-2">Net Allocation</p>
                                                                    <h4 className="text-4xl font-black">MYR {stats?.earnings?.toLocaleString() || 0}</h4>
                                                                </div>
                                                                <div className="pt-6 border-t border-white/10 space-y-4">
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Base Rate</span>
                                                                        <span className="text-xs font-black">MYR 2,400.00</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Commission {staff.commission_percentage}%</span>
                                                                        <span className="text-xs font-black text-emerald-400">+MYR {stats?.earnings?.toLocaleString()}</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">Tax Provision</span>
                                                                        <span className="text-xs font-black text-rose-400">-MYR 240.00</span>
                                                                    </div>
                                                                </div>
                                                                <Button className="w-full h-14 bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all mt-6 shadow-xl shadow-white/5 uppercase">
                                                                    Export Settlement
                                                                </Button>
                                                            </CardContent>
                                                        </Card>

                                                        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
                                                            <CardHeader className="p-10 pb-4">
                                                                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-[#55402f]">Payout Strategy</CardTitle>
                                                            </CardHeader>
                                                            <CardContent className="p-10 pt-4 space-y-4">
                                                                <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
                                                                        <DollarSign className="w-5 h-5 text-emerald-500" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[9px] font-black text-muted-foreground/60 uppercase">Method</p>
                                                                        <p className="text-[11px] font-black text-foreground">Direct Deposit</p>
                                                                    </div>
                                                                </div>
                                                                <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
                                                                        <Calendar className="w-5 h-5 text-muted-foreground/60" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[9px] font-black text-muted-foreground/60 uppercase">Next Date</p>
                                                                        <p className="text-[11px] font-black text-foreground">Feb 1, 2026</p>
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </div>

                                                    <div className="lg:col-span-3">
                                                        <Card className="rounded-[2.5rem] border-none shadow-sm bg-card overflow-hidden">
                                                            <div className="p-10 flex items-center justify-between border-b border-border/5">
                                                                <div>
                                                                    <h4 className="text-lg font-black text-foreground uppercase tracking-tight">Settlement Ledger</h4>
                                                                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">Detailed service rewards for {format(selectedDate, "MMM yyyy")}</p>
                                                                </div>
                                                                <Button variant="ghost" className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:bg-muted/50 transition-all">
                                                                    Filter by Service
                                                                </Button>
                                                            </div>
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow className="bg-muted/20 hover:bg-muted/30 border-none">
                                                                        <TableHead className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Operation / Client</TableHead>
                                                                        <TableHead className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Resource Revenue</TableHead>
                                                                        <TableHead className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Commission Share</TableHead>
                                                                        <TableHead className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Settlement</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {recentCustomers.map((log, i) => (
                                                                        <TableRow key={i} className="border-b border-border/5 hover:bg-muted/10 transition-colors">
                                                                            <TableCell className="px-10 py-6">
                                                                                <span className="font-black text-foreground uppercase text-[11px]">{log.service_name}</span>
                                                                                <p className="text-[10px] font-bold text-muted-foreground/60 mt-1 uppercase tracking-tighter">{log.full_name || "Unknown Identity"} • {format(new Date(log.booking_date), "MMM dd")}</p>
                                                                            </TableCell>
                                                                            <TableCell className="px-6 py-6 font-bold text-foreground">MYR {log.effective_price}</TableCell>
                                                                            <TableCell className="px-6 py-6 font-bold text-muted-foreground/60">{staff.commission_percentage}%</TableCell>
                                                                            <TableCell className="px-10 py-6 text-right font-black text-emerald-500">
                                                                                +MYR {(log.effective_price * (staff.commission_percentage / 100)).toFixed(2)}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                            <div className="p-10 bg-muted/20 border-t border-border/5 flex items-center justify-between">
                                                                <div className="flex items-center gap-8">
                                                                    <div>
                                                                        <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1">Total Payout</p>
                                                                        <p className="text-3xl font-black text-foreground tracking-tight">MYR {stats?.earnings?.toLocaleString() || 0}</p>
                                                                    </div>
                                                                    <div className="w-px h-12 bg-border/50" />
                                                                    <div>
                                                                        <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1">Status</p>
                                                                        <Badge className="bg-emerald-500 text-white border-none rounded-lg px-4 font-black text-[10px] uppercase tracking-widest">Calculated</Badge>
                                                                    </div>
                                                                </div>
                                                                <Button className="h-14 px-10 bg-accent hover:bg-accent/90 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-accent/20 transition-all active:scale-95">Initiate Payout</Button>
                                                            </div>
                                                        </Card>
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        )}

                                        <TabsContent value="attendance" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                                <div className="lg:col-span-1 space-y-8">
                                                    <Card className="rounded-[2.5rem] bg-card overflow-hidden shadow-sm border border-border/50">
                                                        <CardHeader className="p-10 pb-4">
                                                            <CardTitle className="text-sm font-black uppercase tracking-widest text-accent">Work Integrity</CardTitle>
                                                            <CardDescription className="text-xs font-bold text-muted-foreground/60">Efficiency and punctuality metrics.</CardDescription>
                                                        </CardHeader>
                                                        <CardContent className="p-10 pt-4 space-y-8">
                                                            <div className="space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Punctuality Score</span>
                                                                    <span className="text-xs font-black text-emerald-500">92%</span>
                                                                </div>
                                                                <div className="h-2.5 w-full bg-muted/20 rounded-full overflow-hidden shadow-inner">
                                                                    <motion.div
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: '92%' }}
                                                                        className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="p-6 rounded-[2rem] bg-muted/20 border border-border/50 text-center">
                                                                    <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest mb-2">Days Present</p>
                                                                    <p className="text-2xl font-black text-foreground">{stats?.days_worked || 0}</p>
                                                                </div>
                                                                <div className="p-6 rounded-[2rem] bg-muted/20 border border-border/50 text-center">
                                                                    <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest mb-2">Total Output</p>
                                                                    <p className="text-2xl font-black text-foreground">{stats?.total_hours || 0}h</p>
                                                                </div>
                                                            </div>

                                                            <div className="pt-6 border-t border-border/5 space-y-4">
                                                                {[
                                                                    { label: 'Avg Check-In', val: '08:52 AM', color: 'text-emerald-500' },
                                                                    { label: 'Avg Check-Out', val: '06:14 PM', color: 'text-accent' },
                                                                    { label: 'Break Utilization', val: '45 Mins', color: 'text-muted-foreground/60' },
                                                                ].map(item => (
                                                                    <div key={item.label} className="flex justify-between items-center">
                                                                        <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">{item.label}</span>
                                                                        <span className={cn("text-xs font-black", item.color)}>{item.val}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>

                                                <div className="lg:col-span-2">
                                                    <Card className="rounded-[2.5rem] bg-card border border-border/50 shadow-sm overflow-hidden h-full">
                                                        <div className="p-10 border-b border-border/5 flex items-center justify-between">
                                                            <h5 className="text-sm font-black uppercase tracking-widest text-accent">Deployment Matrix (Monthly View)</h5>
                                                            <Badge variant="outline" className="text-[8px] font-black text-accent border-accent/20 uppercase px-3 py-1">Shift Type: Fixed 9-6</Badge>
                                                        </div>
                                                        <div className="p-10 overflow-x-auto">
                                                            <div className="grid grid-cols-7 gap-4 min-w-[700px]">
                                                                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                                                                    <div key={day} className="text-center text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest pb-4">{day}</div>
                                                                ))}
                                                                {Array.from({ length: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate() }, (_, i) => i + 1).map(day => {
                                                                    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                                                    const logs = attendanceLogs.filter(log => log.date === dateStr);
                                                                    const isActive = logs.length > 0;
                                                                    const isWeekend = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day).getDay() === 0 ||
                                                                        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day).getDay() === 6;

                                                                    return (
                                                                        <div key={day} className={cn(
                                                                            "aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all group cursor-pointer relative shadow-sm",
                                                                            isWeekend ? "bg-muted/20 border-border/50" : "bg-background border-border/50 hover:border-accent",
                                                                            isActive && "border-accent bg-accent/5 ring-1 ring-accent/10"
                                                                        )}>
                                                                            <span className={cn("text-xs font-black", isActive ? "text-accent" : "text-muted-foreground/60")}>{day}</span>
                                                                            {isActive && (
                                                                                <div className="flex gap-1">
                                                                                    {logs.map((_, idx) => (
                                                                                        <div key={idx} className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </Card>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="leaves" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                            <div className="flex items-center justify-between mb-8">
                                                <div>
                                                    <h4 className="text-2xl font-black text-foreground tracking-tight uppercase">Absence Dossier</h4>
                                                    <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">Registry of time-off allocations and pending requests.</p>
                                                </div>
                                            </div>

                                            <motion.div
                                                initial="hidden"
                                                animate="visible"
                                                variants={{
                                                    hidden: { opacity: 0 },
                                                    visible: {
                                                        opacity: 1,
                                                        transition: { staggerChildren: 0.1 }
                                                    }
                                                }}
                                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                                            >
                                                {leaves.map((leave, i) => (
                                                    <motion.div
                                                        key={leave.id || i}
                                                        variants={{
                                                            hidden: { opacity: 0, y: 20 },
                                                            visible: { opacity: 1, y: 0 }
                                                        }}
                                                    >
                                                        <Card className="rounded-[2.5rem] border border-border/50 shadow-sm bg-card overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative">
                                                            <div className={cn(
                                                                "absolute top-0 left-0 w-full h-1.5 transition-all duration-500",
                                                                leave.status === 'approved' ? 'bg-emerald-500' :
                                                                    leave.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'
                                                            )} />
                                                            <CardHeader className="p-8 pb-4 relative">
                                                                <div className="absolute top-8 right-8">
                                                                    <Badge className={cn("rounded-xl border-none text-[8px] font-black uppercase tracking-widest px-3 py-1.5 shadow-lg", getLeaveBadgeColor(leave.status))}>
                                                                        {leave.status}
                                                                    </Badge>
                                                                </div>
                                                                <div className="w-12 h-12 rounded-2xl bg-muted/20 flex items-center justify-center text-accent mb-4 border border-border/50">
                                                                    <Calendar className="w-6 h-6" />
                                                                </div>
                                                                <CardTitle className="text-sm font-black text-foreground uppercase tracking-widest">
                                                                    {leave.leave_type.replace('_', ' ')}
                                                                </CardTitle>
                                                                <CardDescription className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{format(new Date(leave.created_at || new Date()), "MMM dd, yyyy")}</CardDescription>
                                                            </CardHeader>
                                                            <CardContent className="p-8 pt-4 space-y-6">
                                                                <div className="p-6 rounded-2xl bg-muted/10 border border-border/5 space-y-4">
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-[9px] font-black text-muted-foreground/40 uppercase">Departure</span>
                                                                        <span className="text-[11px] font-black text-foreground">{format(new Date(leave.start_date), "MMM dd, yyyy")}</span>
                                                                    </div>
                                                                    <div className="h-px bg-border/10" />
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="text-[9px] font-black text-muted-foreground/40 uppercase">Return</span>
                                                                        <span className="text-[11px] font-black text-foreground">{format(new Date(leave.end_date), "MMM dd, yyyy")}</span>
                                                                    </div>
                                                                </div>

                                                                <div className="flex gap-2">
                                                                    {isOwner && leave.status === 'pending' && (
                                                                        <Button
                                                                            onClick={() => handleLeaveStatusUpdate(leave.id, 'approved')}
                                                                            variant="ghost"
                                                                            className="h-14 flex-1 rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                                                                        >
                                                                            <Check className="w-4 h-4 mr-2" /> Approve
                                                                        </Button>
                                                                    )}
                                                                    {isOwner && leave.status === 'pending' && (
                                                                        <Button
                                                                            onClick={() => handleLeaveStatusUpdate(leave.id, 'rejected')}
                                                                            variant="ghost"
                                                                            className="h-14 flex-1 rounded-2xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                                                                        >
                                                                            <X className="w-4 h-4 mr-2" /> Revoke
                                                                        </Button>
                                                                    )}

                                                                    <Button
                                                                        onClick={() => {
                                                                            setSelectedLeave(leave);
                                                                            setIsDetailsDialogOpen(true);
                                                                        }}
                                                                        variant="ghost"
                                                                        className="h-14 flex-1 rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 border border-transparent hover:border-border/50 transition-all"
                                                                    >
                                                                        <Info className="w-4 h-4 mr-2" /> Details
                                                                    </Button>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </motion.div>
                                                ))}

                                                {leaves.length === 0 && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 40 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="col-span-full py-32 text-center space-y-6 rounded-[3rem] border-4 border-dashed border-border/20 bg-card/50 backdrop-blur-sm"
                                                    >
                                                        <div className="w-24 h-24 bg-muted/20 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-accent/5 border border-border/50">
                                                            <Calendar className="w-10 h-10 text-muted-foreground/30" />
                                                        </div>
                                                        <div>
                                                            <h5 className="text-xl font-black text-foreground uppercase tracking-tight">Zero Registry</h5>
                                                            <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mt-2">No absence deployments synchronized for this staff operative.</p>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        </TabsContent>

                                        <TabsContent value="customers" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                            <Card className="rounded-[3rem] border border-border/50 shadow-sm bg-card overflow-hidden">
                                                <div className="p-10 border-b border-border/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                    <div>
                                                        <h4 className="text-2xl font-black text-accent tracking-tight uppercase">Clients Registry</h4>
                                                        <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">Detailed fulfillment history for this specific staff member.</p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                                                            <input
                                                                type="text"
                                                                placeholder="Search Clients..."
                                                                className="h-12 pl-12 pr-6 bg-muted/20 border border-border/50 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 ring-accent/20 transition-all w-64 text-foreground"
                                                            />
                                                        </div>
                                                        <Button className="h-12 px-6 bg-accent/10 text-accent hover:bg-accent/20 rounded-2xl transition-all">
                                                            <Plus className="w-5 h-5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-muted/20 hover:bg-muted/30 border-none">
                                                            <TableHead className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Professional Deployment</TableHead>
                                                            <TableHead className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Operation Profile</TableHead>
                                                            <TableHead className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Fulfillment Status</TableHead>
                                                            <TableHead className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 text-right">Value Earned</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {recentCustomers.map((log, i) => (
                                                            <TableRow key={i} className="border-b border-border/5 hover:bg-muted/10 transition-all group cursor-pointer">
                                                                <TableCell className="px-10 py-8">
                                                                    <div className="flex items-center gap-5">
                                                                        <div className="w-14 h-14 rounded-[1.5rem] bg-accent/20 text-accent flex items-center justify-center font-black text-xl shadow-xl shadow-accent/10 group-hover:scale-105 transition-transform border border-accent/20">
                                                                            {log.full_name?.charAt(0) || "U"}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-black text-foreground uppercase tracking-tight">{log.full_name || "Unknown Identity"}</p>
                                                                            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2 mt-1">
                                                                                <MapPin className="w-3 h-3 text-accent" /> Verified Account
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-10 py-8">
                                                                    <Badge variant="outline" className="rounded-xl border-border/50 text-muted-foreground/80 text-[9px] font-black uppercase tracking-[0.1em] px-4 py-2 bg-muted/20 flex items-center w-fit gap-2">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                                                        {log.service_name}
                                                                    </Badge>
                                                                    <p className="text-[9px] font-bold text-muted-foreground/40 mt-2 uppercase tracking-widest">{format(new Date(log.booking_date), "EEEE, MMM dd, yyyy")}</p>
                                                                </TableCell>
                                                                <TableCell className="px-10 py-8">
                                                                    <div className="space-y-2">
                                                                        <div className="flex justify-between items-center w-24">
                                                                            <span className="text-[8px] font-black text-muted-foreground/30 uppercase">Progress</span>
                                                                            <span className="text-[8px] font-black text-emerald-500 uppercase">100%</span>
                                                                        </div>
                                                                        <div className="h-1 w-24 bg-muted/20 rounded-full overflow-hidden">
                                                                            <div className="h-full bg-emerald-500 w-full" />
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="px-10 py-8 text-right">
                                                                    <p className="text-xl font-black text-foreground tracking-tight">MYR {log.price}</p>
                                                                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-1">Captured</p>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                        {recentCustomers.length === 0 && (
                                                            <TableRow>
                                                                <TableCell colSpan={4} className="h-96 text-center">
                                                                    <div className="flex flex-col items-center justify-center space-y-6 opacity-40 py-20">
                                                                        <div className="w-24 h-24 bg-muted/20 rounded-[2.5rem] flex items-center justify-center shadow-inner border border-border/50">
                                                                            <Users className="w-12 h-12 text-muted-foreground/30" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xl font-black text-foreground uppercase tracking-tight">No Historical Deployments</p>
                                                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-2 text-muted-foreground/60">This staff member hasn't handled any recorded client sessions yet.</p>
                                                                        </div>
                                                                        <Button variant="outline" className="h-12 px-8 border-border/50 rounded-2xl font-black text-[10px] uppercase tracking-widest text-muted-foreground/60">Manual History Entry</Button>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                                <div className="p-8 border-t border-border/5 bg-muted/10 flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">Showing {recentCustomers.length} Operational Records</span>
                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" size="sm" className="w-10 h-10 rounded-xl hover:bg-muted/50 transition-all text-muted-foreground/60"><ChevronRight className="w-4 h-4 rotate-180" /></Button>
                                                        <Button variant="ghost" size="sm" className="w-10 h-10 rounded-xl bg-muted text-foreground font-bold text-xs border border-border/50">1</Button>
                                                        <Button variant="ghost" size="sm" className="w-10 h-10 rounded-xl hover:bg-muted/50 transition-all text-muted-foreground/60"><ChevronRight className="w-4 h-4" /></Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        </TabsContent>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </Tabs>
                </div>
            </div>

            {/* Edit Profile Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-md rounded-[3rem] border border-border/50 shadow-2xl p-10 bg-card">
                    <DialogHeader className="space-y-4">
                        <DialogTitle className="text-3xl font-black text-foreground tracking-tight uppercase">Edit Profile</DialogTitle>
                        <DialogDescription className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest leading-loose">
                            Update the operational parameters for this staff operative.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-6 pt-6">
                        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6 scrollbar-hide">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Full Identity</Label>
                                <Input
                                    value={editForm.display_name}
                                    onChange={e => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                                    className="h-12 bg-muted/20 border-border/50 rounded-2xl font-bold px-5 text-foreground focus:ring-accent/20"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Email Terminal</Label>
                                    <Input
                                        type="email"
                                        value={editForm.email}
                                        onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                        className="h-12 bg-muted/20 border-border/50 rounded-2xl font-bold px-5 text-foreground focus:ring-accent/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Comms (Phone)</Label>
                                    <Input
                                        value={editForm.phone}
                                        onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                        className="h-12 bg-muted/20 border-border/50 rounded-2xl font-bold px-5 text-foreground focus:ring-accent/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Security Access Pass (Password)</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={editForm.password}
                                        onChange={e => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                                        placeholder="Leave blank to keep current"
                                        className="h-12 bg-muted/20 border-border/50 rounded-2xl font-bold px-5 pr-12 text-foreground focus:ring-accent/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Hierarchy Role</Label>
                                    <Select
                                        value={editForm.role}
                                        onValueChange={val => setEditForm(prev => ({ ...prev, role: val }))}
                                    >
                                        <SelectTrigger className="h-12 bg-muted/20 border-border/50 rounded-2xl font-bold px-5 text-foreground">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-border/50 shadow-2xl bg-card">
                                            <SelectItem value="staff">Staff Operative</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Commission Share (%)</Label>
                                    <Input
                                        type="number"
                                        value={editForm.commission_percentage}
                                        onChange={e => setEditForm(prev => ({ ...prev, commission_percentage: Number(e.target.value) }))}
                                        className="h-12 bg-muted/20 border-border/50 rounded-2xl font-bold px-5 text-foreground focus:ring-accent/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-border/10">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-accent ml-1">Assigned Services</Label>
                                <div className="grid grid-cols-1 gap-3 mt-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                                    {allServices.map((service) => (
                                        <div key={service.id} className="flex items-center space-x-3 p-3 rounded-xl bg-muted/20 border border-border/50 hover:border-accent/30 transition-all">
                                            <Checkbox
                                                id={`service-${service.id}`}
                                                checked={editForm.assigned_services.includes(service.id)}
                                                onCheckedChange={(checked) => {
                                                    setEditForm(prev => ({
                                                        ...prev,
                                                        assigned_services: checked
                                                            ? [...prev.assigned_services, service.id]
                                                            : prev.assigned_services.filter(id => id !== service.id)
                                                    }));
                                                }}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <Label
                                                    htmlFor={`service-${service.id}`}
                                                    className="text-[11px] font-black text-foreground/80 uppercase cursor-pointer block truncate"
                                                >
                                                    {service.name}
                                                </Label>
                                                <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest truncate">{service.category || 'General'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-5 bg-muted/20 rounded-[2rem] border border-border/50">
                                <div className="space-y-0.5">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-foreground leading-none">Operational Status</Label>
                                    <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Active deployment toggle</p>
                                </div>
                                <Switch
                                    checked={editForm.is_active}
                                    onCheckedChange={checked => setEditForm(prev => ({ ...prev, is_active: checked }))}
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-6 gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsEditDialogOpen(false)}
                                className="h-14 flex-1 font-black text-[10px] uppercase tracking-widest text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all"
                            >
                                Abort
                            </Button>
                            <Button
                                type="submit"
                                disabled={isUpdating}
                                className="h-14 flex-1 bg-accent hover:bg-accent/90 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-accent/20 transition-all"
                            >
                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Commit Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            {/* Absence Details Dialog */}
            <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                <DialogContent className="max-w-2xl rounded-[3rem] border border-border/50 shadow-2xl p-0 bg-card overflow-hidden">
                    {selectedLeave && (
                        <div className="flex flex-col h-full">
                            <div className="p-10 pb-8 bg-muted/10 relative h-48 flex items-end">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-3xl rounded-full -mr-20 -mt-20" />
                                <div className="absolute top-8 right-8">
                                    <div className="w-14 h-14 rounded-2xl bg-background/50 backdrop-blur-xl flex items-center justify-center border border-border/50 shadow-2xl">
                                        <Calendar className="w-7 h-7 text-accent" />
                                    </div>
                                </div>
                                <div className="relative z-10 w-full">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Operational Pause Analysis</span>
                                    </div>
                                    <DialogTitle className="text-4xl font-black text-foreground tracking-tight uppercase">Absence Dossier</DialogTitle>
                                    <DialogDescription className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mt-2">Registry of time-off allocations and node metadata.</DialogDescription>
                                </div>
                            </div>

                            <div className="p-10 space-y-10">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Temporal Window</p>
                                        </div>
                                        <div className="p-8 rounded-[2rem] bg-muted/20 border border-border/50 space-y-6 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
                                            <div className="flex justify-between items-center relative z-10">
                                                <span className="text-[11px] font-black text-muted-foreground/40 uppercase">Departure</span>
                                                <span className="text-sm font-black text-foreground uppercase tracking-tight">{selectedLeave.start_date ? format(new Date(selectedLeave.start_date), "MMM dd, yyyy") : 'N/A'}</span>
                                            </div>
                                            <div className="h-px bg-border/10 relative z-10">
                                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background border border-border/50 flex items-center justify-center shadow-sm">
                                                    <ArrowRightLeft className="w-3 h-3 text-accent" />
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center relative z-10">
                                                <span className="text-[11px] font-black text-muted-foreground/40 uppercase">Return</span>
                                                <span className="text-sm font-black text-foreground uppercase tracking-tight">{selectedLeave.end_date ? format(new Date(selectedLeave.end_date), "MMM dd, yyyy") : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest ml-1">Node Metadata</p>
                                        <div className="p-8 rounded-[2rem] bg-muted/10 border border-border/50 space-y-8 h-full">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[11px] font-black text-muted-foreground/40 uppercase">Type</span>
                                                <Badge variant="outline" className="rounded-xl border-border/50 text-[10px] font-black uppercase text-foreground px-4 py-1.5 bg-background shadow-sm">{selectedLeave.leave_type}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[11px] font-black text-muted-foreground/40 uppercase">Current State</span>
                                                <Badge className={cn("rounded-xl border-none text-[10px] font-black uppercase px-4 py-1.5 shadow-sm", getLeaveBadgeColor(selectedLeave.status))}>{selectedLeave.status}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest ml-1">Reason Narrative</p>
                                    <div className="p-10 rounded-[2.5rem] bg-muted/20 text-foreground min-h-32 text-sm font-bold leading-relaxed shadow-3xl shadow-accent/5 italic relative overflow-hidden flex items-center group border border-border/50">
                                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-accent/5 blur-3xl rounded-full -mb-24 -mr-24 group-hover:bg-accent/10 transition-colors duration-500" />
                                        <div className="absolute left-0 top-0 w-1.5 h-full bg-accent opacity-50 group-hover:opacity-100 transition-opacity" />
                                        <span className="relative z-10 pl-4 block text-muted-foreground">
                                            "{selectedLeave.reason || "The operative has not provided a specific narrative for this deployment lock-off."}"
                                        </span>
                                    </div>
                                </div>

                                <DialogFooter className="pt-4 gap-4">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsDetailsDialogOpen(false)}
                                        className="h-16 flex-1 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all border border-border/50"
                                    >
                                        Close Dossier
                                    </Button>
                                    {isOwner && selectedLeave.status === 'pending' && (
                                        <Button
                                            onClick={() => {
                                                handleLeaveStatusUpdate(selectedLeave.id, 'approved');
                                                setIsDetailsDialogOpen(false);
                                            }}
                                            disabled={isStatusUpdating}
                                            className="h-16 flex-1 bg-accent hover:bg-accent/90 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-[1.5rem] shadow-2xl shadow-accent/20 transition-all hover:scale-[1.02]"
                                        >
                                            Approve Deployment Pause
                                        </Button>
                                    )}
                                </DialogFooter>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </ResponsiveDashboardLayout>
    );
}
