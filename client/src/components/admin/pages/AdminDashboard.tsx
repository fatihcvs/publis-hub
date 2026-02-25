import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Link as LinkIcon, DollarSign, Gamepad2, Gift, LayoutGrid, User, Palette, Settings, Layout, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";
import type { Profile, SocialLink, Sponsor, DiscountCode, Game } from "@shared/schema";

export function AdminDashboard() {
    const [, navigate] = useLocation();

    const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
        queryKey: ["/api/profile"],
    });

    const { data: socialLinks = [] } = useQuery<SocialLink[]>({
        queryKey: ["/api/social-links"],
    });

    const { data: sponsors = [] } = useQuery<Sponsor[]>({
        queryKey: ["/api/sponsors"],
    });

    const { data: games = [] } = useQuery<Game[]>({
        queryKey: ["/api/games"],
    });

    const { data: discountCodes = [] } = useQuery<DiscountCode[]>({
        queryKey: ["/api/discount-codes"],
    });

    const stats = [
        {
            title: "Sosyal Medya",
            value: socialLinks.filter(l => l.isActive).length,
            total: socialLinks.length,
            icon: LinkIcon,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-950/20",
            path: "/admin/social",
        },
        {
            title: "Sponsorlar",
            value: sponsors.filter(s => s.isActive).length,
            total: sponsors.length,
            icon: DollarSign,
            color: "text-green-600",
            bg: "bg-green-50 dark:bg-green-950/20",
            path: "/admin/sponsors",
        },
        {
            title: "Oyunlar",
            value: (games as Game[]).filter(g => g.isActive).length,
            total: games.length,
            icon: Gamepad2,
            color: "text-orange-600",
            bg: "bg-orange-50 dark:bg-orange-950/20",
            path: "/admin/games",
        },
        {
            title: "İndirim Kodları",
            value: (discountCodes as DiscountCode[]).filter(c => c.isActive).length,
            total: discountCodes.length,
            icon: Gift,
            color: "text-pink-600",
            bg: "bg-pink-50 dark:bg-pink-950/20",
            path: "/admin/codes",
        },
        {
            title: "Widget'lar",
            value: [
                profile?.kickUsername,
                profile?.announcementEnabled,
                profile?.ctaButtonEnabled,
                profile?.statsEnabled,
                profile?.lolWidgetEnabled,
            ].filter(Boolean).length,
            total: 5,
            icon: LayoutGrid,
            color: "text-purple-600",
            bg: "bg-purple-50 dark:bg-purple-950/20",
            path: "/admin/widgets",
        },
    ];

    const quickLinks = [
        { label: "Profil & Biyografi", icon: User, path: "/admin/profile", desc: "İsim, avatar, bio" },
        { label: "Görünüm & Tema", icon: Palette, path: "/admin/appearance", desc: "Renkler, arka plan" },
        { label: "Layout Düzenleyici", icon: Layout, path: "/admin/layout", desc: "Bölüm sıralama" },
        { label: "Site Ayarları", icon: Settings, path: "/admin/settings", desc: "SEO, favicon" },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Genel Bakış</h1>
                <p className="text-muted-foreground">Link Hub yönetim panelinize hoş geldiniz</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-5">
                {profileLoading ? (
                    <>
                        {[1, 2, 3, 4, 5].map(i => (
                            <Card key={i}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-4 rounded" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-8 w-12" />
                                </CardContent>
                            </Card>
                        ))}
                    </>
                ) : (
                    stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card
                                key={stat.title}
                                className="cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => navigate(stat.path)}
                            >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                    <div className={`p-1.5 rounded-md ${stat.bg}`}>
                                        <Icon className={`w-4 h-4 ${stat.color}`} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground mt-0.5">Toplam: {stat.total}</p>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profil Bilgileri</CardTitle>
                        <CardDescription>Aktif profil özeti</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-4">
                            {profile?.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-border" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                                    <User className="w-8 h-8 text-muted-foreground" />
                                </div>
                            )}
                            <div>
                                <div className="font-semibold text-lg">{profile?.name || "İsim ayarlanmamış"}</div>
                                <div className="text-sm text-muted-foreground">{profile?.title || "Başlık ayarlanmamış"}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-3 h-3 rounded border" style={{ backgroundColor: profile?.themeColor || "#7c3aed" }} />
                            <span className="text-muted-foreground">Tema: </span>
                            <span className="font-mono text-xs">{profile?.themeColor || "#7c3aed"}</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-muted-foreground">Aktif widget'lar: </span>
                            <span className="font-medium">
                                {[
                                    profile?.kickUsername && "Kick",
                                    profile?.lolWidgetEnabled && "LoL",
                                    profile?.announcementEnabled && "Duyuru",
                                    profile?.ctaButtonEnabled && "CTA",
                                    profile?.statsEnabled && "İstatistik",
                                ].filter(Boolean).join(", ") || "Yok"}
                            </span>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => navigate("/admin/profile")} className="w-full mt-2">
                            <User className="w-4 h-4 mr-2" />
                            Profili Düzenle
                        </Button>
                    </CardContent>
                </Card>

                {/* Quick Access */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hızlı Erişim</CardTitle>
                        <CardDescription>Sık kullanılan sayfalara git</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {quickLinks.map(link => {
                            const Icon = link.icon;
                            return (
                                <button
                                    key={link.path}
                                    onClick={() => navigate(link.path)}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                                >
                                    <div className="p-2 rounded-md bg-muted">
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium">{link.label}</div>
                                        <div className="text-xs text-muted-foreground">{link.desc}</div>
                                    </div>
                                </button>
                            );
                        })}
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-sm font-medium"
                        >
                            <div className="p-2 rounded-md bg-muted">
                                <ExternalLink className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-sm font-medium">Siteyi Görüntüle</div>
                                <div className="text-xs text-muted-foreground">Yeni sekmede aç</div>
                            </div>
                        </a>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
