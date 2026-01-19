
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
    // Attempt to fetch sorted by event_date
    const { data, error } = await (supabase
        .from("events" as any)
        .select("*")
        .order("event_date", { ascending: true })) as any;

    if (error) {
        console.warn("Primary fetch failed (likely missing event_date), falling back to created_at sort:", error);

        const { data: fallbackData, error: fallbackError } = await (supabase
            .from("events" as any)
            .select("*")
            .order("created_at", { ascending: true })) as any;

        if (fallbackError) {
            console.error("Error fetching events:", fallbackError);
            return [];
        }
        return fallbackData as DbEvent[];
    }

    return data as DbEvent[];
};

export const createEvent = async (event: NewEvent): Promise<{ success: boolean; error?: string }> => {
    const { error } = await (supabase
        .from("events" as any)
        .insert([event])) as any;

    if (error) {
        // Check if error is due to missing column
        if (error.message && error.message.includes('measure to find the')) {
            // supabase-js sometimes gives generic errors, but usually "Could not find the 'event_date' column"
            // We'll check for the specific string or retry on any error if it looks like a schema issue?
            // Safer to check string if possible, but the error message format is "Could not find the 'event_date' column..." inside the error object
        }

        if (error.message && (error.message.includes("Could not find the") || error.code === "PGRST204")) {
            console.warn("Primary create failed (likely missing event_date), retrying without it:", error);
            // Create a copy without event_date
            const { event_date, ...eventWithoutDate } = event;

            const { error: retryError } = await (supabase
                .from("events" as any)
                .insert([eventWithoutDate])) as any;

            if (retryError) {
                console.error("Error creating event (retry failed):", retryError);
                return { success: false, error: retryError.message };
            }
            return { success: true };
        }

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
        if (error.message && (error.message.includes("Could not find the") || error.code === "PGRST204")) {
            console.warn("Primary update failed (likely missing event_date), retrying without it:", error);
            const { event_date, ...updatesWithoutDate } = updates;

            const { error: retryError } = await (supabase
                .from("events" as any)
                .update(updatesWithoutDate)
                .eq("id", id)) as any;

            if (retryError) {
                console.error("Error updating event (retry failed):", retryError);
                return { success: false, error: retryError.message };
            }
            return { success: true };
        }

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
