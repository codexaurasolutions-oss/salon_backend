import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  Clock,
  Banknote,
  Scissors,
  ArrowRight,
  Loader2,
  MapPin,
  Users,
  User,
  ShoppingBag,
  Tag,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";



import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl } from "@/utils/imageUrl";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

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
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  user_name: string;
  user_avatar: string | null;
  service_name: string;
  created_at?: string;
}


const AllServicesSimple = () => {
  const [services, setServices] = useState<SimpleService[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [email, setEmail] = useState("");


  const location = useLocation();
  useEffect(() => {
    if (location.state?.category) {
      setActiveCategory(location.state.category);

      setTimeout(() => {
        const section = document.getElementById("services-list");
        if (section) {
          const yOffset = -120; // 👈 adjust karo (navbar + spacing)
          const y =
            section.getBoundingClientRect().top +
            window.pageYOffset +
            yOffset;

          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 100);
    }
  }, [location.state]);
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to subscribe.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Successfully Subscribed!",
      description: "Thank you for joining our newsletter. Stay tuned for updates!",
    });
    setEmail("");
  };


  const fetchSimpleServices = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("🔍 Fetching services from local API...");
      const data = await api.services.getAll();

      console.log("📋 Services found:", data?.length || 0);
      const formatted = (data || []).map((s: any) => ({
        ...s,
        rating: Number(s.rating || 0),
        review_count: s.review_count || 0
      }));
      setServices(formatted);
    } catch (error: any) {
      console.error("Error fetching services:", error);
      const message = error.message || "Failed to reach the server. Please try again later.";
      setError(message);
      toast({
        title: "Connection Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const data = await api.reviews.getAll();
      const fetchedReviews = data?.reviews || data || [];
      if (Array.isArray(fetchedReviews)) {
        // Map backend fields to ensure they match the UI interface
        const mappedReviews = fetchedReviews.map((r: any) => ({
          id: r.id,
          rating: Number(r.rating),
          comment: r.comment,
          user_name: r.user_name || r.customer_name || "Global Customer",
          user_avatar: r.user_avatar || r.customer_avatar,
          service_name: r.service_name || "Verified Service", // Fallback if service name is missing
          created_at: r.created_at
        }));
        setReviews(mappedReviews);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  };

  useEffect(() => {
    fetchSimpleServices();
    fetchReviews();
  }, []);

  const categories = ["All", ...new Set(services.map(s => s.category).filter(Boolean))];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.salon_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (service.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);

    const matchesCategory = activeCategory === "All" || service.category === activeCategory;

    return matchesSearch && matchesCategory;
  });


  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleBookService = (service: SimpleService) => {
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
  useEffect(() => {
    if (location.state?.category) {
      setActiveCategory(location.state.category);

      setTimeout(() => {
        window.scrollTo({ top: 400, behavior: "smooth" });
      }, 100);
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      {/* Services Banner */}
      <section className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden" id="services-list">
        <img
          src="https://i.ibb.co/x8g8kq9J/IMG-7753-JPG-1.jpg"
          alt="Services Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center space-y-4 px-4">
          <h1 className="text-4xl md:text-6xl lg:text-[4rem] font-black text-white uppercase tracking-tight">
            Our Services
          </h1>
          <p className="text-sm md:text-lg text-slate-200 font-medium max-w-2xl mx-auto">
            Discover a wide range of premium salon rituals precisely curated for your beauty and well-being.
          </p>
        </div>
      </section>

      {/* Global Search & Luxury Filter Section */}
      <section className="pt-24 pb-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-16">
            {/* Title & Filter Block */}
            <div className="flex flex-col items-center space-y-12">
              <div className="text-center space-y-6">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] block">Curated Rituals</span>
                <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-tight uppercase">
                  Our Services
                </h2>
                <div className="h-1.5 w-16 bg-[#49331c] mx-auto rounded-full" />
              </div>

              {/* Redesigned Search Bar - Now Below Title */}
              <div className="relative group w-full max-w-4xl mx-auto">
                <div className="absolute inset-0 bg-accent/5 blur-3xl rounded-[3rem] opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000" />
                <div className="relative flex items-center bg-card rounded-[2.5rem] p-2 pr-4 shadow-inner border border-border focus-within:border-accent/20 transition-all duration-300">
                  <Search className="ml-6 text-muted-foreground w-6 h-6 group-focus-within:text-accent transition-colors" />
                  <Input
                    placeholder="Search treatments, rituals or creators..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-16 px-6 bg-transparent border-none text-xl font-medium shadow-none focus-visible:ring-0 placeholder:text-muted-foreground"
                  />
                  <Button
                    className="bg-[#b07d62] text-white rounded-[2rem] px-8 h-12 font-black uppercase tracking-widest text-[10px] hover:bg-[#a06d52] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#b07d62]/10 shrink-0"
                  >
                    Search Rituals
                  </Button>
                </div>
              </div>

              <div className="w-full">
                <div className="flex flex-wrap items-center gap-3 justify-center">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`
                        flex items-center gap-3 px-8 py-4 rounded-full font-black text-[11px] uppercase tracking-widest whitespace-nowrap transition-all duration-500
                        ${activeCategory === category
                          ? "bg-[#b07d62] text-white shadow-2xl shadow-[#b07d62]/20 scale-105"
                          : "bg-card text-muted-foreground border border-border hover:border-accent/20 hover:text-foreground transition-all shadow-sm"
                        }
                      `}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="pb-32 px-4 shadow-sm">
        <div className="container mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="w-12 h-12 text-accent animate-spin" />
              <p className="font-black text-muted-foreground uppercase tracking-widest text-[10px]">Syncing Local Service Registry...</p>
            </div>
          ) : error ? (
            <div className="text-center py-32 space-y-8 max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Clock className="w-12 h-12 text-red-500 animate-pulse" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl font-black text-foreground border-b-4 border-red-500 inline-block pb-2">Service Offline</h3>
                <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                  {error}
                </p>
                <div className="p-4 bg-card rounded-xl border border-border mt-6 overflow-hidden">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-2">Technical Detail</p>
                  <code className="text-xs text-muted-foreground break-all">{error}</code>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={() => fetchSimpleServices()}
                  className="bg-red-600 text-white rounded-2xl px-12 h-14 font-black shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all hover:scale-105 active:scale-95"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  RETRY CONNECTION
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="rounded-2xl px-8 h-14 font-black border-2 border-slate-200"
                >
                  REFRESH PAGE
                </Button>
              </div>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-32 space-y-6">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                <Scissors className="w-10 h-10 text-slate-200" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-foreground">No matches found locally.</h3>
                <p className="text-muted-foreground font-medium">Try broadening your search or resetting categories.</p>
              </div>
              <Button onClick={() => { setSearchQuery(""); setActiveCategory("All"); }} className="bg-slate-900 text-white rounded-2xl px-8 h-12 font-black">
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredServices.map((service, index) => (
                    <motion.div
                      key={service.id}
                      layoutId={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div
                        onClick={() => navigate(`/services/${service.id}`)}
                        className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer h-full border border-border/50"
                      >
                        <div className="relative h-48 overflow-hidden bg-slate-100">
                          <img
                            src={getImageUrl(service.image_url, 'service', service.id)}
                            alt={service.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold text-slate-900 shadow-sm">
                            RM {service.price}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 relative">
                          {/* Logo Overlay */}
                          <div className="absolute -top-10 right-4">
                            <div className="h-14 w-14 rounded-2xl border-4 border-white overflow-hidden shadow-xl bg-white group-hover:scale-110 transition-transform">
                              <img
                                src={getImageUrl(service.salon_logo_url, 'logo', service.salon_id)}
                                className="w-full h-full object-cover"
                                alt="Logo"
                                onError={(e) => {
    e.currentTarget.onerror = null; // Prevent infinite loop
    e.currentTarget.src = getImageUrl(null, 'logo', service.id);
  }}
                              />
                            </div>
                          </div>

                          <div className="pt-4 space-y-3">
                            <h3 className="font-bold text-lg line-clamp-1 group-hover:text-accent transition-colors">{service.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">{service.salon_name || "Premium Salon"}</p>

                            {/* Rating Placeholder */}
                            {/* <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < Math.floor(service.rating || 0) ? "fill-[#55402f] text-[#55402f]" : "text-slate-200"}`}
                                />
                              ))}
                              <span className="text-xs text-muted-foreground ml-1">({(typeof service.rating === 'number' ? service.rating : Number(service.rating || 0)).toFixed(1)})</span>
                              {service.review_count !== undefined && (
                                <span className="text-[10px] text-slate-400 ml-1">· {service.review_count} reviews</span>
                              )}
                            </div> */}

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="font-bold text-sky-600 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {service.duration_minutes}m
                              </span>
                              <span className="flex items-center gap-1 text-xs font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                                {service.category}
                              </span>
                            </div>

                            {/* Book Button */}
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBookService(service);
                              }}
                              variant="ghost"
                              className="w-full mt-2 text-foreground hover:bg-[#533B26] hover:text-white font-medium transition-all duration-300 border border-slate-100"
                            >
                              Book Now &rarr;
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

            </div >
          )}
        </div>
      </section>




      <Footer />
    </div >
  );
};

export default AllServicesSimple;
