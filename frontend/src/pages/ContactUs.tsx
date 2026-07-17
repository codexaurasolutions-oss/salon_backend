import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import { CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: ""
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.contactEnquiries.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        inquiry_type: formData.inquiryType,
      });

      setShowSuccess(true);

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        inquiryType: ""
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background pb-0">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 text-center mt-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-6 text-foreground">
          Get in Touch
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
          We respect your privacy and look forward to hearing from you. Whether you have a question about our services or want to book an appointment, our team is ready to help.
        </p>
      </section>

      {/* Screenshot Style Contact Cards */}
      <section className="py-24 bg-[#8B5A33] text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="text-xs tracking-[0.2em] uppercase font-light opacity-80">Let's Connect</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-y-12 md:gap-y-0">
            {/* Phone */}
            <div className="flex flex-col items-center text-center px-6 relative md:border-r border-white/20">
              <h3 className="text-3xl font-serif mb-6">Phone</h3>
              <p className="text-[10px] tracking-[0.2em] uppercase mb-4 opacity-80">CALL US</p>
              <div className="w-12 h-px bg-white/40 mb-8" />
              <a href="tel:01123198819" className="text-sm font-light hover:opacity-70 transition-opacity">011 23198819</a>
            </div>

            {/* Email */}
            <div className="flex flex-col items-center text-center px-6 relative md:border-r border-white/20">
              <h3 className="text-3xl font-serif mb-6">Email</h3>
              <p className="text-[10px] tracking-[0.2em] uppercase mb-4 opacity-80">WRITE TO US</p>
              <div className="w-12 h-px bg-white/40 mb-8" />
              <a href="mailto:skinnoam@gmail.com" className="text-sm font-light hover:opacity-70 transition-opacity">skinnoam@gmail.com</a>
            </div>

            {/* WhatsApp */}
            <div className="flex flex-col items-center text-center px-6 relative md:border-r border-white/20">
              <h3 className="text-3xl font-serif mb-6">WhatsApp</h3>
              <p className="text-[10px] tracking-[0.2em] uppercase mb-4 opacity-80">CHAT WITH US</p>
              <div className="w-12 h-px bg-white/40 mb-8" />
              <a href="https://wa.me/601123198819" target="_blank" rel="noopener noreferrer" className="text-sm font-light hover:opacity-70 transition-opacity">011 23198819</a>
            </div>

            {/* Visit Us */}
            <div className="flex flex-col items-center text-center px-6 relative">
              <h3 className="text-3xl font-serif mb-6">Visit Us</h3>
              <p className="text-[10px] tracking-[0.2em] uppercase mb-4 opacity-80">DROP BY</p>
              <div className="w-12 h-px bg-white/40 mb-8" />
              <a href="#map" className="text-sm font-light hover:opacity-70 transition-opacity">Bangsar, KL</a>
            </div>
          </div>
        </div>
      </section>

      {/* Two Column Form & Location */}
      <section className="py-24 px-4 bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-20 items-start">

            {/* Form Left */}
            <div>
              <h2 className="text-3xl md:text-4xl font-serif mb-12 text-foreground">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-medium">Full Name *</label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="border-0 border-b border-border hover:border-foreground rounded-none px-0 bg-transparent focus-visible:ring-0 focus-visible:border-foreground transition-colors shadow-none text-base font-light"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-medium">Email Address *</label>
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="border-0 border-b border-border hover:border-foreground rounded-none px-0 bg-transparent focus-visible:ring-0 focus-visible:border-foreground transition-colors shadow-none text-base font-light"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-medium">Phone Number</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="border-0 border-b border-border hover:border-foreground rounded-none px-0 bg-transparent focus-visible:ring-0 focus-visible:border-foreground transition-colors shadow-none text-base font-light"
                      placeholder="011 23198819"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-medium">Inquiry Type</label>
                    <Select value={formData.inquiryType} onValueChange={(value) => handleInputChange("inquiryType", value)}>
                      <SelectTrigger className="border-0 border-b border-border hover:border-foreground rounded-none px-0 bg-transparent focus:ring-0 focus:border-foreground transition-colors shadow-none h-10 text-base font-light">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="appointment">Book Appointment</SelectItem>
                        <SelectItem value="service">Service Question</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-medium">Subject *</label>
                  <Input
                    required
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    className="border-0 border-b border-border hover:border-foreground rounded-none px-0 bg-transparent focus-visible:ring-0 focus-visible:border-foreground transition-colors shadow-none text-base font-light"
                    placeholder="Brief description"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-medium">Message *</label>
                  <Textarea
                    required
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    className="border-0 border-b border-border hover:border-foreground rounded-none px-0 bg-transparent focus-visible:ring-0 focus-visible:border-foreground transition-colors shadow-none resize-none min-h-[120px] text-base font-light"
                    placeholder="How can we help you?"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-[#8B5A33] hover:bg-[#684c39] text-white px-12 py-7 mt-4 text-xs uppercase tracking-[0.2em] rounded-none transition-all"
                >
                  {loading ? "Sending..." : "Submit Inquiry"}
                </Button>
              </form>
            </div>

            {/* Location Right */}
            <div className="lg:pl-16 lg:border-l border-border mt-16 lg:mt-0 pb-16">
              <h2 className="text-3xl md:text-4xl font-serif mb-12 text-foreground">Our Studio</h2>
              <div className="space-y-12">
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-4 text-muted-foreground">Address</h4>
                  <p className="font-light leading-loose text-[15px]">
                    <strong className="font-medium">Noamskin</strong><br />
                    46 Jalan Limau Nipis,<br />
                    59000 Bangsar,<br />
                    Kuala Lumpur
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-4 text-muted-foreground">Operating Hours</h4>
                  {/* <p className="font-light leading-loose text-[15px]">
                    Monday: Closed<br />
                    Tuesday: 2 PM - 12 AM<br />
                    Wednesday: 11 AM - 7 PM<br />
                    Thursday: Closed<br />
                    Friday: 2 PM - 12 AM<br />
                    Saturday: 2 PM - 12 AM<br />
                    Sunday: 11 AM - 7 PM
                  </p> */}

                  <p className="font-light leading-loose text-[15px]">
                    Wednesday - Sunday : 11:00 AM - 11 :00 PM<br />
                    Monday - Tuesday : CLOSED<br />


                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-4 text-muted-foreground">Socials</h4>
                  <div className="flex gap-6">
                    <a href="#" className="font-light hover:text-[#8B5A33] transition-colors text-[15px] underline underline-offset-4">Instagram</a>
                    <a href="#" className="font-light hover:text-[#8B5A33] transition-colors text-[15px] underline underline-offset-4">Facebook</a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Map Segment */}
      <section id="map" className="w-full h-[550px] grayscale hover:grayscale-0 transition-all duration-700 opacity-90 hover:opacity-100">
        <iframe
          src="https://maps.google.com/maps?q=46%20Jalan%20Limau%20Nipis,%2059000%20Bangsar,%20Kuala%20Lumpur&t=&z=16&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Noamskin Salon Location Map"
        />
      </section>

      <Footer />

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="w-[92vw] sm:max-w-md rounded-3xl p-8 text-center">
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <DialogTitle className="text-2xl font-black text-slate-900">Message Sent!</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium text-base">
              Thank you for reaching out. We'll get back to you within 24 hours.
            </DialogDescription>
            <Button onClick={() => setShowSuccess(false)} className="mt-4 h-12 px-10 rounded-2xl bg-slate-900 hover:bg-black text-white font-black">
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactUs;
