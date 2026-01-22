
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
import { fetchDetailedVotes, DetailedVote } from "@/services/votingService";
import { Download, Loader2, Search, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

const VoteAuditList = () => {
    const [votes, setVotes] = useState<DetailedVote[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const loadVotes = async () => {
            const data = await fetchDetailedVotes();
            setVotes(data);
            setLoading(false);
        };
        loadVotes();
    }, []);

    const exportToCsv = () => {
        if (votes.length === 0) return;

        // CSV Header
        const headers = ["Email", "Category", "Nominee", "Voted At"];

        // CSV Rows
        const rows = votes.map(v => [
            v.profiles?.email || "Unknown",
            v.categories?.name || "Unknown",
            v.nominees?.name || "Unknown",
            new Date(v.created_at).toLocaleString()
        ]);

        // Combine
        const csvContent = [
            headers.join(","),
            ...rows.map(r => r.map(field => `"${field}"`).join(","))
        ].join("\n");

        // Download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `votes_audit_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredVotes = votes.filter(v =>
        v.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.categories?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.nominees?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                        placeholder="Search by email, category or nominee..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-card/50 border-white/10"
                    />
                </div>
                <Button onClick={exportToCsv} variant="outline" className="gap-2 shrink-0">
                    <Download size={16} />
                    Export to Excel (CSV)
                </Button>
            </div>

            <div className="rounded-xl border border-white/10 overflow-hidden bg-card/30">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow>
                            <TableHead>Voter Email</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Nominee</TableHead>
                            <TableHead>Date & Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredVotes.length > 0 ? (
                            filteredVotes.map((vote) => (
                                <TableRow key={vote.id} className="hover:bg-white/5 border-white/5">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {vote.profiles?.email}
                                        </div>
                                    </TableCell>
                                    <TableCell>{vote.categories?.name}</TableCell>
                                    <TableCell className="text-primary font-medium">{vote.nominees?.name}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(vote.created_at).toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                    No records found matching your search.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default VoteAuditList;
