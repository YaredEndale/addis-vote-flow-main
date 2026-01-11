
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VotingProgress from "@/components/VotingProgress";
import { useVotingStore } from "@/store/votingStore";
import { fetchCategories, DbCategory } from "@/services/votingService";
import { Trophy, Share2, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const ThankYou = () => {
  const { getVotedCategories } = useVotingStore();
  const votedCategories = getVotedCategories();
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchCategories();
      setCategories(data);
      setLoading(false);
    };
    loadCategories();
  }, []);

  const remainingCategories = categories.filter(
    (c) => !votedCategories.includes(c.id)
  );

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Addis Games Week Awards 2024",
        text: "I just voted in the Addis Games Week Awards! Cast your vote too!",
        url: window.location.origin,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-dark">
      <Header />

      <main className="flex-1 pt-24 md:pt-28 pb-12 px-4 flex items-center">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center animate-slide-up">
            {/* Trophy Icon */}
            <div className="w-24 h-24 rounded-full bg-gradient-gold flex items-center justify-center mx-auto mb-8 shadow-gold animate-float">
              <Trophy className="w-12 h-12 text-accent-foreground" />
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl md:text-5xl tracking-wide mb-4">
              THANK <span className="text-gradient-gold">YOU!</span>
            </h1>

            {/* Message */}
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              Your votes have been recorded. You're helping shape the future of Ethiopian gaming!
            </p>

            {/* Progress */}
            <div className="mb-8">
              <VotingProgress votedCategories={votedCategories} categories={categories} />
            </div>

            {/* Remaining Categories */}
            {!loading && remainingCategories.length > 0 && (
              <div className="bg-secondary/30 border border-border/50 rounded-xl p-6 mb-8">
                <h3 className="font-display text-lg tracking-wide mb-4">
                  Complete Your Votes
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You haven't voted in {remainingCategories.length} category(ies) yet:
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {remainingCategories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/vote/${category.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-sm text-foreground hover:bg-primary/20 hover:text-primary transition-all duration-300 border border-border/50"
                    >
                      <span>{category.icon}</span>
                      <span>{category.name.replace("Best ", "")}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {remainingCategories.length > 0 ? (
                <Button variant="hero" size="lg" asChild>
                  <Link to={`/vote/${remainingCategories[0].id}`}>
                    Continue Voting
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              ) : (
                <Button variant="hero" size="lg" asChild>
                  <Link to="/categories">
                    Review Votes
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              )}

              <Button variant="outline" size="lg" onClick={handleShare}>
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </Button>
            </div>

            {/* Note */}
            <p className="text-xs text-muted-foreground mt-8">
              Winners will be announced at the Addis Games Week Award Ceremony.
              <br />
              You can update your votes until the deadline.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ThankYou;
