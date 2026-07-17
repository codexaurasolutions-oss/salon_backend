import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText, CheckCircle, AlertTriangle, Scale, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { motion } from "framer-motion";

const TermsOfService = () => {
    useEffect(() => {
        const timer = setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const sections = [
        {
            icon: CheckCircle,
            title: "1. Acceptance of Terms",
            content: "By accessing and using Noamskin's platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.",
        },
        {
            icon: FileText,
            title: "2. Use License",
            content: "Permission is granted to temporarily use the Noamskin platform for personal or business salon management purposes. This is the grant of a license, not a transfer of title.",
            list: [
                "Modify or copy the materials",
                "Attempt to decompile or reverse engineer software",
                "Remove any copyright or proprietary notations",
                "Transfer materials to another person or mirror them"
            ]
        },
        {
            icon: AlertTriangle,
            title: "3. Disclaimer",
            content: "The materials on Noamskin's platform are provided on an 'as is' basis. Noamskin makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including merchantability or non-infringement.",
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
                                <Scale className="w-4 h-4 text-[#B07D62]" />
                                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#B07D62]">
                                    Platform Usage Rights
                                </span>
                            </div>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-6xl md:text-8xl font-black text-[#1A2338] tracking-tighter uppercase leading-none"
                        >
                            Terms of<br />Service
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-xl text-slate-500 font-medium italic max-w-2xl mx-auto leading-relaxed"
                        >
                            "Excellence thrives on mutual understanding. Our terms are designed to ensure a fair, transparent, and high-standard partnership for every user."
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

                        {/* Governing Law Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-[#1A2338] rounded-[3rem] p-12 md:p-16 text-white text-center space-y-8"
                        >
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight uppercase">Governing Law</h2>
                            <p className="text-slate-300 opacity-80 text-lg max-w-xl mx-auto">
                                These terms and conditions are governed by and construed in accordance with the laws of Malaysia.
                            </p>
                            <div className="pt-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">JURISDICTION</span>
                                    <p className="text-xl font-bold italic">Kuala Lumpur, Malaysia</p>
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

export default TermsOfService;
