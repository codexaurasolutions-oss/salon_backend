import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import api from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface SimpleService {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: string;
  salon_id: string;
  salon_name?: string;
  owner_name?: string;
  salon_logo_url?: string;
  salon_cover_url?: string;
  image_url?: string;
  staff_count?: number;
  rating?: number;
  review_count?: number;
  is_featured?: boolean;
}

const SkinConcernSection = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const [services, setServices] = useState<SimpleService[]>([]);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await api.services.getAll({ featured: 1 });
                // Optionally take top 6 to map well to the grid
                setServices((data || []).slice(0, 6));
            } catch (error) {
                console.error("Error fetching services:", error);
            }
        };
        fetchServices();
    }, []);

    const handleBookService = (e: React.MouseEvent, service: SimpleService) => {
        e.stopPropagation();
        if (!user) {
            toast({
                title: "Login Required",
                description: "Please sign up or log in to book this ritual.",
                variant: "default",
            });
            navigate("/signup");
            return;
        }
        window.location.href = `/book?salonId=${service.salon_id}&serviceId=${service.id}`;
    };

    return (
        <section className="w-full py-20 bg-white">
            <div className="mx-auto px-4 md:px-20">

                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <span className="text-[10px] tracking-[0.4em] uppercase text-slate-400">
                        Tailored To You
                    </span>

                    <h2 className="text-3xl md:text-5xl font-medium text-[#1A2338]">
                       Facials Designed for Real Skin.
                    </h2>

                    <p className="text-sm text-slate-400 max-w-xl mx-auto">
                       Every treatment is customised to your skin’s unique needs using advanced techniques, professional-grade products, and expert care.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    <AnimatePresence mode="popLayout">
                        {services.map((service, index) => (
                            <motion.div
                                key={service.id}
                                layoutId={`skin-concern-${service.id}`}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                onClick={() => navigate(`/services/${service.id}`)}

                                className="bg-[#F5F2ED] rounded-[1rem] p-6 h-full flex flex-col justify-between border border-transparent hover:border-[#e5e2dc] transition-all cursor-pointer"
                            >
                                {/* Top Content */}
                                <div className="space-y-5">

                                    {/* Icon */}
                                    <div className="w-12 h-12 bg-[#B07D62] rounded-xl flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>

                                    {/* Title  (Using original style and mapping to category) */}
                                    <h3 className="text-xl md:text-2xl font-medium text-[#1A2338] leading-snug">
                                        {service.category || "General Beauty"}
                                    </h3>

                                    {/* Recommendation */}
                                    <div className="space-y-1">
                                        <span className="text-[10px] tracking-[0.25em] uppercase text-slate-400">
                                            Recommended Treatment
                                        </span>

                                        <p className="text-sm text-[#4A5568] font-medium line-clamp-1">
                                            {service.name}
                                        </p>
                                    </div>
                                </div>

                                {/* Bottom Button (FIXED POSITION) */}
                                <div className="pt-6">
                                    <button 
                                        className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-[#1A2338] hover:text-[#B07D62] transition-colors"
                                        onClick={(e) => handleBookService(e, service)}
                                    >
                                        Book This Treatment
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                            </motion.div>
                        ))}
                    </AnimatePresence>

                </div>
            </div>
        </section>
    );
};

export default SkinConcernSection;
