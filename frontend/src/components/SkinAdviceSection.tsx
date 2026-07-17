import { motion } from "framer-motion";
import { ChevronRight, User, Sparkles, MessageCircle } from "lucide-react";

const SkinAdviceSection = () => {

    const whatsappNumber = "601123198819";

    return (
        <section className="pb-24 bg-white relative">
            <div className="max-w-[1400px] mx-auto px-4">

                <div className="flex flex-col md:flex-row gap-5">

                    {/* 1. NEW CLIENT */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-[#F3EFE9] flex-1 rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all"
                        onClick={() =>
                            window.open(
                                `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                                    "Hi, I’m a new client. I’d like to book a facial. Can you guide me on what suits my skin?"
                                )}`,
                                "_blank"
                            )
                        }
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300">
                                <User size={18} className="text-gray-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-[#1A2338]">New Client</p>
                                <p className="text-sm text-gray-500">
                                    New here? Start your skin journey.
                                </p>
                            </div>
                        </div>

                        <ChevronRight className="text-gray-400" />
                    </motion.div>


                    {/* 2. SIGNATURE FACIAL */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-[#F3EFE9] flex-1 rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all"
                        onClick={() => window.location.href = "/services-simple"}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300">
                                <Sparkles size={18} className="text-gray-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-[#1A2338]">
                                    Noam's Signature Custom Facial
                                </p>
                                <p className="text-sm text-gray-500">
                                    A fully personalised facial experience.
                                </p>
                            </div>
                        </div>

                        <ChevronRight className="text-gray-400" />
                    </motion.div>


                    {/* 3. CONSULTATION */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-[#F3EFE9] flex-1 rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all"
                        onClick={() =>
                            window.open(
                                `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                                    "Hi, I’d like to ask about your facials."
                                )}`,
                                "_blank"
                            )
                        }
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300">
                                <MessageCircle size={18} className="text-gray-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-[#1A2338]">
                                    I Need a Consultation
                                </p>
                                <p className="text-sm text-gray-500">
                                    Chat with us on WhatsApp.
                                </p>
                            </div>
                        </div>

                        <ChevronRight className="text-gray-400" />
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default SkinAdviceSection;