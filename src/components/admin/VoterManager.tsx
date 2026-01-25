
import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { fetchUsersWithStatus, deleteUser, deleteUnverifiedUsers, UserProfile } from "@/services/votingService";
import { Loader2, Search, Trash2, AlertTriangle, CheckCircle, UserX, Ghost, Mail, ShieldCheck, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const VoterManager = () => {
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showUnverifiedOnly, setShowUnverifiedOnly] = useState(false);
    const [showSuspiciousOnly, setShowSuspiciousOnly] = useState(false);
    const [isDeletingAll, setIsDeletingAll] = useState(false);

    const loadProfiles = async () => {
        setLoading(true);
        const data = await fetchUsersWithStatus();
        setProfiles(data);
        setLoading(false);
    };

    useEffect(() => {
        loadProfiles();
    }, []);

    const handleDelete = async (userId: string) => {
        setDeletingId(userId);
        const { success, error } = await deleteUser(userId);
        if (success) {
            toast.success("User and all their data deleted permanently");
            setProfiles(profiles.filter(p => p.id !== userId && p.user_id !== userId));
        } else {
            toast.error("Failed to delete user", { description: error });
        }
        setDeletingId(null);
    };

    const handleDeleteUnverified = async () => {
        setIsDeletingAll(true);
        const { success, count, error } = await deleteUnverifiedUsers();
        if (success) {
            toast.success(`Deleted ${count} unverified users successfully`);
            loadProfiles(); // Reload to refresh list
        } else {
            toast.error("Failed to delete unverified users", { description: error });
        }
        setIsDeletingAll(false);
    };

    const handleDeleteSuspicious = async () => {
        setIsDeletingAll(true);
        // Filter current profiles to get suspicious ones
        const suspiciousProfiles = profiles.filter(p => isSuspicious(p.email));

        let deletedCount = 0;
        let errorCount = 0;

        // Delete linearly (could be parallelized but safer linearly to avoid rate limits)
        for (const profile of suspiciousProfiles) {
            const targetId = profile.user_id || profile.id;
            const { success } = await deleteUser(targetId);
            if (success) {
                deletedCount++;
            } else {
                errorCount++;
            }
        }

        toast.success(`Deleted ${deletedCount} suspicious users. ${errorCount > 0 ? `${errorCount} failed.` : ''}`);
        loadProfiles();
        setIsDeletingAll(false);
    };

    const isSuspicious = (email: string | null) => {
        if (!email) return false;
        const localPart = email.split('@')[0];

        let score = 0;

        // 1. Digital Noise
        // Catch "vig66" (Short with digits) or "user123456" (Too many digits)
        const digitCount = (localPart.match(/\d/g) || []).length;
        if (digitCount >= 4) return true; // Instant flag: Too many numbers
        if (localPart.length < 8 && digitCount >= 2) score += 2; // Short with multiple digits
        if (/\d{2,}$/.test(localPart)) score += 1; // Ends with 2+ digits

        // 2. Character Repetition (e.g. "haakabka", "hejjsjsjj")
        const charMap: Record<string, number> = {};
        let maxCharCount = 0;
        for (const char of localPart) {
            charMap[char] = (charMap[char] || 0) + 1;
            maxCharCount = Math.max(maxCharCount, charMap[char]);
        }
        // If one character makes up > 40% of the name (for reasonable length names)
        if (localPart.length > 6 && (maxCharCount / localPart.length) > 0.4) score += 2;

        // 3. Consonant Clumping (e.g. "hhsiss6u")
        // Check for 4+ consecutive consonants (very rare in real names)
        if (/[bcdfghjklmnpqrstvwxyz]{4,}/i.test(localPart)) score += 2;

        // 4. Gibberish / Chaos (e.g. "tauahsg6u7", "hhsiss6u")
        // Check for alternating Letter-Digit-Letter patterns (high transitions)
        // e.g. "g6u7" has 3 transitions. "alex123" has 1.
        let transitions = 0;
        let isDigit = /\d/.test(localPart[0]);
        for (let i = 1; i < localPart.length; i++) {
            const currentIsDigit = /\d/.test(localPart[i]);
            if (currentIsDigit !== isDigit) {
                transitions++;
                isDigit = currentIsDigit;
            }
        }
        if (transitions >= 2) score += 1;
        if (transitions >= 4) score += 2; // Very chaotic

        // 5. Vowel Ratio (Low vowels often mean keyboard mash)
        const vowels = (localPart.match(/[aeiou]/gi) || []).length;
        if (localPart.length > 6 && vowels === 0) return true; // Instant flag: No vowels
        if (localPart.length > 8 && vowels / localPart.length < 0.2) score += 1;

        // 6. Double Start (e.g. "hhsiss...")
        if (localPart.length > 4 && localPart[0] === localPart[1]) score += 1;

        // Threshold
        return score >= 2;
    };

    const filteredProfiles = profiles.filter(p => {
        const matchesSearch = p.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesUnverified = showUnverifiedOnly ? !p.email_confirmed_at : true;
        const matchesSuspicious = showSuspiciousOnly ? isSuspicious(p.email) : true;

        return matchesSearch && matchesUnverified && matchesSuspicious;
    });

    const suspiciousCount = filteredProfiles.filter(p => isSuspicious(p.email)).length;
    const unverifiedCount = profiles.filter(p => !p.email_confirmed_at).length;

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-card/50 border-white/10"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        variant={showUnverifiedOnly ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setShowUnverifiedOnly(!showUnverifiedOnly)}
                        className="gap-2"
                    >
                        <Filter size={14} />
                        {showUnverifiedOnly ? "Show All Users" : "Show Unverified Only"}
                    </Button>

                    <div className="px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm flex items-center gap-2">
                        <AlertTriangle size={16} />
                        <span>{suspiciousCount} Suspicious</span>
                    </div>

                    <Button
                        variant={showSuspiciousOnly ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => {
                            setShowSuspiciousOnly(!showSuspiciousOnly);
                            if (!showSuspiciousOnly) setShowUnverifiedOnly(false); // Toggle others off for clarity
                        }}
                        className={`gap-2 ${showSuspiciousOnly ? "bg-orange-500/20 text-orange-500 border-orange-500/30 hover:bg-orange-500/30" : ""}`}
                    >
                        <AlertTriangle size={14} />
                        {showSuspiciousOnly ? "Show All Users" : "Show Suspicious Only"}
                    </Button>

                    {unverifiedCount > 0 && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" disabled={isDeletingAll}>
                                    {isDeletingAll ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                    Delete {unverifiedCount} Unverified
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-900 border-white/10">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">Delete All Unverified Users?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-slate-400">
                                        This will permanently delete <strong>{unverifiedCount} users</strong> who have not verified their email address.
                                        This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-slate-800 text-white border-white/10 hover:bg-slate-700">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteUnverified} className="bg-destructive text-white hover:bg-destructive/90">
                                        Yes, Delete All
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}

                    {suspiciousCount > 0 && showSuspiciousOnly && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" disabled={isDeletingAll}>
                                    {isDeletingAll ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                    Delete {suspiciousCount} Suspicious
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-900 border-white/10">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">Delete All Suspicious Users?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-slate-400">
                                        This will permanently delete <strong>{suspiciousCount} users</strong> flagged as suspicious.
                                        Please review the list before confirming, as this action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-slate-800 text-white border-white/10 hover:bg-slate-700">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteSuspicious} className="bg-destructive text-white hover:bg-destructive/90">
                                        Yes, Delete All
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden bg-card/30">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow>
                            <TableHead>Email Address</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Verified</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProfiles.length > 0 ? (
                            filteredProfiles.map((profile) => {
                                const suspicious = isSuspicious(profile.email);
                                const verified = !!profile.email_confirmed_at;

                                // Determine the ID to use for deletion (prefer user_id but fall back to id if needed)
                                // In the new RPC, id IS user_id. In the old mock/fetchProfiles, user_id was separate.
                                // We check both to be safe.
                                const deleteTargetId = profile.user_id || profile.id;
                                return (
                                    <TableRow key={profile.id} className="hover:bg-white/5 border-white/5">
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span>{profile.email}</span>
                                                <span className="text-xs text-muted-foreground">{profile.id.slice(0, 8)}...</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(profile.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {verified ? (
                                                <span className="inline-flex items-center gap-1.5 text-xs text-green-400">
                                                    <ShieldCheck size={14} /> Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-xs text-yellow-400">
                                                    <Mail size={14} /> Pending
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {suspicious ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-500 border border-orange-500/30">
                                                    <AlertTriangle size={10} />
                                                    Suspicious
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-green-500/20 text-green-500 border border-green-500/30">
                                                    <CheckCircle size={10} />
                                                    OK
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        disabled={deletingId === deleteTargetId}
                                                    >
                                                        {deletingId === deleteTargetId ? (
                                                            <Loader2 size={16} className="animate-spin" />
                                                        ) : (
                                                            <UserX size={16} />
                                                        )}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="bg-slate-900 border-white/10">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="text-white flex items-center gap-2">
                                                            <Ghost className="text-destructive" />
                                                            Delete Voter?
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription className="text-slate-400">
                                                            This action will permanently delete <strong>{profile.email}</strong>.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="bg-slate-800 text-white border-white/10 hover:bg-slate-700">Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(deleteTargetId)}
                                                            className="bg-destructive text-white hover:bg-destructive/90"
                                                        >
                                                            Delete Permanently
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                    No voters found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div >
    );
};

export default VoterManager;
