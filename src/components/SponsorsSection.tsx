
import { useEffect, useRef } from "react";

const sponsors = [
    { name: "433 Football", logo: "/sponsors/433-football.jpg" },
    { name: "PUBG Mobile", logo: "/sponsors/pubg-mobile.jpg" },
    { name: "Ideeza", logo: "/sponsors/ideeza-logo.png" },
    { name: "Habesha Creative Lab", logo: "/sponsors/habesha-creative-lab.png" },
    { name: "iceaddis", logo: "/sponsors/iceaddis.jpg" },
    { name: "Alliance EthioFrançaise", logo: "/sponsors/alliance-ethio-francaise.png" },
    { name: "ACES", logo: "/sponsors/aces-logo.jpg" },
    { name: "Chewatacon", logo: "/sponsors/chewatacon-logo.png" },
    { name: "Muqecha Studios", logo: "/sponsors/muqecha-studios.png" },
    { name: "D5 Game", logo: "/sponsors/d5-game-logo.png" },
    { name: "Tobiya Studio", logo: "/sponsors/tobiya-studio.png" },
];

const SponsorsSection = () => {
    return (
        <section className="py-12 bg-black/40 border-y border-white/5 backdrop-blur-sm overflow-hidden">
            <div className="container mx-auto px-4 mb-8 text-center">
                <h2 className="font-display text-2xl md:text-3xl tracking-wide text-muted-foreground/80 uppercase">
                    Our Partners
                </h2>
            </div>

            <div className="relative flex overflow-x-hidden group">
                <div className="py-2 animate-marquee whitespace-nowrap flex items-center gap-12 sm:gap-24 px-12">
                    {/* Double the list for seamless loop */}
                    {[...sponsors, ...sponsors].map((sponsor, index) => (
                        <div
                            key={`${sponsor.name}-${index}`}
                            className="relative w-32 h-24 sm:w-40 sm:h-32 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-110 opacity-70 hover:opacity-100"
                        >
                            <img
                                src={sponsor.logo}
                                alt={sponsor.name}
                                className="max-w-full max-h-full object-contain drop-shadow-lg"
                            />
                        </div>
                    ))}
                </div>

                <div className="absolute top-0 py-2 animate-marquee2 whitespace-nowrap flex items-center gap-12 sm:gap-24 px-12">
                    {[...sponsors, ...sponsors].map((sponsor, index) => (
                        <div
                            key={`${sponsor.name}-duplicate-${index}`}
                            className="relative w-32 h-24 sm:w-40 sm:h-32 flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-110 opacity-70 hover:opacity-100"
                        >
                            <img
                                src={sponsor.logo}
                                alt={sponsor.name}
                                className="max-w-full max-h-full object-contain drop-shadow-lg"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SponsorsSection;
