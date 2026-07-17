import { useState, useEffect } from "react";
import { Bell, CheckCircle, Info, Calendar, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import api from "@/services/api";
import { useSalon } from "@/hooks/useSalon";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useNavigate } from "react-router-dom";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    created_at: string;
    is_read: boolean;
    link?: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const { currentSalon, isOwner } = useSalon();
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchData = async () => {
        if (!currentSalon || !user) return;
        setLoading(true);
        try {
            // Fetch System Notifications
            const notifData = await api.notifications.getAll({
                salon_id: currentSalon.id
            });
            setNotifications(notifData || []);

            // Fetch Messages
            const msgData = await api.messages.getAll(currentSalon.id);
            setMessages(msgData?.messages || []);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentSalon, user]);

    const markAsRead = async (id: string, isMessage: boolean = false) => {
        try {
            if (isMessage) {
                await api.messages.markAsRead(id);
                setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
            } else {
                await api.notifications.markAsRead(id);
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            }
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const markAllRead = async () => {
        if (!currentSalon) return;
        try {
            await api.notifications.markAllAsRead(currentSalon.id);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

            // For messages, we'd need a bulk endpoint, but for now individual or just UI sync
            setMessages(prev => prev.map(m => ({ ...m, is_read: true })));
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const filteredNotifications = notifications.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredMessages = messages.filter(m =>
        m.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.sender_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-foreground tracking-tight">Notification Center</h1>
                        <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-widest">Manage your alerts and communications</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            className="rounded-2xl border-slate-200 font-bold text-xs uppercase tracking-wider"
                            onClick={fetchData}
                        >
                            Refresh
                        </Button>
                        <Button
                            className="bg-accent hover:bg-accent/90 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-accent/20"
                            onClick={markAllRead}
                        >
                            Mark All as Read
                        </Button>
                    </div>
                </div>

                <Card className="border border-border/50 shadow-sm rounded-[2.5rem] overflow-hidden bg-card backdrop-blur-xl">
                    <CardHeader className="border-b border-border/50 p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <Tabs defaultValue="all" className="w-full md:w-auto">
                                <TabsList className="bg-muted/50 p-1.5 rounded-2xl h-auto">
                                    <TabsTrigger value="all" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">All Alerts</TabsTrigger>
                                    <TabsTrigger value="unread" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Unread Only</TabsTrigger>
                                </TabsList>
                            </Tabs>
                            <div className="relative group max-w-md w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                                <Input
                                    placeholder="Search alerts or messages..."
                                    className="pl-12 pr-4 py-6 bg-muted/20 border border-border/50 rounded-2xl focus:ring-4 focus:ring-accent/5 transition-all font-medium text-sm text-foreground"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Tabs defaultValue="notifications" className="w-full">
                            <div className="px-8 pt-6">
                                <TabsList className="bg-transparent border-b border-border/50 w-full justify-start rounded-none h-auto p-0 gap-8">
                                    <TabsTrigger value="notifications" className="border-b-2 border-transparent data-[state=active]:border-accent rounded-none bg-transparent px-0 py-4 font-black text-sm uppercase tracking-widest text-muted-foreground data-[state=active]:text-accent">
                                        System Alerts ({notifications.filter(n => !n.is_read).length})
                                    </TabsTrigger>
                                    {/* {!isOwner && (
                                        <TabsTrigger value="messages" className="border-b-2 border-transparent data-[state=active]:border-accent rounded-none bg-transparent px-0 py-4 font-black text-sm uppercase tracking-widest text-slate-400 data-[state=active]:text-accent">
                                            Staff Messages ({messages.filter(m => m.receiver_id === user?.id && !m.is_read).length})
                                        </TabsTrigger>
                                    )} */}
                                </TabsList>
                            </div>

                            <div className="p-8">
                                <TabsContent value="notifications" className="m-0 focus-visible:ring-0">
                                    <ScrollArea className="h-[600px] pr-4">
                                        {filteredNotifications.length === 0 ? (
                                            <div className="text-center py-20">
                                                <div className="w-20 h-20 bg-muted/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                                    <Bell className="w-10 h-10 text-muted-foreground/40" />
                                                </div>
                                                <h3 className="text-xl font-bold text-foreground">No Alerts Found</h3>
                                                <p className="text-muted-foreground font-medium mt-1">You're all caught up with your salon activity.</p>
                                            </div>
                                        ) : (
                                            <div className="grid gap-4">
                                                {filteredNotifications.map((n) => (
                                                    <div
                                                        key={n.id}
                                                        className={`group relative p-6 rounded-3xl border-2 transition-all cursor-pointer ${n.is_read
                                                            ? "bg-muted/10 border-transparent opacity-60 hover:opacity-100"
                                                            : "bg-card border-accent/20 shadow-lg shadow-accent/5 hover:border-accent/40"
                                                            }`}
                                                        onClick={() => {
                                                            markAsRead(n.id);
                                                            if (n.link) navigate(n.link);
                                                        }}
                                                    >
                                                        <div className="flex items-start gap-6">
                                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${n.is_read ? "bg-muted/30 text-muted-foreground" : "bg-accent/10 text-accent ring-4 ring-accent/5"
                                                                }`}>
                                                                {n.type === 'booking' ? <Calendar className="w-7 h-7" /> : <Info className="w-7 h-7" />}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <h4 className="font-black text-lg text-foreground truncate tracking-tight">{n.title}</h4>
                                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{format(new Date(n.created_at), 'MMM d, HH:mm')}</span>
                                                                </div>
                                                                <p className="text-muted-foreground font-medium leading-relaxed">{n.message}</p>
                                                            </div>
                                                            {!n.is_read && (
                                                                <div className="w-3 h-3 bg-accent rounded-full animate-pulse mt-2" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </ScrollArea>
                                </TabsContent>

                                <TabsContent value="messages" className="m-0 focus-visible:ring-0">
                                    <ScrollArea className="h-[600px] pr-4">
                                        {filteredMessages.length === 0 ? (
                                            <div className="text-center py-20">
                                                <div className="w-20 h-20 bg-muted/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                                    <Bell className="w-10 h-10 text-muted-foreground/40" />
                                                </div>
                                                <h3 className="text-xl font-bold text-foreground">No Messages Found</h3>
                                                <p className="text-muted-foreground font-medium mt-1">Your inbox is currently empty.</p>
                                            </div>
                                        ) : (
                                            <div className="grid gap-4">
                                                {filteredMessages.map((m) => (
                                                    <div
                                                        key={m.id}
                                                        className={`group relative p-6 rounded-3xl border-2 transition-all cursor-pointer ${(m.receiver_id === user?.id && m.is_read) || m.sender_id === user?.id
                                                            ? "bg-muted/10 border-transparent opacity-60 hover:opacity-100"
                                                            : "bg-card border-accent/20 shadow-lg shadow-accent/5 hover:border-accent/40"
                                                            }`}
                                                        onClick={() => {
                                                            if (m.receiver_id === user?.id && !m.is_read) markAsRead(m.id, true);
                                                            navigate('/salon/staff/messages');
                                                        }}
                                                    >
                                                        <div className="flex items-start gap-6">
                                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center font-bold text-muted-foreground shrink-0 uppercase">
                                                                {m.sender_name?.substring(0, 2) || "M"}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <h4 className="font-black text-lg text-foreground truncate tracking-tight">{m.subject || "No Subject"}</h4>
                                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{format(new Date(m.created_at), 'MMM d, HH:mm')}</span>
                                                                </div>
                                                                <p className="text-xs font-bold text-accent mb-2 uppercase tracking-widest">From: {m.sender_name}</p>
                                                                <p className="text-muted-foreground font-medium leading-relaxed truncate">{m.content}</p>
                                                            </div>
                                                            {m.receiver_id === user?.id && !m.is_read && (
                                                                <div className="w-3 h-3 bg-accent rounded-full animate-pulse mt-2" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </ScrollArea>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
