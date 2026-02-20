import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Link as LinkIcon, DollarSign, Gamepad2 } from "lucide-react";
import type { Profile, SocialLink, Sponsor } from "@shared/schema";

export function AdminDashboard() {
    const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
        queryKey: ["/api/profile"],
    });

    const { data: socialLinks = [] } = useQuery<SocialLink[]>({
        queryKey: ["/api/social-links"],
    });

    const { data: sponsors = [] } = useQuery<Sponsor[]>({
        queryKey: ["/api/sponsors"],
    });

    const stats = [
        {
            title: "Sosyal Medya",
            value: socialLinks.filter(l => l.isActive).length,
            icon: LinkIcon,
            color: "text-blue-600",
        },
        {
            title: "Sponsorlar",
            value: sponsors.filter(s => s.isActive).length,
            icon: DollarSign,
            color: "text-green-600",
        },
        {
            title: "Widget'lar",
            value: [
                profile?.kickUsername,
                profile?.announcementEnabled,
                profile?.ctaButtonEnabled,
                profile?.statsEnabled,
            ].filter(Boolean).length,
            icon: Gamepad2,
            color: "text-purple-600",
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Genel Bakış</h1>
                <p className="text-muted-foreground">Link Hub yönetim panelinize hoş geldiniz</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                {profileLoading ? (
                    <>
                        {[1, 2, 3].map(i => (
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
                            <Card key={stat.title}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                    <Icon className={`w-4 h-4 ${stat.color}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Quick Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Profil Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">İsim:</span>
                        <span className="font-medium">{profile?.name || "Ayarlanmamış"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Başlık:</span>
                        <span className="font-medium">{profile?.title || "Ayarlanmamış"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Tema Rengi:</span>
                        <div className="flex items-center gap-2">
                            <div
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: profile?.themeColor || "#7c3aed" }}
                            />
                            <span className="font-medium">{profile?.themeColor || "#7c3aed"}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
