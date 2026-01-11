
import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { fetchReservations, Reservation } from "@/services/reservationService";
import { Loader2 } from "lucide-react";

const ReservationList = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReservations = async () => {
            const data = await fetchReservations();
            setReservations(data);
            setLoading(false);
        };
        loadReservations();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (reservations.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground border border-dashed border-white/10 rounded-lg">
                No reservations found.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-primary">Date</TableHead>
                        <TableHead className="text-primary">User Name</TableHead>
                        <TableHead className="text-primary">Contact Info</TableHead>
                        <TableHead className="text-primary">Event</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {reservations.map((res) => (
                        <TableRow key={res.id} className="border-white/10 hover:bg-white/5">
                            <TableCell className="text-muted-foreground">
                                {new Date(res.created_at).toLocaleDateString()} {new Date(res.created_at).toLocaleTimeString()}
                            </TableCell>
                            <TableCell className="font-medium text-foreground">{res.user_name}</TableCell>
                            <TableCell className="text-muted-foreground">{res.contact_info}</TableCell>
                            <TableCell className="text-foreground">{res.event_title}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default ReservationList;
