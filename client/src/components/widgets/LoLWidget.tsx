import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, TrendingUp, Gamepad2, Clock } from "lucide-react";
import type { Profile } from "@shared/schema";

interface LoLMatch {
    champion: string;
    kills: number;
    deaths: number;
    assists: number;
    cs: number;
    win: boolean;
    items: number[];
    gameDuration: number;
    timestamp: number;
}

interface LoLRank {
    tier: string;
    division: string;
    lp: number;
    wins: number;
    losses: number;
    winrate: number;
}

interface LoLData {
    summonerName: string;
    summonerLevel: number;
    rank: LoLRank | null;
    recentMatches: LoLMatch[];
}

// Data Dragon CDN for item images (latest version)
const DDRAGON_VERSION = "14.1.1";
const ITEM_CDN = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/item`;

function formatGameDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatTimestamp(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} gün önce`;
    if (hours > 0) return `${hours} saat önce`;
    return 'Az önce';
}

export function LoLWidget() {
    const { data: profile } = useQuery<Profile>({
        queryKey: ["/api/profile"],
    });

    // Build API URL with tag support (fallback to 'EUW' if tag not set)
    const apiUrl = profile?.lolSummonerName && profile?.lolRegion
        ? `/api/lol/summoner/${profile.lolRegion}/${profile.lolSummonerName}/${profile.lolRiotTag || 'EUW'}`
        : null;

    const { data: lolData, isLoading } = useQuery<{ success: boolean; data: LoLData }>({
        queryKey: ["lol-summoner", apiUrl],
        queryFn: async () => {
            if (!apiUrl) throw new Error("Missing summoner data");
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("Failed to fetch summoner data");
            return response.json();
        },
        enabled: !!profile?.lolWidgetEnabled && !!apiUrl,
        refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    });

    if (!profile?.lolWidgetEnabled || !profile?.lolSummonerName) {
        return null;
    }

    if (isLoading) {
        return (
            <Card className="w-full">
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!lolData?.success || !lolData?.data) {
        return null;
    }

    const { data: summoner } = lolData;
    const settings = profile.lolWidgetSettings || {
        showLastMatches: true,
        matchCount: 5,
        showRank: true,
        showWinrate: true,
        cardColor: "#7c3aed",
        accentColor: "#a78bfa",
    };

    return (
        <Card
            className="w-full overflow-hidden"
            style={{
                backgroundColor: settings.cardColor + '20',
                borderColor: settings.accentColor
            }}
        >
            <CardHeader style={{ backgroundColor: settings.cardColor }}>
                <div className="flex items-center justify-between text-white">
                    <div>
                        <CardTitle className="text-xl">{summoner.summonerName}</CardTitle>
                        <p className="text-sm opacity-90">Level {summoner.summonerLevel}</p>
                    </div>
                    <Gamepad2 className="w-8 h-8 opacity-80" />
                </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
                {/* Rank Section */}
                {settings.showRank && summoner.rank && (
                    <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                        <Trophy className="w-6 h-6" style={{ color: settings.accentColor }} />
                        <div className="flex-1">
                            <div className="font-semibold">
                                {summoner.rank.tier} {summoner.rank.division}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {summoner.rank.lp} LP
                            </div>
                        </div>
                        {settings.showWinrate && (
                            <div className="text-right">
                                <div className="font-semibold" style={{ color: settings.accentColor }}>
                                    {summoner.rank.winrate}%
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {summoner.rank.wins}W {summoner.rank.losses}L
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* No Rank Message */}
                {settings.showRank && !summoner.rank && (
                    <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                        <Trophy className="w-6 h-6 text-muted-foreground" />
                        <div>
                            <div className="font-semibold text-muted-foreground">Sıralanmamış</div>
                            <div className="text-xs text-muted-foreground">Henüz ranked maç oynanmamış</div>
                        </div>
                    </div>
                )}

                {/* Recent Matches */}
                {settings.showLastMatches && summoner.recentMatches.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <TrendingUp className="w-4 h-4" />
                            Son Maçlar
                        </div>
                        <div className="space-y-2">
                            {summoner.recentMatches.slice(0, settings.matchCount || 5).map((match, idx) => (
                                <div
                                    key={idx}
                                    className={`p-3 rounded-lg border-l-4 ${match.win
                                        ? 'bg-green-500/10 border-green-500'
                                        : 'bg-red-500/10 border-red-500'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{match.champion}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded ${match.win ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'
                                                }`}>
                                                {match.win ? 'Galibiyet' : 'Mağlubiyet'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            {formatGameDuration(match.gameDuration)}
                                            <span>•</span>
                                            {formatTimestamp(match.timestamp)}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="text-sm">
                                                <span className="font-bold">{match.kills}</span>
                                                <span className="text-muted-foreground">/</span>
                                                <span className="font-bold text-red-500">{match.deaths}</span>
                                                <span className="text-muted-foreground">/</span>
                                                <span className="font-bold">{match.assists}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {match.cs} CS
                                            </div>
                                            <div className="text-xs font-semibold" style={{ color: settings.accentColor }}>
                                                {match.deaths > 0
                                                    ? ((match.kills + match.assists) / match.deaths).toFixed(2)
                                                    : 'Perfect'
                                                } KDA
                                            </div>
                                        </div>

                                        {/* Items */}
                                        <div className="flex gap-1">
                                            {match.items.slice(0, 6).map((itemId, itemIdx) => (
                                                <div
                                                    key={itemIdx}
                                                    className="w-6 h-6 rounded bg-background/80 border border-border overflow-hidden"
                                                    title={`Item ${itemId}`}
                                                >
                                                    {itemId > 0 && (
                                                        <img
                                                            src={`${ITEM_CDN}/${itemId}.png`}
                                                            alt={`Item ${itemId}`}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Matches Message */}
                {settings.showLastMatches && summoner.recentMatches.length === 0 && (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                        No recent matches found
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
