import { motion } from "framer-motion";
import logo from "@/assets/logo.png";

export default function SiteLoader() {
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-white"
        >
            <div className="absolute inset-0 flex items-center justify-center">
                {[1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{
                            scale: [0.8, 1.5],
                            opacity: [0.1, 0]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.8,
                            ease: "easeOut"
                        }}
                        className="absolute h-[300px] w-[300px] rounded-full border border-slate-100"
                    />
                ))}
            </div>

            <div className="relative flex flex-col items-center">
                <motion.div
                    initial={{ scale: 0.96, y: 12, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.8 }}
                    className="text-center"
                >
                    <motion.img
                        src={logo}
                        alt="Noamskin Logo"
                        animate={{ opacity: [0.92, 1, 0.92] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                        className="mb-5 h-28 w-auto md:h-32"
                    />

                    <div className="flex h-6 items-center justify-center gap-1.5">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    height: [8, 20, 8],
                                    opacity: [0.3, 1, 0.3]
                                }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: i * 0.15,
                                    ease: "easeInOut"
                                }}
                                className="w-1.5 rounded-full bg-[#4A6670]"
                            />
                        ))}
                    </div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-12 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400"
            >
                Preparing The Noamskin Experience
            </motion.div>
        </motion.div>
    );
}
