
import { Calendar, MapPin, Clock, Info, Ticket, X, Loader2, Check } from "lucide-react";
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
import { fetchEvents, DbEvent } from "@/services/eventService";
import { useEffect } from "react";

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
    sortDate?: string;
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
    const [reservedEvents, setReservedEvents] = useState<string[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem("agw-reservations");
        if (stored) {
            setReservedEvents(JSON.parse(stored));
        }
    }, []);

    const handleReserve = (eventTitle: string) => {
        if (reservedEvents.includes(eventTitle)) return;
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

            // Update local state and storage
            const newReserved = [...reservedEvents, selectedEvent];
            setReservedEvents(newReserved);
            localStorage.setItem("agw-reservations", JSON.stringify(newReserved));

            setOpen(false);
            setUserName("");
            setContactInfo("");
        } else {
            toast.error("Failed to reserve spot: " + (error || "Unknown error"));
        }
    };

    const [events, setEvents] = useState<DbEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadEvents = async () => {
            setLoading(true);
            const data = await fetchEvents();
            setEvents(data);
            setLoading(false);
        };
        loadEvents();
    }, []);

    // Group events by phase -> day
    const getSchedule = (): TimelinePhase[] => {
        const phases: Record<string, TimelinePhase> = {
            "Pre-Event": { title: "Pre-Event", days: [] },
            "On-Event": { title: "On-Event", days: [] }
        };

        const daysMap: Record<string, TimelineDay> = {};

        events.forEach(event => {
            const phaseKey = event.phase === "Pre-Event" ? "Pre-Event" : "On-Event";
            const dayKey = `${phaseKey}-${event.day_label}`;

            if (!daysMap[dayKey]) {
                // Try to find a sortable date
                let sortDate = event.event_date || "";
                if (!sortDate) {
                    // Try to parse day_label if it looks like a date e.g. "Jan 21"
                    const parsed = Date.parse(event.day_label + " " + new Date().getFullYear());
                    if (!isNaN(parsed)) {
                        sortDate = new Date(parsed).toISOString();
                    }
                }

                daysMap[dayKey] = {
                    day: event.day_label,
                    sortDate: sortDate,
                    events: []
                };
                phases[phaseKey].days.push(daysMap[dayKey]);
            }

            daysMap[dayKey].events.push({
                time: event.start_time ? `${event.start_time}${event.end_time ? ' – ' + event.end_time : ''}` : undefined,
                title: event.title,
                description: event.description,
                speakers: event.speakers,
                reservable: event.reservable
            });
        });

        // Helper to parse time string like "5:00 PM" to minutes
        const parseTime = (timeStr?: string): number => {
            if (!timeStr) return 9999; // Late if no time
            try {
                // Extract "5:00 PM" from "5:00 PM - 6:00 PM" or "5:00 PM – 6:00 PM"
                // Normalize dashes
                const firstPart = timeStr.replace('–', '-').split('-')[0].trim();
                const parts = firstPart.match(/(\d+):?(\d+)?\s*(AM|PM)/i);

                if (parts) {
                    let [_, hoursStr, minutesStr, modifier] = parts;
                    let hours = parseInt(hoursStr, 10);
                    let minutes = minutesStr ? parseInt(minutesStr, 10) : 0;

                    if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
                    if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;

                    return hours * 60 + minutes;
                }
                return 9999;
            } catch (e) {
                return 9999;
            }
        };

        // Sort days within phases and events within days
        Object.values(phases).forEach(phase => {
            phase.days.sort((a, b) => {
                if (a.sortDate && b.sortDate) {
                    return a.sortDate.localeCompare(b.sortDate);
                }
                // Fallback: maintain original order or sort by day label string
                return 0;
            });

            // Sort events within each day by time
            phase.days.forEach(day => {
                day.events.sort((a, b) => parseTime(a.time) - parseTime(b.time));
            });
        });

        return [phases["Pre-Event"], phases["On-Event"]].filter(p => p.days.length > 0);
    };

    const schedule = getSchedule();

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
                                                                    {/* Reservation Button - Only for future events */}
                                                                    {event.reservable && (
                                                                        <div className="mt-4 pt-4 border-t border-white/5">
                                                                            <Button
                                                                                size="sm"
                                                                                className={`w-full gap-2 ${reservedEvents.includes(event.title)
                                                                                    ? "bg-emerald-600 hover:bg-emerald-600 text-white border-emerald-500 cursor-default opacity-100 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                                                                    : "shadow-glow hover:scale-105 transition-transform"
                                                                                    }`}
                                                                                onClick={() => handleReserve(event.title)}
                                                                                disabled={reservedEvents.includes(event.title)}
                                                                            >
                                                                                {reservedEvents.includes(event.title) ? (
                                                                                    <>
                                                                                        <Check className="w-4 h-4" />
                                                                                        Reserved
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <Ticket className="w-4 h-4" />
                                                                                        Reserve Spot
                                                                                    </>
                                                                                )}
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
