
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Pencil, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { DbEvent, NewEvent, fetchEvents, createEvent, updateEvent, deleteEvent } from "@/services/eventService";

const EventManager = () => {
    const [events, setEvents] = useState<DbEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingEvent, setEditingEvent] = useState<DbEvent | null>(null);

    const [formData, setFormData] = useState<NewEvent>({
        title: "",
        description: "",
        phase: "On-Event",
        day_label: "",
        reservable: false,
        start_time: "",
        end_time: "",
        venue: "",
        speakers: ""
    });

    const loadEvents = async () => {
        setLoading(true);
        const data = await fetchEvents();
        setEvents(data);
        setLoading(false);
    };

    useEffect(() => {
        loadEvents();
    }, []);

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            phase: "On-Event",
            day_label: "",
            reservable: false,
            start_time: "",
            end_time: "",
            venue: "",
            speakers: ""
        });
        setEditingEvent(null);
    };

    const handleEdit = (event: DbEvent) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            description: event.description || "",
            phase: event.phase,
            day_label: event.day_label,
            reservable: event.reservable,
            start_time: event.start_time || "",
            end_time: event.end_time || "",
            venue: event.venue || "",
            speakers: event.speakers || ""
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;

        const { success, error } = await deleteEvent(id);
        if (success) {
            toast.success("Event deleted successfully");
            loadEvents();
        } else {
            toast.error("Failed to delete event: " + error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (editingEvent) {
                const { success, error } = await updateEvent(editingEvent.id, formData);
                if (success) {
                    toast.success("Event updated successfully");
                    setIsDialogOpen(false);
                    resetForm();
                    loadEvents();
                } else {
                    toast.error("Failed to update event: " + error);
                }
            } else {
                const { success, error } = await createEvent(formData);
                if (success) {
                    toast.success("Event created successfully");
                    setIsDialogOpen(false);
                    resetForm();
                    loadEvents();
                } else {
                    toast.error("Failed to create event: " + error);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-display">Manage Events</h2>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" /> Add Event
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-card border-white/10">
                        <DialogHeader>
                            <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Phase</Label>
                                    <Select
                                        value={formData.phase}
                                        onValueChange={(val: "Pre-Event" | "On-Event") => setFormData({ ...formData, phase: val })}
                                    >
                                        <SelectTrigger className="bg-secondary/50 border-white/10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Pre-Event">Pre-Event</SelectItem>
                                            <SelectItem value="On-Event">On-Event</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Day (e.g., "Monday" or "Jan 21")</Label>
                                    <Input
                                        value={formData.day_label}
                                        onChange={e => setFormData({ ...formData, day_label: e.target.value })}
                                        placeholder="Friday"
                                        required
                                        className="bg-secondary/50 border-white/10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Event Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Official Opening"
                                    required
                                    className="bg-secondary/50 border-white/10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Event details..."
                                    className="bg-secondary/50 border-white/10"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Time Range (Optional)</Label>
                                    <Input
                                        value={formData.start_time || ""}
                                        onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                        placeholder="5:00 PM – 6:00 PM"
                                        className="bg-secondary/50 border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Reservable?</Label>
                                    <Select
                                        value={formData.reservable ? "true" : "false"}
                                        onValueChange={(val) => setFormData({ ...formData, reservable: val === "true" })}
                                    >
                                        <SelectTrigger className="bg-secondary/50 border-white/10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="false">No</SelectItem>
                                            <SelectItem value="true">Yes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Venue (Optional)</Label>
                                <Input
                                    value={formData.venue || ""}
                                    onChange={e => setFormData({ ...formData, venue: e.target.value })}
                                    placeholder="Creative Hub"
                                    className="bg-secondary/50 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Speakers (Optional)</Label>
                                <Input
                                    value={formData.speakers || ""}
                                    onChange={e => setFormData({ ...formData, speakers: e.target.value })}
                                    placeholder="John Doe, Jane Smith"
                                    className="bg-secondary/50 border-white/10"
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {editingEvent ? "Update Event" : "Create Event"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="border border-white/10 rounded-xl overflow-hidden">
                    <Table>
                        <TableHeader className="bg-card">
                            <TableRow className="border-white/10 hover:bg-white/5">
                                <TableHead>Phase</TableHead>
                                <TableHead>Day</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No events found. Add one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                events.map((event) => (
                                    <TableRow key={event.id} className="border-white/10 hover:bg-white/5">
                                        <TableCell className="font-medium">{event.phase}</TableCell>
                                        <TableCell>{event.day_label}</TableCell>
                                        <TableCell>{event.title}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(event)}
                                                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(event.id)}
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
};

export default EventManager;
