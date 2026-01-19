
import { supabase } from "@/integrations/supabase/client";

export interface DbEvent {
    id: string;
    title: string;
    description?: string;
    start_time?: string;
    end_time?: string;
    venue?: string;
    speakers?: string;
    reservable: boolean;
    phase: "Pre-Event" | "On-Event";
    day_label: string; // e.g. "Monday", "Jan 21"
    event_date: string; // ISO date string YYYY-MM-DD for sorting
    created_at: string;
}

export type NewEvent = Omit<DbEvent, "id" | "created_at">;

export type EventUpdate = Partial<Omit<DbEvent, "created_at">>;

// Using 'any' cast for table name until types are generated
export const fetchEvents = async (): Promise<DbEvent[]> => {
    const { data, error } = await (supabase
        .from("events" as any)
        .select("*")
        .order("event_date", { ascending: true })) as any;

    if (error) {
        console.error("Error fetching events:", error);
        return [];
    }

    return data as DbEvent[];
};

export const createEvent = async (event: NewEvent): Promise<{ success: boolean; error?: string }> => {
    const { error } = await (supabase
        .from("events" as any)
        .insert([event])) as any;

    if (error) {
        console.error("Error creating event:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
};

export const updateEvent = async (id: string, updates: EventUpdate): Promise<{ success: boolean; error?: string }> => {
    const { error } = await (supabase
        .from("events" as any)
        .update(updates)
        .eq("id", id)) as any;

    if (error) {
        console.error("Error updating event:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
};

export const deleteEvent = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await (supabase
        .from("events" as any)
        .delete()
        .eq("id", id)) as any;

    if (error) {
        console.error("Error deleting event:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
};
