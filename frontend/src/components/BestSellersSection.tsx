import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/services/api";
import { getImageUrl } from "@/utils/imageUrl";

const BestSellersSection = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                // Fetch customer products
                const data = await api.platformProducts.getAll('customer');
                // Take top 4 for the grid
                setProducts(data?.slice(0, 4) || []);
            } catch (error) {
                console.error("Failed to fetch best sellers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBestSellers();
    }, []);

    if (loading) return (
        <section className="py-24 bg-white">
            <div className="max-w-[1400px] mx-auto px-4 md:px-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="aspect-square bg-slate-50 animate-pulse rounded-[2rem]" />
                    ))}
                </div>
            </div>
        </section>
    );

    if (products.length === 0) return null;

    return (
        <section className="py-24 bg-white">
            <div className="max-w-[1400px] mx-auto px-4 md:px-12">
                {/* Header Block */}
                <div className="text-center mb-20 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="space-y-4"
                    >
                        <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.4em]">
                            CURATED FOR YOUR GLOW
                        </span>
                        <h2 className="text-3xl md:text-5xl lg:text-[3rem] font-black text-[#1A2338] tracking-tight uppercase">
                            SHOP OUR BEST SELLERS
                        </h2>
                        <p className="text-sm md:text-base text-slate-400 font-medium max-w-2xl mx-auto">
                            Expert-approved essentials to maintain your ritual results at home.
                        </p>
                    </motion.div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16" >
                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="flex flex-col h-full group border border-dark" style={{borderRadius: "20px"}}
                        >
                            {/* Image Container with Full-Bleed Look */}
                            <div className="relative aspect-square overflow-hidden  mb-6" style={{borderTopRightRadius: "20px", borderTopLeftRadius: "20px"}}>
                                {/* Category Tag - Added glassmorphism to stay visible over cover image */}
                                <div className="absolute top-6 left-6 z-30">
                                    <span className="text-[10px] font-bold text-[#1A2338] uppercase tracking-[0.2em] bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-sm">
                                        {product.category || "SKIN CARE"}
                                    </span>
                                </div>

                                {/* Full 100% Cover Image */}
                                <div className="w-full h-full relative overflow-hidden">
                                    <img
                                        src={getImageUrl(product.image_url)}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    {/* Subtle overlay to help text readability if needed */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/[0.02] to-transparent pointer-events-none" />
                                </div>
                            </div>

                            {/* Text Meta Section */}
                            <div className="space-y-4 flex-grow px-1 me-3 ms-4">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-[#1A2338] tracking-tight truncate uppercase leading-tight">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-slate-400 font-medium line-clamp-1">
                                        {product.description || "Premium Care"}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <span className="text-2xl font-bold text-[#1A2338]">
                                        RM {parseFloat(product.price).toFixed(2)}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                        {product.quantity > 0 ? "IN STOCK" : "OUT OF STOCK"}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons - Pill style from reference */}
                            <div className="grid grid-cols-2 gap-3  p-4">
                                <button
                                    onClick={() => navigate(`/product/${product.id}`)}
                                    className="btn border btn-sm border-[#B07D62]/40 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] text-[#B07D62] hover:bg-[#B07D62] hover:text-white transition-all text-center"
                                >
                                    VIEW
                                </button>
                                <button
                                    onClick={() => navigate('/shop')}
                                    className="py-3 px-4 bg-[#B07D62] rounded-full text-[11px] font-bold uppercase tracking-[0.15em] text-white hover:bg-[#96644d] transition-all text-center shadow-md shadow-[#B07D62]/20"
                                >
                                    SHOP NOW
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BestSellersSection;
