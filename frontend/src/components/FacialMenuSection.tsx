import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus } from "lucide-react";

const facials = [
    {
        id: "detox",
        title: "Detox + Glow Facial",
        description: "A deep-cleansing facial designed to purify the skin while keeping it calm and balanced. This treatment focuses on clearing congestion, reducing inflammation, and supporting healthy skin function — without stripping or over-drying.",
        for: "Acne-prone, oily, congested skin.",
        result: "Skin feels clean, clear, & refreshed, less congested, & visibly healthier.",
        image: "https://i.ibb.co/6cq8nwXw/491575c8-285c-411b-b187-930434e6f7e1.jpg",
        imageLabel: "Luxury Facial Treatment"
    },
    {
        id: "regeneration",
        title: "Absolute Regeneration",
        description: "A powerful age-defying treatment that stimulates cellular renewal and provides intense hydration. Ideal for restoring a youthful radiance and firming the skin's texture.",
        for: "Mature, dry, or tired skin.",
        result: "Visibly firmer, smoother, and more radiant complexion.",
        image: "https://i.ibb.co/7tmhgNHW/9b02eb3d-955e-4664-8cc1-732dae646112.jpg",
        imageLabel: "Advanced Skin Recovery"
    },
    {
        id: "hydra",
        title: "The Smart Hydra Programme",
        description: "A comprehensive hydration boost using advanced moisture-binding technologies. Designed to quench the deepest layers of the skin, leaving it plump and revitalized.",
        for: "Dehydrated, dull, or stressed skin.",
        result: "Deeply hydrated, glowing, and supple skin.",
        image: "https://i.ibb.co/YFmynKJX/fcce72cd-a4a6-463f-ad06-8e919dc5c3a8.jpg",
        imageLabel: "Moisture Lock Technology"
    }
];

const FacialMenuSection = () => {
    const [activeId, setActiveId] = useState("detox");

    const activeFacial = facials.find(f => f.id === activeId) || facials[0];

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-4 md:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

                    {/* Left Column: Menu */}
                    <div className="space-y-12">
                        <h2 className="text-3xl md:text-5xl lg:text-[3rem] font-black text-[#1A2338] tracking-tight uppercase mb-16">
                            Our Facial Menu
                        </h2>

                        <div className="space-y-8">
                            {facials.map((facial) => (
                                <div key={facial.id} className="border-b border-slate-100 pb-8 last:border-0">
                                    <button
                                        onClick={() => setActiveId(facial.id)}
                                        className="w-full flex items-center justify-between group transition-all"
                                    >
                                        <h3 className={`text-xl md:text-2xl font-black tracking-tight uppercase ${activeId === facial.id ? 'text-[#1A2338]' : 'text-slate-400 group-hover:text-slate-600'}`}>
                                            {facial.title}
                                        </h3>
                                        {activeId === facial.id ? (
                                            <Minus className="w-5 h-5 text-slate-400" />
                                        ) : (
                                            <Plus className="w-5 h-5 text-slate-300 group-hover:text-slate-400 transition-all" />
                                        )}
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {activeId === facial.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <div className="pt-6 space-y-6">
                                                    <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed">
                                                        {facial.description}
                                                    </p>

                                                    <div className="space-y-2">
                                                        <p className="text-sm md:text-base font-black text-[#1A2338]">
                                                            For: <span className="font-medium text-slate-500 tracking-normal capitalize">{facial.for}</span>
                                                        </p>
                                                        <p className="text-sm md:text-base font-black text-[#1A2338]">
                                                            Result: <span className="font-medium text-slate-500 tracking-normal capitalize">{facial.result}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Dynamic Image */}
                    <div className="relative">
                        <div className="sticky top-24">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeId}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.5 }}
                                    className="relative aspect-square md:aspect-[4/4] rounded-[2.5rem] overflow-hidden "
                                >
                                    <div className="absolute top-6 left-6 z-10">
                                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] bg-white/80 backdrop-blur-md px-4 py-2 rounded-full">
                                            {activeFacial.imageLabel}
                                        </span>
                                    </div>
                                    <img
                                        src={activeFacial.image}
                                        alt={activeFacial.title}
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>
                            </AnimatePresence>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default FacialMenuSection;
