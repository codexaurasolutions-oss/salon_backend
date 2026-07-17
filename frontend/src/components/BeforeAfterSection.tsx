import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Star, CheckCircle2, Camera, ShieldCheck, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface Transformation {
    id: string;
    customer_name: string;
    rating: number;
    treatment_name: string;
    duration: string;
    comment: string;
    before_image: string;
    after_image: string;
}

const ComparisonSlider = ({ before, after }: { before: string, after: string }) => {
    const [sliderPos, setSliderPos] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = (clientX: number, e?: React.MouseEvent | React.TouchEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percent = (x / rect.width) * 100;
        setSliderPos(percent);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-[250px] overflow-hidden cursor-ew-resize select-none touch-none"
            onMouseMove={(e) => {
                if (e.buttons === 1) handleMove(e.clientX, e);
            }}
            onTouchMove={(e) => handleMove(e.touches[0].clientX, e)}
        >
            {/* Labels - Clean labels like Image 1 */}
            <div className="absolute top-4 left-6 z-20">
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#B07D62] uppercase bg-white/40 backdrop-blur-md px-2 py-1 rounded">BEFORE</span>
            </div>
            <div className="absolute top-4 right-6 z-20">
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#B07D62] uppercase bg-white/40 backdrop-blur-md px-2 py-1 rounded">AFTER</span>
            </div>

            {/* After Image */}
            <img src={after} alt="After" className="absolute inset-0 w-full h-full object-cover" />

            {/* Before Image */}
            <div
                className="absolute inset-0 w-full h-full z-10"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
                <img src={before} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
            </div>

            {/* Handle - High-end tactile handle as seen in Image 1 */}
            <div
                className="absolute top-0 bottom-0 z-30"
                style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
            >
                <div className="h-full w-[1px] bg-white relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-white/20">
                        <div className="flex gap-0.5 text-[#B07D62]">
                            <ArrowLeft size={16} />
                            <ArrowRight size={16} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BeforeAfterSection = () => {
    const navigate = useNavigate();
    const [results, setResults] = useState<Transformation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransformations = async () => {
            try {
                const data = await api.customerRecords.getTransformations();
                const fetched = data?.transformations || [];
                if (fetched.length > 0) {
                    setResults(fetched);
                } else {
                    // Fallback to placeholder data
                    setResults([
                        {
                            id: "1",
                            customer_name: "KRISHNA",
                            rating: 5,
                            treatment_name: "Hair Care & Styling",
                            duration: "90 Minutes",
                            comment: "Visible reduction in cystic inflammation and texture refinement.",
                            before_image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=2069&auto=format&fit=crop",
                            after_image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2074&auto=format&fit=crop"
                        },
                        {
                            id: "2",
                            customer_name: "SARAH",
                            rating: 5,
                            treatment_name: "Skin Rejuvenation",
                            duration: "45 Minutes",
                            comment: "Hydration Facial after 3-4 weeks showing great results.",
                            before_image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2069&auto=format&fit=crop",
                            after_image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=2070&auto=format&fit=crop"
                        },
                        {
                            id: "3",
                            customer_name: "ALEXA",
                            rating: 5,
                            treatment_name: "Signature Glow Treatment",
                            duration: "120 Minutes",
                            comment: "Visible improvement in texture and glow after just one session.",
                            before_image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop",
                            after_image: "https://images.unsplash.com/photo-1503951458645-643d53efd93f?q=80&w=2070&auto=format&fit=crop"
                        }
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch transformations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransformations();
    }, []);

    const formatDuration = (duration: any) => {
        if (!duration) return 'N/A';
        const str = String(duration).toLowerCase();
        if (str.includes('minute') || str.includes('min')) {
            const mins = parseInt(str);
            if (!isNaN(mins)) {
                if (mins >= 60) {
                    const h = Math.floor(mins / 60);
                    const m = mins % 60;
                    return `${h}h${m > 0 ? ` ${m}m` : ''}`;
                }
                return `${mins} Mins`;
            }
        }
        return duration;
    };

    if (loading) return null;

    return (
        <section className="py-18 bg-white overflow-hidden">
            <div className="max-w-[1400px] ">
                {/* Header Section - Centered Luxury Heading */}
                <div className="text-center mb-24">
                    <h2 className="text-4xl md:text-[3rem] font-black text-[#1A2338] tracking-tight leading-tight uppercase mb-6">
                        REAL RESULTS. REAL PEOPLE. 
                    </h2>

                    <p className="text-slate-400 font-medium tracking-tight whitespace-pre-line">
                        See authentic before & after results from our real salon customers.{"\n"}
                    </p>
                </div>

                {/* Slider Layout - Wide Padding for Floating Controls as seen in Image 1 */}
                <div className="relative mb-24 md:px-20 lg:px-24">
                    <Carousel
                        opts={{
                            align: "start",
                            loop: true,
                            watchDrag: false,
                        }}
                      
                        className="w-full relative group"
                    >
                        <CarouselContent className="-ml-8">
                            {results.map((item) => (
                                <CarouselItem key={item.id} className="pl-8 md:basis-1/2 lg:basis-1/3">
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        className="flex flex-col bg-white rounded-[16px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] border border-black h-full"
                                    >
                                        <ComparisonSlider before={item.before_image} after={item.after_image} />

                                        <div className="p-6 flex flex-col space-y-6 flex-grow">
                                            {/* Name and Rating Block - Horizontal Alignment */}
                                            <div className="text-center items-center justify-between gap-4">
                                                <h3 className="text-3xl font-black text-[#1A2338] uppercase tracking-tight">{item.customer_name}</h3>
                                                <div className="flex gap-1 justify-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={16}
                                                            className="fill-[#B07D62] text-transparent"
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="h-[1px] w-full bg-slate-100" />

                                            {/* Detail Stack */}
                                            <div className="space-y-2">
                                                <p className="text-xs font-bold text-[#1A2338] tracking-widest uppercase">
                                                    Treatment: <span className="text-slate-400 font-medium normal-case">{item.treatment_name}</span>
                                                </p>
                                                <p className="text-xs font-bold text-[#1A2338] tracking-widest uppercase">
                                                    Duration: <span className="text-slate-400 font-medium normal-case">{formatDuration(item.duration)}</span>
                                                </p>
                                            </div>

                                            <div className="h-[1px] w-full bg-slate-100" />

                                            {/* Comment/Quote */}
                                            <p className="text-lg text-[#1A2338] font-black leading-relaxed italic opacity-80 min-h-[84px] line-clamp-3 text-center">
                                                "{item.comment}"
                                            </p>
                                        </div>
                                    </motion.div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        {/* 
                            Slider Controls - This handles the 'slider effect controll' perfectly.
                            Positioned absolutely on the sides to match Image 1's floating style.
                        */}
                        <div className="hidden lg:block">
                            <CarouselPrevious
                                className="absolute -left-20 top-1/2 -translate-y-1/2 h-16 w-16 rounded-full border border-black bg-white shadow-[0_20px_40px_rgba(0,0,0,0.1)] text-black hover:bg-[#B07D62] hover:text-white hover:border-[#B07D62] transition-all duration-300 z-50 flex items-center justify-center translate-x-1/2"
                            />
                            <CarouselNext
                                className="absolute -right-20 top-1/2 -translate-y-1/2 h-16 w-16 rounded-full border border-black bg-white shadow-[0_20px_40px_rgba(0,0,0,0.1)] text-black hover:bg-[#B07D62] hover:text-white hover:border-[#B07D62] transition-all duration-300 z-50 flex items-center justify-center -translate-x-1/2"
                            />
                        </div>

                        {/* Mobile Navigation - Accessible buttons at the bottom */}
                        <div className="flex justify-center gap-6 mt-12 lg:hidden">
                            <CarouselPrevious className="static translate-y-0 h-14 w-14 rounded-full border border-black bg-white shadow-md text-black hover:bg-[#B07D62] hover:text-white" />
                            <CarouselNext className="static translate-y-0 h-14 w-14 rounded-full border border-black bg-white shadow-md text-black hover:bg-[#B07D62] hover:text-white" />
                        </div>
                    </Carousel>
                </div>

                {/* Trust Metrics */}
                {/* <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 mb-16">
                    {[
                        { icon: CheckCircle2, text: "1000+ HAPPY CUSTOMERS" },
                        { icon: Camera, text: "NO FILTERS USED" },
                        { icon: ShieldCheck, text: "DERMATOLOGICALLY APPROVED" },
                        { icon: UserCheck, text: "CERTIFIED PROFESSIONALS" },
                    ].map((badge, i) => (
                        <div key={i} className="flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-full bg-[#B07D62]/10 flex items-center justify-center text-[#B07D62] group-hover:bg-[#B07D62] group-hover:text-white transition-all">
                                <badge.icon size={16} />
                            </div>
                            <span className="text-[10px] font-black tracking-[0.2em] text-[#B07D62] uppercase">
                                {badge.text}
                            </span>
                            {i < 3 && <div className="hidden lg:block w-[1px] h-4 bg-slate-200 ml-12" />}
                        </div>
                    ))}
                </div> */}

                {/* Booking Action */}
                <div className="flex justify-center mb-24">
                    <Button
                        onClick={() => navigate('/contact')}
                        className="h-16 px-16 bg-[#B07D62] hover:bg-[#96644B] text-white font-black uppercase tracking-[0.2em] rounded-2xl  transition-all hover:scale-105 active:scale-95"
                    >
                        BOOK YOUR APPOINTMENT
                    </Button>
                </div>
            </div>
        </section >
    );
};

export default BeforeAfterSection;
