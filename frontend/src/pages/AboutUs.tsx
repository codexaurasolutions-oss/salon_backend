import { Link } from "react-router-dom";
import {
  Target,
  Clock,
  Sparkles,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 bg-muted/30">
        <div className="container mx-auto text-center">
          <Badge className="mt-8 mb-6 bg-accent/10 text-accent border-accent/20 px-4 py-1.5 text-sm">
            About Noam Skin
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Healthy Skin Begins With You
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover a boutique home-based skin studio dedicated to your glowing and healthy skin.
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="py-16 px-4">
        <div className="container-flueid mx-auto max-w-5xl space-y-24">

          {/* Our Philosophy */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-accent" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Philosophy</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                At Noam Skin, we believe that healthy skin begins with understanding each individual’s unique skin needs. Every treatment is thoughtfully customised to restore balance, support skin health and deliver visible, long-term results.
              </p>
            </div>
            <div className="rounded-3xl overflow-hidden  h-[400px]">
              <img src="https://i.ibb.co/ksjp4tHP/IMG-0208-JPG.jpg" alt="Our Philosophy" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
            </div>
          </div>

          {/* Separator */}
          <div className="flex justify-center">
            <div className="w-24 h-1 bg-accent/20 rounded-full"></div>
          </div>

          {/* Our Approach */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 rounded-3xl overflow-hidden  h-[400px]">
              <img src="https://i.ibb.co/HLH9QWNW/IMG-0170-JPG.jpg" alt="Our Approach" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
            </div>
            <div className="order-1 md:order-2">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-accent" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Approach</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our treatments combine personalised techniques with carefully selected professional skincare products from France, Germany and Spain, chosen for their quality, effectiveness and skin-friendly formulations. Each session is designed to provide gentle yet effective care tailored to your skin.
              </p>
            </div>
          </div>

          {/* Separator */}
          <div className="flex justify-center">
            <div className="w-24 h-1 bg-accent/20 rounded-full"></div>
          </div>

          {/* Our Studio */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7 text-accent" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Studio</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Located in Bangsar, Kuala Lumpur, Noam Skin is a boutique home-based skin studio offering a calm, comfortable and private treatment environment where clients can relax and focus on their skin wellness.
              </p>
            </div>
            <div className="rounded-3xl overflow-hidden  h-[400px]">
              <img src="https://i.ibb.co/ZRJ2GfFB/IMG-3007-JPG.jpg" alt="Our Studio" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
            </div>
          </div>

          {/* Separator */}
          <div className="flex justify-center">
            <div className="w-24 h-1 bg-accent/20 rounded-full"></div>
          </div>

          {/* Designed for Your Schedule */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 rounded-3xl overflow-hidden  h-[400px]">
              <img src="https://i.ibb.co/qLQvSgT1/IMG-2868-JPG.jpg" alt="Designed for Your Schedule" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
            </div>
            <div className="order-1 md:order-2">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-accent" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Designed for Your Schedule</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Understanding that many clients have busy lifestyles, we offer evening appointment hours and remain open on selected holidays, making it easier to prioritise your skin care without disrupting your daily routine.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 mb-8">
        <div className="container mx-auto text-center max-w-3xl bg-accent/5 rounded-3xl p-12 border border-accent/10 shadow-lg">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready for Glowing Skin?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Book your customised treatment today and start your journey towards healthier, balanced skin.
          </p>
          <div className="flex justify-center">
            <Link to="/book">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-10 py-6 text-lg rounded-xl shadow-xl shadow-accent/20 transition-all hover:-translate-y-1">
                Book an Appointment
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
