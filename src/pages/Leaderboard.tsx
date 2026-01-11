import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { fetchCategories, fetchNominees, fetchVoteCounts, DbCategory, DbNominee, LeaderboardEntry } from "@/services/votingService";
import { Loader2, Trophy, Medal, Crown, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Leaderboard = () => {
    const [categories, setCategories] = useState<DbCategory[]>([]);
    const [nominees, setNominees] = useState<DbNominee[]>([]);
    const [voteCounts, setVoteCounts] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const [cats, noms, counts] = await Promise.all([
                fetchCategories(),
                fetchNominees(),
                fetchVoteCounts(),
            ]);
            setCategories(cats);
            setNominees(noms);
            setVoteCounts(counts);
            setLoading(false);
        };
        loadData();
    }, []);

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 0: return <Crown className="w-5 h-5 text-primary shadow-glow animate-pulse" />;
            case 1: return <Medal className="w-5 h-5 text-primary/80" />;
            case 2: return <Medal className="w-5 h-5 text-primary/60" />;
            default: return <span className="text-xs font-bold text-muted-foreground w-5 text-center">#{rank + 1}</span>;
        }
    };

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

    return (
        <div className="min-h-screen flex flex-col bg-gradient-dark">
            <Header />

            <main className="flex-1 pt-24 md:pt-28 pb-12 px-4">
                <div className="container mx-auto max-w-5xl">
                    {/* Page Header */}
                    <div className="text-center mb-12 animate-slide-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-6 backdrop-blur-md">
                            <TrendingUp className="w-4 h-4" />
                            Live Standings
                        </div>
                        <h1 className="font-display text-4xl md:text-5xl tracking-wide mb-4">
                            VOTING <span className="text-gradient-cyan">LEADERBOARD</span>
                        </h1>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            See which nominees are currently leading the race in each category. Standings are updated in real-time as votes are cast.
                        </p>
                    </div>

                    <Tabs defaultValue={categories[0]?.id} className="w-full">
                        <div className="flex justify-center mb-8">
                            <TabsList className="bg-secondary/30 border border-white/5 p-1 h-auto flex-wrap justify-center gap-1">
                                {categories.map((cat) => (
                                    <TabsTrigger
                                        key={cat.id}
                                        value={cat.id}
                                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-display tracking-wider py-2 px-6"
                                    >
                                        {cat.name}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        {categories.map((category) => {
                            const categoryVotes = voteCounts.filter(v => v.category_id === category.id);
                            const totalVotes = categoryVotes.reduce((acc, curr) => acc + curr.vote_count, 0);
                            const rankedNominees = nominees
                                .filter(n => n.category_id === category.id)
                                .map(n => {
                                    const entry = categoryVotes.find(v => v.nominee_id === n.id);
                                    return { ...n, votes: entry ? entry.vote_count : 0 };
                                })
                                .sort((a, b) => b.votes - a.votes);

                            return (
                                <TabsContent key={category.id} value={category.id} className="animate-fade-in outline-none">
                                    <div className="bg-gradient-card border border-white/5 rounded-2xl p-6 md:p-8 shadow-card">
                                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/5">
                                            <div className="text-4xl">{category.icon}</div>
                                            <div>
                                                <h2 className="font-display text-2xl tracking-wide">{category.name}</h2>
                                                <p className="text-sm text-muted-foreground">{totalVotes} total votes cast</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {rankedNominees.map((nominee, index) => {
                                                const percentage = totalVotes > 0 ? (nominee.votes / totalVotes) * 100 : 0;
                                                return (
                                                    <div key={nominee.id} className="group">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-3">
                                                                {getRankIcon(index)}
                                                                <span className={`font-medium ${index === 0 ? "text-primary tracking-wide text-lg" : "text-foreground"}`}>
                                                                    {nominee.name}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm font-bold text-primary">{Math.round(percentage)}%</span>
                                                        </div>

                                                        <div className="relative h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                                                            <div
                                                                className={`absolute inset-0 bg-primary/20 blur-sm w-[${percentage}%] transition-all duration-1000`}
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                            <div
                                                                className="h-full bg-gradient-primary rounded-full transition-all duration-1000 ease-out"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </div>
                                                        <div className="flex justify-between mt-1">
                                                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{nominee.votes} votes</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {rankedNominees.length === 0 && (
                                                <div className="text-center py-12 text-muted-foreground">
                                                    No nominees registered in this category yet.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>
                            );
                        })}
                    </Tabs>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Leaderboard;
