
const organizers = [
    { name: "EGA", logo: "/sponsors/ega-logo.jpg" },
    { name: "Orange", logo: "/sponsors/orange-dots.jpg" },
];

const OrganizersSection = () => {
    return (
        <section className="py-20 bg-black/60 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10 text-center">
                <h2 className="font-display text-2xl md:text-3xl tracking-wide text-white mb-12 uppercase">
                    Organized By
                </h2>

                <div className="flex flex-wrap items-center justify-center gap-16 md:gap-24">
                    {organizers.map((organizer) => (
                        <div
                            key={organizer.name}
                            className="group relative w-48 h-32 md:w-60 md:h-40 flex items-center justify-center transition-transform hover:scale-105 duration-500"
                        >
                            {/* Glass card effect */}
                            <div className="absolute inset-0 bg-white/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <img
                                src={organizer.logo}
                                alt={organizer.name}
                                className="max-w-full max-h-full object-contain drop-shadow-2xl relative z-10 filter grayscale hover:grayscale-0 transition-all duration-500"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default OrganizersSection;
