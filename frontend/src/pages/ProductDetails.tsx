import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    Loader2,
    Search,
    Plus,
    Minus,
    ArrowLeft,
    ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import api from "@/services/api";
import { getImageUrl } from "@/utils/imageUrl";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    category: string;
    image_url_2?: string;
    image_url_3?: string;
    image_url_4?: string;
}

export default function ProductDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await api.platformProducts.getById(id);
                const productData = data?.product || data;
                setProduct(productData);
                setSelectedImage(productData.image_url);
            } catch (err: any) {
                console.error("Error fetching product details:", err);
                setError("Could not load product details.");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F3EEEA] flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#1A1A1A] animate-spin" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-[#F3EEEA] flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-['DM_Serif_Display'] mb-4 text-[#1A1A1A]">Product Not Found</h2>
                <Button onClick={() => navigate(-1)} className="bg-[#1A1A1A] text-white rounded-full">Return to Catalog</Button>
            </div>
        );
    }

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            addToCart({
                id: product.id,
                name: product.name,
                price: Number(product.price),
                image_url: product.image_url,
                type: 'product'
            });
        }
        toast.success(`${quantity} ${quantity > 1 ? 'items' : 'item'} added to your bag`);
    };

    return (
        <div className="min-h-screen bg-[#F3EEEA]">
            <Navbar />

            <main className="pt-32 pb-20">
                <div className="container mx-auto px-4 max-w-7xl">

                    {/* Breadcrumbs */}
                    <nav className="flex flex-row flex-nowrap items-center gap-2 text-xs md:text-sm text-[#1A1A1A] mb-8 overflow-x-auto scrollbar-hide py-2 whitespace-nowrap">
                        <Link to="/" className="hover:opacity-60 flex-shrink-0 flex items-center">Home</Link>
                        <ChevronRight className="w-3 h-3 opacity-40 flex-shrink-0" />
                        <Link to="/shop" className="hover:opacity-60 flex-shrink-0 flex items-center">All Products</Link>
                        <ChevronRight className="w-3 h-3 opacity-40 flex-shrink-0" />
                        <span className="opacity-60 flex-shrink-0 truncate">{product.name}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-start">

                        {/* Left: Product Image */}
                        <div className="relative group">
                            <div className="bg-white/40 rounded-[2.5rem] overflow-hidden aspect-square flex items-center justify-center p-8 md:p-12 mb-6">
                                <motion.img
                                    key={selectedImage}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    src={getImageUrl(selectedImage, 'service', product.id)}
                                    alt={product.name}
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            {/* Image Grid */}
                            <div className="grid grid-cols-4 gap-4">
                                {[product.image_url, product.image_url_2, product.image_url_3, product.image_url_4]
                                    .filter(Boolean)
                                    .map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(img!)}
                                            className={`aspect-square rounded-2xl overflow-hidden p-2 bg-white/40 border-2 transition-all ${selectedImage === img ? 'border-[#1A1A1A] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                        >
                                            <img
                                                src={getImageUrl(img!, 'service', product.id)}
                                                alt={`${product.name} view ${index + 1}`}
                                                className="w-full h-full object-contain"
                                            />
                                        </button>
                                    ))}
                            </div>
                        </div>

                        {/* Right: Product Details */}
                        <div className="flex flex-col">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-['DM_Serif_Display'] text-[#1A1A1A] leading-[1.1] mb-6">
                                {product.name}
                            </h1>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">
                                        MYR {Number(product.price).toFixed(2)}
                                    </p>
                                    <button className="text-sm text-[#1A1A1A] underline underline-offset-4 decoration-1 opacity-80 hover:opacity-100 transition-opacity mt-2">
                                        Shipping
                                    </button>
                                    <span className="text-sm text-[#1A1A1A] opacity-80 decoration-1"> calculated at checkout.</span>
                                </div>



                                <div className="text-base md:text-lg text-[#1A1A1A]/80 leading-relaxed max-w-xl">
                                    {product.description || `A premium ${product.category || 'product'} designed to deliver exceptional results. Formulated with high-quality ingredients to nourish, protect, and enhance your daily routine.`}
                                </div>

                                {/* Purchase Controls */}
                                <div className="flex flex-col gap-4 pt-4">
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center bg-white border border-[#1A1A1A]/5 rounded-full p-1.5 h-14 min-w-[140px]">
                                            <button
                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F3EEEA] transition-all text-[#1A1A1A]"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="flex-1 text-center font-bold text-lg">{quantity}</span>
                                            <button
                                                onClick={() => setQuantity(q => q + 1)}
                                                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F3EEEA] transition-all text-[#1A1A1A]"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <Button
                                            onClick={handleAddToCart}
                                            className="flex-1 h-14 bg-[#EDEDED] hover:bg-[#E5E5E5] text-[#1A1A1A] font-bold text-lg rounded-full border-none shadow-none"
                                        >
                                            Add To Cart
                                        </Button>
                                    </div>

                                    <Button
                                        onClick={() => {
                                            handleAddToCart();
                                            navigate('/checkout');
                                        }}
                                        className="w-full h-14 bg-[#1A1A1A] hover:bg-black text-white font-bold text-lg rounded-full shadow-none flex items-center justify-center gap-2"
                                    >
                                        Buy it now
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
