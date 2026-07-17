// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import api from "@/services/api";
// import { getImageUrl } from "@/utils/imageUrl";

// const InsideSpaceSection = () => {
//     const navigate = useNavigate();
//     const [services, setServices] = useState<any[]>([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const fetchDynamicServices = async () => {
//             try {
//                 setLoading(true);
//                 const data = await api.services.getAll();

//                 let items: any[] = [];
//                 const fallbacks = [
//                     { id: "facials", title: "Facials", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop" },
//                     { id: "body-massages", title: "Body Massages", image: "https://images.unsplash.com/photo-1544161515-4af6b1d46af0?w=800&auto=format&fit=crop" },
//                     { id: "acupuncture", title: "Acupuncture", image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800&auto=format&fit=crop" },
//                     { id: "tea-bar", title: "Tea Bar", image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc206e?w=800&auto=format&fit=crop" },
//                 ];

//                 if (data && data.length > 0) {
//                     items = data.slice(0, 4).map((service: any) => ({
//                         id: service.id,
//                         title: service.name,
//                         image: service.image_url || service.cover_image_url
//                     }));
//                 }

//                 // Fill remaining slots with fallbacks if less than 4
//                 if (items.length < 4) {
//                     const existingTitles = new Set(items.map(s => s.title));
//                     fallbacks.forEach(f => {
//                         if (items.length < 4 && !existingTitles.has(f.title)) {
//                             items.push(f);
//                         }
//                     });
//                 }

//                 setServices(items);
//             } catch (error) {
//                 console.error("[InsideSpaceSection] Error fetching:", error);
//                 setServices([
//                     { id: "f1", title: "Facials", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop" },
//                     { id: "f2", title: "Body Massages", image: "https://images.unsplash.com/photo-1544161515-4af6b1d46af0?w=800&auto=format&fit=crop" },
//                     { id: "f3", title: "Acupuncture", image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800&auto=format&fit=crop" },
//                     { id: "f4", title: "Tea Bar", image: "https://images.unsplash.com/photo-1512290923902-8a9f81dc206e?w=800&auto=format&fit=crop" },
//                 ]);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchDynamicServices();
//     }, []);

//     const handleServiceClick = (service: any) => {
//         // If it's a fallback ID, maybe navigate to category search or skip
//         if (service.id.startsWith('f') || service.id.length < 5) {
//             navigate(`/salons?category=${encodeURIComponent(service.title)}`);
//         } else {
//             navigate(`/services/${service.id}`);
//         }
//     };

//     return (
//         <section className="py-24 px-4 bg-muted/30 overflow-hidden">
//             <div className="container mx-auto">
//                 <div className="max-w-4xl mx-auto text-center mb-16 px-4">
//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         whileInView={{ opacity: 1, y: 0 }}
//                         viewport={{ once: true }}
//                         transition={{ duration: 0.8 }}
//                         className="space-y-4"
//                     >
//                         <h2 className="text-4xl md:text-5xl lg:text-[3rem] font-bold text-foreground tracking-tight ">
//                             Inside Our Space Salons
//                         </h2>
//                     </motion.div>
//                 </div>

//                 <div className="max-w-[1400px] mx-auto px-4 lg:px-12">
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
//                         {loading ? (
//                             Array(4).fill(0).map((_, i) => (
//                                 <div key={i} className="animate-pulse space-y-8">
//                                     <div className="bg-slate-200 aspect-square rounded-[48px]" />
//                                     <div className="h-8 bg-slate-100 w-3/4 mx-auto rounded" />
//                                 </div>
//                             ))
//                         ) : (
//                             services.map((service, index) => (
//                                 <motion.div
//                                     key={service.id || index}
//                                     initial={{ opacity: 0, y: 20 }}
//                                     whileInView={{ opacity: 1, y: 0 }}
//                                     viewport={{ once: true }}
//                                     transition={{ delay: index * 0.1, duration: 0.6 }}
//                                 >
//                                     <div
//                                         onClick={() => handleServiceClick(service)}
//                                         className="group cursor-pointer flex flex-col items-center space-y-8"
//                                     >
//                                         <div className="relative w-full aspect-square rounded-[30px] overflow-hidden transition-all duration-700 shadow-sm group-hover:shadow-2xl active:scale-[0.98]">
//                                             <img
//                                                 src={getImageUrl(service.image, 'service', service.id)}
//                                                 alt={service.title}
//                                                 className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
//                                                 onError={(e) => {
//                                                     const target = e.target as HTMLImageElement;
//                                                     target.src = "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800";
//                                                 }}
//                                             />
//                                         </div>

//                                         <div className="text-center relative">
//                                             <h3 className="font-bold text-2xl  text-foreground transition-colors" style={{fontSize: "20px"}}>
//                                                 {service.title}
//                                             </h3>
//                                             {/* <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-foreground origin-center" /> */}
//                                         </div>
//                                     </div>
//                                 </motion.div>
//                             ))
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </section>
//     );
// };

// export default InsideSpaceSection;








import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const InsideSpaceSection = () => {
    const navigate = useNavigate();

    // ✅ Static Services (tum yaha se control karoge)
    const services = [
        {

            title: "Facials",
            category: "Facial",
            image: "/images/1.jpeg",
            redirect: "/services-simple" // 👈 yaha change karna hai
        },
        {

            title: "Laser Hair Removal ",
            category: "Laser",
            image: "/images/2.jpeg",
            redirect: "/services-simple"
        },
        {

            title: "Skin Programmes",
            category: "Skin Care",
            image: "/images/3.jpeg",
            redirect: "/services-simple"
        },
        {

            title: "Skin Care",
            category: null,
            image: "/images/4.jpeg",
            redirect: "/shop"
        }
    ];
    const handleServiceClick = (service: any) => {
        navigate(service.redirect, {
            state: { category: service.category }
        });
    };

    return (
        <section className="py-24 px-4 bg-muted/30 overflow-hidden mobileinsight">
            <div className="container mx-auto">
                <div className="max-w-4xl mx-auto text-center mb-16 px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="space-y-4"
                    >
                        <h2 className="text-4xl md:text-5xl lg:text-[3rem] font-bold text-foreground tracking-tight">
                            Inside Our Space
                        </h2>
                    </motion.div>
                </div>

                <div className="max-w-[1400px] mx-auto px-4 lg:px-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                        {services.map((service, index) => (
                            <motion.div
                                key={`${service.title}-${service.redirect}`}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                            >
                                <div
                                    onClick={() => handleServiceClick(service)}
                                    className="group cursor-pointer flex flex-col items-center space-y-8"
                                >
                                    <div className="relative w-full aspect-square rounded-[30px] overflow-hidden transition-all duration-700 shadow-sm group-hover:shadow-2xl active:scale-[0.98]">
                                        <img
                                            src={service.image}
                                            alt={service.title}
                                            className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                                        />
                                    </div>

                                    <div className="text-center relative">
                                        <h3
                                            className="font-bold text-2xl text-foreground"
                                            style={{ fontSize: "20px" }}
                                        >
                                            {service.title}
                                        </h3>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InsideSpaceSection;
