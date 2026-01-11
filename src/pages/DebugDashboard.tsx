import { useEffect, useState } from "react";
import { fetchCategories, fetchNominees, DbCategory, DbNominee } from "@/services/votingService";
import { Loader2 } from "lucide-react";

const DebugDashboard = () => {
    const [categories, setCategories] = useState<DbCategory[]>([]);
    const [nominees, setNominees] = useState<DbNominee[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const [cats, noms] = await Promise.all([fetchCategories(), fetchNominees()]);
            setCategories(cats);
            setNominees(noms);
            setLoading(false);
        };
        loadData();
    }, []);

    if (loading) return <div className="p-8 flex items-center gap-2"><Loader2 className="animate-spin" /> Loading Debug Data...</div>;

    return (
        <div className="p-8 bg-black text-white min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-red-500">DEBUG DASHBOARD</h1>

            <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-cyan-400">Categories ({categories.length})</h2>
                <div className="border border-white/20 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/10 uppercase">
                            <tr>
                                <th className="p-3">ID</th>
                                <th className="p-3">Name</th>
                                <th className="p-3">Nominee Count (Calc)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {categories.map(cat => {
                                const count = nominees.filter(n => n.category_id === cat.id).length;
                                return (
                                    <tr key={cat.id} className="hover:bg-white/5">
                                        <td className="p-3 font-mono text-xs text-gray-400">{cat.id}</td>
                                        <td className="p-3 font-bold">{cat.name}</td>
                                        <td className={`p-3 font-bold ${count === 0 ? "text-red-500" : "text-green-500"}`}>{count}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-4 text-cyan-400">Nominees ({nominees.length})</h2>
                <div className="border border-white/20 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/10 uppercase">
                            <tr>
                                <th className="p-3">ID</th>
                                <th className="p-3">Name</th>
                                <th className="p-3">Category ID (FK)</th>
                                <th className="p-3">Matched Category</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {nominees.map(nom => {
                                const parent = categories.find(c => c.id === nom.category_id);
                                return (
                                    <tr key={nom.id} className="hover:bg-white/5">
                                        <td className="p-3 font-mono text-xs text-gray-400">{nom.id}</td>
                                        <td className="p-3">{nom.name}</td>
                                        <td className="p-3 font-mono text-xs text-gray-400">{nom.category_id}</td>
                                        <td className={`p-3 ${parent ? "text-green-500" : "text-red-500 font-bold"}`}>
                                            {parent ? parent.name : "ORPHANED / MISMATCH"}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default DebugDashboard;
