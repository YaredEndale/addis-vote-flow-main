import { supabase } from "@/integrations/supabase/client";

export interface Vote {
  id: string;
  user_id: string;
  category_id: string;
  nominee_id: string;
  created_at: string;
  updated_at: string;
}

export const fetchUserVotes = async (userId: string): Promise<Record<string, string>> => {
  const { data, error } = await supabase
    .from("votes")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching votes:", error);
    return {};
  }

  // Convert to categoryId -> nomineeId map
  const votesMap: Record<string, string> = {};
  data?.forEach((vote) => {
    votesMap[vote.category_id] = vote.nominee_id;
  });

  return votesMap;
};

export const submitVote = async (
  userId: string,
  categoryId: string,
  nomineeId: string
): Promise<{ success: boolean; error?: string }> => {
  // Check if vote exists for this category
  const { data: existingVote } = await supabase
    .from("votes")
    .select("id")
    .eq("user_id", userId)
    .eq("category_id", categoryId)
    .maybeSingle();

  if (existingVote) {
    // Update existing vote
    const { error } = await supabase
      .from("votes")
      .update({ nominee_id: nomineeId })
      .eq("id", existingVote.id);

    if (error) {
      console.error("Error updating vote:", error);
      return { success: false, error: error.message };
    }
  } else {
    // Insert new vote
    const { error } = await supabase
      .from("votes")
      .insert({
        user_id: userId,
        category_id: categoryId,
        nominee_id: nomineeId,
      });

    if (error) {
      console.error("Error inserting vote:", error);
      return { success: false, error: error.message };
    }
  }

  return { success: true };
};

export const fetchAllVotes = async (): Promise<Vote[]> => {
  const { data, error } = await supabase
    .from("votes")
    .select("*");

  if (error) {
    console.error("Error fetching all votes:", error);
    return [];
  }

  return data as Vote[];
};

// --- Categories CRUD ---

export interface DbCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const fetchCategories = async (): Promise<DbCategory[]> => {
  const { data, error } = await supabase.from("categories").select("*");
  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
  return data as DbCategory[];
};

export const createCategory = async (category: DbCategory): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.from("categories").insert(category);
  if (error) {
    console.error("Error creating category:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
};

export const updateCategory = async (id: string, updates: Partial<DbCategory>): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.from("categories").update(updates).eq("id", id);
  if (error) {
    console.error("Error updating category:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
};

export const deleteCategory = async (id: string): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
};

// --- Nominees CRUD ---

export interface DbNominee {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category_id: string;
}

export const fetchNominees = async (): Promise<DbNominee[]> => {
  const { data, error } = await supabase.from("nominees").select("*");
  if (error) {
    console.error("Error fetching nominees:", error);
    return [];
  }
  return data as DbNominee[];
};

export const createNominee = async (nominee: DbNominee): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.from("nominees").insert(nominee);
  if (error) {
    console.error("Error creating nominee:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
};

export const updateNominee = async (id: string, updates: Partial<DbNominee>): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.from("nominees").update(updates).eq("id", id);
  if (error) {
    console.error("Error updating nominee:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
};

export const deleteNominee = async (id: string): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.from("nominees").delete().eq("id", id);
  if (error) {
    console.error("Error deleting nominee:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
};

// --- Leaderboard ---

export interface LeaderboardEntry {
  nominee_id: string;
  category_id: string;
  vote_count: number;
}

export const fetchVoteCounts = async (): Promise<LeaderboardEntry[]> => {
  const { data, error } = await supabase
    .from("votes")
    .select("category_id, nominee_id");

  if (error) {
    console.error("Error fetching vote counts:", error);
    return [];
  }

  // Aggregate counts in frontend for simplicity and speed (avoids complex SQL views for now)
  const counts: Record<string, number> = {};
  data.forEach((v) => {
    const key = `${v.category_id}|${v.nominee_id}`;
    counts[key] = (counts[key] || 0) + 1;
  });

  return Object.entries(counts).map(([key, count]) => {
    const [category_id, nominee_id] = key.split("|");
    return { category_id, nominee_id, vote_count: count };
  });
};
