import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

const BecomeMemberSection = () => {
    return (
        <section className="bg-white pt-20">
            <div className="grid grid-cols-1 lg:grid-cols-2">

                {/* Text Content - Left Side */}
                <div className="flex items-center p-12 md:p-24 lg:p-32 xl:p-40 order-2 lg:order-1">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="max-w-xl space-y-8"
                    >
                        {/* Eyebrow - matches reference style */}
                        <div className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-[#1A1A1A] uppercase">
                            Exclusive Access
                        </div>

                        {/* Bold Uppercase Header */}
                        <h2 className="text-5xl md:text-6xl lg:text-[4rem] font-black text-[#0f172a] uppercase tracking-tighter leading-[1.05]">
                            BECOME A<br />MEMBER
                        </h2>

                        {/* Subheading */}
                        <p className="text-base text-slate-500 font-medium leading-[1.8] max-w-md">
                            Earn points with every treatment and product purchase.
                            Redeem rewards for your next visit.
                        </p>

                        {/* Minimal Text CTA matching "BOOK NOW" */}
                        <div className="pt-6">
                            <Link
                                to="/membership"
                                className="text-[10px] md:text-xs font-black text-[#1A1A1A] tracking-[0.3em] uppercase hover:underline underline-offset-8 transition-all"
                            >
                                EXPLORE MEMBERSHIP →
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Full Bleed Image - Right Side */}
                <div className="flex justify-center lg:justify-end p-4 md:pr-16 lg:pr-24 order-1 lg:order-2">
                    <div className="w-full max-w-[650px]">

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                            className="relative rounded-[2.5rem] overflow-hidden "
                        >
                            <img
                                src="https://i.ibb.co/RwVzrMC/IMG-9112-JPG.jpg" alt="Become a Member Experience"
                                className="w-full h-[500px] md:h-[650px] object-cover"
                            />
                        </motion.div>

                    </div>
                </div>


            </div>

            <section className="py-16 px-4 mb-8">
                <div className="container mx-auto text-center max-w-3xl bg-accent/5 rounded-3xl p-12 border border-accent/10 shadow-lg">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join Us?</h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        Sign up today to start earning rewards for your everyday skincare.
                    </p>
                    <div className="flex justify-center">
                        <Link to="/membership">
                            <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-10 py-6 text-lg rounded-xl shadow-xl shadow-accent/20 transition-all hover:-translate-y-1">
                                Become a Member
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </section>
    );
};

export default BecomeMemberSection;
