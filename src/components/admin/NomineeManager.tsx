
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    fetchNominees,
    fetchCategories,
    createNominee,
    updateNominee,
    deleteNominee,
    DbNominee,
    DbCategory
} from "@/services/votingService";
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

const NomineeManager = () => {
    const [nominees, setNominees] = useState<DbNominee[]>([]);
    const [categories, setCategories] = useState<DbCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingNominee, setEditingNominee] = useState<DbNominee | null>(null);

    // Filter state
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

    const [formData, setFormData] = useState({
        id: "",
        name: "",
        description: "",
        image_url: "",
        category_id: ""
    });

    const loadData = async () => {
        setLoading(true);
        const [nomData, catData] = await Promise.all([
            fetchNominees(),
            fetchCategories()
        ]);
        setNominees(nomData);
        setCategories(catData);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleOpenDialog = (nominee?: DbNominee) => {
        if (nominee) {
            setEditingNominee(nominee);
            setFormData({
                id: nominee.id,
                name: nominee.name,
                description: nominee.description,
                image_url: nominee.image_url,
                category_id: nominee.category_id,
            });
        } else {
            setEditingNominee(null);
            setFormData({
                id: crypto.randomUUID(), // Auto-generate ID for nominees
                name: "",
                description: "",
                image_url: "",
                category_id: categories[0]?.id || ""
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.category_id) {
            toast.error("Name and Category are required");
            return;
        }

        const { id, name, description, image_url, category_id } = formData;
        let success = false;

        if (editingNominee) {
            const result = await updateNominee(editingNominee.id, { name, description, image_url, category_id });
            success = result.success;
            if (!success) toast.error(result.error || "Update failed");
        } else {
            const result = await createNominee({ id, name, description, image_url, category_id });
            success = result.success;
            if (!success) toast.error(result.error || "Create failed");
        }

        if (success) {
            toast.success(editingNominee ? "Nominee updated" : "Nominee created");
            setIsDialogOpen(false);
            loadData();
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure?")) {
            const result = await deleteNominee(id);
            if (result.success) {
                toast.success("Nominee deleted");
                loadData();
            } else {
                toast.error(result.error || "Delete failed");
            }
        }
    };

    const filteredNominees = selectedCategoryFilter === "all"
        ? nominees
        : nominees.filter(n => n.category_id === selectedCategoryFilter);

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl font-display">Nominees</h2>
                <div className="flex gap-2">
                    <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Filter by Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={() => handleOpenDialog()} className="gap-2">
                        <Plus size={16} /> Add Nominee
                    </Button>
                </div>
            </div>

            <div className="border border-white/10 rounded-lg overflow-hidden bg-card/30">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead>Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="hidden md:table-cell">Description</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : filteredNominees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No nominees found in this category.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredNominees.map((nominee) => (
                                <TableRow key={nominee.id} className="border-white/10 hover:bg-white/5">
                                    <TableCell>
                                        {nominee.image_url ? (
                                            <img src={nominee.image_url} alt={nominee.name} className="w-8 h-8 rounded object-cover" />
                                        ) : (
                                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                                                <ImageIcon size={14} className="text-muted-foreground" />
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{nominee.name}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {categories.find(c => c.id === nominee.category_id)?.name || nominee.category_id}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-muted-foreground truncate max-w-[200px]">
                                        {nominee.description}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(nominee)}>
                                                <Pencil size={16} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(nominee.id)}>
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingNominee ? "Edit Nominee" : "Add Nominee"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={formData.category_id}
                                onValueChange={(val) => setFormData({ ...formData, category_id: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Game Name / Person Name"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="image_url">Image URL</Label>
                            <Input
                                id="image_url"
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            {editingNominee ? "Update Nominee" : "Create Nominee"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default NomineeManager;
