import { useNavigate } from "react-router-dom";

const HeroVideoCarousel = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full mt-28 px-3 md:px-4">
            <section className="relative w-full md:h-[600px] lg:h-[690px] overflow-hidden bg-[#FAF9F6] rounded-3xl">

                {/* Background Videos */}
                <div className="relative md:absolute md:inset-0 z-0 overflow-hidden rounded-3xl">

                    {/* Desktop Video */}
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="hidden md:block w-full h-full object-cover object-center"
                    >
                        <source src="/heromobile.mp4" type="video/mp4" />
                    </video>

                    {/* Mobile Video */}
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="block md:hidden w-full h-auto object-contain bg-[#FAF9F6] mobielvideo"
                    >
                        <source src="/heromobile.mp4" type="video/mp4" />
                    </video>

                </div>

            </section>
        </div>
    );
};

export default HeroVideoCarousel;