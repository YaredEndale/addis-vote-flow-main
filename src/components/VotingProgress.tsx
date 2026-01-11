import { Check } from "lucide-react";
import { DbCategory } from "@/services/votingService";

interface VotingProgressProps {
  votedCategories: string[];
  categories: DbCategory[];
}

const VotingProgress = ({ votedCategories, categories }: VotingProgressProps) => {
  const totalCategories = categories.length;
  const votedCount = votedCategories.length;
  const progressPercentage = totalCategories > 0 ? (votedCount / totalCategories) * 100 : 0;

  return (
    <div className="bg-secondary/30 border border-border/50 rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg tracking-wide">YOUR PROGRESS</h3>
        <span className="text-accent font-semibold">
          {votedCount} / {totalCategories}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-gold transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const hasVoted = votedCategories.includes(category.id);
          return (
            <div
              key={category.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${hasVoted
                  ? "bg-accent/20 text-accent border border-accent/30"
                  : "bg-muted/50 text-muted-foreground border border-border/50"
                }`}
            >
              {hasVoted && <Check className="w-3 h-3" />}
              <span className="truncate max-w-[100px]">{category.name.replace("Best ", "")}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VotingProgress;
