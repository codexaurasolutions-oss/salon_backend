import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

const FeaturedFacialSection = () => {
    const navigate = useNavigate();

    const services = [
        { name: "BUCCAL MASSAGE", link: "/services-simple?search=Buccal" },
        { name: "FACIALS", link: "/services-simple?category=Facials" },
        { name: "SKIN CONSULT", link: "/services-simple?category=Consultation" },
    ];
    const facialService = {
        category: "Facial",
        redirect: "/services-simple",
    };
    const handleBookNow = () => {
        navigate(facialService.redirect, {
            state: { category: facialService.category },
        });
    };
    return (
        <section className="w-full grid grid-cols-1 md:grid-cols-2 items-center py-20">

            {/* LEFT IMAGE */}
            <div className="flex justify-center md:justify-start pl-6 md:pl-16 lg:pl-24 pl6">
                <div className="w-full max-w-[650px]">

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="relative rounded-[2.5rem] overflow-hidden"
                    >
                        <img
                            src="https://i.ibb.co/HTySgqhz/IMG-9100-JPG.jpg"
                            alt="facial treatment"
                            className="w-full h-[500px] md:h-[650px] object-cover"
                        />
                    </motion.div>

                </div>
            </div>

            {/* RIGHT CONTENT */}
            <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="w-full flex justify-center md:justify-start px-6 md:px-12 lg:px-20 mt-10 md:mt-0"
            >
                <div className="max-w-[520px] space-y-6">

                    {/* Tag */}
                    <span className="text-xs tracking-[0.25em] uppercase text-slate-500">
                        Best Seller
                    </span>

                    {/* Heading */}
                    <h2 className="text-4xl md:text-[3.2rem] leading-[1.1] font-medium text-[#1A2338]">
                        Noam SKN Custom Facial

                    </h2>

                    {/* Description */}
                    <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                        A fully customised facial tailored to your skin needs, using an advanced and intensive approach. Designed to target specific concerns with enhanced techniques and targeted treatment masks for visible, longer-lasting results.
                    </p>

                    {/* Button */}
                    {/* <button
                        onClick={handleBookNow}
                        className="mt-4 text-xs uppercase tracking-[0.3em] group"
                    >
                        BOOK NOW
                        <span className="block w-0 h-[1px] bg-black transition-all duration-300 group-hover:w-full mt-1"></span>
                    </button> */}

                </div>
            </motion.div>

        </section>
    );
};

export default FeaturedFacialSection;
