import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface FAQ {
    question: string;
    answer: string;
}

const FAQSection = () => {
    const navigate = useNavigate();
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqs: FAQ[] = [
        {
            question: "Do you accept male clients?",
            answer: "Yes. All our treatments are suitable for both men and women.",
        },
        {
            question: "Why is a booking deposit required?",
            answer:
                "The deposit secures your appointment time and ensures a smooth scheduling experience for all clients.",
        },
        {
            question:
                "I'm not sure which treatment is right for me. Can I consult the therapist first?",
            answer:
                "Absolutely. You can book a consultation to receive personalized recommendations before committing to a treatment.",
        },
        {
            question:
                "What products do you use, and are they safe for pregnant clients?",
            answer:
                "We use professional-grade skincare products sourced from France and Spain, chosen for their safety and effectiveness. Many of our treatments are pregnancy-friendly, and our therapists will guide you to the safest options.",
        },
    ];

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-24 px-4 bg-white overflow-hidden">
            <div className="container mx-auto max-w-5xl">
                {/* Header Block */}
                <div className="text-center mb-20 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="space-y-4"
                    >
                        <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.4em]">
                            ASSISTANCE & CLARITY
                        </span>
                        <h2 className="text-3xl md:text-5xl lg:text-[3rem] font-black text-[#1A2338] tracking-tight uppercase">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-sm md:text-base text-slate-400 font-medium max-w-2xl mx-auto">
                            Quick answers to help you understand our rituals and services better.
                        </p>
                    </motion.div>
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-6 mb-16">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-50 transition-all duration-300 hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)]"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full px-8 md:px-12 py-8 flex items-center justify-between text-left transition-colors"
                            >
                                <h3
                                    className={`text-lg md:text-xl font-black uppercase tracking-tight pr-8 transition-colors ${openIndex === index ? "text-[#55402f]" : "text-[#1A2338]"
                                        }`}
                                >
                                    {faq.question}
                                </h3>
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 transition-all duration-300"
                                    style={{ transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                    {openIndex === index ? (
                                        <Minus className="w-5 h-5 text-[#55402f]" />
                                    ) : (
                                        <Plus className="w-5 h-5" />
                                    )}
                                </div>
                            </button>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-8 md:px-12 pb-10 pt-2 border-t border-slate-50/50">
                                            <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed max-w-3xl">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* CTA Block */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <div className="inline-flex flex-col items-center gap-6">
                        <p className="text-slate-400 font-medium">Still have questions?</p>
                        <Button
                            onClick={() => navigate("/contact")}
                            className="h-16 px-12 bg-[#1A2338] hover:bg-[#55402f] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300  hover:-translate-y-1"
                        >
                            Book a Consultation
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default FAQSection;
