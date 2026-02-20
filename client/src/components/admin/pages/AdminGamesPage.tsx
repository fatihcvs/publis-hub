import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ExternalLink, Upload, Loader2, Gamepad2, Edit2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Game {
    id: string;
    name: string;
    platform: string | null;
    url: string | null;
    logoUrl: string | null;
    displayOrder: number;
    isActive: boolean;
}

export function AdminGamesPage() {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Game>>({});
    const [newGame, setNewGame] = useState({
        name: "",
        platform: "",
        url: "",
        logoUrl: "",
    });

    const { data: games = [] } = useQuery<Game[]>({
        queryKey: ["/api/games"],
    });

    const addGame = useMutation({
        mutationFn: (data: typeof newGame) =>
            apiRequest("POST", "/api/admin/games", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/games"] });
            setNewGame({ name: "", platform: "", url: "", logoUrl: "" });
            toast({ title: "Oyun eklendi" });
        },
    });

    const updateGame = useMutation({
        mutationFn: ({ id, ...data }: Partial<Game> & { id: string }) =>
            apiRequest("PUT", `/api/admin/games/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/games"] });
            setEditingId(null);
            toast({ title: "Oyun güncellendi" });
        },
    });

    const deleteGame = useMutation({
        mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/games/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/games"] });
            toast({ title: "Oyun silindi" });
        },
    });

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, gameId?: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/admin/upload-game-logo", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (!response.ok) throw new Error("Upload failed");

            const { objectPath } = await response.json();

            if (gameId && editingId === gameId) {
                setEditForm({ ...editForm, logoUrl: objectPath });
            } else {
                setNewGame({ ...newGame, logoUrl: objectPath });
            }

            toast({ title: "Logo yüklendi" });
        } catch (error) {
            toast({ title: "Yükleme başarısız", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddGame = () => {
        if (!newGame.name.trim()) {
            toast({ title: "Oyun adı gerekli", variant: "destructive" });
            return;
        }
        addGame.mutate(newGame);
    };

    const startEdit = (game: Game) => {
        setEditingId(game.id);
        setEditForm({
            name: game.name,
            platform: game.platform || "",
            url: game.url || "",
            logoUrl: game.logoUrl || "",
        });
    };

    const saveEdit = (id: string) => {
        if (!editForm.name?.trim()) {
            toast({ title: "Oyun adı gerekli", variant: "destructive" });
            return;
        }
        updateGame.mutate({ id, ...editForm });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Oyunlar</h1>
                <p className="text-muted-foreground">Oynadığınız oyunları yönetin</p>
            </div>

            {/* Add New Game */}
            <Card>
                <CardHeader>
                    <CardTitle>Yeni Oyun Ekle</CardTitle>
                    <CardDescription>Oyun bilgilerini girin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Oyun Adı *</Label>
                            <Input
                                value={newGame.name}
                                onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
                                placeholder="League of Legends"
                            />
                        </div>
                        <div>
                            <Label>Platform</Label>
                            <Input
                                value={newGame.platform}
                                onChange={(e) => setNewGame({ ...newGame, platform: e.target.value })}
                                placeholder="PC, PS5, Xbox..."
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Oyun URL (İsteğe Bağlı)</Label>
                        <Input
                            value={newGame.url}
                            onChange={(e) => setNewGame({ ...newGame, url: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <Label>Logo</Label>
                        <div className="flex items-center gap-3 mt-2">
                            {newGame.logoUrl ? (
                                <img
                                    src={newGame.logoUrl}
                                    alt="Logo"
                                    className="w-20 h-20 rounded-md object-cover border"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-md bg-muted border flex items-center justify-center">
                                    <Gamepad2 className="w-8 h-8 text-muted-foreground" />
                                </div>
                            )}
                            <div className="flex flex-col gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={isUploading}
                                    onClick={() => document.getElementById("game-logo-upload")?.click()}
                                >
                                    {isUploading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Upload className="w-4 h-4 mr-2" />
                                    )}
                                    {isUploading ? "Yükleniyor..." : "Logo Yükle"}
                                </Button>
                                <input
                                    id="game-logo-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleLogoUpload(e)}
                                />
                            </div>
                        </div>
                    </div>

                    <Button onClick={handleAddGame} disabled={addGame.isPending}>
                        <Plus className="w-4 h-4 mr-2" />
                        Oyun Ekle
                    </Button>
                </CardContent>
            </Card>

            {/* Existing Games */}
            <Card>
                <CardHeader>
                    <CardTitle>Mevcut Oyunlar</CardTitle>
                    <CardDescription>{games.length} oyun</CardDescription>
                </CardHeader>
                <CardContent>
                    {games.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Henüz oyun eklenmemiş
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {games
                                .sort((a, b) => a.displayOrder - b.displayOrder)
                                .map((game) => (
                                    <div
                                        key={game.id}
                                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                    >
                                        {editingId === game.id ? (
                                            // Edit Mode
                                            <div className="flex-1 space-y-3">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <Label className="text-xs">Oyun Adı</Label>
                                                        <Input
                                                            value={editForm.name || ""}
                                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                            className="h-8"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-xs">Platform</Label>
                                                        <Input
                                                            value={editForm.platform || ""}
                                                            onChange={(e) => setEditForm({ ...editForm, platform: e.target.value })}
                                                            className="h-8"
                                                        />
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
                                                <div>
                                                    <Label className="text-xs">Logo</Label>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        {editForm.logoUrl ? (
                                                            <img
                                                                src={editForm.logoUrl}
                                                                alt="Logo"
                                                                className="w-14 h-14 rounded-md object-cover border"
                                                            />
                                                        ) : (
                                                            <div className="w-14 h-14 rounded-md bg-muted border flex items-center justify-center">
                                                                <Gamepad2 className="w-6 h-6 text-muted-foreground" />
                                                            </div>
                                                        )}
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={isUploading}
                                                            onClick={() => document.getElementById(`edit-logo-${game.id}`)?.click()}
                                                        >
                                                            {isUploading ? (
                                                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                            ) : (
                                                                <Upload className="w-3 h-3 mr-1" />
                                                            )}
                                                            Değiştir
                                                        </Button>
                                                        <input
                                                            id={`edit-logo-${game.id}`}
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => handleLogoUpload(e, game.id)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button size="sm" onClick={() => saveEdit(game.id)}>
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
                                                {game.logoUrl ? (
                                                    <img
                                                        src={game.logoUrl}
                                                        alt={game.name}
                                                        className="w-16 h-16 rounded-md object-cover border flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-md bg-muted border flex items-center justify-center flex-shrink-0">
                                                        <Gamepad2 className="w-7 h-7 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-base">{game.name}</div>
                                                    {game.platform && (
                                                        <p className="text-sm text-muted-foreground">{game.platform}</p>
                                                    )}
                                                    {game.url && (
                                                        <a
                                                            href={game.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                                                        >
                                                            {game.url}
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => startEdit(game)}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            if (confirm(`${game.name} oyununu silmek istediğinize emin misiniz?`)) {
                                                                deleteGame.mutate(game.id);
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
