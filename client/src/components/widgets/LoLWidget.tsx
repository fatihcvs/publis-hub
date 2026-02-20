import { useQuery } from "@tanstack/react-query";
import { Trophy, TrendingUp, Gamepad2, Clock, Swords, Shield, Target, Skull, Award } from "lucide-react";
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

// Data Dragon CDN for images
const DDRAGON_VERSION = "14.1.1";
const ITEM_CDN = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/item`;
const CHAMPION_CDN = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/champion`;

// Rank emblem colors
const RANK_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
    IRON: { bg: "from-stone-700 to-stone-600", text: "text-stone-300", glow: "shadow-stone-500/30" },
    BRONZE: { bg: "from-amber-800 to-amber-700", text: "text-amber-300", glow: "shadow-amber-500/30" },
    SILVER: { bg: "from-slate-500 to-slate-400", text: "text-slate-200", glow: "shadow-slate-400/30" },
    GOLD: { bg: "from-yellow-600 to-yellow-500", text: "text-yellow-200", glow: "shadow-yellow-500/40" },
    PLATINUM: { bg: "from-teal-600 to-teal-500", text: "text-teal-200", glow: "shadow-teal-500/40" },
    EMERALD: { bg: "from-emerald-700 to-emerald-600", text: "text-emerald-200", glow: "shadow-emerald-500/40" },
    DIAMOND: { bg: "from-blue-600 to-blue-500", text: "text-blue-200", glow: "shadow-blue-500/40" },
    MASTER: { bg: "from-purple-700 to-purple-600", text: "text-purple-200", glow: "shadow-purple-500/40" },
    GRANDMASTER: { bg: "from-red-700 to-red-600", text: "text-red-200", glow: "shadow-red-500/40" },
    CHALLENGER: { bg: "from-cyan-500 to-blue-400", text: "text-cyan-100", glow: "shadow-cyan-400/50" },
};

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

    if (days > 0) return `${days}g önce`;
    if (hours > 0) return `${hours}sa önce`;
    return 'Az önce';
}

function getKdaColor(kda: number): string {
    if (kda >= 5) return "text-yellow-400";
    if (kda >= 3) return "text-green-400";
    if (kda >= 2) return "text-blue-400";
    return "text-gray-400";
}

export function LoLWidget() {
    const { data: profile } = useQuery<Profile>({
        queryKey: ["/api/profile"],
    });

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
        refetchInterval: 5 * 60 * 1000,
    });

    if (!profile?.lolWidgetEnabled || !profile?.lolSummonerName) return null;

    const settings = profile.lolWidgetSettings || {
        showLastMatches: true,
        matchCount: 5,
        showRank: true,
        showWinrate: true,
        cardColor: "#7c3aed",
        accentColor: "#a78bfa",
    };

    if (isLoading) {
        return (
            <div className="w-full rounded-2xl overflow-hidden border border-border/30"
                style={{ backgroundColor: settings.cardColor + '15' }}>
                <div className="p-8 flex flex-col items-center gap-3">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 border-3 border-t-transparent rounded-full animate-spin"
                            style={{ borderColor: settings.accentColor, borderTopColor: 'transparent' }} />
                        <Gamepad2 className="absolute inset-0 m-auto w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground animate-pulse">Yükleniyor...</span>
                </div>
            </div>
        );
    }

    if (!lolData?.success || !lolData?.data) return null;

    const { data: summoner } = lolData;
    const rankStyle = summoner.rank ? RANK_COLORS[summoner.rank.tier] || RANK_COLORS.IRON : null;

    // Calculate recent stats
    const matches = summoner.recentMatches.slice(0, settings.matchCount || 5);
    const totalWins = matches.filter(m => m.win).length;
    const totalLosses = matches.length - totalWins;
    const avgKills = matches.length > 0 ? (matches.reduce((s, m) => s + m.kills, 0) / matches.length).toFixed(1) : "0";
    const avgDeaths = matches.length > 0 ? (matches.reduce((s, m) => s + m.deaths, 0) / matches.length).toFixed(1) : "0";
    const avgAssists = matches.length > 0 ? (matches.reduce((s, m) => s + m.assists, 0) / matches.length).toFixed(1) : "0";

    return (
        <div className="w-full rounded-2xl overflow-hidden border border-border/30 backdrop-blur-sm"
            style={{ backgroundColor: settings.cardColor + '12' }}>

            {/* Header - Summoner Info */}
            <div className="relative overflow-hidden px-5 py-4"
                style={{ background: `linear-gradient(135deg, ${settings.cardColor}dd, ${settings.cardColor}99)` }}>
                {/* Decorative bg circles */}
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 bg-white" />
                <div className="absolute -left-4 -bottom-10 w-32 h-32 rounded-full opacity-5 bg-white" />

                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                                <Gamepad2 className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                                {summoner.summonerLevel}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg tracking-tight">{summoner.summonerName}</h3>
                            <p className="text-white/60 text-xs font-medium">League of Legends</p>
                        </div>
                    </div>
                    {summoner.rank && rankStyle && (
                        <div className={`px-3 py-1.5 rounded-lg bg-gradient-to-r ${rankStyle.bg} shadow-lg ${rankStyle.glow}`}>
                            <span className={`text-sm font-bold ${rankStyle.text}`}>
                                {summoner.rank.tier} {summoner.rank.division}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Rank & Stats Row */}
            {settings.showRank && summoner.rank && (
                <div className="px-5 py-3 border-b border-border/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4" style={{ color: settings.accentColor }} />
                                <span className="text-sm font-semibold">{summoner.rank.lp} LP</span>
                            </div>
                            {settings.showWinrate && (
                                <>
                                    <div className="h-4 w-px bg-border/40" />
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-green-500 font-medium">{summoner.rank.wins}W</span>
                                        <span className="text-muted-foreground">/</span>
                                        <span className="text-red-400 font-medium">{summoner.rank.losses}L</span>
                                    </div>
                                    <div className="h-4 w-px bg-border/40" />
                                    <span className="text-sm font-bold" style={{ color: settings.accentColor }}>
                                        {summoner.rank.winrate}% WR
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Matches Summary */}
            {settings.showLastMatches && matches.length > 0 && (
                <div className="px-5 py-3 border-b border-border/20">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" style={{ color: settings.accentColor }} />
                            <span className="text-sm font-semibold">Son {matches.length} Maç</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-green-500 text-xs font-bold">{totalWins}W</span>
                            <span className="text-muted-foreground text-xs">/</span>
                            <span className="text-red-400 text-xs font-bold">{totalLosses}L</span>
                        </div>
                    </div>

                    {/* Average Stats Bar */}
                    <div className="flex items-center gap-3 mb-3 px-3 py-2 rounded-lg bg-background/40">
                        <div className="flex items-center gap-1.5">
                            <Swords className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-xs font-bold">{avgKills}</span>
                        </div>
                        <span className="text-muted-foreground text-xs">/</span>
                        <div className="flex items-center gap-1.5">
                            <Skull className="w-3.5 h-3.5 text-red-400" />
                            <span className="text-xs font-bold">{avgDeaths}</span>
                        </div>
                        <span className="text-muted-foreground text-xs">/</span>
                        <div className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-xs font-bold">{avgAssists}</span>
                        </div>
                        <span className="text-xs text-muted-foreground ml-auto">Ortalama</span>
                    </div>

                    {/* Match rows */}
                    <div className="space-y-1.5">
                        {matches.map((match, idx) => {
                            const kda = match.deaths > 0 ? (match.kills + match.assists) / match.deaths : match.kills + match.assists;
                            const kdaColor = getKdaColor(kda);

                            return (
                                <div
                                    key={idx}
                                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.01] ${match.win
                                            ? 'bg-green-500/8 hover:bg-green-500/12'
                                            : 'bg-red-500/8 hover:bg-red-500/12'
                                        }`}
                                >
                                    {/* Win/Loss indicator bar */}
                                    <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-full ${match.win ? 'bg-green-500' : 'bg-red-500'
                                        }`} />

                                    {/* Champion Icon */}
                                    <div className="relative shrink-0">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-background/60 border border-border/30">
                                            <img
                                                src={`${CHAMPION_CDN}/${match.champion}.png`}
                                                alt={match.champion}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">${match.champion.slice(0, 2)}</div>`;
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Match Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="font-semibold text-sm truncate">{match.champion}</span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${match.win
                                                    ? 'bg-green-500/20 text-green-500'
                                                    : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {match.win ? 'W' : 'L'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="font-bold">
                                                <span className="text-green-400">{match.kills}</span>
                                                <span className="text-muted-foreground">/</span>
                                                <span className="text-red-400">{match.deaths}</span>
                                                <span className="text-muted-foreground">/</span>
                                                <span className="text-blue-400">{match.assists}</span>
                                            </span>
                                            <span className={`font-bold ${kdaColor}`}>
                                                {kda.toFixed(1)} KDA
                                            </span>
                                            <span className="text-muted-foreground">
                                                {match.cs} CS
                                            </span>
                                        </div>
                                    </div>

                                    {/* Items + Time */}
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <div className="flex gap-0.5">
                                            {match.items.slice(0, 6).map((itemId, itemIdx) => (
                                                <div
                                                    key={itemIdx}
                                                    className="w-5 h-5 rounded bg-background/60 border border-border/20 overflow-hidden"
                                                >
                                                    {itemId > 0 && (
                                                        <img
                                                            src={`${ITEM_CDN}/${itemId}.png`}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                            <Clock className="w-2.5 h-2.5" />
                                            <span>{formatGameDuration(match.gameDuration)}</span>
                                            <span>·</span>
                                            <span>{formatTimestamp(match.timestamp)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* No Matches */}
            {settings.showLastMatches && summoner.recentMatches.length === 0 && (
                <div className="px-5 py-6 text-center">
                    <Target className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="text-sm text-muted-foreground">Son maç bulunamadı</p>
                </div>
            )}

            {/* No Rank */}
            {settings.showRank && !summoner.rank && (
                <div className="px-5 py-4 border-b border-border/20">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-background/40">
                        <Award className="w-5 h-5 text-muted-foreground/50" />
                        <div>
                            <span className="text-sm font-medium text-muted-foreground">Sıralanmamış</span>
                            <p className="text-xs text-muted-foreground/60">Henüz ranked maç oynanmamış</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="px-5 py-2 flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground/40 font-medium tracking-wider uppercase">
                    Riot Games
                </span>
            </div>
        </div>
    );
}
