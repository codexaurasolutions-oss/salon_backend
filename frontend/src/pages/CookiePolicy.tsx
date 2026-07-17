import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Cookie, Info, Settings, ShieldCheck, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { motion } from "framer-motion";

const CookiePolicy = () => {
    useEffect(() => {
        const timer = setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const sections = [
        {
            icon: Info,
            title: "1. What are Cookies?",
            content: "Cookies are small text files placed on your device to help websites work more efficiently and provide valuable information to site owners.",
        },
        {
            icon: ShieldCheck,
            title: "2. How We Use Cookies",
            content: "We use cookies to personalize your experience and analyze our traffic to provide better services.",
            grid: [
                {
                    title: "Essential Cookies",
                    desc: "Necessary for the website to function, such as secure login and session management."
                },
                {
                    title: "Performance Cookies",
                    desc: "Help us count visitors and understand how they navigate our digital space."
                }
            ]
        },
        {
            icon: Settings,
            title: "3. Managing Cookies",
            content: "Most browsers allow you to control cookies through their settings. You can learn more about managing your digital footprint at global privacy resources.",
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
                                <Cookie className="w-4 h-4 text-[#B07D62]" />
                                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#B07D62]">
                                    User Privacy Control
                                </span>
                            </div>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-6xl md:text-8xl font-black text-[#1A2338] tracking-tighter uppercase leading-none"
                        >
                            Cookie<br />Policy
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-xl text-slate-500 font-medium italic max-w-2xl mx-auto leading-relaxed"
                        >
                            "Your digital comfort is as important as your physical relaxation. We use cookies to tailor a seamless and personalized experience for every ritual."
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

                                    {section.grid && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                            {section.grid.map((item, i) => (
                                                <div key={i} className="p-8 rounded-[2rem] bg-[#FDFCFB] border border-slate-100 space-y-3 group/item hover:border-[#B07D62]/30 transition-colors">
                                                    <h3 className="text-lg font-black text-[#1A2338] uppercase tracking-tight">
                                                        {item.title}
                                                    </h3>
                                                    <p className="text-sm text-slate-400 font-medium leading-relaxed italic">
                                                        {item.desc}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {/* Question Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-[#1A2338] rounded-[3rem] p-12 md:p-16 text-white text-center space-y-8"
                        >
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase">Questions?</h2>
                            <p className="text-slate-300 opacity-80 text-lg max-w-xl mx-auto">
                                If you have any concerns regarding how we use cookies, our privacy team is here to provide clarity.
                            </p>
                            <div className="pt-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">DIRECT ENQUIRY</span>
                                    <p className="text-xl font-bold">skinnoam@gmail.com</p>
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

export default CookiePolicy;
