import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Plus, Trash2, ExternalLink, Upload, Loader2, Edit2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Sponsor {
    id: string;
    name: string;
    description: string | null;
    logoUrl: string | null;
    websiteUrl: string | null;
    displayOrder: number;
    isActive: boolean;
}

export function AdminSponsorsPage() {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Sponsor>>({});
    const [newSponsor, setNewSponsor] = useState({
        name: "",
        description: "",
        websiteUrl: "",
        logoUrl: "",
    });

    const { data: sponsors = [] } = useQuery<Sponsor[]>({
        queryKey: ["/api/sponsors"],
    });

    const addSponsor = useMutation({
        mutationFn: (data: typeof newSponsor) =>
            apiRequest("POST", "/api/admin/sponsors", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/sponsors"] });
            setNewSponsor({ name: "", description: "", websiteUrl: "", logoUrl: "" });
            toast({ title: "Sponsor eklendi" });
        },
    });

    const updateSponsor = useMutation({
        mutationFn: ({ id, ...data }: Partial<Sponsor> & { id: string }) =>
            apiRequest("PUT", `/api/admin/sponsors/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/sponsors"] });
            setEditingId(null);
            toast({ title: "Sponsor güncellendi" });
        },
    });

    const deleteSponsor = useMutation({
        mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/sponsors/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/sponsors"] });
            toast({ title: "Sponsor silindi" });
        },
    });

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, sponsorId?: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/admin/upload-sponsor-logo", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (!response.ok) throw new Error("Upload failed");

            const { objectPath } = await response.json();

            if (sponsorId) {
                if (editingId === sponsorId) {
                    setEditForm({ ...editForm, logoUrl: objectPath });
                } else {
                    updateSponsor.mutate({ id: sponsorId, logoUrl: objectPath });
                }
            } else {
                setNewSponsor({ ...newSponsor, logoUrl: objectPath });
            }

            toast({ title: "Logo yüklendi" });
        } catch (error) {
            toast({ title: "Yükleme başarısız", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddSponsor = () => {
        if (!newSponsor.name.trim()) {
            toast({ title: "Sponsor adı gerekli", variant: "destructive" });
            return;
        }
        addSponsor.mutate(newSponsor);
    };

    const startEdit = (sponsor: Sponsor) => {
        setEditingId(sponsor.id);
        setEditForm({
            name: sponsor.name,
            description: sponsor.description || "",
            websiteUrl: sponsor.websiteUrl || "",
            logoUrl: sponsor.logoUrl || "",
        });
    };

    const saveEdit = (id: string) => {
        if (!editForm.name?.trim()) {
            toast({ title: "Sponsor adı gerekli", variant: "destructive" });
            return;
        }
        updateSponsor.mutate({ id, ...editForm });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Sponsorlar</h1>
                <p className="text-muted-foreground">Sponsorlarınızı yönetin</p>
            </div>

            {/* Add New Sponsor */}
            <Card>
                <CardHeader>
                    <CardTitle>Yeni Sponsor Ekle</CardTitle>
                    <CardDescription>Sponsor bilgilerini girin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Sponsor Adı *</Label>
                            <Input
                                value={newSponsor.name}
                                onChange={(e) => setNewSponsor({ ...newSponsor, name: e.target.value })}
                                placeholder="TechGear Pro"
                            />
                        </div>
                        <div>
                            <Label>Website URL</Label>
                            <Input
                                value={newSponsor.websiteUrl}
                                onChange={(e) => setNewSponsor({ ...newSponsor, websiteUrl: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Açıklama</Label>
                        <Textarea
                            value={newSponsor.description}
                            onChange={(e) => setNewSponsor({ ...newSponsor, description: e.target.value })}
                            placeholder="Sponsor hakkında kısa açıklama..."
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label>Logo</Label>
                        <div className="flex items-center gap-3 mt-2">
                            {newSponsor.logoUrl ? (
                                <img
                                    src={newSponsor.logoUrl}
                                    alt="Logo"
                                    className="w-20 h-20 rounded-md object-cover border"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-md bg-muted border flex items-center justify-center text-muted-foreground text-xs">
                                    Logo Yok
                                </div>
                            )}
                            <div className="flex flex-col gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={isUploading}
                                    onClick={() => document.getElementById("new-logo-upload")?.click()}
                                >
                                    {isUploading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Upload className="w-4 h-4 mr-2" />
                                    )}
                                    {isUploading ? "Yükleniyor..." : "Logo Yükle"}
                                </Button>
                                <input
                                    id="new-logo-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleLogoUpload(e)}
                                />
                            </div>
                        </div>
                    </div>

                    <Button onClick={handleAddSponsor} disabled={addSponsor.isPending}>
                        <Plus className="w-4 h-4 mr-2" />
                        Sponsor Ekle
                    </Button>
                </CardContent>
            </Card>

            {/* Existing Sponsors */}
            <Card>
                <CardHeader>
                    <CardTitle>Mevcut Sponsorlar</CardTitle>
                    <CardDescription>{sponsors.length} sponsor</CardDescription>
                </CardHeader>
                <CardContent>
                    {sponsors.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Henüz sponsor eklenmemiş
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sponsors
                                .sort((a, b) => a.displayOrder - b.displayOrder)
                                .map((sponsor) => (
                                    <div
                                        key={sponsor.id}
                                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                    >
                                        {editingId === sponsor.id ? (
                                            // Edit Mode
                                            <div className="flex-1 space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <Label className="text-xs">Sponsor Adı</Label>
                                                        <Input
                                                            value={editForm.name || ""}
                                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                            className="h-8"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Website URL</Label>
                                                        <Input
                                                            value={editForm.websiteUrl || ""}
                                                            onChange={(e) => setEditForm({ ...editForm, websiteUrl: e.target.value })}
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
                                                    <Label className="text-xs">Logo</Label>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        {editForm.logoUrl ? (
                                                            <img
                                                                src={editForm.logoUrl}
                                                                alt="Logo"
                                                                className="w-16 h-16 rounded-md object-cover border"
                                                            />
                                                        ) : (
                                                            <div className="w-16 h-16 rounded-md bg-muted border flex items-center justify-center text-muted-foreground text-xs">
                                                                Logo Yok
                                                            </div>
                                                        )}
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={isUploading}
                                                            onClick={() => document.getElementById(`edit-logo-${sponsor.id}`)?.click()}
                                                        >
                                                            {isUploading ? (
                                                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                            ) : (
                                                                <Upload className="w-3 h-3 mr-1" />
                                                            )}
                                                            {isUploading ? "Yükleniyor..." : "Değiştir"}
                                                        </Button>
                                                        <input
                                                            id={`edit-logo-${sponsor.id}`}
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => handleLogoUpload(e, sponsor.id)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={() => saveEdit(sponsor.id)}>
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
                                                {sponsor.logoUrl ? (
                                                    <img
                                                        src={sponsor.logoUrl}
                                                        alt={sponsor.name}
                                                        className="w-16 h-16 rounded-md object-cover border"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-md bg-muted border flex items-center justify-center text-muted-foreground text-xs">
                                                        Logo Yok
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <div className="font-semibold text-lg">{sponsor.name}</div>
                                                    {sponsor.description && (
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {sponsor.description}
                                                        </p>
                                                    )}
                                                    {sponsor.websiteUrl && (
                                                        <a
                                                            href={sponsor.websiteUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
                                                        >
                                                            {sponsor.websiteUrl}
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => startEdit(sponsor)}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            if (confirm(`${sponsor.name} sponsorunu silmek istediğinize emin misiniz?`)) {
                                                                deleteSponsor.mutate(sponsor.id);
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
