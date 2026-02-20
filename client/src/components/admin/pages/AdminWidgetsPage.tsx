import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, Gamepad2, Key, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Profile } from "@shared/schema";

export function AdminWidgetsPage() {
    const { toast } = useToast();

    const { data: profile } = useQuery<Profile>({
        queryKey: ["/api/profile"],
    });

    const [widgetsForm, setWidgetsForm] = useState({
        // Kick Widget
        kickUsername: "",
        kickAutoplay: true,
        // Announcement
        announcementText: "",
        announcementEnabled: false,
        announcementColor: "#7c3aed",
        // CTA Button
        ctaButtonText: "",
        ctaButtonUrl: "",
        ctaButtonEnabled: false,
        // Stats
        statsEnabled: false,
        statsFollowers: "",
        statsViews: "",
        // LoL Widget
        lolSummonerName: "",
        lolRegion: "TR1",
        lolRiotTag: "EUW",
        lolWidgetEnabled: false,
        riotApiKey: "",
        lolWidgetSettings: {
            showLastMatches: true,
            matchCount: 5,
            showRank: true,
            showTopChampions: false,
            showWinrate: true,
            cardColor: "#7c3aed",
            accentColor: "#a78bfa",
        },
    });
    const [showApiKey, setShowApiKey] = useState(false);

    useEffect(() => {
        if (profile) {
            setWidgetsForm({
                kickUsername: profile.kickUsername || "",
                kickAutoplay: profile.kickAutoplay ?? true,
                announcementText: profile.announcementText || "",
                announcementEnabled: profile.announcementEnabled || false,
                announcementColor: profile.announcementColor || "#7c3aed",
                ctaButtonText: profile.ctaButtonText || "",
                ctaButtonUrl: profile.ctaButtonUrl || "",
                ctaButtonEnabled: profile.ctaButtonEnabled || false,
                statsEnabled: profile.statsEnabled || false,
                statsFollowers: profile.statsFollowers || "",
                statsViews: profile.statsViews || "",
                lolSummonerName: profile.lolSummonerName || "",
                lolRegion: profile.lolRegion || "TR1",
                lolRiotTag: profile.lolRiotTag || "EUW",
                lolWidgetEnabled: profile.lolWidgetEnabled || false,
                riotApiKey: profile.riotApiKey || "",
                lolWidgetSettings: profile.lolWidgetSettings || {
                    showLastMatches: true,
                    matchCount: 5,
                    showRank: true,
                    showTopChampions: false,
                    showWinrate: true,
                    cardColor: "#7c3aed",
                    accentColor: "#a78bfa",
                },
            });
        }
    }, [profile]);

    const updateProfile = useMutation({
        mutationFn: (data: Partial<Profile>) => apiRequest("PUT", "/api/admin/profile", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
            toast({ title: "Widget ayarları güncellendi" });
        },
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Widget Yönetimi</h1>
                <p className="text-muted-foreground">Sitenizde görünecek widget'ları yönetin</p>
            </div>

            {/* League of Legends Widget */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Gamepad2 className="w-5 h-5" />
                        <CardTitle>League of Legends Widget</CardTitle>
                    </div>
                    <CardDescription>LoL hesap bilgilerinizi ve son maçlarınızı gösterin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Widget'ı Aktifleştir</Label>
                            <p className="text-sm text-muted-foreground">LoL widget'ını ana sayfada göster</p>
                        </div>
                        <Switch
                            checked={widgetsForm.lolWidgetEnabled}
                            onCheckedChange={(checked) => setWidgetsForm({ ...widgetsForm, lolWidgetEnabled: checked })}
                        />
                    </div>

                    {widgetsForm.lolWidgetEnabled && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label>Game Name</Label>
                                    <Input
                                        value={widgetsForm.lolSummonerName}
                                        onChange={(e) => setWidgetsForm({ ...widgetsForm, lolSummonerName: e.target.value })}
                                        placeholder="Seahlorm"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Riot ID'nizin ilk kısmı</p>
                                </div>
                                <div>
                                    <Label>Tag</Label>
                                    <Input
                                        value={widgetsForm.lolRiotTag}
                                        onChange={(e) => setWidgetsForm({ ...widgetsForm, lolRiotTag: e.target.value })}
                                        placeholder="EUW"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1"># işaretinden sonraki kısım</p>
                                </div>
                                <div>
                                    <Label>Region</Label>
                                    <Select
                                        value={widgetsForm.lolRegion}
                                        onValueChange={(value) => setWidgetsForm({ ...widgetsForm, lolRegion: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TR1">Türkiye (TR1)</SelectItem>
                                            <SelectItem value="EUW1">Europe West (EUW1)</SelectItem>
                                            <SelectItem value="EUNE1">Europe Nordic & East (EUNE1)</SelectItem>
                                            <SelectItem value="NA1">North America (NA1)</SelectItem>
                                            <SelectItem value="KR">Korea (KR)</SelectItem>
                                            <SelectItem value="BR1">Brazil (BR1)</SelectItem>
                                            <SelectItem value="JP1">Japan (JP1)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Riot API Key */}
                            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg space-y-3">
                                <div className="flex items-center gap-2">
                                    <Key className="w-4 h-4 text-amber-600" />
                                    <Label className="text-amber-800 dark:text-amber-400 font-semibold">Riot API Key</Label>
                                </div>
                                <p className="text-xs text-amber-700 dark:text-amber-400">
                                    ⚠️ Development key'ler her 24 saatte sürer. Yeni key almak için{" "}
                                    <a href="https://developer.riotgames.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">developer.riotgames.com</a>'u ziyaret edin.
                                </p>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            type={showApiKey ? "text" : "password"}
                                            value={widgetsForm.riotApiKey}
                                            onChange={(e) => setWidgetsForm({ ...widgetsForm, riotApiKey: e.target.value })}
                                            placeholder="RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                            className="pr-10 font-mono text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowApiKey(!showApiKey)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                {widgetsForm.riotApiKey && (
                                    <p className="text-xs text-green-600 dark:text-green-400">
                                        ✅ API key kaydedildi - .env dosyasını düzenlemene gerek yok
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3 pt-4 border-t">
                                <Label className="text-sm font-semibold">Görünüm Ayarları</Label>

                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-normal">Rank Göster</Label>
                                    <Switch
                                        checked={widgetsForm.lolWidgetSettings.showRank}
                                        onCheckedChange={(checked) =>
                                            setWidgetsForm({
                                                ...widgetsForm,
                                                lolWidgetSettings: { ...widgetsForm.lolWidgetSettings, showRank: checked }
                                            })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-normal">Kazanma Oranı Göster</Label>
                                    <Switch
                                        checked={widgetsForm.lolWidgetSettings.showWinrate}
                                        onCheckedChange={(checked) =>
                                            setWidgetsForm({
                                                ...widgetsForm,
                                                lolWidgetSettings: { ...widgetsForm.lolWidgetSettings, showWinrate: checked }
                                            })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-normal">Son Maçları Göster</Label>
                                    <Switch
                                        checked={widgetsForm.lolWidgetSettings.showLastMatches}
                                        onCheckedChange={(checked) =>
                                            setWidgetsForm({
                                                ...widgetsForm,
                                                lolWidgetSettings: { ...widgetsForm.lolWidgetSettings, showLastMatches: checked }
                                            })
                                        }
                                    />
                                </div>

                                {widgetsForm.lolWidgetSettings.showLastMatches && (
                                    <div>
                                        <Label className="text-sm">Gösterilecek Maç Sayısı</Label>
                                        <Select
                                            value={widgetsForm.lolWidgetSettings.matchCount.toString()}
                                            onValueChange={(value) =>
                                                setWidgetsForm({
                                                    ...widgetsForm,
                                                    lolWidgetSettings: { ...widgetsForm.lolWidgetSettings, matchCount: parseInt(value) }
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="3">3 Maç</SelectItem>
                                                <SelectItem value="5">5 Maç</SelectItem>
                                                <SelectItem value="10">10 Maç</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm">Kart Rengi</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Input
                                                type="color"
                                                value={widgetsForm.lolWidgetSettings.cardColor}
                                                onChange={(e) =>
                                                    setWidgetsForm({
                                                        ...widgetsForm,
                                                        lolWidgetSettings: { ...widgetsForm.lolWidgetSettings, cardColor: e.target.value }
                                                    })
                                                }
                                                className="w-12 h-12 p-1 rounded-md cursor-pointer"
                                            />
                                            <span className="text-xs text-muted-foreground">{widgetsForm.lolWidgetSettings.cardColor}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm">Vurgu Rengi</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Input
                                                type="color"
                                                value={widgetsForm.lolWidgetSettings.accentColor}
                                                onChange={(e) =>
                                                    setWidgetsForm({
                                                        ...widgetsForm,
                                                        lolWidgetSettings: { ...widgetsForm.lolWidgetSettings, accentColor: e.target.value }
                                                    })
                                                }
                                                className="w-12 h-12 p-1 rounded-md cursor-pointer"
                                            />
                                            <span className="text-xs text-muted-foreground">{widgetsForm.lolWidgetSettings.accentColor}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Other Widgets - Kick, Announcement, etc. */}
            <Card>
                <CardHeader>
                    <CardTitle>Diğer Widget'lar</CardTitle>
                    <CardDescription>Kick, Duyuru, CTA ve İstatistik widget'ları</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Diğer widget ayarları için eski admin panelini kullanın (geçici)
                    </p>
                </CardContent>
            </Card>

            <Button onClick={() => updateProfile.mutate(widgetsForm)} disabled={updateProfile.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Kaydet
            </Button>
        </div>
    );
}
