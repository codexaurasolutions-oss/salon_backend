import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import api from "@/services/api";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const data = await api.newsletter.subscribe(email);
      toast({
        title: "Successfully Subscribed",
        description: data?.message || "Welcome! Use code SUB50 for 50 RM off your first booking.",
      });
      setEmail("");
    } catch (error: any) {
      toast({
        title: "Subscription Failed",
        description: error.message || "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 md:py-24 px-4 overflow-hidden relative">
      <div className="container mx-auto mobc">
        <div className="bg-[#0A0A0A] text-white rounded-[2.5rem] p-10 md:p-24 text-center  mx-auto relative overflow-hidden shadow-2xl">
          {/* Subtle Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

          <h2 className="text-4xl md:text-[3rem] font-extrabold mb-6 tracking-tight leading-[1.1] text-white relative z-10">
            Stay Updated with the Latest <br className="hidden md:block" />
            Salon Trends
          </h2>

          <p className="text-base md:text-xl text-white/50 mb-12 max-w-2xl mx-auto font-medium leading-relaxed relative z-10">
            Subscribe to our newsletter and stay ahead in the beauty industry! <br className="hidden md:block" />
            Get exclusive salon tips and promotions.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto relative z-10 w-full px-4 md:px-0">
            <div className="flex-1 relative group">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="h-14 md:h-16 bg-[#1A1A1A] border border-white/10 text-white placeholder:text-white/20 text-base md:text-lg rounded-full px-8 focus-visible:ring-white/10 focus-visible:ring-offset-0 transition-all w-full"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="h-14 md:h-16 rounded-full px-10 bg-white hover:bg-gray-100 text-black font-bold text-base md:text-lg transition-all shadow-[0_4px_20px_rgba(255,255,255,0.15)] active:scale-95 whitespace-nowrap"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Subscribe Now"
              )}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
