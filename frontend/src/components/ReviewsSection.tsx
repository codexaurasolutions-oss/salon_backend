import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import api from "@/services/api";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface Review {
    id: string;
    user_name: string;
    service_name: string;
    rating: number;
    comment: string;
    user_avatar: string | null;
}

const ReviewsSection = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const data = await api.reviews.getAll();
                const fetched = data?.reviews || data || [];
                if (Array.isArray(fetched)) {
                    const mappedRows = fetched.map((r: any) => ({
                        id: r.id,
                        user_name: r.user_name || r.customer_name || "Global Customer",
                        service_name: r.service_name || "Luxury Treatment",
                        rating: Number(r.rating) || 5,
                        comment: r.comment || r.text || "Experience excellence.",
                        user_avatar: r.user_avatar || r.customer_avatar || `https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop`
                    }));
                    setReviews(mappedRows);
                }
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    if (loading) return null;
    if (reviews.length === 0) return null;

    return (
        <section className="py-24  overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-4 md:px-12">
                {/* Section Header */}
                <div className="text-center mb-20 space-y-4">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.4em] block"
                    >
                        Customer Stories
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl lg:text-5xl font-black text-[#1A1A1A] tracking-tighter uppercase leading-[0.9]"
                    >
                        Customers Love Using Salon.
                    </motion.h2>
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: 80 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="h-1 bg-slate-900 mx-auto mt-8"
                    />
                </div>

                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                        watchDrag: false,
                    }}
                    plugins={[
                        Autoplay({
                            delay: 4000,
                        }),
                    ]}
                    className="w-full relative group"
                >
                    <CarouselContent className="-ml-12">
                        {reviews.map((review) => (
                            <CarouselItem key={review.id} className="pl-12 md:basis-1/2 lg:basis-1/3">
                                <motion.div
                                    className="flex flex-col group"
                                >
                                    {/* Vertical Layout - Image Top */}
                                    <div className="relative aspect-square w-full rounded-[4rem] overflow-hidden  mb-8">
                                        <img
                                            src={review.user_avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop"}
                                            alt={review.user_name}
                                            className="w-full h-full object-cover grayscale transition-all duration-1000 group-hover:grayscale-0 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    </div>

                                    {/* Content Below */}
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <h3 className="text-3xl font-black text-[#1A2338] uppercase tracking-tight">
                                                {review.user_name}
                                            </h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                                                {review.service_name}
                                            </p>
                                        </div>

                                        <div className="flex gap-1.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={16}
                                                    className={`${i < review.rating ? "fill-[#1A2338] text-[#1A2338]" : "text-slate-200"}`}
                                                />
                                            ))}
                                        </div>

                                        <p className="text-xl text-[#4A4A4A] font-medium leading-relaxed italic line-clamp-3">
                                            "{review.comment}"
                                        </p>
                                    </div>
                                </motion.div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    {/* Navigation Buttons */}
                    <div className="flex justify-center gap-4 mt-12">
                        <CarouselPrevious className="static translate-y-0 w-14 h-14 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-600 transition-all shadow-sm" />
                        <CarouselNext className="static translate-y-0 w-14 h-14 rounded-full border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-600 transition-all shadow-sm" />
                    </div>
                </Carousel>
            </div>
        </section>
    );
};

export default ReviewsSection;
