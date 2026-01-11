
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
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    DbCategory
} from "@/services/votingService";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CategoryManager = () => {
    const [categories, setCategories] = useState<DbCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<DbCategory | null>(null);
    const [formData, setFormData] = useState({ id: "", name: "", description: "", icon: "" });

    const loadCategories = async () => {
        setLoading(true);
        const data = await fetchCategories();
        setCategories(data);
        setLoading(false);
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleOpenDialog = (category?: DbCategory) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                id: category.id,
                name: category.name,
                description: category.description,
                icon: category.icon,
            });
        } else {
            setEditingCategory(null);
            setFormData({ id: "", name: "", description: "", icon: "" });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.id || !formData.name) {
            toast.error("ID and Name are required");
            return;
        }

        const { id, name, description, icon } = formData;
        let success = false;

        if (editingCategory) {
            const result = await updateCategory(editingCategory.id, { name, description, icon });
            success = result.success;
            if (!success) toast.error(result.error || "Update failed");
        } else {
            const result = await createCategory({ id, name, description, icon });
            success = result.success;
            if (!success) toast.error(result.error || "Create failed");
        }

        if (success) {
            toast.success(editingCategory ? "Category updated" : "Category created");
            setIsDialogOpen(false);
            loadCategories();
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure? This will delete all nominees in this category.")) {
            const result = await deleteCategory(id);
            if (result.success) {
                toast.success("Category deleted");
                loadCategories();
            } else {
                toast.error(result.error || "Delete failed");
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-display">Categories</h2>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                    <Plus size={16} /> Add Category
                </Button>
            </div>

            <div className="border border-white/10 rounded-lg overflow-hidden bg-card/30">
                <Table>
                    <TableHeader>
                        <TableRow className="border-white/10 hover:bg-white/5">
                            <TableHead>Icon</TableHead>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
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
                        ) : categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No categories found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((category) => (
                                <TableRow key={category.id} className="border-white/10 hover:bg-white/5">
                                    <TableCell className="text-2xl">{category.icon}</TableCell>
                                    <TableCell className="font-mono text-xs">{category.id}</TableCell>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell className="text-muted-foreground truncate max-w-[200px]">
                                        {category.description}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(category)}>
                                                <Pencil size={16} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(category.id)}>
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
                        <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="id">Unqiue ID (e.g. game-for-change)</Label>
                            <Input
                                id="id"
                                value={formData.id}
                                onChange={(e) => setFormData({ ...formData, id: e.target.value.trim() })}
                                disabled={!!editingCategory}
                                placeholder="slug-format"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Display Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Best Game..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="icon">Icon (Emoji)</Label>
                            <Input
                                id="icon"
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                placeholder="🏆"
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
                        <Button type="submit" className="w-full">
                            {editingCategory ? "Update Category" : "Create Category"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CategoryManager;
