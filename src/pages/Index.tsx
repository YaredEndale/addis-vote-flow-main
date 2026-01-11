import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CountdownTimer from "@/components/CountdownTimer";
import VotingProgress from "@/components/VotingProgress";
import OtherEvents from "@/components/OtherEvents";
import { useVotingStore } from "@/store/votingStore";
import { fetchCategories, DbCategory } from "@/services/votingService";
import { ArrowRight, Shield, Users, Trophy, Clock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const getVotedCategories = useVotingStore((state) => state.getVotedCategories);
  const votedCategories = getVotedCategories();

  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchCategories();
      setCategories(data);
      setLoading(false);
    };
    loadData();
  }, []);

  // Set voting deadline to January 25, 2026 (adjust timezone)
  const votingDeadline = new Date(2026, 0, 25, 23, 59, 59);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-dark">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ backgroundImage: `url(${heroBg})` }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background" />

        {/* Animated Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] animate-pulse-slow" />

        {/* Floating Icons from Logo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src="/logo.png"
            className="absolute top-[20%] left-[10%] w-32 h-32 opacity-10 animate-float-slow"
            alt=""
          />
          <img
            src="/logo.png"
            className="absolute bottom-[20%] right-[10%] w-40 h-40 opacity-10 animate-float-fast"
            alt=""
          />
          <img
            src="/logo.png"
            className="absolute top-[40%] right-[20%] w-24 h-24 opacity-5 animate-spin-slow"
            alt=""
          />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-4xl mx-auto animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-6 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Voting Now Open
            </div>

            {/* Main Title */}
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-wider mb-6 leading-tight">
              ADDIS GAMES WEEK
              <span className="block text-gradient-cyan mt-2">AWARDS 2026</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Celebrate excellence in Ethiopian gaming. Vote for your favorites across
              <span className="text-primary font-semibold"> {categories.length} categories</span> and help shape the future of our gaming community.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button variant="hero" size="xl" asChild className="shadow-glow hover:scale-105 transition-transform">
                <Link to="/categories">
                  Start Voting
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="backdrop-blur-sm border-white/10 hover:bg-white/5">
                <Link to="/rules">View Rules</Link>
              </Button>
            </div>

            {/* Countdown */}
            <div className="mb-8">
              <p className="text-sm text-muted-foreground uppercase tracking-widest mb-4">
                Voting Ends In
              </p>
              <CountdownTimer targetDate={votingDeadline} />
            </div>
          </div>
        </div>
      </section>

      {/* Progress Section (if user has voted) */}
      {votedCategories.length > 0 && (
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-3xl">
            <VotingProgress votedCategories={votedCategories} categories={categories} />
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl tracking-wide mb-4">
              FAIR & TRANSPARENT VOTING
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Your vote matters. We ensure every vote counts through secure and transparent processes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: "Secure Voting",
                description: "Advanced protection against vote manipulation and fraud",
              },
              {
                icon: Users,
                title: "One Vote Per Category",
                description: "Each voter can only submit one vote per category",
              },
              {
                icon: Trophy,
                title: "8 Categories",
                description: "Vote across diverse categories celebrating gaming excellence",
              },
              {
                icon: Clock,
                title: "Real Results",
                description: "Winners announced at the Addis Games Week ceremony",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-card border border-border/50 rounded-xl p-6 text-center hover:border-primary/30 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg tracking-wide mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
            <div>
              <h2 className="font-display text-3xl md:text-4xl tracking-wide mb-2">
                AWARD CATEGORIES
              </h2>
              <p className="text-muted-foreground">
                Vote in all {categories.length} categories to have your voice heard
              </p>
            </div>
            <Button variant="hero" asChild>
              <Link to="/categories">
                View All Categories
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.slice(0, 4).map((category) => (
                <Link
                  key={category.id}
                  to={`/vote/${category.id}`}
                  className="bg-gradient-card border border-white/5 rounded-xl p-6 text-center hover:border-primary/50 hover:shadow-glow transition-all duration-300 group"
                >
                  <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">{category.icon}</div>
                  <h3 className="font-display text-sm md:text-base tracking-wide group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                </Link>
              ))}
              {categories.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground">No categories yet.</div>
              )}
            </div>
          )}
        </div>
      </section>

      <OtherEvents />

      <Footer />
    </div>
  );
};

export default Index;
