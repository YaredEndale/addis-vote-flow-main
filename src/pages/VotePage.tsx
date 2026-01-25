import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NomineeCard from "@/components/NomineeCard";
import { Button } from "@/components/ui/button";
import { useVotingStore } from "@/store/votingStore";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCategories, fetchNominees, DbCategory, DbNominee, isVotingActive } from "@/services/votingService";
import { ArrowLeft, ArrowRight, Check, LogIn, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const VotePage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setVote, getVote, getVotedCategories, submitVoteToDb, loadVotesFromDb, syncWithDb } = useVotingStore();

  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [nominees, setNominees] = useState<DbNominee[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingActive, setVotingActive] = useState(true);

  // DEBUG LOGGING
  useEffect(() => {
    if (!loading) {
      console.log("Current URL Param categoryId:", categoryId);
      console.log("Available Categories:", categories.map(c => ({ id: c.id, name: c.name })));
      // Loose matching with trim
      const found = categories.find((c) => c.id.trim() === categoryId?.trim());
      console.log("Found Category:", found);
    }
  }, [loading, categoryId, categories]);

  // Robust matching: trim both sides
  const category = categories.find((c) => c.id.trim() === categoryId?.trim());
  const categoryNominees = nominees.filter((n) => n.category_id.trim() === categoryId?.trim());
  const currentVote = getVote(categoryId || "");
  const [selectedNominee, setSelectedNominee] = useState<string | null>(currentVote || null);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [cats, noms, active] = await Promise.all([
        fetchCategories(),
        fetchNominees(),
        isVotingActive()
      ]);
      setCategories(cats);
      setNominees(noms);
      setVotingActive(active);
      setLoading(false);
    };
    loadData();
  }, []);

  // Update confirmed state once data is loaded and vote exists
  useEffect(() => {
    const vote = getVote(categoryId || "");
    if (vote) {
      setHasConfirmed(true);
    }
  }, [categoryId, getVote, loading]);

  // Load votes from DB when user logs in
  useEffect(() => {
    if (user && !syncWithDb) {
      loadVotesFromDb(user.id);
    }
  }, [user, syncWithDb, loadVotesFromDb]);

  // Update selected nominee when vote changes
  useEffect(() => {
    const vote = getVote(categoryId || "");
    if (vote) {
      setSelectedNominee(vote);
      setHasConfirmed(true);
    }
  }, [categoryId, getVote]);

  // Handle Share Link (Auto-select nominee from URL)
  const [searchParams] = useSearchParams();
  const nomineeParam = searchParams.get("nominee");

  useEffect(() => {
    if (nomineeParam && !selectedNominee && !hasConfirmed && nominees.length > 0) {
      // Verify if nominee exists in this category
      const exists = nominees.find(n => n.id === nomineeParam && n.category_id.trim() === categoryId?.trim());

      if (exists) {
        console.log("Auto-selecting nominee from URL:", nomineeParam);
        setSelectedNominee(nomineeParam);

        // Scroll to nominee after a short delay to ensure rendering
        setTimeout(() => {
          const element = document.getElementById(`nominee-${nomineeParam}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a temporary highlight effect class if needed, or just rely on the selection state
          }
        }, 500);
      }
    }
  }, [nomineeParam, nominees, categoryId, selectedNominee, hasConfirmed]);

  // Navigation helpers
  const currentIndex = categories.findIndex((c) => c.id === categoryId);
  const prevCategory = currentIndex > 0 ? categories[currentIndex - 1] : null;
  const nextCategory = currentIndex < categories.length - 1 ? categories[currentIndex + 1] : null;
  const votedCategories = getVotedCategories();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-dark">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-dark">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-3xl mb-4">Category Not Found</h1>
            <Button asChild>
              <Link to="/categories">Back to Categories</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleVote = (nomineeId: string) => {
    if (!votingActive) {
      toast.error("Voting is closed", {
        description: "The voting period has ended or is temporarily suspended."
      });
      return;
    }
    setSelectedNominee(nomineeId);
    setHasConfirmed(false);
  };

  const handleConfirmVote = async () => {
    if (!selectedNominee || !categoryId) return;

    // If user is not logged in, prompt to sign in
    if (!user) {
      toast.info("Sign in required", {
        description: "Please sign in to save your vote.",
        action: {
          label: "Sign In",
          onClick: () => navigate("/auth"),
        },
      });
      // Still save locally for now
      setVote(categoryId, selectedNominee);
      setHasConfirmed(true);
      return;
    }


    setSubmitting(true);
    // Use category.id to ensure we match the DB record exactly (ignoring URL whitespace issues)
    const success = await submitVoteToDb(user.id, category.id, selectedNominee);
    setSubmitting(false);

    if (success) {
      setHasConfirmed(true);
      const nominee = categoryNominees.find((n) => n.id === selectedNominee);
      toast.success(`Vote confirmed for ${nominee?.name}!`, {
        description: `Your vote in "${category.name}" has been saved.`,
      });
    } else {
      toast.error("Failed to save vote", {
        description: "Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-dark">
      <Header />

      <main className="flex-1 pt-24 md:pt-28 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Back Link */}
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Categories
          </Link>

          {/* Voting Closed Banner */}
          {!votingActive && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <div>
                <p className="font-semibold text-destructive">Voting is currently closed</p>
                <p className="text-sm text-destructive/80">You can still view the nominees, but submissions are disabled.</p>
              </div>
            </div>
          )}

          {/* Not logged in banner */}
          {user && votingActive && (
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <LogIn className="w-5 h-5 text-primary" />
                <span className="text-sm">Sign in to save your votes permanently</span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          )}


          {/* Category Header */}
          <div className="text-center mb-12 animate-slide-up">
            <div className="text-5xl mb-4">{category.icon}</div>
            <h1 className="font-display text-3xl md:text-4xl tracking-wide mb-3">
              {category.name}
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {category.description}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {categories.map((cat, index) => (
              <Link
                key={cat.id}
                to={`/vote/${cat.id.trim()}`}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${cat.id.trim() === categoryId?.trim()
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : votedCategories.includes(cat.id)
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                title={cat.name}
              >
                {votedCategories.includes(cat.id) && cat.id.trim() !== categoryId?.trim() ? (
                  <Check className="w-3 h-3" />
                ) : (
                  index + 1
                )}
              </Link>
            ))}
          </div>

          {/* Nominees Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {categoryNominees.map((nominee, index) => (
              <div
                key={nominee.id}
                id={`nominee-${nominee.id}`}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <NomineeCard
                  nominee={nominee}
                  isSelected={selectedNominee === nominee.id}
                  onVote={handleVote}
                  categoryId={category.id}
                  disabled={!votingActive}
                />
              </div>
            ))}
          </div>

          {/* Confirm Button */}
          {selectedNominee && !hasConfirmed && votingActive && (
            <div className="flex justify-center mb-8 animate-fade-in">
              <Button
                variant="hero"
                size="lg"
                onClick={handleConfirmVote}
                disabled={submitting}
              >
                {submitting ? (
                  <span className="animate-pulse">Saving...</span>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Confirm Vote
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Success Message */}
          {hasConfirmed && (
            <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 text-center mb-8 animate-fade-in">
              <Check className="w-12 h-12 text-primary mx-auto mb-3 shadow-glow rounded-full p-2" />
              <h3 className="font-display text-xl tracking-wide mb-2">Vote Recorded!</h3>
              <p className="text-muted-foreground">
                {user
                  ? `Thank you for voting in ${category.name}. You can change your vote until the deadline.`
                  : `Vote saved locally. Sign in to save permanently.`
                }
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between border-t border-border/50 pt-8">
            {prevCategory ? (
              <Button variant="outline" asChild>
                <Link to={`/vote/${prevCategory.id}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {prevCategory.name}
                </Link>
              </Button>
            ) : (
              <div />
            )}

            {nextCategory ? (
              <Button variant="outline" asChild className="border-primary/20 hover:bg-primary/5 hover:text-primary">
                <Link to={`/vote/${nextCategory.id}`}>
                  {nextCategory.name}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <Button variant="hero" asChild>
                <Link to="/thank-you">
                  Complete Voting
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VotePage;
