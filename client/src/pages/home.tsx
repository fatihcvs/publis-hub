import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, ExternalLink, Percent, Gamepad2, Users, Star } from "lucide-react";
import { SiKick, SiYoutube, SiX, SiInstagram, SiDiscord, SiTiktok, SiTwitch, SiGithub, SiFacebook, SiLinkedin } from "react-icons/si";
import { Globe } from "lucide-react";
import type { Profile, SocialLink, Sponsor, DiscountCode } from "@shared/schema";

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  kick: SiKick,
  youtube: SiYoutube,
  twitch: SiTwitch,
  twitter: SiX,
  x: SiX,
  instagram: SiInstagram,
  discord: SiDiscord,
  tiktok: SiTiktok,
  github: SiGithub,
  facebook: SiFacebook,
  linkedin: SiLinkedin,
};

const platformColors: Record<string, string> = {
  kick: "from-green-500 to-green-600",
  youtube: "from-red-500 to-red-600",
  twitch: "from-purple-500 to-purple-600",
  twitter: "from-gray-700 to-gray-800",
  x: "from-gray-700 to-gray-800",
  instagram: "from-pink-500 via-purple-500 to-orange-400",
  discord: "from-indigo-500 to-indigo-600",
  tiktok: "from-gray-900 to-gray-800",
  github: "from-gray-700 to-gray-800",
  facebook: "from-blue-600 to-blue-700",
  linkedin: "from-blue-500 to-blue-600",
};

export default function Home() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedSponsorId, setCopiedSponsorId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

  const { data: socialLinks = [] } = useQuery<SocialLink[]>({
    queryKey: ["/api/social-links"],
  });

  const { data: sponsors = [] } = useQuery<Sponsor[]>({
    queryKey: ["/api/sponsors"],
  });

  const { data: discountCodes = [] } = useQuery<DiscountCode[]>({
    queryKey: ["/api/discount-codes"],
  });

  const activeLinks = socialLinks.filter(l => l.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
  const activeSponsors = sponsors.filter(s => s.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
  const activeCodes = discountCodes.filter(c => c.isActive).sort((a, b) => a.displayOrder - b.displayOrder);

  const getSponsorName = (sponsorId: string | null): string => {
    if (!sponsorId) return "";
    const sponsor = sponsors.find(s => s.id === sponsorId);
    return sponsor?.name || "";
  };

  const copyCode = async (code: DiscountCode) => {
    try {
      await navigator.clipboard.writeText(code.code);
      setCopiedId(code.id);
      toast({
        title: "Kod kopyalandı!",
        description: `${code.code} panoya kopyalandı.`,
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({
        title: "Kopyalama başarısız",
        variant: "destructive",
      });
    }
  };

  const copySponsorCode = async (sponsor: Sponsor) => {
    if (!sponsor.code || !sponsor.code.trim()) return;
    try {
      await navigator.clipboard.writeText(sponsor.code);
      setCopiedSponsorId(sponsor.id);
      toast({
        title: "Kod kopyalandı!",
        description: `${sponsor.code} panoya kopyalandı.`,
      });
      setTimeout(() => setCopiedSponsorId(null), 2000);
    } catch {
      toast({
        title: "Kopyalama başarısız",
        variant: "destructive",
      });
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/30 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden" data-testid="page-home">
      {/* Animated background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/3 to-transparent rounded-full" />
      </div>

      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <main className="relative max-w-lg mx-auto px-4 py-16">
        {/* Profile Section with Glow */}
        <div className="flex flex-col items-center gap-6 mb-12">
          <div className="relative group">
            {/* Outer glow ring */}
            <div className="absolute -inset-2 bg-gradient-to-r from-primary via-primary/50 to-primary rounded-full opacity-75 blur-lg group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
            {/* Inner ring */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/80 rounded-full" />
            <Avatar className="relative w-28 h-28 border-4 border-background" data-testid="avatar-profile">
              <AvatarImage src={profile?.avatarUrl || undefined} alt={profile?.name} className="object-cover" />
              <AvatarFallback className="text-3xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold">
                {profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'TP'}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text" data-testid="text-profile-name">
              {profile?.name || 'ThePublisher'}
            </h1>
            {profile?.title && (
              <p className="text-sm font-medium text-primary flex items-center justify-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                {profile.title}
              </p>
            )}
            {profile?.bio && (
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed" data-testid="text-profile-bio">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div className="flex flex-col gap-4">
          {activeLinks.map((link, index) => {
            const Icon = platformIcons[link.platform.toLowerCase()] || Globe;
            const gradientClass = platformColors[link.platform.toLowerCase()] || "from-primary to-primary/80";
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block overflow-hidden rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30"
                style={{ animationDelay: `${index * 100}ms` }}
                data-testid={`link-social-${link.platform.toLowerCase()}`}
              >
                {/* Gradient accent line */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${gradientClass} opacity-80 group-hover:opacity-100 transition-opacity`} />
                
                <div className="p-4 pl-5">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${gradientClass} text-white shadow-lg`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">{link.platform}</span>
                        {link.badge && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                            {link.badge}
                          </Badge>
                        )}
                      </div>
                      {link.followerCount && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                          <Users className="w-3.5 h-3.5" />
                          <span>{link.followerCount} takipçi</span>
                        </div>
                      )}
                    </div>
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  {link.description && (
                    <p className="text-sm text-muted-foreground mt-2 pl-12 line-clamp-2">
                      {link.description}
                    </p>
                  )}
                </div>
              </a>
            );
          })}

          {/* Sponsors Section */}
          {activeSponsors.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Star className="w-4 h-4 text-primary" />
                  <span>Sponsorlar</span>
                  <Star className="w-4 h-4 text-primary" />
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
              
              <div className="grid gap-4">
                {activeSponsors.map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className="group relative p-5 rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
                    data-testid={`card-sponsor-${sponsor.id}`}
                  >
                    <div className="flex items-start gap-4">
                      {sponsor.logoUrl ? (
                        <div className="shrink-0 p-2 rounded-lg bg-background border border-border/50">
                          <img 
                            src={sponsor.logoUrl} 
                            alt={sponsor.name} 
                            className="w-12 h-12 rounded object-contain"
                          />
                        </div>
                      ) : (
                        <div className="shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <Star className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-lg">{sponsor.name}</h3>
                          {sponsor.code && sponsor.code.trim() && (
                            <div className="flex items-center gap-2">
                              <code className="px-2 py-1 rounded-md bg-primary/10 font-mono text-sm text-primary font-semibold">
                                {sponsor.code}
                              </code>
                              {sponsor.discountPercent !== null && sponsor.discountPercent !== undefined && sponsor.discountPercent > 0 && (
                                <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                                  <Percent className="w-3 h-3 mr-1" />
                                  {sponsor.discountPercent}
                                </Badge>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => { e.preventDefault(); copySponsorCode(sponsor); }}
                                className="hover:bg-primary/10"
                                data-testid={`button-copy-sponsor-${sponsor.id}`}
                              >
                                {copiedSponsorId === sponsor.id ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                        {sponsor.description && (
                          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                            {sponsor.description}
                          </p>
                        )}
                        <a
                          href={sponsor.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary hover:underline font-medium"
                          data-testid={`link-sponsor-${sponsor.id}`}
                        >
                          Siteye Git
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Games/Discount Codes Section */}
          {activeCodes.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Gamepad2 className="w-4 h-4 text-primary" />
                  <span>Oyunlar</span>
                  <Gamepad2 className="w-4 h-4 text-primary" />
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
              
              <div className="grid gap-4">
                {activeCodes.map((code) => {
                  const isCopied = copiedId === code.id;
                  return (
                    <div
                      key={code.id}
                      className="group relative p-5 rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {code.logoUrl ? (
                            <img src={code.logoUrl} alt={code.description || "Game"} className="w-12 h-12 object-cover rounded-lg shadow-lg" />
                          ) : (
                            <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg">
                              <Gamepad2 className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-lg">{code.description || code.code}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="px-2 py-0.5 rounded bg-primary/10 font-mono text-sm text-primary font-semibold" data-testid={`text-discount-code-${code.id}`}>
                                {code.code}
                              </code>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyCode(code)}
                                className="h-6 px-2"
                                data-testid={`button-copy-code-${code.id}`}
                              >
                                {isCopied ? (
                                  <Check className="w-3.5 h-3.5 text-green-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                        {code.url && (
                          <a
                            href={code.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                            data-testid={`link-buy-${code.id}`}
                          >
                            Satın Al
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Gamepad2 className="w-4 h-4 text-primary" />
            <span>ThePublisher</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
