import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DbNominee } from "@/services/votingService";
import { Check, User, Share2 } from "lucide-react";
import { useState } from "react";
import ShareNomineeDialog from "./ShareNomineeDialog";

interface NomineeCardProps {
  nominee: DbNominee;
  isSelected: boolean;
  onVote: (nomineeId: string) => void;
  categoryId: string; // Added to construct share URL
}

const NomineeCard = ({ nominee, isSelected, onVote, categoryId }: NomineeCardProps) => {
  const [showShareDialog, setShowShareDialog] = useState(false);

  return (
    <>
      <Card
        variant="nominee"
        className={`relative overflow-hidden transition-all duration-300 ${isSelected ? "border-primary shadow-glow ring-2 ring-primary/30" : ""
          }`}
      >
        {isSelected && (
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-glow z-10 transition-transform hover:scale-105">
            <Check className="w-4 h-4 text-primary-foreground" />
          </div>
        )}

        {/* Share Button (Top Left or floating top right below selection) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowShareDialog(true);
          }}
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-background/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/80 transition-all z-20"
          title="Share Nominee"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <CardContent className="p-6">
          {/* Nominee Avatar */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden border border-border/50">
              {nominee.image_url ? (
                <img
                  src={nominee.image_url}
                  alt={nominee.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-xl tracking-wide truncate">{nominee.name}</h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
            {nominee.description}
          </p>

          {/* Vote Button */}
          <Button
            variant={isSelected ? "voted" : "vote"}
            className="w-full"
            onClick={() => onVote(nominee.id)}
          >
            {isSelected ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Voted
              </>
            ) : (
              "Vote"
            )}
          </Button>
        </CardContent>
      </Card>

      <ShareNomineeDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        nomineeName={nominee.name}
        nomineeId={nominee.id}
        categoryId={categoryId}
      />
    </>
  );
};

export default NomineeCard;
