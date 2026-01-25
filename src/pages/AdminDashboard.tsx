
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAllVotes, fetchCategories, fetchNominees, Vote, DbCategory, DbNominee, isVotingActive, setVotingActive } from "@/services/votingService";
import VoteStats from "@/components/admin/VoteStats";
import CategoryManager from "@/components/admin/CategoryManager";
import NomineeManager from "@/components/admin/NomineeManager";
import EventManager from "@/components/admin/EventManager";
import ReservationList from "@/components/admin/ReservationList";
import VoteAuditList from "@/components/admin/VoteAuditList";
import VoterManager from "@/components/admin/VoterManager";
import { Loader2, RefreshCw, ShieldAlert, BarChart3, Settings2, Users, Ticket, Calendar, ListChecks, Power, PowerOff, UserMinus } from "lucide-react";
import { toast } from "sonner";

const AdminDashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [votes, setVotes] = useState<Vote[]>([]);
    const [categories, setCategories] = useState<DbCategory[]>([]);
    const [nominees, setNominees] = useState<DbNominee[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [votingActive, setVotingActiveState] = useState(true);
    const [togglingVoting, setTogglingVoting] = useState(false);

    // Dashboard, Categories, Nominees
    const [activeMainTab, setActiveMainTab] = useState("dashboard");

    const loadData = async () => {
        setLoading(true);
        const [votesData, categoriesData, nomineesData, isActive] = await Promise.all([
            fetchAllVotes(),
            fetchCategories(),
            fetchNominees(),
            isVotingActive()
        ]);
        setVotes(votesData);
        setCategories(categoriesData);
        setNominees(nomineesData);
        setVotingActiveState(isActive);
        setLastUpdated(new Date());
        setLoading(false);
    };

    const handleToggleVoting = async () => {
        setTogglingVoting(true);
        const nextState = !votingActive;
        const { success, error } = await setVotingActive(nextState);

        if (success) {
            setVotingActiveState(nextState);
            toast.success(nextState ? "Voting has been started" : "Voting has been stopped");
        } else {
            toast.error("Failed to update voting status", { description: error });
        }
        setTogglingVoting(false);
    };

    useEffect(() => {
        if (user && activeMainTab === "dashboard") {
            loadData();
        }
    }, [user, activeMainTab]);

    if (authLoading) {
        return (
            <div className="min-h-screen grid place-items-center bg-gradient-dark">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col bg-gradient-dark">
            <Header />

            <main className="flex-1 pt-24 md:pt-28 pb-12 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="font-display text-3xl md:text-4xl mb-2 flex items-center gap-3">
                                <ShieldAlert className="text-primary w-8 h-8" />
                                Admin Dashboard
                            </h1>
                            <p className="text-muted-foreground">
                                Manage voting content and view results
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="text-sm text-muted-foreground hidden md:block">
                                Last updated: {lastUpdated.toLocaleTimeString()}
                            </div>

                            <Button
                                onClick={handleToggleVoting}
                                disabled={togglingVoting}
                                variant={votingActive ? "destructive" : "hero"}
                                size="sm"
                                className="min-w-[140px]"
                            >
                                {togglingVoting ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : votingActive ? (
                                    <PowerOff className="w-4 h-4 mr-2" />
                                ) : (
                                    <Power className="w-4 h-4 mr-2" />
                                )}
                                {votingActive ? "Stop Voting" : "Start Voting"}
                            </Button>

                            <Button onClick={loadData} disabled={loading} variant="outline" size="sm">
                                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh Data
                            </Button>
                        </div>
                    </div>

                    <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="space-y-6">
                        <TabsList className="bg-card/50 border border-white/10 flex-wrap h-auto">
                            <TabsTrigger value="dashboard" className="gap-2"><BarChart3 size={16} /> Dashboard</TabsTrigger>
                            <TabsTrigger value="categories" className="gap-2"><Settings2 size={16} /> Categories</TabsTrigger>
                            <TabsTrigger value="nominees" className="gap-2"><Users size={16} /> Nominees</TabsTrigger>
                            <TabsTrigger value="reservations" className="gap-2"><Ticket size={16} /> Reservations</TabsTrigger>
                            <TabsTrigger value="events" className="gap-2"><Calendar size={16} /> Events</TabsTrigger>
                            <TabsTrigger value="voters" className="gap-2"><UserMinus size={16} /> Voters</TabsTrigger>
                            <TabsTrigger value="audit" className="gap-2"><ListChecks size={16} /> Audit Log</TabsTrigger>
                        </TabsList>

                        <TabsContent value="dashboard" className="animate-fade-in space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-card/30 border border-white/10 rounded-xl p-6">
                                    <h3 className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-2">Total Votes</h3>
                                    <div className="text-4xl font-bold font-display">{votes.length}</div>
                                </div>
                                <div className="bg-card/30 border border-white/10 rounded-xl p-6">
                                    <h3 className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-2">User Count</h3>
                                    <div className="text-4xl font-bold font-display">
                                        {new Set(votes.map(v => v.user_id)).size}
                                    </div>
                                </div>
                                <div className="bg-card/30 border border-white/10 rounded-xl p-6">
                                    <h3 className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-2">Categories</h3>
                                    <div className="text-4xl font-bold font-display">{categories.length}</div>
                                </div>
                            </div>

                            {categories.length > 0 ? (
                                <Tabs defaultValue={categories[0]?.id} className="space-y-6">
                                    <div className="overflow-x-auto pb-2">
                                        <TabsList className="bg-card/50 border border-white/10 h-auto p-1 inline-flex w-max min-w-full justify-start">
                                            {categories.map((category) => (
                                                <TabsTrigger
                                                    key={category.id}
                                                    value={category.id}
                                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2 px-4"
                                                >
                                                    <span className="mr-2">{category.icon}</span>
                                                    {category.name}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                    </div>

                                    {categories.map((category) => (
                                        <TabsContent key={category.id} value={category.id} className="animate-fade-in">
                                            <VoteStats votes={votes} category={category} nominees={nominees} />
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground border border-dashed border-white/10 rounded-xl">
                                    <p>No categories found.</p>
                                    <Button variant="link" onClick={() => setActiveMainTab("categories")}>Create your first category</Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="categories" className="animate-fade-in">
                            <CategoryManager />
                        </TabsContent>

                        <TabsContent value="nominees" className="animate-fade-in">
                            <NomineeManager />
                        </TabsContent>

                        <TabsContent value="reservations" className="animate-fade-in">
                            <div className="bg-card/30 border border-white/10 rounded-xl p-6">
                                <h2 className="text-xl font-display mb-6">Event Reservations</h2>
                                <ReservationList />
                            </div>
                        </TabsContent>

                        <TabsContent value="events" className="animate-fade-in">
                            <div className="bg-card/30 border border-white/10 rounded-xl p-6">
                                <EventManager />
                            </div>
                        </TabsContent>

                        <TabsContent value="voters" className="animate-fade-in">
                            <div className="bg-card/30 border border-white/10 rounded-xl p-6">
                                <h2 className="text-xl font-display mb-6">User Management</h2>
                                <VoterManager />
                            </div>
                        </TabsContent>

                        <TabsContent value="audit" className="animate-fade-in">
                            <div className="bg-card/30 border border-white/10 rounded-xl p-6">
                                <h2 className="text-xl font-display mb-6">Vote Audit Log</h2>
                                <VoteAuditList />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AdminDashboard;
