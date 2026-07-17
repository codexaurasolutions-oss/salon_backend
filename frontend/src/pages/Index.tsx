import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

// Original website components
import Navbar from "@/components/Navbar";
import HeroVideoCarousel from "@/components/HeroVideoCarousel";



import NewsletterSection from "@/components/NewsletterSection";
import GlowConfidenceSection from "@/components/GlowConfidenceSection";
import FeaturedFacialSection from "@/components/FeaturedFacialSection";
import SkinConcernSection from "@/components/SkinConcernSection";
import SkinAdviceSection from "@/components/SkinAdviceSection";
import FacialMenuSection from "@/components/FacialMenuSection";
import BestSellersSection from "@/components/BestSellersSection";
import BeforeAfterSection from "@/components/BeforeAfterSection";
import InsideSpaceSection from "@/components/InsideSpaceSection";
import BecomeMemberSection from "@/components/BecomeMemberSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";


const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleBooking = (salonId: string) => {
    if (!user) {
      toast({
        title: "Registration Required",
        description: "To reserve your spot in our local registry, please sign up or log in first.",
        variant: "default",
      });
      navigate("/signup");
      return;
    }
    navigate(`/book?salonId=${salonId}`);
  };


  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />
      <HeroVideoCarousel />

      <InsideSpaceSection />

      <div id="glow">
        <GlowConfidenceSection />
      </div>

      {/* <div id="facial-menu">
        <FacialMenuSection />
      </div> */}

      <div id="featured-facial">
        <FeaturedFacialSection />
      </div>

      <div id="skin-concern">
        <SkinConcernSection />
      </div>

      {/* <div id="best-sellers">
        <BestSellersSection />
      </div> */}

      <div id="skin-advice">
        <SkinAdviceSection />
      </div>

      {/* <div id="before-after">
        <BeforeAfterSection />
      </div> */}



      {/* <div id="faq">
        <FAQSection />
      </div> */}

      <BecomeMemberSection />

      <div id="newsletter">
        <NewsletterSection />
      </div>

      <Footer />
    </div>
  );
};

export default Index;
