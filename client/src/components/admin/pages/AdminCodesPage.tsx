import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, ExternalLink, Percent, Edit2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DiscountCode {
    id: string;
    sponsorId: string | null;
    code: string;
    description: string | null;
    discountPercent: number | null;
    url: string | null;
    displayOrder: number;
    isActive: boolean;
}

interface Sponsor {
    id: string;
    name: string;
}

export function AdminCodesPage() {
    const { toast } = useToast();
    const [newCode, setNewCode] = useState({
        code: "",
        description: "",
        discountPercent: "",
        url: "",
        sponsorId: "",
    });

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<DiscountCode>>({});

    const { data: codes = [] } = useQuery<DiscountCode[]>({
        queryKey: ["/api/discount-codes"],
    });

    const { data: sponsors = [] } = useQuery<Sponsor[]>({
        queryKey: ["/api/sponsors"],
    });

    const addCode = useMutation({
        mutationFn: (data: typeof newCode) =>
            apiRequest("POST", "/api/admin/discount-codes", {
                ...data,
                discountPercent: data.discountPercent ? parseInt(data.discountPercent) : null,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/discount-codes"] });
            setNewCode({ code: "", description: "", discountPercent: "", url: "", sponsorId: "" });
            toast({ title: "Oyun kodu eklendi" });
        },
    });

    const updateCode = useMutation({
        mutationFn: ({ id, ...data }: Partial<DiscountCode> & { id: string }) =>
            apiRequest("PUT", `/api/admin/discount-codes/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/discount-codes"] });
            setEditingId(null);
            toast({ title: "Kod güncellendi" });
        },
    });

    const deleteCode = useMutation({
        mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/discount-codes/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/discount-codes"] });
            toast({ title: "Kod silindi" });
        },
    });

    const handleAddCode = () => {
        if (!newCode.code.trim()) {
            toast({ title: "Kod gerekli", variant: "destructive" });
            return;
        }
        addCode.mutate(newCode);
    };

    const startEdit = (code: DiscountCode) => {
        setEditingId(code.id);
        setEditForm({
            code: code.code,
            description: code.description || "",
            discountPercent: code.discountPercent || null,
            url: code.url || "",
            sponsorId: code.sponsorId || "",
        });
    };

    const saveEdit = (id: string) => {
        updateCode.mutate({
            id,
            ...editForm,
            discountPercent: editForm.discountPercent ? Number(editForm.discountPercent) : null,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const getSponsorName = (sponsorId: string | null) => {
        if (!sponsorId) return "Genel";
        const sponsor = sponsors.find(s => s.id === sponsorId);
        return sponsor?.name || "Bilinmeyen";
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Oyunlar</h1>
                <p className="text-muted-foreground">Oyun kodlarınızı ve indirimlerinizi yönetin</p>
            </div>

            {/* Add New Code */}
            <Card>
                <CardHeader>
                    <CardTitle>Yeni Kod Ekle</CardTitle>
                    <CardDescription>Yeni bir oyun kodu veya indirim ekleyin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Kod</Label>
                            <Input
                                value={newCode.code}
                                onChange={(e) => setNewCode({ ...newCode, code: e.target.value })}
                                placeholder="Ör: SUMMER2024"
                            />
                        </div>
                        <div>
                            <Label>İndirim Yüzdesi (Opsiyonel)</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={newCode.discountPercent}
                                    onChange={(e) => setNewCode({ ...newCode, discountPercent: e.target.value })}
                                    placeholder="20"
                                    min="0"
                                    max="100"
                                />
                                <Percent className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <Label>Açıklama (Opsiyonel)</Label>
                        <Textarea
                            value={newCode.description}
                            onChange={(e) => setNewCode({ ...newCode, description: e.target.value })}
                            placeholder="Kod hakkında açıklama..."
                            className="h-20"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>URL (Opsiyonel)</Label>
                            <Input
                                value={newCode.url}
                                onChange={(e) => setNewCode({ ...newCode, url: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                        <div>
                            <Label>Sponsor (Opsiyonel)</Label>
                            <Select
                                value={newCode.sponsorId}
                                onValueChange={(value) => setNewCode({ ...newCode, sponsorId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sponsor seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Genel</SelectItem>
                                    {sponsors.map((sponsor) => (
                                        <SelectItem key={sponsor.id} value={sponsor.id}>
                                            {sponsor.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button onClick={handleAddCode} disabled={addCode.isPending}>
                        <Plus className="w-4 h-4 mr-2" />
                        Kod Ekle
                    </Button>
                </CardContent>
            </Card>

            {/* Existing Codes */}
            <Card>
                <CardHeader>
                    <CardTitle>Mevcut Kodlar</CardTitle>
                    <CardDescription>{codes.length} oyun kodu</CardDescription>
                </CardHeader>
                <CardContent>
                    {codes.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Henüz kod eklenmemiş
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {codes
                                .sort((a, b) => a.displayOrder - b.displayOrder)
                                .map((code) => (
                                    <div
                                        key={code.id}
                                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                    >
                                        {editingId === code.id ? (
                                            // Edit Mode
                                            <div className="flex-1 space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <Label className="text-xs">Kod</Label>
                                                        <Input
                                                            value={editForm.code || ""}
                                                            onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                                                            className="h-8"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">İndirim %</Label>
                                                        <Input
                                                            type="number"
                                                            value={editForm.discountPercent || ""}
                                                            onChange={(e) => setEditForm({ ...editForm, discountPercent: e.target.value ? Number(e.target.value) : null })}
                                                            className="h-8"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="text-xs">Açıklama</Label>
                                                    <Textarea
                                                        value={editForm.description || ""}
                                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                        className="h-16"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-xs">URL</Label>
                                                    <Input
                                                        value={editForm.url || ""}
                                                        onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                                                        className="h-8"
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={() => saveEdit(code.id)}>
                                                        <Save className="w-3 h-3 mr-1" />
                                                        Kaydet
                                                    </Button>
                                                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                                                        <X className="w-3 h-3 mr-1" />
                                                        İptal
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            // View Mode
                                            <>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <code className="text-lg font-bold bg-primary/10 px-3 py-1 rounded">
                                                            {code.code}
                                                        </code>
                                                        {code.discountPercent && (
                                                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                                %{code.discountPercent} İndirim
                                                            </span>
                                                        )}
                                                        <span className="text-sm text-muted-foreground">
                                                            • {getSponsorName(code.sponsorId)}
                                                        </span>
                                                    </div>
                                                    {code.description && (
                                                        <p className="text-sm text-muted-foreground mt-2">
                                                            {code.description}
                                                        </p>
                                                    )}
                                                    {code.url && (
                                                        <a
                                                            href={code.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
                                                        >
                                                            {code.url}
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Label className="text-xs">Aktif</Label>
                                                        <Switch
                                                            checked={code.isActive}
                                                            onCheckedChange={(checked) =>
                                                                updateCode.mutate({ id: code.id, isActive: checked })
                                                            }
                                                        />
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => startEdit(code)}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            if (confirm(`${code.code} kodunu silmek istediğinize emin misiniz?`)) {
                                                                deleteCode.mutate(code.id);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
