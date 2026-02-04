import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, ExternalLink, Percent } from "lucide-react";
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

export default function Home() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
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

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="page-home">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <main className="max-w-md mx-auto px-4 py-12">
        <div className="flex flex-col items-center gap-4 mb-8">
          <Avatar className="w-24 h-24 border-2 border-border" data-testid="avatar-profile">
            <AvatarImage src={profile?.avatarUrl || undefined} alt={profile?.name} />
            <AvatarFallback className="text-2xl bg-muted">
              {profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'TP'}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <h1 className="text-xl font-semibold" data-testid="text-profile-name">
              {profile?.name || 'ThePublisher'}
            </h1>
            {profile?.bio && (
              <p className="text-sm text-muted-foreground mt-1 max-w-xs" data-testid="text-profile-bio">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {activeLinks.map((link) => {
            const Icon = platformIcons[link.platform.toLowerCase()] || Globe;
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-md border border-border bg-card hover-elevate transition-colors"
                data-testid={`link-social-${link.platform.toLowerCase()}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-medium flex-1">{link.platform}</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </a>
            );
          })}

          {activeSponsors.length > 0 && (
            <>
              <div className="mt-6 mb-2">
                <p className="text-sm font-medium text-muted-foreground text-center">Sponsorlar</p>
              </div>
              {activeSponsors.map((sponsor) => (
                <a
                  key={sponsor.id}
                  href={sponsor.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-md border border-border bg-card hover-elevate transition-colors"
                  data-testid={`link-sponsor-${sponsor.id}`}
                >
                  <span className="font-medium flex-1">{sponsor.name}</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
              ))}
            </>
          )}

          {activeCodes.length > 0 && (
            <>
              <div className="mt-6 mb-2">
                <p className="text-sm font-medium text-muted-foreground text-center">Oyun Satın Alma Kodları</p>
              </div>
              <div className="flex flex-col gap-3">
                {activeCodes.map((code) => {
                  const isCopied = copiedId === code.id;
                  return (
                    <div
                      key={code.id}
                      className="flex items-center gap-3 p-4 rounded-md border border-border bg-card"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-semibold" data-testid={`text-discount-code-${code.id}`}>
                            {code.code}
                          </code>
                          {code.discountPercent && (
                            <Badge variant="secondary" className="text-xs">
                              <Percent className="w-3 h-3 mr-1" />
                              {code.discountPercent}
                            </Badge>
                          )}
                        </div>
                        {getSponsorName(code.sponsorId) && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {getSponsorName(code.sponsorId)}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyCode(code)}
                        data-testid={`button-copy-code-${code.id}`}
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4 text-primary" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <footer className="mt-12 text-center">
          <p className="text-xs text-muted-foreground">ThePublisher</p>
        </footer>
      </main>
    </div>
  );
}
