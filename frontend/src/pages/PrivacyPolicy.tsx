import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Lock, Eye, FileText, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { motion } from "framer-motion";

const PrivacyPolicy = () => {
    useEffect(() => {
        const timer = setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const sections = [
        {
            icon: Eye,
            title: "1. Information We Collect",
            content: "We collect information that you provide directly to us, including when you create an account, make a booking, or communicate with us.",
            list: [
                "Contact information (name, email address, phone number)",
                "Booking details and history",
                "Payment information (processed securely through our payment partners)",
                "Communication preferences and feedback"
            ]
        },
        {
            icon: Lock,
            title: "2. How We Use Your Information",
            content: "We use the collected information for various purposes to provide and maintain our Service safely and efficiently.",
            list: [
                "To provide and maintain our Service",
                "To notify you about changes to our Service",
                "To provide customer support",
                "To gather analysis to improve our Service",
                "To monitor the usage of our Service"
            ]
        },
        {
            icon: Shield,
            title: "3. Data Security",
            content: "The security of your data is our priority. We strive to use commercially acceptable means to protect your Personal Data, acknowledging that no method of transmission over the Internet is 100% secure.",
        },
    ];

    return (
        <div className="min-h-screen bg-[#FDFCFB]">
            <Navbar />

            <main className="pt-40 pb-32">
                <div className="container mx-auto px-4">
                    {/* Header Section */}
                    <div className="max-w-4xl mx-auto text-center mb-24 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-center"
                        >
                            <div className="inline-flex items-center gap-3 bg-[#F5EFEA]/80 backdrop-blur-sm border border-[#E8DFD8] px-6 py-2.5 rounded-full">
                                <Shield className="w-4 h-4 text-[#B07D62]" />
                                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#B07D62]">
                                    Digital Trust Framework
                                </span>
                            </div>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-6xl md:text-8xl font-black text-[#1A2338] tracking-tighter uppercase leading-none"
                        >
                            Privacy<br />Policy
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-xl text-slate-500 font-medium italic max-w-2xl mx-auto leading-relaxed"
                        >
                            "Transparency is the foundation of our partnership. We are committed to protecting your presence in our digital space."
                        </motion.p>
                    </div>

                    {/* Content Sections */}
                    <div className="max-w-5xl mx-auto space-y-12">
                        {sections.map((section, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group bg-white rounded-[3rem] p-10 md:p-16 shadow-[0_32px_64px_-16px_rgba(26,35,56,0.06)] border border-slate-50 flex flex-col md:flex-row gap-12 items-start"
                            >
                                <div className="flex-shrink-0 w-24 h-24 rounded-[2rem] bg-[#FDFCFB] border border-slate-100 flex items-center justify-center text-[#B07D62] shadow-inner group-hover:scale-110 transition-transform duration-500">
                                    <section.icon className="w-10 h-10" />
                                </div>

                                <div className="flex-grow space-y-6">
                                    <h2 className="text-3xl md:text-4xl font-black text-[#1A2338] tracking-tight uppercase">
                                        {section.title}
                                    </h2>
                                    <p className="text-lg text-slate-500 font-medium leading-relaxed">
                                        {section.content}
                                    </p>
                                    {section.list && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                            {section.list.map((item, i) => (
                                                <div key={i} className="flex items-start gap-3 group/item">
                                                    <div className="mt-1.5 flex-shrink-0 w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center group-hover/item:bg-[#B07D62]/10 transition-colors">
                                                        <ChevronRight className="w-3 h-3 text-slate-300 group-hover/item:text-[#B07D62]" />
                                                    </div>
                                                    <span className="text-base text-slate-400 font-medium leading-normal italic">
                                                        {item}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {/* Contact Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-[#1A2338] rounded-[3rem] p-12 md:p-16 text-white text-center space-y-8"
                        >
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase">Questions?</h2>
                            <p className="text-slate-300 opacity-80 text-lg max-w-xl mx-auto">
                                If you have any questions about this Privacy Policy, our experts are here to help clarify.
                            </p>
                            <div className="flex flex-col md:flex-row justify-center gap-8 md:gap-16 pt-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">EMAIL US</span>
                                    <p className="text-xl font-bold">skinnoam@gmail.com</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">VISIT US</span>
                                    <p className="text-xl font-bold">Bangsar, Kuala Lumpur</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
