import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

const GlowConfidenceSection = () => {
    const navigate = useNavigate();

    const services = [
        {
            name: "FACIALS",
            category: "Facial",
            redirect: "/services-simple",
        },
        {
            name: "HAIR REMOVAL",
            category: "Laser",
            redirect: "/services-simple",
        },
        {
            name: "SKIN PROGRAMMES",
            category: "Skin Care",
            redirect: "/services-simple",
        },
    ];
    const handleServiceClick = (service) => {
        navigate(service.redirect, {
            state: { category: service.category },
        });
    };

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-4 md:px-12">
                <div className="text-center space-y-12">
                    {/* Top Accent */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col items-center"
                    >


                        <h2 className="text-4xl md:text-[3rem] font-black text-[#1A2338] tracking-tight leading-[1.1] uppercase">
                            Because Healthy Skin Starts With Care<br className="hidden md:block" />
                        </h2>
                    </motion.div>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-base md:text-xl text-slate-500 font-medium leading-relaxed"
                    >
                        We believe great skin begins with thoughtful care.
                        At NoamSkin, treatments are designed to support healthier, clearer and naturally radiant skin in a calm and welcoming space.
                    </motion.p>

                    {/* CTA with Sheet */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="pt-4"
                    >
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="relative text-xs md:text-sm font-black uppercase tracking-[0.2em] group p-0 h-auto hover:bg-transparent text-slate-900 hover:text-black transition-all"
                                >
                                    BOOK NOW
                                    <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-black transition-all duration-300 group-hover:w-full" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-full sm:max-w-md border-r-0 p-12 flex flex-col gap-12">
                                <SheetHeader className="text-left space-y-8">
                                    <img
                                        src="https://i.ibb.co/gLDv9pcN/logo.png"
                                        alt="Noamskin Logo"
                                        className="w-28 object-contain"
                                    />
                                    <SheetTitle className="text-xl font-bold text-slate-900 tracking-tight">
                                        Select a service:
                                    </SheetTitle>
                                </SheetHeader>

                                <div className="flex flex-col gap-8 mt-4">
                                    {services.map((service) => (
                                        <button
                                            key={service.name}
                                            onClick={() => handleServiceClick(service)}
                                            className="flex items-center justify-between w-full group py-2"
                                        >
                                            <span className="text-lg font-black tracking-widest text-[#1A2338] group-hover:text-accent transition-colors">
                                                {service.name}
                                            </span>
                                            <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-accent transition-all group-hover:translate-x-1" />
                                        </button>
                                    ))}
                                    <p className="text-[14px] text-slate-400 leading-relaxed mt-6">
                                        Note: A RM100 deposit is required to secure your appointment and will be deducted from your treatment.
                                    </p>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default GlowConfidenceSection;
