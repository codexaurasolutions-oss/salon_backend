import { useState, useEffect, useCallback } from "react";
import {
    Calendar,
    Clock,
    DollarSign,
    User,
    CheckCircle,
    XCircle,
    Play,
    Square,
    BarChart3,
    CalendarDays,
    Mail,
    MoreVertical,
    ChevronRight,
    TrendingUp,
    AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSalon } from "@/hooks/useSalon";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { format, isToday, parseISO, isAfter, differenceInSeconds } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export function StaffDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { currentSalon, isOwner, loading: salonLoading } = useSalon();
    const { toast } = useToast();

    const [staffInfo, setStaffInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [todayBookings, setTodayBookings] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [clockLoading, setClockLoading] = useState(false);
    const [recordBookingId, setRecordBookingId] = useState<string | null>(null);
    const [treatmentData, setTreatmentData] = useState({
        treatment_details: "",
        products_used: "",
        skin_reaction: "",
        improvement_notes: ""
    });
    const [savingRecord, setSavingRecord] = useState(false);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

    const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);

    const [currentSession, setCurrentSession] = useState<any>(null);
    const [liveDuration, setLiveDuration] = useState("00:00:00");
    const [lastSync, setLastSync] = useState<Date>(new Date());

    const fetchData = useCallback(async () => {
        if (!currentSalon || !user) return;

        try {
            setLoading(true);
            const data = await api.staff.getDashboardData(currentSalon.id);

            if (data) {
                setStaffInfo(data.staff);
                setStats(data.stats);
                setTodayBookings(data.today_bookings || []);
                setUpcomingBookings(data.upcoming_bookings || []);
                setUnreadMessagesCount(data.unread_messages || 0);

                if (data.attendance) {
                    setIsClockedIn(true);
                    setCurrentSession(data.attendance);
                } else {
                    setIsClockedIn(false);
                    setCurrentSession(null);
                }

                // Still fetch full attendance history for the list if needed, 
                // but main dashboard state is now loaded in one go.
                if (data.staff?.id) {
                    const history = await api.staff.getAttendance(data.staff.id);
                    setAttendance(history);
                }

                setLastSync(new Date());
            }
        } catch (error) {
            console.error("Staff dashboard fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, [currentSalon, user]);

    useEffect(() => {
        if (!salonLoading && !currentSalon) {
            setLoading(false);
            return;
        }

        if (currentSalon && user) {
            fetchData();
        }

        // Auto refresh every 30 seconds
        const interval = setInterval(() => {
            if (currentSalon && user) fetchData();
        }, 30000);

        return () => clearInterval(interval);
    }, [fetchData, currentSalon, user, salonLoading]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isClockedIn && currentSession?.check_in) {
            // Function to update timer
            const updateTimer = () => {
                const start = typeof currentSession.check_in === 'string'
                    ? parseISO(currentSession.check_in.replace(' ', 'T'))
                    : new Date(currentSession.check_in);

                const diff = differenceInSeconds(new Date(), start);
                if (diff >= 0) {
                    const h = Math.floor(diff / 3600);
                    const m = Math.floor((diff % 3600) / 60);
                    const s = diff % 60;
                    setLiveDuration(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
                }
            };

            updateTimer(); // Initial call
            interval = setInterval(updateTimer, 1000);
        } else {
            setLiveDuration("00:00:00");
        }
        return () => clearInterval(interval);
    }, [isClockedIn, currentSession]);

    // ... handleClockToggle ...
    const handleClockToggle = async () => {
        if (!currentSalon) return;
        setClockLoading(true);
        try {
            if (isClockedIn) {
                await api.staff.checkOut(currentSalon.id);
                toast({ title: "Clocked Out", description: "Your session has ended successfully." });
                setIsClockedIn(false);
            } else {
                await api.staff.checkIn(currentSalon.id);
                toast({ title: "Clocked In", description: "Your duty cycle has started." });
                setIsClockedIn(true);
            }
            fetchData();
        } catch (error: any) {
            toast({
                title: "Action Failed",
                description: error.message || "Attendance sync failed.",
                variant: "destructive"
            });
            // If we get "Already checked in", we should probably re-fetch to sync state
            if (error.message?.includes("Already checked in")) {
                fetchData();
            }
        } finally {
            setClockLoading(false);
        }
    };

    // ... (rest of functions) ...

    const updateBookingStatus = async (id: string, status: string) => {
        try {
            await api.bookings.updateStatus(id, status, staffInfo?.id);
            toast({ title: "Status Updated", description: `Appointment marked as ${status}.` });
            if (status === 'completed') {
                setRecordBookingId(id);
            }
            fetchData();
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Could not update status.", variant: "destructive" });
        }
    };

    const handleSaveRecord = async () => {
        if (!recordBookingId) return;
        setSavingRecord(true);
        try {
            await api.customerRecords.saveTreatmentRecord({
                booking_id: recordBookingId,
                ...treatmentData
            });
            toast({ title: "Record Saved", description: "Treatment details successfully logged." });
            setRecordBookingId(null);
            setTreatmentData({ treatment_details: "", products_used: "", skin_reaction: "", improvement_notes: "" });
            fetchData();
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Could not save treatment record.", variant: "destructive" });
        } finally {
            setSavingRecord(false);
        }
    };

    if (loading || (!currentSalon && !user)) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <div className="w-10 h-10 border-4 border-[#55402f] border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {loading ? "Restoring Staff Session..." : "authenticating..."}
                </p>
            </div>
        );
    }

    if (!currentSalon) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
                <div className="p-6 bg-orange-50 rounded-full">
                    <AlertCircle className="w-12 h-12 text-[#55402f]" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-black text-slate-900">No Salon Assigned</h2>
                    <p className="text-sm text-slate-500 font-medium max-w-sm">
                        You do not appear to be assigned to any salon workspace.
                        Please contact your administrator.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Welcome & Clock Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-foreground tracking-tight">
                        Hello, {staffInfo?.display_name?.split(' ')?.[0] || 'Staff'} 👋
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                        {isClockedIn && currentSession?.check_in
                            ? `Duty Active • Started ${format(parseISO(currentSession.check_in.replace(' ', 'T')), "h:mm a")}`
                            : "Shift Pending • System Ready"}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Card className={cn(
                        "border-none shadow-xl rounded-2xl p-1 pr-6 flex items-center gap-4 transition-all overflow-hidden relative",
                        isClockedIn ? "bg-emerald-500 text-white" : "bg-card border border-border"
                    )}>
                        {isClockedIn && <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 blur-2xl rounded-full" />}
                        <Button
                            onClick={handleClockToggle}
                            disabled={clockLoading}
                            className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-lg",
                                isClockedIn ? "bg-card text-emerald-500 hover:bg-muted" : "bg-[#55402f] text-white hover:bg-[#433225]"
                            )}
                        >
                            {clockLoading ? (
                                <Clock className="w-5 h-5 animate-spin" />
                            ) : isClockedIn ? (
                                <Square className="w-5 h-5 fill-current" />
                            ) : (
                                <Play className="w-5 h-5 fill-current ml-1" />
                            )}
                        </Button>
                        <div className="flex flex-col">
                            <span className={cn("text-[10px] font-black uppercase tracking-widest", isClockedIn ? "text-white/80" : "text-slate-400")}>
                                {isClockedIn ? "Active Duty" : "Not Clocked In"}
                            </span>
                            <span className="text-sm font-black">
                                {isClockedIn ? liveDuration : "--:--"}
                            </span>
                            {isClockedIn && currentSession?.check_in && (
                                <span className="text-[9px] font-bold text-white/60">
                                    {format(parseISO(currentSession.check_in.replace(' ', 'T')), "h:mm a")}
                                </span>
                            )}
                        </div>
                    </Card>
                </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Today's Mission (Appointments) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Today's Schedule</h3>
                        <Badge className="bg-muted text-muted-foreground border-none font-black text-[10px] uppercase tracking-widest px-3">
                            {todayBookings.length} Missions
                        </Badge>
                    </div>

                    <div className="space-y-4">
                        {todayBookings.length === 0 ? (
                            <div className="p-20 bg-slate-50/50 rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                                <Calendar className="w-12 h-12 text-slate-200 mb-4" />
                                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No deployments assigned today</p>
                            </div>
                        ) : (
                            todayBookings.map((b, i) => (
                                <Card key={i} className="rounded-[2rem] border-none shadow-sm bg-card overflow-hidden group hover:shadow-2xl transition-all">
                                    <CardContent className="p-6 flex flex-wrap items-center justify-between gap-6">
                                        <div className="flex items-center gap-5">
                                            <div className="flex flex-col items-center justify-center w-20 h-20 bg-[#55402f] text-white rounded-[1.5rem] shadow-xl shadow-[#55402f]/10">
                                                <span className="text-[10px] font-black uppercase tracking-tighter opacity-60">
                                                    {format(parseISO(b.booking_date), "MMM")}
                                                </span>
                                                <span className="text-2xl font-black">
                                                    {format(parseISO(b.booking_date), "dd")}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-lg font-black text-foreground tracking-tight">
                                                    {(() => {
                                                        const walkInMatch = b.notes?.match(/Walk-in:\s*([^|#\n]+)/);
                                                        if (walkInMatch && walkInMatch[1].trim() && walkInMatch[1].trim() !== "undefined") {
                                                            return walkInMatch[1].trim();
                                                        }

                                                        if (b.user_type === 'customer') {
                                                            return "Online service booking";
                                                        }

                                                        if (b.user_name && (b.user_id === user?.id || b.user_name === user?.full_name)) {
                                                            return "Walk-in Customer";
                                                        }

                                                        return b.user_name || "Anonymous Client";
                                                    })()}
                                                </h4>
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className="rounded-lg border-border text-[9px] font-black uppercase tracking-widest px-2 text-[#55402f]">
                                                        {b.service_name}
                                                    </Badge>
                                                    <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {b.booking_time}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {b.status === 'pending' && (
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        onClick={() => updateBookingStatus(b.id, 'confirmed')}
                                                        disabled={!isClockedIn}
                                                        className={cn(
                                                            "bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest h-12 px-6 rounded-2xl",
                                                            !isClockedIn && "opacity-50 cursor-not-allowed"
                                                        )}
                                                    >
                                                        Confirm
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => updateBookingStatus(b.id, 'cancelled')}
                                                        className="text-rose-500 hover:bg-rose-50 h-12 w-12 rounded-2xl flex items-center justify-center"
                                                    >
                                                        <XCircle className="w-6 h-6" />
                                                    </Button>
                                                </div>
                                            )}
                                            {b.status === 'confirmed' && (
                                                <Button
                                                    onClick={() => updateBookingStatus(b.id, 'completed')}
                                                    disabled={!isClockedIn}
                                                    className={cn(
                                                        "bg-[#55402f] hover:bg-[#433225] text-white font-black text-[10px] uppercase tracking-widest h-12 px-8 rounded-2xl",
                                                        !isClockedIn && "opacity-50 cursor-not-allowed"
                                                    )}
                                                >
                                                    Mark Complete
                                                </Button>
                                            )}
                                            {!isClockedIn && (b.status === 'pending' || b.status === 'confirmed') && (
                                                <p className="hidden md:block text-[8px] font-black uppercase tracking-widest text-[#55402f] animate-pulse">
                                                    Clock-in required
                                                </p>
                                            )}
                                            {b.status === 'completed' && (
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-emerald-100 text-emerald-600 border-none font-black text-[10px] uppercase tracking-widest h-10 px-6 rounded-xl flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4" /> Accomplished
                                                    </Badge>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => {
                                                            const record = b.treatment_records?.[0];
                                                            if (record) {
                                                                setTreatmentData({
                                                                    treatment_details: record.treatment_details || "",
                                                                    products_used: record.products_used || "",
                                                                    skin_reaction: record.skin_reaction || "",
                                                                    improvement_notes: record.improvement_notes || ""
                                                                });
                                                            } else {
                                                                setTreatmentData({ treatment_details: "", products_used: "", skin_reaction: "", improvement_notes: "" });
                                                            }
                                                            setRecordBookingId(b.id);
                                                        }}
                                                        className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#55402f] border-[#55402f]/20 hover:bg-[#55402f]/5 transition-all active:scale-95"
                                                    >
                                                        View Log
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    {/* Upcoming Assignments */}
                    {upcomingBookings.length > 0 && (
                        <div className="space-y-6 pt-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight opacity-50">Upcoming </h3>
                            </div>
                            <div className="space-y-4">
                                {upcomingBookings.map((b, i) => (
                                    <Card key={i} className="rounded-[2rem] border-none shadow-sm bg-card/50 overflow-hidden group hover:shadow-xl transition-all grayscale hover:grayscale-0 opacity-70 hover:opacity-100">
                                        <CardContent className="p-6 flex flex-wrap items-center justify-between gap-6">
                                            <div className="flex items-center gap-5">
                                                <div className="flex flex-col items-center justify-center w-16 h-16 bg-slate-200 text-slate-500 rounded-[1.2rem] transition-all group-hover:bg-slate-800 group-hover:text-white">
                                                    <span className="text-[8px] font-black uppercase tracking-tighter opacity-60">
                                                        {format(parseISO(b.booking_date), "MMM")}
                                                    </span>
                                                    <span className="text-xl font-black">
                                                        {format(parseISO(b.booking_date), "dd")}
                                                    </span>
                                                </div>
                                                <div className="space-y-1">
                                                    <h4 className="text-sm font-black text-slate-700">{b.service_name}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        Scheduled: {b.booking_time}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="rounded-lg border-border text-[8px] font-black uppercase tracking-widest px-3 text-muted-foreground">
                                                Next Deployment
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Tactical Links & Messages */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        {staffInfo?.assigned_services && staffInfo.assigned_services.length > 0 && (
                            <div className="space-y-4 mb-8">
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight px-2">My Assigned Services</h3>
                                <div className="flex flex-wrap gap-2 px-2">
                                    {staffInfo.assigned_services.map((service: any, i: number) => (
                                        <Badge key={i} className="bg-[#55402f]/10 text-[#55402f] border-none font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl">
                                            {service.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        <h3 className="text-xl font-black text-foreground uppercase tracking-tight px-2">Operational Hub</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                {
                                    label: "My Profile",
                                    icon: User,
                                    path: staffInfo?.id ? `/staff/profile/${staffInfo.id}` : '#',
                                    desc: "View performance stats",
                                    disabled: !staffInfo
                                },
                                { label: "Deployment Logs", icon: Clock, path: "/staff/attendance", desc: "View work hour history" },
                                { label: "Time-Off", icon: CalendarDays, path: "/staff/leaves", desc: "Request absence authorization" },
                            ].filter(Boolean).map((link: any, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        if (link.disabled) {
                                            toast({ title: "Profile Unavailable", description: "Staff profile data not loaded.", variant: "destructive" });
                                            return;
                                        }
                                        navigate(link.path);
                                    }}
                                    className={cn(
                                        "p-5 rounded-3xl border flex items-center gap-5 text-left group transition-all hover:shadow-xl",
                                        link.isGold ? "bg-[#55402f] border-[#55402f] text-white hover:bg-[#433225]" : "bg-card border-border text-foreground hover:bg-muted/50",
                                        link.disabled ? "opacity-50 cursor-not-allowed" : ""
                                    )}
                                    disabled={!!link.disabled}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-inner",
                                        link.isGold ? "bg-white/20 text-white" : "bg-muted text-foreground group-hover:bg-[#55402f] group-hover:text-white"
                                    )}>
                                        <link.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "text-sm font-black",
                                                link.isGold ? "text-white" : "text-white"
                                            )}>{link.label}</span>
                                            {link.alert && unreadMessagesCount > 0 && (
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full animate-ping",
                                                    link.isGold ? "bg-white" : "bg-[#55402f]"
                                                )} />
                                            )}
                                        </div>
                                        <p className={cn(
                                            "text-[10px] font-bold uppercase tracking-widest mt-0.5",
                                            link.isGold ? "text-white/80" : "text-white/40"
                                        )}>{link.desc}</p>
                                    </div>
                                    <ChevronRight className={cn(
                                        "w-4 h-4 transition-all group-hover:translate-x-1",
                                        link.isGold ? "text-white/40 group-hover:text-white" : "text-slate-200 group-hover:text-white"
                                    )} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <Card className="rounded-[2.5rem] bg-[#55402f] text-white overflow-hidden relative border-none shadow-2xl p-8">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#55402f]/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="p-3 bg-white/10 rounded-2xl">
                                    <AlertCircle className="w-6 h-6 text-[#55402f]" />
                                </div>
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-black text-[8px] uppercase tracking-widest">System Live</Badge>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-lg font-black tracking-tight">Deployment Ready</h4>
                                <p className="text-[10px] font-bold text-white/50 leading-relaxed uppercase tracking-widest">
                                    Last Sync: {format(lastSync, "h:mm:ss a")} • System Optimized
                                </p>
                            </div>
                            <Button
                                onClick={() => fetchData()}
                                className="w-full h-12 bg-background text-foreground font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-accent hover:text-white transition-all shadow-xl"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Refresh Matrix
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Treatment Record Dialog */}
            <Dialog open={!!recordBookingId} onOpenChange={() => setRecordBookingId(null)}>
                <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl p-10 bg-card">
                    <DialogHeader className="space-y-4">
                        <DialogTitle className="text-3xl font-black text-foreground tracking-tight uppercase">Treatment Log</DialogTitle>
                        <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Document the details of the accomplished mission.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-6 border-y border-slate-50 my-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Treatment Details</Label>
                            <Textarea
                                value={treatmentData.treatment_details}
                                onChange={e => setTreatmentData({ ...treatmentData, treatment_details: e.target.value })}
                                placeholder="What was done?"
                                className="bg-muted/50 border border-border rounded-xl text-foreground text-sm font-semibold focus-visible:ring-1 focus-visible:ring-accent"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Products Used</Label>
                            <Textarea
                                value={treatmentData.products_used}
                                onChange={e => setTreatmentData({ ...treatmentData, products_used: e.target.value })}
                                placeholder="Chemicals/Tools deployed..."
                                className="bg-muted/50 border border-border rounded-xl text-foreground text-sm font-semibold focus-visible:ring-1 focus-visible:ring-accent"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Skin Reaction / Notes</Label>
                            <Input
                                value={treatmentData.skin_reaction}
                                onChange={e => setTreatmentData({ ...treatmentData, skin_reaction: e.target.value })}
                                placeholder="Normal / Sensitive / Reaction..."
                                className="h-12 bg-muted/50 border border-border rounded-xl text-foreground text-sm font-semibold focus-visible:ring-1 focus-visible:ring-accent"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-3">
                        <Button variant="ghost" onClick={() => setRecordBookingId(null)} className="h-14 flex-1 font-black text-[10px] uppercase tracking-widest text-slate-400">Skip</Button>
                        <Button
                            onClick={handleSaveRecord}
                            disabled={savingRecord}
                            className="h-14 flex-1 bg-[#55402f] hover:bg-[#433225] text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl"
                        >
                            {savingRecord ? <Loader2 className="w-4 h-4 animate-spin" /> : "Finalize Log"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
