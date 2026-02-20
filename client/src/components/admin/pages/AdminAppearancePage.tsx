import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Profile } from "@shared/schema";

export function AdminAppearancePage() {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);

    const { data: profile } = useQuery<Profile>({
        queryKey: ["/api/profile"],
    });

    const [appearanceForm, setAppearanceForm] = useState({
        themeColor: "#7c3aed",
        cardOpacity: 80,
        backgroundBlur: 0,
        backgroundImageUrl: "",
        fontFamily: "Nunito",
        borderRadius: "2rem",
        floatingEmojis: false,
        siteTitle: "Link Hub",
        faviconUrl: "",
    });

    useEffect(() => {
        if (profile) {
            setAppearanceForm({
                themeColor: profile.themeColor || "#7c3aed",
                cardOpacity: profile.cardOpacity ?? 80,
                backgroundBlur: profile.backgroundBlur ?? 0,
                backgroundImageUrl: profile.backgroundImageUrl || "",
                fontFamily: profile.fontFamily || "Nunito",
                borderRadius: profile.borderRadius || "2rem",
                floatingEmojis: profile.floatingEmojis || false,
                siteTitle: profile.siteTitle || "Link Hub",
                faviconUrl: profile.faviconUrl || "",
            });
        }
    }, [profile]);

    const updateProfile = useMutation({
        mutationFn: (data: Partial<Profile>) => apiRequest("PUT", "/api/admin/profile", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
            toast({ title: "Görünüm güncellendi" });
        },
    });

    const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/admin/upload-background-image", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (!response.ok) throw new Error("Upload failed");

            const { objectPath } = await response.json();
            setAppearanceForm({ ...appearanceForm, backgroundImageUrl: objectPath });
            toast({ title: "Arka plan yüklendi" });
        } catch (error) {
            toast({ title: "Yükleme başarısız", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Görünüm & Tema</h1>
                <p className="text-muted-foreground">Sitenizin görünümünü ve temasını özelleştirin</p>
            </div>

            {/* Theme Colors */}
            <Card>
                <CardHeader>
                    <CardTitle>Renkler</CardTitle>
                    <CardDescription>Tema renkleri ve şeffaflık ayarları</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Tema Rengi</Label>
                            <div className="flex items-center gap-2 mt-2">
                                <Input
                                    type="color"
                                    value={appearanceForm.themeColor}
                                    onChange={(e) => setAppearanceForm({ ...appearanceForm, themeColor: e.target.value })}
                                    className="w-12 h-12 p-1 rounded-md cursor-pointer"
                                />
                                <span className="text-sm text-muted-foreground">{appearanceForm.themeColor}</span>
                            </div>
                        </div>

                        <div>
                            <Label>Kart Şeffaflığı (%{appearanceForm.cardOpacity})</Label>
                            <div className="flex items-center gap-2 mt-2">
                                <Input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={appearanceForm.cardOpacity}
                                    onChange={(e) => setAppearanceForm({ ...appearanceForm, cardOpacity: parseInt(e.target.value) })}
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Background */}
            <Card>
                <CardHeader>
                    <CardTitle>Arka Plan</CardTitle>
                    <CardDescription>Arka plan resmi ve bulanıklık ayarları</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Arka Plan Resmi</Label>
                        <div className="flex items-center gap-3 mt-2">
                            {appearanceForm.backgroundImageUrl ? (
                                <img
                                    src={appearanceForm.backgroundImageUrl}
                                    alt="Arka Plan"
                                    className="w-32 h-20 rounded-md object-cover border"
                                />
                            ) : (
                                <div className="w-32 h-20 rounded-md bg-muted border flex items-center justify-center text-muted-foreground text-xs">
                                    Resim Yok
                                </div>
                            )}
                            <div className="flex flex-col gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isUploading}
                                    onClick={() => document.getElementById("bg-upload")?.click()}
                                >
                                    {isUploading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Upload className="w-4 h-4 mr-2" />
                                    )}
                                    {isUploading ? "Yükleniyor..." : "Arka Plan Yükle"}
                                </Button>
                                <input
                                    id="bg-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleBackgroundUpload}
                                />
                                <span className="text-xs text-muted-foreground">JPG, PNG</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label>Arka Plan Bulanıklığı ({appearanceForm.backgroundBlur}px)</Label>
                        <div className="flex items-center gap-2 mt-2">
                            <Input
                                type="range"
                                min="0"
                                max="20"
                                step="1"
                                value={appearanceForm.backgroundBlur}
                                onChange={(e) => setAppearanceForm({ ...appearanceForm, backgroundBlur: parseInt(e.target.value) })}
                                className="flex-1"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Typography & Style */}
            <Card>
                <CardHeader>
                    <CardTitle>Tipografi & Stil</CardTitle>
                    <CardDescription>Font ve köşe yuvarlaklığı ayarları</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Font Ailesi</Label>
                            <Select
                                value={appearanceForm.fontFamily}
                                onValueChange={(value) => setAppearanceForm({ ...appearanceForm, fontFamily: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Nunito">Nunito</SelectItem>
                                    <SelectItem value="Inter">Inter</SelectItem>
                                    <SelectItem value="Poppins">Poppins</SelectItem>
                                    <SelectItem value="Roboto">Roboto</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Köşe Yuvarlaklığı</Label>
                            <Select
                                value={appearanceForm.borderRadius}
                                onValueChange={(value) => setAppearanceForm({ ...appearanceForm, borderRadius: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0.5rem">Küçük (0.5rem)</SelectItem>
                                    <SelectItem value="1rem">Orta (1rem)</SelectItem>
                                    <SelectItem value="2rem">Büyük (2rem)</SelectItem>
                                    <SelectItem value="9999px">Tam Yuvarlak</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Yüzen Emojiler</Label>
                            <p className="text-sm text-muted-foreground">Arka planda animasyonlu emojiler göster</p>
                        </div>
                        <Switch
                            checked={appearanceForm.floatingEmojis}
                            onCheckedChange={(checked) => setAppearanceForm({ ...appearanceForm, floatingEmojis: checked })}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Site Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Site Ayarları</CardTitle>
                    <CardDescription>Site başlığı ve favicon</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Site Başlığı</Label>
                        <Input
                            value={appearanceForm.siteTitle}
                            onChange={(e) => setAppearanceForm({ ...appearanceForm, siteTitle: e.target.value })}
                            placeholder="Link Hub"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Tarayıcı sekmesinde görünecek başlık</p>
                    </div>
                    <div>
                        <Label>Favicon URL (İsteğe Bağlı)</Label>
                        <Input
                            value={appearanceForm.faviconUrl}
                            onChange={(e) => setAppearanceForm({ ...appearanceForm, faviconUrl: e.target.value })}
                            placeholder="https://example.com/favicon.png"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Site ikonu için bir URL girin</p>
                    </div>
                </CardContent>
            </Card>

            <Button onClick={() => updateProfile.mutate(appearanceForm)} disabled={updateProfile.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Kaydet
            </Button>
        </div>
    );
}
