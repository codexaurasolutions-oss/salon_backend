import React from 'react';
import { useCart } from "@/context/CartContext";
import { getImageUrl } from "@/utils/imageUrl";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import api from "@/services/api";

const CartPage = () => {
 const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
 const [platformSettings, setPlatformSettings] = React.useState({
    shipping_fee: 15,
    free_shipping_min: 150
 });

 React.useEffect(() => {
    const loadSettings = async () => {
        try {
            const data = await api.admin.getPlatformSettings();
            if (data) {
                setPlatformSettings({
                    shipping_fee: Number(data.shipping_fee ?? 15),
                    free_shipping_min: Number(data.free_shipping_min ?? 150)
                });
            }
        } catch (e) {
            console.error('Failed to load cart settings', e);
        }
    };
    loadSettings();
 }, []);

 const shipping = cart.length > 0 ? (cartTotal >= platformSettings.free_shipping_min ? 0 : platformSettings.shipping_fee) : 0;
 const finalTotal = cartTotal + shipping;

 return (
 <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
 <Navbar />

 <main className="container mx-auto px-4 pt-32 pb-20">
 <div className="max-w-6xl mx-auto">
 <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 md:mb-12">
 <Link to="/" className="w-10 h-10 bg-card rounded-full hover:bg-muted transition-colors flex items-center justify-center shadow-sm border border-border flex-shrink-0">
 <ArrowLeft className="w-5 h-5 text-foreground" />
 </Link>
 <div className="flex items-baseline gap-3">
 <h1 className="text-3xl md:text-5xl font-['DM_Serif_Display'] text-foreground">Your Bag</h1>
 {cartCount > 0 && (
 <span className="text-lg md:text-xl text-muted-foreground">({cartCount} items)</span>
 )}
 </div>
 </div>

 {cart.length === 0 ? (
 <div className="bg-card rounded-[2rem] p-8 md:p-20 text-center shadow-sm border border-border">
 <div className="w-20 h-20 md:w-24 md:h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8">
 <ShoppingBag className="w-8 h-8 md:w-10 md:h-10 text-muted-foreground" />
 </div>
 <h2 className="text-xl md:text-2xl font-bold mb-4">Your bag is empty</h2>
 <p className="text-sm md:text-base text-muted-foreground mb-8 md:mb-10 max-w-md mx-auto">
 Looks like you haven't added anything to your bag yet. Explore our services and products to find what suits you best.
 </p>
 <Button asChild className="bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 text-white px-8 md:px-10 h-12 md:h-14 rounded-full text-base md:text-lg">
 <Link to="/shop">Start Shopping</Link>
 </Button>
 </div>
 ) : (
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
 {/* Items List */}
 <div className="lg:col-span-8 space-y-4 md:space-y-6">
 {cart.map((item) => (
 <div key={item.id} className="bg-card rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 shadow-sm border border-border flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 group transition-all hover:shadow-md">
 <div className="w-full sm:w-32 h-48 sm:h-40 bg-muted rounded-2xl overflow-hidden flex-shrink-0">
 <img
 src={getImageUrl(item.image_url, item.type === 'product' ? 'service' : 'service', item.id)}
 alt={item.name}
 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
 />
 </div>

 <div className="flex-1 w-full flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
 <div className="space-y-1">
 <span className="text-[10px] font-black tracking-widest uppercase text-muted-foreground block">
 {item.type}
 </span>
 <h3 className="text-lg md:text-xl font-bold group-hover:text-accent transition-colors">
 {item.name}
 </h3>
 <p className="text-muted-foreground font-medium">RM {item.price.toFixed(2)}</p>
 </div>

 <div className="flex items-center justify-between sm:justify-end gap-x-8 md:gap-x-10">
 <div className="flex items-center bg-muted rounded-full p-1 border border-border scale-90 sm:scale-100 origin-left">
 <button
 onClick={() => updateQuantity(item.id, item.quantity - 1)}
 className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-card transition-all text-foreground"
 >
 <Minus className="w-3.5 h-3.5" />
 </button>
 <span className="w-8 md:w-10 text-center font-bold text-sm md:text-base">{item.quantity}</span>
 <button
 onClick={() => updateQuantity(item.id, item.quantity + 1)}
 className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:bg-card transition-all text-foreground"
 >
 <Plus className="w-3.5 h-3.5" />
 </button>
 </div>

 <div className="text-right flex flex-col items-end gap-1 md:gap-2">
 <p className="text-lg md:text-xl font-black ">
 RM {(item.price * item.quantity).toFixed(2)}
 </p>
 <button
 onClick={() => removeFromCart(item.id)}
 className="p-1.5 md:p-2 text-muted-foreground hover:text-red-500 transition-colors"
 >
 <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
 </button>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>

 {/* Summary Card */}
 <div className="lg:col-span-4">
 <div className="bg-card rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 shadow-sm border border-border md:sticky md:top-32">
 <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">Summary</h2>

 <div className="space-y-4 mb-6 md:mb-8">
 <div className="flex justify-between text-sm md:text-base text-muted-foreground">
 <span>Subtotal</span>
 <span className="font-bold text-foreground">RM {cartTotal.toFixed(2)}</span>
 </div>
 <div className="flex justify-between text-sm md:text-base text-muted-foreground">
 <span>Shipping Fee</span>
 <span className="font-bold text-foreground">RM {shipping.toFixed(2)}</span>
 </div>
 <div className="h-px bg-border my-4" />
 <div className="flex justify-between text-lg md:text-xl font-bold ">
 <span>Total</span>
 <span className="text-accent">RM {finalTotal.toFixed(2)}</span>
 </div>
 </div>

 <Button asChild className="w-full bg-foreground text-background hover:bg-accent hover:text-white h-14 md:h-16 rounded-full text-base md:text-lg group transition-all">
 <Link to="/checkout" className="flex items-center justify-center">
 Checkout Now
 <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
 </Link>
 </Button>

 <div className="mt-6 flex flex-col gap-4">
 <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">
 Secure payments & instant booking
 </p>
 <div className="flex justify-center gap-3 grayscale opacity-30">
 <div className="w-8 md:w-10 h-5 md:h-6 bg-slate-200 rounded" />
 <div className="w-8 md:w-10 h-5 md:h-6 bg-slate-200 rounded" />
 <div className="w-8 md:w-10 h-5 md:h-6 bg-slate-200 rounded" />
 </div>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 </main>
 </div>
 );
};

export default CartPage;
