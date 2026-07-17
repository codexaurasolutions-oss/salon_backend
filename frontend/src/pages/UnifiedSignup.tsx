import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Loader2, Store, User, Mail, Lock, Phone, Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { countryCodes } from "@/utils/countryCodes";

import { Percent, Link as LinkIcon, CalendarDays } from "lucide-react";

type SignupType = "salon_owner";

const UnifiedSignup = () => {
    const [signupType, setSignupType] = useState<SignupType>("salon_owner");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [countryCode, setCountryCode] = useState("Malaysia-+60");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [salonName, setSalonName] = useState("");
    const [salonSlug, setSalonSlug] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { signUp } = useAuth();

    const updateSlug = (name: string) => {
        setSalonName(name);
        if (!salonSlug || salonSlug === name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
            setSalonSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fullName.trim() || !email.trim() || !password.trim() || !salonName.trim()) {
            toast({
                title: "Information Required",
                description: "Please fill in all required fields, including your salon name.",
                variant: "destructive",
            });
            return;
        }

        if (password !== confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match",
                variant: "destructive",
            });
            return;
        }

        if (password.length < 6) {
            toast({
                title: "Error",
                description: "Password must be at least 6 characters",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const dialCode = countryCode.split('-').pop() || "";
            const fullPhone = phone ? `${dialCode}${phone}` : "";
            const extraData: any = {
                phone: fullPhone,
                user_type: "salon_owner",
                salon_name: salonName.trim(),
                salon_slug: salonSlug.trim() || undefined
            };

            await signUp(email.trim(), password, fullName.trim(), extraData);

            toast({
                title: "Station Registered!",
                description: "Your saloon station has been initialized in the global registry.",
            });

            navigate("/dashboard");
        } catch (error: any) {
            console.error("Signup error:", error);
            toast({
                title: "Enrollment Failed",
                description: error.message || "Could not initialize account",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB] flex flex-col pt-24">
            <Navbar />

            {/* Hero Section */}
            <section className="relative w-full h-screen overflow-hidden">
                <div className="absolute inset-0 bg-slate-900">
                    <img
                        src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=2070&auto=format&fit=crop"
                        alt="Join our prestigious membership"
                        className="w-full h-full object-cover opacity-60"
                        loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />
                </div>

                <div className="relative h-full container mx-auto px-6 flex flex-col items-center justify-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center px-6 py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md mb-8"
                    >
                        <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.3em]">Institutional Membership</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight tracking-tighter uppercase mb-6"
                    >
                        Join The Family
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-white/80 font-medium max-w-2xl leading-relaxed italic"
                    >
                        Scale your salon business with Malaysia's most advanced management ecosystem. Experience the future of grooming.
                    </motion.p>
                </div>
            </section>

            {/* Benefit Icons */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100/50">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 uppercase tracking-tighter">Increased Revenue</h3>
                                <p className="text-sm text-slate-500 font-medium mt-1">Smart booking algorithms to maximize your daily capacity.</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 shadow-sm border border-slate-100">
                                <Store className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 uppercase tracking-tighter">Connected Network</h3>
                                <p className="text-sm text-slate-500 font-medium mt-1">Plug into Malaysia's elite network of premier studios.</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100/50">
                                <CalendarDays className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 uppercase tracking-tighter">Advanced Flow</h3>
                                <p className="text-sm text-slate-500 font-medium mt-1">Seamlessly manage staff, inventory, and analytics.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Join The Family Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-black text-slate-900 mb-6"
                    >
                        Why Join The Family?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-slate-500 font-medium max-w-4xl mx-auto leading-relaxed italic mb-12"
                    >
                        Join the family that's redefining the grooming industry. Our ecosystem provides more than just software;
                        it provides a gateway to operational excellence, staff fulfillment, and unprecedented business growth.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-4 px-8 py-4 bg-slate-50 border border-slate-100 rounded-full shadow-sm"
                    >
                        <div className="flex -space-x-3 overflow-hidden">
                            {[
                                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
                                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
                                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop",
                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop"
                            ].map((src, i) => (
                                <img
                                    key={i}
                                    src={src}
                                    className="inline-block h-10 w-10 rounded-full ring-4 ring-white object-cover"
                                    alt="Partner avatar"
                                />
                            ))}
                        </div>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">15,000+ SALONS SYNCED</span>
                    </motion.div>
                </div>
            </section>

            <div className="flex-grow flex items-center justify-center p-4 py-24 bg-slate-50/50">
                <Card className="w-full max-w-xl border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] bg-white rounded-[2rem] overflow-hidden border border-white/40">
                    <CardHeader className="text-center pt-12 pb-8">
                        <CardTitle className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                            Membership Form
                        </CardTitle>
                        <CardDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mt-2">
                            Secure your position in Malaysia's elite hub
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSignup} className="px-10 pb-12">
                        <CardContent className="space-y-6 px-0">
                            {/* Saloon specific fields */}
                            <div className="p-1 bg-accent/10 rounded-[2rem] mb-6">
                                <div className="bg-white rounded-[1.8rem] p-6 space-y-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Sparkles className="w-5 h-5 text-accent" />
                                        <p className="font-black text-slate-900">Saloon Identity</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Saloon Brand Name *</Label>
                                        <Input
                                            placeholder="e.g. Noir Grooming Lounge"
                                            value={salonName}
                                            onChange={(e) => updateSlug(e.target.value)}
                                            className="h-14 bg-slate-50 border-none rounded-2xl font-bold px-5"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Common Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-1.5">
                                        <User className="w-3 h-3" />
                                        Owner Name *
                                    </Label>
                                    <Input
                                        placeholder="Enter your name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="h-14 bg-slate-50 border-none rounded-2xl font-bold px-5 shadow-inner"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-1.5">
                                        <Mail className="w-3 h-3" />
                                        Business Email *
                                    </Label>
                                    <Input
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-14 bg-slate-50 border-none rounded-2xl font-bold px-5 shadow-inner"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-1.5">
                                    <Phone className="w-3 h-3" />
                                    Contact Number
                                </Label>
                                <div className="flex gap-2">
                                    <Select value={countryCode} onValueChange={setCountryCode}>
                                        <SelectTrigger className="w-[110px] h-14 bg-slate-50 border-none rounded-2xl font-bold px-4 shadow-inner">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-none shadow-2xl bg-white">
                                            {countryCodes.map((c) => (
                                                <SelectItem key={`${c.country}-${c.code}`} value={`${c.country}-${c.code}`} className="font-bold py-3 rounded-xl focus:bg-accent/10 cursor-pointer">
                                                    <span className="flex items-center gap-2">
                                                        <span>{c.flag}</span>
                                                        <span>{c.code}</span>
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        type="tel"
                                        placeholder="000 000 0000"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                                        className="h-14 bg-slate-50 border-none rounded-2xl font-bold px-5 shadow-inner flex-1"
                                    />
                                </div>
                            </div>

                            {/* Password Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-1.5">
                                        <Lock className="w-3 h-3" />
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="h-14 bg-slate-50 border-none rounded-2xl font-bold px-5 pr-12 shadow-inner"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                                        Confirm Identity
                                    </Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="h-14 bg-slate-50 border-none rounded-2xl font-bold px-5 shadow-inner"
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-6 px-0 pt-8 mt-4">
                            <Button
                                type="submit"
                                className="w-full h-16 rounded-[2rem] font-black text-lg transition-all transform hover:scale-[1.01] bg-slate-900 hover:bg-black text-white shadow-2xl shadow-slate-900/10"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                        PROVISIONING NODE...
                                    </>
                                ) : (
                                    "INITIALIZE MANAGEMENT STATION"
                                )}
                            </Button>

                            <div className="text-center space-y-4">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest max-w-[80%] mx-auto leading-relaxed">
                                    By creating an account, you agree to our{" "}
                                    <Link to="/terms" className="text-slate-600 underline">Terms of Service</Link> and{" "}
                                    <Link to="/privacy" className="text-slate-600 underline">Privacy Policy</Link>
                                </p>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                    Already a member?{" "}
                                    <Link to="/login" className="text-accent underline font-black">
                                        Sign In
                                    </Link>
                                </p>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
            <Footer />
        </div>
    );
};

export default UnifiedSignup;
