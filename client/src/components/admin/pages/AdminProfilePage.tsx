import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Profile } from "@shared/schema";

export function AdminProfilePage() {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);

    const { data: profile } = useQuery<Profile>({
        queryKey: ["/api/profile"],
    });

    const [profileForm, setProfileForm] = useState({
        name: "",
        title: "",
        bio: "",
        avatarUrl: "",
        bioTitle: "",
        bioTitleColor: "#000000",
        bioBody: "",
        bioBodyColor: "#333333",
        bioFooter: "",
        bioFooterColor: "#ff0000",
        bioBorderColor: "",
        bioBackgroundColor: "#fffBEB",
    });

    useEffect(() => {
        if (profile) {
            setProfileForm({
                name: profile.name,
                title: profile.title,
                bio: profile.bio,
                avatarUrl: profile.avatarUrl || "",
                bioTitle: profile.bioTitle || "",
                bioTitleColor: profile.bioTitleColor || "#000000",
                bioBody: profile.bioBody || "",
                bioBodyColor: profile.bioBodyColor || "#333333",
                bioFooter: profile.bioFooter || "",
                bioFooterColor: profile.bioFooterColor || "#ff0000",
                bioBorderColor: profile.bioBorderColor || "",
                bioBackgroundColor: profile.bioBackgroundColor || "#fffBEB",
            });
        }
    }, [profile]);

    const updateProfile = useMutation({
        mutationFn: (data: Partial<Profile>) => apiRequest("PUT", "/api/admin/profile", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
            toast({ title: "Profil güncellendi" });
        },
    });

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/admin/upload-logo", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (!response.ok) throw new Error("Upload failed");

            const { objectPath } = await response.json();
            setProfileForm({ ...profileForm, avatarUrl: objectPath });
            toast({ title: "Logo yüklendi" });
        } catch (error) {
            toast({ title: "Yükleme başarısız", variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Profil & Biyografi</h1>
                <p className="text-muted-foreground">Temel profil bilgileriniz ve biyografi kartı ayarları</p>
            </div>

            {/* Basic Profile Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Temel Bilgiler</CardTitle>
                    <CardDescription>İsim, başlık ve bio bilgileriniz</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>İsim</Label>
                            <Input
                                value={profileForm.name}
                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                placeholder="İsminiz"
                            />
                        </div>
                        <div>
                            <Label>Başlık</Label>
                            <Input
                                value={profileForm.title}
                                onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                                placeholder="Ör: Kick & YouTube İçerik Üreticisi"
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Bio</Label>
                        <Textarea
                            value={profileForm.bio}
                            onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                            placeholder="Kısa açıklama"
                            className="h-20"
                        />
                    </div>
                    <div>
                        <Label>Logo</Label>
                        <div className="flex items-center gap-3">
                            {profileForm.avatarUrl && (
                                <img
                                    src={profileForm.avatarUrl}
                                    alt="Logo"
                                    className="w-16 h-16 rounded-full object-cover border"
                                />
                            )}
                            <div className="flex flex-col gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isUploading}
                                    onClick={() => document.getElementById("logo-upload")?.click()}
                                >
                                    {isUploading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Upload className="w-4 h-4 mr-2" />
                                    )}
                                    {isUploading ? "Yükleniyor..." : "Logo Yükle"}
                                </Button>
                                <input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleLogoUpload}
                                />
                                <span className="text-xs text-muted-foreground">JPG, PNG, GIF, WebP (maks. 5MB)</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Biography Card Customization */}
            <Card>
                <CardHeader>
                    <CardTitle>Biyografi Kartı Özelleştirme</CardTitle>
                    <CardDescription>Biyografi kartınızın görünümünü özelleştirin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Kart Başlığı</Label>
                            <Input
                                value={profileForm.bioTitle}
                                onChange={(e) => setProfileForm({ ...profileForm, bioTitle: e.target.value })}
                                placeholder="Ör: Kick Streamer & İçerik Üreticisi"
                            />
                            <div className="flex items-center gap-2">
                                <Input
                                    type="color"
                                    value={profileForm.bioTitleColor}
                                    onChange={(e) => setProfileForm({ ...profileForm, bioTitleColor: e.target.value })}
                                    className="w-8 h-8 p-1 rounded-md cursor-pointer"
                                />
                                <span className="text-xs text-muted-foreground">Başlık Rengi</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Alt Bilgi</Label>
                            <Input
                                value={profileForm.bioFooter}
                                onChange={(e) => setProfileForm({ ...profileForm, bioFooter: e.target.value })}
                                placeholder="Ör: +18 içerikler için..."
                            />
                            <div className="flex items-center gap-2">
                                <Input
                                    type="color"
                                    value={profileForm.bioFooterColor}
                                    onChange={(e) => setProfileForm({ ...profileForm, bioFooterColor: e.target.value })}
                                    className="w-8 h-8 p-1 rounded-md cursor-pointer"
                                />
                                <span className="text-xs text-muted-foreground">Alt Bilgi Rengi</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Detaylı İçerik</Label>
                        <Textarea
                            value={profileForm.bioBody}
                            onChange={(e) => setProfileForm({ ...profileForm, bioBody: e.target.value })}
                            placeholder="Detaylı biyografi metni..."
                            className="h-24"
                        />
                        <div className="flex items-center gap-2">
                            <Input
                                type="color"
                                value={profileForm.bioBodyColor}
                                onChange={(e) => setProfileForm({ ...profileForm, bioBodyColor: e.target.value })}
                                className="w-8 h-8 p-1 rounded-md cursor-pointer"
                            />
                            <span className="text-xs text-muted-foreground">İçerik Rengi</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Kart Arka Plan Rengi</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="color"
                                    value={profileForm.bioBackgroundColor}
                                    onChange={(e) => setProfileForm({ ...profileForm, bioBackgroundColor: e.target.value })}
                                    className="w-8 h-8 p-1 rounded-md cursor-pointer"
                                />
                                <span className="text-sm text-muted-foreground">{profileForm.bioBackgroundColor}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Kart Kenarlık Rengi (Opsiyonel)</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="color"
                                    value={profileForm.bioBorderColor || "#000000"}
                                    onChange={(e) => setProfileForm({ ...profileForm, bioBorderColor: e.target.value })}
                                    className="w-8 h-8 p-1 rounded-md cursor-pointer"
                                />
                                <span className="text-sm text-muted-foreground">{profileForm.bioBorderColor || "Yok"}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Button onClick={() => updateProfile.mutate(profileForm)} disabled={updateProfile.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Kaydet
            </Button>
        </div>
    );
}
