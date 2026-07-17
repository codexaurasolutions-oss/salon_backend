import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import api from "@/services/api";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";


interface PlatformProduct {
    id: string;
    name: string;
    description: string;
    price: number;
    discount?: number;
    image_url: string | null;
    category: string;
    brand?: string;
    quantity: number;
}

const RecommendedProductsSection = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<PlatformProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();


    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await api.platformProducts.getAll();
                setProducts(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching recommended products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return null; // Or a loader if preferred
    if (products.length === 0) return null;

    return (
        <section className="py-24 px-4 bg-white overflow-hidden">
            <div className="container mx-auto">
                <div className="text-center mb-20 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="space-y-4"
                    >
                        <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.4em]">
                            CHOSEN FOR YOUR RITUAL
                        </span>
                        <h2 className="text-3xl md:text-5xl lg:text-[3rem] font-black text-[#1A2338] tracking-tight uppercase">
                            Recommended Products
                        </h2>
                        <p className="text-sm md:text-base text-slate-400 font-medium max-w-2xl mx-auto">
                            Elevate your home care with our professionally curated selection.
                        </p>
                    </motion.div>
                </div>

                {products.length > 0 ? (
                    <div className="relative px-4 md:px-12">
                        <Carousel
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                            plugins={[
                                Autoplay({
                                    delay: 5000,
                                }),
                            ]}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-4 md:-ml-6 py-4 items-stretch min-h-[500px]">
                                {products.map((product) => (
                                    <CarouselItem key={product.id} className="pl-4 md:pl-6 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 flex flex-col">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.5 }}
                                            className="flex flex-col flex-1"
                                        >
                                            <div
                                                onClick={() => navigate(`/product/${product.id}`)}
                                                className="group bg-white rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] hover:shadow-[0_48px_80px_-16px_rgba(0,0,0,0.1)] transition-all duration-500 cursor-pointer border border-slate-50 flex flex-col flex-1"
                                            >
                                                {/* Product Image */}
                                                <div className="relative h-64 overflow-hidden bg-[#F9F9F9] flex items-center justify-center">
                                                    {product.image_url ? (
                                                        <img
                                                            src={product.image_url}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <ShoppingBag className="w-16 h-16 text-slate-200" />
                                                    )}

                                                    {/* Discount Badge */}
                                                    {(Number(product.discount) > 0) && (
                                                        <div className="absolute top-6 left-6 bg-red-500 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
                                                            SAVE RM {product.discount}
                                                        </div>
                                                    )}

                                                    {/* Category Tag */}
                                                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <span className="text-[10px] font-bold text-[#1A2338] uppercase tracking-[0.2em] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
                                                            {product.category || "General"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-8 flex flex-col flex-grow">
                                                    <div className="mb-3">
                                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{product.brand || product.category || "General"}</span>
                                                    </div>
                                                    <h3 className="font-black text-xl text-[#1A2338] tracking-tight uppercase line-clamp-2 mb-3 group-hover:text-[#55402f] transition-colors">{product.name}</h3>
                                                    <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-6 flex-grow">{product.description}</p>

                                                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs text-slate-300 font-bold line-through">
                                                                {Number(product.discount) > 0 ? `RM ${(Number(product.price) + Number(product.discount)).toFixed(2)}` : ''}
                                                            </span>
                                                            <span className="text-2xl font-black text-[#1A2338]">RM {product.price}</span>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            className="rounded-full px-6 bg-[#1A2338] text-white hover:bg-[#55402f] font-black text-[10px] uppercase tracking-widest transition-all duration-300 shadow-lg shadow-[#1A2338]/10"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                addToCart({
                                                                    id: product.id,
                                                                    name: product.name,
                                                                    price: Number(product.price),
                                                                    image_url: product.image_url || "",
                                                                    type: 'product'
                                                                });
                                                                toast.success(`${product.name} added to bag`);
                                                            }}
                                                        >
                                                            Add Cart
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="absolute -left-2 md:-left-6 top-1/2 rounded-full h-14 w-14 border-none bg-white shadow-2xl text-[#1A2338] hover:bg-[#1A2338] hover:text-white transition-all duration-300" />
                            <CarouselNext className="absolute -right-2 md:-right-6 top-1/2 rounded-full h-14 w-14 border-none bg-white shadow-2xl text-[#1A2338] hover:bg-[#1A2338] hover:text-white transition-all duration-300" />
                        </Carousel>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-slate-400">No products available at the moment.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default RecommendedProductsSection;
