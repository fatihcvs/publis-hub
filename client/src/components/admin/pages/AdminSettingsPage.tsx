import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Save, Shield, LogOut, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Profile } from "@shared/schema";

export function AdminSettingsPage() {
    const { toast } = useToast();
    const { data: profile } = useQuery<Profile>({ queryKey: ["/api/profile"] });

    const [seoForm, setSeoForm] = useState({
        siteTitle: "",
        faviconUrl: "",
        bio: "",
    });

    useEffect(() => {
        if (profile) {
            setSeoForm({
                siteTitle: profile.siteTitle || "",
                faviconUrl: profile.faviconUrl || "",
                bio: profile.bio || "",
            });
        }
    }, [profile]);

    const updateProfile = useMutation({
        mutationFn: (data: Partial<Profile>) => apiRequest("PUT", "/api/admin/profile", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
            toast({ title: "SEO ayarları kaydedildi" });
        },
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Site Ayarları</h1>
                <p className="text-muted-foreground">SEO yapılandırması ve site bilgileri</p>
            </div>

            {/* SEO Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        SEO Ayarları
                    </CardTitle>
                    <CardDescription>Arama motoru optimizasyonu — meta etiketleri ve site başlığı</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Site Başlığı (Title Tag)</Label>
                        <Input
                            value={seoForm.siteTitle}
                            onChange={(e) => setSeoForm({ ...seoForm, siteTitle: e.target.value })}
                            placeholder="Örn: ThePublisher | Kick & YouTube İçerikçisi"
                            maxLength={60}
                            className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {seoForm.siteTitle.length}/60 karakter — Arama sonuçlarında görünen başlık
                        </p>
                    </div>

                    <div>
                        <Label>Meta Açıklama (Description)</Label>
                        <Textarea
                            value={seoForm.bio}
                            onChange={(e) => setSeoForm({ ...seoForm, bio: e.target.value })}
                            placeholder="Sitenizi tanıtan kısa bir açıklama..."
                            rows={3}
                            maxLength={160}
                            className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {seoForm.bio.length}/160 karakter — Arama sonuçlarında görünen açıklama
                        </p>
                    </div>

                    <div>
                        <Label>Favicon URL</Label>
                        <div className="flex gap-2 items-center mt-2">
                            {seoForm.faviconUrl && (
                                <img src={seoForm.faviconUrl} alt="Favicon" className="w-6 h-6 rounded" />
                            )}
                            <Input
                                value={seoForm.faviconUrl}
                                onChange={(e) => setSeoForm({ ...seoForm, faviconUrl: e.target.value })}
                                placeholder="https://... veya /uploads/favicon.ico"
                                className="flex-1"
                            />
                        </div>
                    </div>

                    <div className="p-3 bg-muted/50 rounded-lg text-sm">
                        <div className="font-semibold text-sm mb-1">Arama Motoru Önizlemesi:</div>
                        <div className="text-blue-600 font-medium truncate">{seoForm.siteTitle || "Site Başlığı"}</div>
                        <div className="text-green-700 text-xs">thepublisher.com</div>
                        <div className="text-muted-foreground text-xs mt-1 line-clamp-2">
                            {seoForm.bio || "Meta açıklaması burada görünecek..."}
                        </div>
                    </div>

                    <Button onClick={() => updateProfile.mutate(seoForm)} disabled={updateProfile.isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        SEO Ayarlarını Kaydet
                    </Button>
                </CardContent>
            </Card>

            {/* Auth Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Güvenlik & Oturum
                    </CardTitle>
                    <CardDescription>Admin kimlik doğrulama bilgileri</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-3 bg-muted/50 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Kullanıcı Adı:</span>
                            <span className="font-mono font-medium">admin</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Şifre Değiştirme:</span>
                            <span className="text-muted-foreground">`.env` dosyasındaki <code className="bg-muted px-1 rounded text-xs">ADMIN_PASSWORD</code> değişkenini güncelleyin</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm">
                        <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-amber-700 dark:text-amber-400">
                            Şifre değiştirmek için sunucuda <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">.env</code> dosyasını düzenleyin: <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">ADMIN_PASSWORD=yeni_sifre</code> ardından sunucuyu yeniden başlatın.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => { if (confirm("Oturumu kapatmak istediğinize emin misiniz?")) window.location.href = "/api/logout"; }}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Oturumu Kapat
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
