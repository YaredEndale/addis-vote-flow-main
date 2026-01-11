
import { supabase } from "@/integrations/supabase/client";

export interface Reservation {
    id: string;
    user_name: string;
    event_title: string;
    contact_info: string;
    created_at: string;
}

export const createReservation = async (
    eventTitle: string,
    userName: string,
    contactInfo: string
): Promise<{ success: boolean; error?: string }> => {
    // using any to bypass type checks as the table is not in the generated types yet
    const { error } = await (supabase.from("event_reservations" as any) as any)
        .insert([
            {
                event_title: eventTitle,
                user_name: userName,
                contact_info: contactInfo,
            },
        ]);

    if (error) {
        console.error("Error creating reservation:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
};

export const fetchReservations = async (): Promise<Reservation[]> => {
    // using any to bypass type checks as the table is not in the generated types yet
    const { data, error } = await (supabase
        .from("event_reservations" as any) as any)
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching reservations:", error);
        return [];
    }

    return data as Reservation[];
};
