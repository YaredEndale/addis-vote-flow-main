import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchUserVotes, submitVote } from "@/services/votingService";

interface VotingState {
  votes: Record<string, string>; // categoryId -> nomineeId
  loading: boolean;
  setVote: (categoryId: string, nomineeId: string) => void;
  getVote: (categoryId: string) => string | undefined;
  getVotedCategories: () => string[];
  clearVotes: () => void;
  loadVotesFromDb: (userId: string) => Promise<void>;
  submitVoteToDb: (userId: string, categoryId: string, nomineeId: string) => Promise<boolean>;
  syncWithDb: boolean;
  setSyncWithDb: (sync: boolean) => void;
}

export const useVotingStore = create<VotingState>()(
  persist(
    (set, get) => ({
      votes: {},
      loading: false,
      syncWithDb: false,
      
      setVote: (categoryId, nomineeId) =>
        set((state) => ({
          votes: { ...state.votes, [categoryId]: nomineeId },
        })),
      
      getVote: (categoryId) => get().votes[categoryId],
      
      getVotedCategories: () => Object.keys(get().votes),
      
      clearVotes: () => set({ votes: {} }),
      
      setSyncWithDb: (sync) => set({ syncWithDb: sync }),
      
      loadVotesFromDb: async (userId: string) => {
        set({ loading: true });
        try {
          const dbVotes = await fetchUserVotes(userId);
          set({ votes: dbVotes, syncWithDb: true, loading: false });
        } catch (error) {
          console.error("Error loading votes:", error);
          set({ loading: false });
        }
      },
      
      submitVoteToDb: async (userId: string, categoryId: string, nomineeId: string) => {
        const result = await submitVote(userId, categoryId, nomineeId);
        if (result.success) {
          set((state) => ({
            votes: { ...state.votes, [categoryId]: nomineeId },
          }));
        }
        return result.success;
      },
    }),
    {
      name: "agw-votes",
    }
  )
);
