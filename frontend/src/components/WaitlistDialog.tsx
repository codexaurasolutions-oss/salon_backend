import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";

interface WaitlistDialogProps {
    isOpen: boolean;
    onClose: () => void;
    serviceName: string;
}

const WaitlistDialog = ({ isOpen, onClose, serviceName }: WaitlistDialogProps) => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            await api.newsletter.subscribe(email);
            setSuccess(true);
            toast({
                title: "Joined Waitlist",
                description: `You'll be the first to know when ${serviceName} is available!`,
            });
        } catch (error) {
            console.error("Waitlist error:", error);
            toast({
                title: "Subscription Failed",
                description: "Something went wrong. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSuccess(false);
        setEmail("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-none shadow-2xl overflow-hidden">
                {!success ? (
                    <div className="p-2">
                        <DialogHeader className="space-y-4 text-center">
                            <div className="mx-auto w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                                <Mail className="w-8 h-8 text-slate-400" />
                            </div>
                            <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight uppercase">Coming Soon</DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium text-lg">
                                <span className="text-accent font-bold">{serviceName}</span> is launching soon. Join the waitlist to get early access and exclusive opening offers.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                            <div className="relative group">
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-14 pl-4 pr-12 bg-slate-50 border-none rounded-2xl font-medium focus-visible:ring-2 focus-visible:ring-accent/20 transition-all"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-slate-900 text-white hover:bg-black rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Notify Me"}
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div className="py-12 text-center space-y-6">
                        <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center animate-bounce-slow">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-slate-900">You're on the list!</h3>
                            <p className="text-slate-500 font-medium max-w-[280px] mx-auto">
                                We'll reach out to <span className="text-slate-900 font-bold">{email}</span> as soon as we're ready.
                            </p>
                        </div>
                        <Button
                            onClick={handleClose}
                            className="px-8 h-12 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest"
                        >
                            Great
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default WaitlistDialog;
