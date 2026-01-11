
import { Calendar, MapPin, Clock, Info, Ticket, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { createReservation } from "@/services/reservationService";

interface TimelineEvent {
    time?: string;
    title: string;
    description?: string;
    speakers?: string;
    reservable?: boolean;
}

interface TimelineDay {
    day: string;
    date?: string;
    venue?: string;
    events: TimelineEvent[];
}

interface TimelinePhase {
    title: string;
    days: TimelineDay[];
}

const OtherEvents = () => {
    const [open, setOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<string>("");
    const [userName, setUserName] = useState("");
    const [contactInfo, setContactInfo] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReserve = (eventTitle: string) => {
        setSelectedEvent(eventTitle);
        setOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userName || !contactInfo) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsSubmitting(true);
        const { success, error } = await createReservation(selectedEvent, userName, contactInfo);
        setIsSubmitting(false);

        if (success) {
            toast.success("Spot reserved successfully!");
            setOpen(false);
            setUserName("");
            setContactInfo("");
        } else {
            toast.error("Failed to reserve spot: " + (error || "Unknown error"));
        }
    };

    const schedule: TimelinePhase[] = [
        {
            title: "Pre-Event",
            days: [
                {
                    day: "Monday",
                    events: [
                        {
                            title: "Award Voting Opens (Public)",
                            reservable: false
                        }
                    ]
                },
                {
                    day: "Wednesday",
                    date: "Jan 21",
                    events: [
                        {
                            time: "7:00 PM – 9:00 PM",
                            title: "Soft Launch (Online)",
                            speakers: "Led by: Yared, Jo, Freadam",
                            reservable: true
                        }
                    ]
                }
            ]
        },
        {
            title: "On-Event",
            days: [
                {
                    day: "Friday",
                    date: "Jan 24",
                    venue: "Tentative Venue: Creative Hub",
                    events: [
                        {
                            time: "5:00 PM – 6:00 PM",
                            title: "Official Opening & Keynotes",
                            reservable: true
                        },
                        {
                            time: "6:00 PM – 6:30 PM",
                            title: "Addis Games Week Game Jam Kick-off",
                            reservable: true
                        },
                        {
                            time: "6:30 PM – 8:00 PM",
                            title: "Expo & Job Fair",
                            description: "Brat’s Memorial Product Showcase",
                            reservable: true
                        }
                    ]
                },
                {
                    day: "Saturday",
                    date: "Jan 25",
                    venue: "Tentative Venue: Creative Hub or Alliance Ethio-France",
                    events: [
                        {
                            time: "2:00 PM – 3:30 PM",
                            title: "Talk Esports – Esports as a Career",
                            speakers: "Emmanuel, Emmanuel, Cloud Bura, EDI / Ministry of Sport & Culture, Alliance, Bernard (Canada)",
                            reservable: true
                        },
                        {
                            time: "3:45 PM – 5:00 PM",
                            title: "Games for Change vs Entertainment (Fireside Chat)",
                            speakers: "Dagmawi, Jo, Bruke",
                            reservable: true
                        },
                        {
                            time: "5:30 PM – 7:00 PM",
                            title: "The Future of Learning – Extended Reality",
                            speakers: "Oliyad & Dani",
                            reservable: true
                        },
                        {
                            time: "7:00 PM – 9:00 PM",
                            title: "Press & Play – Free Game Day",
                            reservable: true
                        }
                    ]
                },
                {
                    day: "Sunday",
                    date: "Jan 26",
                    venue: "Tentative Venue: Creative Hub or Alliance Ethio-France",
                    events: [
                        {
                            time: "9:30 PM – 11:30 PM",
                            title: "Masterclass 01 – Game Development Studios as a Business",
                            reservable: true
                        },
                        {
                            time: "12:00 AM – 2:00 AM",
                            title: "Masterclass 02 – Tournament Organization & Streaming Production",
                            speakers: "Emmanuel & Kidus / Qkwecy",
                            reservable: true
                        },
                        {
                            time: "2:00 AM – 2:30 AM",
                            title: "Game Jam Closing",
                            reservable: true
                        },
                        {
                            time: "3:00 AM – 6:00 AM",
                            title: "Award Ceremony",
                            reservable: true
                        }
                    ]
                }
            ]
        }
    ];

    return (
        <section className="py-20 px-4 relative overflow-hidden" id="events-calendar">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background via-background/95 to-background -z-10" />
            <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] -z-10" />

            <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-16">
                    <h2 className="font-display text-4xl md:text-5xl tracking-wide mb-6">
                        EVENT CALENDAR
                    </h2>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-4">
                        <Clock className="w-4 h-4" />
                        <span>Time Zone: GMT +6</span>
                    </div>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                        Join us for a week of gaming, learning, and celebration.
                    </p>
                </div>

                <div className="space-y-16">
                    {schedule.map((phase, phaseIndex) => (
                        <div key={phaseIndex} className="relative">
                            <h3 className="font-display text-2xl text-primary mb-8 border-b border-primary/20 pb-2 inline-block">
                                {phase.title}
                            </h3>

                            <div className="grid gap-8">
                                {phase.days.map((day, dayIndex) => (
                                    <div
                                        key={dayIndex}
                                        className="relative pl-8 md:pl-0"
                                    >
                                        {/* Timeline styling for desktop */}
                                        <div className="hidden md:block absolute left-[149px] top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 to-transparent" />

                                        <div className="flex flex-col md:flex-row gap-8">
                                            {/* Date Column */}
                                            <div className="md:w-[150px] flex-shrink-0 pt-2 relative">
                                                <div className="md:text-right sticky top-24 pr-6">
                                                    <div className="font-display text-2xl text-white mb-1">{day.day}</div>
                                                    {day.date && <div className="text-primary font-medium">{day.date}</div>}
                                                    <div className="hidden md:block absolute right-[-9px] top-3 w-4 h-4 rounded-full bg-background border-2 border-primary z-10" />
                                                </div>
                                            </div>

                                            {/* Content Column */}
                                            <div className="flex-grow space-y-4">
                                                {day.venue && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg border border-white/5 mb-4 w-fit">
                                                        <MapPin className="w-4 h-4 text-primary" />
                                                        {day.venue}
                                                    </div>
                                                )}

                                                <div className="grid gap-4">
                                                    {day.events.map((event, eventIndex) => (
                                                        <div
                                                            key={eventIndex}
                                                            className="group relative bg-gradient-to-br from-card/50 to-card/20 border border-white/5 rounded-xl p-5 hover:border-primary/30 transition-all duration-300 hover:translate-x-1"
                                                        >
                                                            <div className="flex flex-col md:flex-row md:items-start gap-4">
                                                                {event.time && (
                                                                    <div className="flex-shrink-0 min-w-[140px]">
                                                                        <div className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/20">
                                                                            <Clock className="w-3 h-3" />
                                                                            {event.time}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                <div className="flex-grow">
                                                                    <h4 className="font-display text-lg tracking-wide text-foreground mb-2 group-hover:text-primary transition-colors">
                                                                        {event.title}
                                                                    </h4>

                                                                    {event.description && (
                                                                        <p className="text-muted-foreground text-sm mb-2 italic border-l-2 border-white/10 pl-3">
                                                                            {event.description}
                                                                        </p>
                                                                    )}

                                                                    {event.speakers && (
                                                                        <div className="flex items-start gap-2 text-xs text-muted-foreground/80 mt-3 pt-3 border-t border-white/5">
                                                                            <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                                            <span>{event.speakers}</span>
                                                                        </div>
                                                                    )}

                                                                    {event.reservable && (
                                                                        <div className="mt-4 flex justify-end">
                                                                            <Button
                                                                                size="sm"
                                                                                className="gap-2 bg-primary/20 hover:bg-primary text-primary hover:text-primary-foreground border-primary/20"
                                                                                onClick={() => handleReserve(event.title)}
                                                                            >
                                                                                <Ticket className="w-4 h-4" />
                                                                                Reserve Spot
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md bg-card border-white/10 text-foreground">
                    <DialogHeader>
                        <DialogTitle>Reserve Spot</DialogTitle>
                        <DialogDescription>
                            Enter your details to reserve a spot for <strong>{selectedEvent}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="bg-secondary/50 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact">Contact Info (Email or Phone)</Label>
                            <Input
                                id="contact"
                                placeholder="john@example.com"
                                value={contactInfo}
                                onChange={(e) => setContactInfo(e.target.value)}
                                className="bg-secondary/50 border-white/10"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Reserving...
                                    </>
                                ) : (
                                    "Confirm Reservation"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    );
};

export default OtherEvents;
