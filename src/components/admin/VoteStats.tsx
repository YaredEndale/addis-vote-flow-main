
import { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { Vote, DbCategory, DbNominee } from "@/services/votingService";

interface VoteStatsProps {
    votes: Vote[];
    category: DbCategory;
    nominees: DbNominee[];
}

const VoteStats = ({ votes, category, nominees }: VoteStatsProps) => {
    const categoryNominees = nominees.filter((n) => n.category_id === category.id);

    const data = useMemo(() => {
        // Initialize counts for all nominees in this category
        const counts: Record<string, number> = {};
        categoryNominees.forEach((n) => {
            counts[n.id] = 0;
        });

        // Count votes
        votes.forEach((v) => {
            if (v.category_id === category.id && counts[v.nominee_id] !== undefined) {
                counts[v.nominee_id]++;
            }
        });

        // Format for Recharts
        return categoryNominees.map((n) => ({
            name: n.name,
            votes: counts[n.id],
            id: n.id,
        }));
    }, [votes, category.id, categoryNominees]);

    if (!category) return <div>Category not found</div>;

    return (
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
            <h3 className="text-xl font-display mb-6 flex items-center gap-2">
                <span>{category.icon}</span>
                {category.name}
            </h3>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            width={100}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(20, 20, 30, 0.9)',
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                        />
                        <Bar dataKey="votes" radius={[0, 4, 4, 0]} barSize={32}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#9b87f5" : "#D946EF"} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.map((item) => (
                    <div key={item.id} className="bg-background/40 p-3 rounded-lg border border-white/5">
                        <div className="text-sm text-muted-foreground truncate" title={item.name}>{item.name}</div>
                        <div className="text-2xl font-bold">{item.votes}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VoteStats;
