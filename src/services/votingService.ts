import { supabase } from "@/integrations/supabase/client";

export interface Vote {
  id: string;
  user_id: string;
  category_id: string;
  nominee_id: string;
  created_at: string;
  updated_at: string;
}

export interface DetailedVote extends Vote {
  profiles: {
    email: string;
  };
  categories: {
    name: string;
  };
  nominees: {
    name: string;
  };
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
  let allVotes: Vote[] = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("votes")
      .select("*")
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("Error fetching votes page", page, error);
      // If we already have data, return what we have to avoid breaking UI completely
      // or break to stop trying
      break;
    }

    if (data) {
      allVotes = [...allVotes, ...(data as Vote[])];

      // If we got fewer results than requested, we've reached the end
      if (data.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    } else {
      hasMore = false;
    }
  }

  return allVotes;
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
  let allVotes: { category_id: string; nominee_id: string }[] = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from("votes")
      .select("category_id, nominee_id")
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error("Error fetching vote counts page", page, error);
      break;
    }

    if (data) {
      // Cast data to expected shape since we only selected specific fields
      allVotes = [...allVotes, ...data];

      if (data.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    } else {
      hasMore = false;
    }
  }

  // Aggregate counts in frontend
  const counts: Record<string, number> = {};
  allVotes.forEach((v) => {
    const key = `${v.category_id}|${v.nominee_id}`;
    counts[key] = (counts[key] || 0) + 1;
  });

  return Object.entries(counts).map(([key, count]) => {
    const [category_id, nominee_id] = key.split("|");
    return { category_id, nominee_id, vote_count: count };
  });
};

export const fetchDetailedVotes = async (): Promise<DetailedVote[]> => {
  const { data, error } = await supabase
    .from("votes")
    .select(`
      *,
      profiles:user_id (email),
      categories:category_id (name),
      nominees:nominee_id (name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching detailed votes:", error);
    return [];
  }

  // We need to manually handle the join result because of Supabase's type system
  return data as unknown as DetailedVote[];
};
