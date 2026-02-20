import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Database, Code, BarChart, Search, Save, ExternalLink } from "lucide-react";
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
                <p className="text-muted-foreground">Gelişmiş site ayarları ve SEO yapılandırması</p>
            </div>

            {/* SEO Settings - Real Editor */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="w-5 h-5" />
                        SEO Ayarları
                    </CardTitle>
                    <CardDescription>Arama motoru optimizasyonu - meta etiketleri ve site başlığı</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Site Başlığı (Title Tag)</Label>
                        <Input
                            value={seoForm.siteTitle}
                            onChange={(e) => setSeoForm({ ...seoForm, siteTitle: e.target.value })}
                            placeholder="Örn: ThePublisher | Kick & YouTube İçerikçisi"
                            maxLength={60}
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
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            {seoForm.bio.length}/160 karakter — Arama sonuçlarında görünen açıklama (bio alanı kullanılır)
                        </p>
                    </div>

                    <div>
                        <Label>Favicon URL</Label>
                        <div className="flex gap-2 items-center">
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
                        <div className="font-semibold text-sm mb-1">Önizleme:</div>
                        <div className="text-blue-600 font-medium truncate">{seoForm.siteTitle || "Site Başlığı"}</div>
                        <div className="text-green-700 text-xs">localhost:5000</div>
                        <div className="text-muted-foreground text-xs mt-1 line-clamp-2">
                            {seoForm.bio || "Meta açıklaması burada görünecek..."}
                        </div>
                    </div>

                    <Button
                        onClick={() => updateProfile.mutate(seoForm)}
                        disabled={updateProfile.isPending}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        SEO Ayarlarını Kaydet
                    </Button>
                </CardContent>
            </Card>

            {/* Other settings cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5" />
                            Genel Ayarlar
                        </CardTitle>
                        <CardDescription>Temel site yapılandırması</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Site başlığı ve favicon ayarları <strong>Görünüm & Tema</strong> sayfasında da bulunur.
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => window.open("/admin/appearance", "_self")}
                        >
                            <ExternalLink className="w-3 h-3 mr-2" />
                            Görünüm Sayfasına Git
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart className="w-5 h-5" />
                            Analitik
                        </CardTitle>
                        <CardDescription>Ziyaretçi istatistikleri</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Analitik özellikleri gelecek güncellemelerde eklenecek.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="w-5 h-5" />
                            Veritabanı
                        </CardTitle>
                        <CardDescription>Veri yönetimi</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Veritabanı yönetimi özellikleri gelecek güncellemelerde eklenecek.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Code className="w-5 h-5" />
                            Özel Kod
                        </CardTitle>
                        <CardDescription>Custom CSS/JS</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Özel CSS ve JavaScript ekleme özellikleri gelecek güncellemelerde eklenecek.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
