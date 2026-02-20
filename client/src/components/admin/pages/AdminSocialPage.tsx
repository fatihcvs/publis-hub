import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Plus, Trash2, ExternalLink, Edit2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SocialLink {
    id: string;
    platform: string;
    url: string;
    displayOrder: number;
    isActive: boolean;
    displayStyle: string;
}

const PLATFORMS = [
    "Kick", "YouTube", "Twitch", "Twitter", "Instagram",
    "Discord", "TikTok", "GitHub", "Facebook", "LinkedIn", "Website"
];

export function AdminSocialPage() {
    const { toast } = useToast();
    const [newLink, setNewLink] = useState({ platform: "Kick", url: "" });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<SocialLink>>({});

    const { data: socialLinks = [] } = useQuery<SocialLink[]>({
        queryKey: ["/api/social-links"],
    });

    const addLink = useMutation({
        mutationFn: (data: { platform: string; url: string }) =>
            apiRequest("POST", "/api/admin/social-links", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/social-links"] });
            setNewLink({ platform: "Kick", url: "" });
            toast({ title: "Sosyal medya linki eklendi" });
        },
    });

    const updateLink = useMutation({
        mutationFn: ({ id, ...data }: Partial<SocialLink> & { id: string }) =>
            apiRequest("PUT", `/api/admin/social-links/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/social-links"] });
            setEditingId(null);
            toast({ title: "Link güncellendi" });
        },
    });

    const deleteLink = useMutation({
        mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/social-links/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/social-links"] });
            toast({ title: "Link silindi" });
        },
    });

    const handleAddLink = () => {
        if (!newLink.url.trim()) {
            toast({ title: "URL gerekli", variant: "destructive" });
            return;
        }
        addLink.mutate(newLink);
    };

    const startEdit = (link: SocialLink) => {
        setEditingId(link.id);
        setEditForm({
            platform: link.platform,
            url: link.url,
            displayStyle: link.displayStyle,
        });
    };

    const saveEdit = (id: string) => {
        if (!editForm.url?.trim()) {
            toast({ title: "URL gerekli", variant: "destructive" });
            return;
        }
        updateLink.mutate({ id, ...editForm });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Sosyal Medya</h1>
                <p className="text-muted-foreground">Sosyal medya linklerinizi yönetin</p>
            </div>

            {/* Add New Link */}
            <Card>
                <CardHeader>
                    <CardTitle>Yeni Link Ekle</CardTitle>
                    <CardDescription>Sosyal medya hesaplarınızı ekleyin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Platform</Label>
                            <Select
                                value={newLink.platform}
                                onValueChange={(value) => setNewLink({ ...newLink, platform: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PLATFORMS.map((platform) => (
                                        <SelectItem key={platform} value={platform}>
                                            {platform}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-2">
                            <Label>URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={newLink.url}
                                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                                    placeholder="https://..."
                                    className="flex-1"
                                />
                                <Button onClick={handleAddLink} disabled={addLink.isPending}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Ekle
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Existing Links */}
            <Card>
                <CardHeader>
                    <CardTitle>Mevcut Linkler</CardTitle>
                    <CardDescription>{socialLinks.length} sosyal medya linki</CardDescription>
                </CardHeader>
                <CardContent>
                    {socialLinks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Henüz sosyal medya linki eklenmemiş
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {socialLinks
                                .sort((a, b) => a.displayOrder - b.displayOrder)
                                .map((link) => (
                                    <div
                                        key={link.id}
                                        className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                    >
                                        {editingId === link.id ? (
                                            // Edit Mode
                                            <div className="flex-1 space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <Label className="text-xs">Platform</Label>
                                                        <Select
                                                            value={editForm.platform}
                                                            onValueChange={(value) => setEditForm({ ...editForm, platform: value })}
                                                        >
                                                            <SelectTrigger className="h-8">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {PLATFORMS.map((platform) => (
                                                                    <SelectItem key={platform} value={platform}>
                                                                        {platform}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Görünüm</Label>
                                                        <Select
                                                            value={editForm.displayStyle}
                                                            onValueChange={(value) => setEditForm({ ...editForm, displayStyle: value })}
                                                        >
                                                            <SelectTrigger className="h-8">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="standard">Standart</SelectItem>
                                                                <SelectItem value="icon">Sadece İkon</SelectItem>
                                                                <SelectItem value="text">Sadece Yazı</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
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
                                                    <Button size="sm" onClick={() => saveEdit(link.id)}>
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
                                                    <div className="font-semibold">{link.platform}</div>
                                                    <a
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                                                    >
                                                        {link.url}
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                    <span className="text-xs text-muted-foreground mt-1 block">
                                                        Görünüm: {link.displayStyle === "standard" ? "Standart" : link.displayStyle === "icon" ? "Sadece İkon" : "Sadece Yazı"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => startEdit(link)}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            if (confirm(`${link.platform} linkini silmek istediğinize emin misiniz?`)) {
                                                                deleteLink.mutate(link.id);
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
