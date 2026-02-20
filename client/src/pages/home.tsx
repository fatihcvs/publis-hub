import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, ExternalLink, Percent, Gamepad2, Users, Star, Mail } from "lucide-react";
import { SiKick, SiYoutube, SiX, SiInstagram, SiDiscord, SiTiktok, SiTwitch, SiGithub, SiFacebook, SiLinkedin } from "react-icons/si";
import { Globe } from "lucide-react";
import type { Profile, SocialLink, Sponsor, DiscountCode } from "@shared/schema";

// Import Nunito font
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";

import { KickWidget } from "@/components/widgets/kick-widget";
import { FloatingEmojis } from "@/components/widgets/floating-emojis";
import { LoLWidget } from "@/components/widgets/LoLWidget";

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

  // Update document title, favicon, and meta tags dynamically
  useEffect(() => {
    if (profile?.siteTitle) {
      document.title = profile.siteTitle;
    }

    // Update meta description
    const setMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };
    const setOG = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    if (profile?.bio) {
      setMeta("description", profile.bio.slice(0, 160));
      setOG("og:description", profile.bio.slice(0, 160));
    }
    if (profile?.siteTitle) {
      setOG("og:title", profile.siteTitle);
      setOG("og:type", "website");
    }

    // Update favicon
    const existingFavicon = document.querySelector("link[rel='icon']");
    if (profile?.faviconUrl) {
      if (existingFavicon) {
        existingFavicon.setAttribute("href", profile.faviconUrl);
      } else {
        const link = document.createElement("link");
        link.rel = "icon";
        link.type = "image/png";
        link.href = profile.faviconUrl;
        document.head.appendChild(link);
      }
    } else if (existingFavicon) {
      existingFavicon.remove();
    }
  }, [profile?.siteTitle, profile?.faviconUrl, profile?.bio]);


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

  // Calculate styles based on profile settings
  const themeStyle = {
    "--primary": profile?.themeColor || "#7c3aed",
    "--primary-foreground": "#ffffff",
  } as React.CSSProperties;

  const backgroundStyle = profile?.backgroundImageUrl ? {
    backgroundImage: `url(${profile.backgroundImageUrl})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: `blur(${profile.backgroundBlur ?? 0}px)`,
  } as React.CSSProperties : {};

  const cardStyle = {
    backgroundColor: `rgba(var(--card-rgb), ${((profile?.cardOpacity ?? 80) / 100)})`, // Assuming --card-rgb is available or we use a hex conversion
    // Fallback if --card-rgb is not defined in global css, we can use a hex/rgb value. 
    // Let's use a simpler approach for now: modifying the tailwind classes or inline style for bg.
    // Actually, shadcn cards use bg-card. We can override it or use a specific rgba.
    // Let's try to set a custom variable or style for cards.
  };

  // Helper to hex to rgb
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : null;
  };

  const primaryRgb = profile?.themeColor ? hexToRgb(profile.themeColor) : "124 58 237"; // violet-600 default
  const borderRadius = profile?.borderRadius || "2rem";
  const fontFamily = profile?.fontFamily || "Nunito";

  return (
    <div
      className="min-h-screen bg-background relative overflow-hidden transition-colors duration-500"
      data-testid="page-home"
      style={{
        "--primary": primaryRgb,
        fontFamily: fontFamily,
      } as React.CSSProperties}
    >

      {/* Background Image / Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {profile?.backgroundImageUrl ? (
          <>
            <div
              className="absolute inset-0 bg-background/50 z-0" // Overlay
            />
            <div
              className="absolute inset-0 z-[-1]"
              style={backgroundStyle}
            />
          </>
        ) : (
          <>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/3 to-transparent rounded-full" />
          </>
        )}
        {profile?.floatingEmojis && <FloatingEmojis />}
      </div>

      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <main className="relative max-w-md mx-auto px-4 py-16">
        <div className="flex flex-col gap-4">
          {(profile?.layoutConfig && (profile.layoutConfig as any[]).length > 0
            ? (profile.layoutConfig as any[])
            : [
              { id: "bio", visible: true, width: "full" },
              { id: "socials", visible: true, width: "full" },
              { id: "kick", visible: true, width: "full" },
              { id: "sponsors", visible: true, width: "full" },
              { id: "lol", visible: false, width: "half" },
              { id: "games", visible: true, width: "full" },
              { id: "contact", visible: true, width: "full" }
            ]
          ).filter((section: any) => section.visible).map((section: any) => {
            const renderContent = () => {
              switch (section.id) {
                case "bio":
                  return (
                    <div className="flex flex-col items-center gap-6 mb-4">
                      <div className="relative group">
                        <div className="absolute -inset-2 bg-gradient-to-r from-primary via-primary/50 to-primary rounded-full opacity-75 blur-lg group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/80 rounded-full" />
                        <Avatar className="relative w-28 h-28 border-4 border-background" data-testid="avatar-profile">
                          <AvatarImage src={profile?.avatarUrl || undefined} alt={profile?.name} className="object-cover" />
                          <AvatarFallback className="text-3xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold">
                            {profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'TP'}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="text-center space-y-2 w-full">
                        {profile?.bioTitle ? (
                          <div
                            className="rounded-xl p-4 mb-4 border"
                            style={{
                              backgroundColor: profile.bioBackgroundColor || "#fffBEB",
                              borderColor: profile.bioBorderColor || "transparent",
                              color: profile.bioBodyColor || "#333333"
                            }}
                          >
                            <h1
                              className="text-xl font-bold mb-2 flex items-center justify-center gap-2"
                              style={{ color: profile.bioTitleColor || "#000000" }}
                            >
                              {profile.title && <Gamepad2 className="w-5 h-5" />}
                              {profile.bioTitle}
                            </h1>
                            <div className="whitespace-pre-wrap text-sm leading-relaxed mb-3">
                              {profile.bioBody || profile.bio}
                            </div>
                            {profile.bioFooter && (
                              <div
                                className="text-sm font-semibold mt-2 pt-2 border-t border-black/5"
                                style={{ color: profile.bioFooterColor || "#ff0000" }}
                              >
                                {profile.bioFooter}
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
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
                          </>
                        )}
                      </div>
                    </div>
                  );
                case "widgets":
                  // Legacy grouping support, though now we prefer separate keys
                  return null;
                case "kick":
                  if (!profile?.kickUsername) return null;
                  return <KickWidget username={profile.kickUsername} autoplay={profile.kickAutoplay ?? true} />;
                case "lol":
                  if (!profile?.lolWidgetEnabled) return null;
                  return <LoLWidget />;
                case "age_verify":
                  return null; // Modal is handled globally
                case "socials":
                  if (activeLinks.length === 0) return null;

                  // Separate links by display style
                  const standardLinks = activeLinks.filter(link => !link.displayStyle || link.displayStyle === "standard");
                  const gridLinks = activeLinks.filter(link => link.displayStyle === "grid");
                  const iconLinks = activeLinks.filter(link => link.displayStyle === "icon");

                  return (
                    <div className="flex flex-col gap-3">
                      {/* Standard links - full width, vertical stack */}
                      {standardLinks.map((link) => {
                        const Icon = platformIcons[link.platform.toLowerCase()] || Globe;
                        const gradientClass = platformColors[link.platform.toLowerCase()] || "from-primary to-primary/80";

                        const commonStyle = {
                          backgroundColor: link.customBgColor || `rgba(var(--card-rgb), ${(profile?.cardOpacity ?? 80) / 100})`,
                          backdropFilter: "blur(8px)",
                          color: link.customTextColor || undefined
                        };

                        return (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative block overflow-hidden rounded-2xl border border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30"
                            style={{ ...commonStyle, borderRadius }}
                          >
                            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${gradientClass} opacity-80 group-hover:opacity-100 transition-opacity`} />
                            <div className="p-4 pl-5">
                              <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-lg bg-gradient-to-br ${gradientClass} text-white shadow-lg`}><Icon className="w-5 h-5" /></div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2"><span className="font-semibold text-base">{link.platform}</span>{link.badge && <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{link.badge}</Badge>}</div>
                                  {link.followerCount && <div className="flex items-center gap-1.5 text-xs mt-0.5"><Users className="w-3.5 h-3.5" /><span className={!link.customTextColor ? "text-muted-foreground" : ""}>{link.followerCount} takipçi</span></div>}
                                </div>
                                <ExternalLink className={`w-5 h-5 transition-colors ${link.customTextColor ? '' : 'text-muted-foreground group-hover:text-primary'}`} />
                              </div>
                              {link.description && <p className={`text-sm mt-2 pl-12 line-clamp-2 ${link.customTextColor ? '' : 'text-muted-foreground'}`}>{link.description}</p>}
                            </div>
                          </a>
                        );
                      })}

                      {/* Grid links - 2 column layout */}
                      {gridLinks.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                          {gridLinks.map((link) => {
                            const Icon = platformIcons[link.platform.toLowerCase()] || Globe;
                            const gradientClass = platformColors[link.platform.toLowerCase()] || "from-primary to-primary/80";

                            const commonStyle = {
                              backgroundColor: link.customBgColor || `rgba(var(--card-rgb), ${(profile?.cardOpacity ?? 80) / 100})`,
                              backdropFilter: "blur(8px)",
                              color: link.customTextColor || undefined
                            };

                            return (
                              <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative flex flex-col items-center justify-center p-5 text-center rounded-2xl border border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-primary/30"
                                style={{ ...commonStyle, borderRadius }}
                              >
                                <div className={`p-3 mb-2 rounded-xl bg-gradient-to-br ${gradientClass} text-white shadow-xl`}>
                                  <Icon className="w-6 h-6" />
                                </div>
                                <span className="font-semibold text-sm">{link.platform}</span>
                                {link.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{link.description}</p>}
                              </a>
                            );
                          })}
                        </div>
                      )}

                      {/* Icon-only links in a compact row */}
                      {iconLinks.length > 0 && (
                        <div className="flex items-center justify-center gap-3 mt-2">
                          {iconLinks.map((link) => {
                            const Icon = platformIcons[link.platform.toLowerCase()] || Globe;
                            const gradientClass = platformColors[link.platform.toLowerCase()] || "from-primary to-primary/80";

                            return (
                              <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-white dark:bg-card border border-border/50 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:border-primary/30"
                              >
                                <div className={`p-2.5 rounded-full bg-gradient-to-br ${gradientClass} text-white shadow-lg group-hover:shadow-primary/50`}>
                                  <Icon className="w-5 h-5" />
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                case "sponsors":
                  if (activeSponsors.length === 0) return null;
                  return (
                    <div className="mt-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Star className="w-4 h-4 text-primary" /><span>Sponsorlar</span><Star className="w-4 h-4 text-primary" />
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                      </div>
                      <div className="grid gap-4">
                        {activeSponsors.map((sponsor) => (
                          <div key={sponsor.id} className="group relative p-5 rounded-xl border border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
                            style={{ backgroundColor: `rgba(var(--card-rgb), ${(profile?.cardOpacity ?? 80) / 100})`, backdropFilter: "blur(8px)" }}>
                            <div className="flex items-start gap-4">
                              {sponsor.logoUrl ? <div className="shrink-0 p-2 rounded-lg bg-background border border-border/50"><img src={sponsor.logoUrl} className="w-12 h-12 rounded object-contain" /></div> : <div className="shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"><Star className="w-6 h-6 text-primary" /></div>}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h3 className="font-semibold text-lg">{sponsor.name}</h3>
                                  {sponsor.code && <div className="flex items-center gap-2"><code className="px-2 py-1 rounded-md bg-primary/10 font-mono text-sm text-primary font-semibold">{sponsor.code}</code><Button size="sm" variant="ghost" onClick={(e) => { e.preventDefault(); copySponsorCode(sponsor); }} className="hover:bg-primary/10">{copiedSponsorId === sponsor.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}</Button></div>}
                                </div>
                                {sponsor.description && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{sponsor.description}</p>}
                                <a href={sponsor.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary hover:underline font-medium">Siteye Git <ExternalLink className="w-3.5 h-3.5" /></a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                case "games":
                  if (activeCodes.length === 0) return null;
                  return (
                    <div className="mt-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Gamepad2 className="w-4 h-4 text-primary" /><span>Oyunlar</span><Gamepad2 className="w-4 h-4 text-primary" /></div>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                      </div>
                      <div className="grid gap-4">
                        {activeCodes.map(code => (
                          <div key={code.id} className="group relative p-5 rounded-xl border border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
                            style={{ backgroundColor: `rgba(var(--card-rgb), ${(profile?.cardOpacity ?? 80) / 100})`, backdropFilter: "blur(8px)" }}>
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                {code.logoUrl ? <img src={code.logoUrl} className="w-12 h-12 object-cover rounded-lg shadow-lg" /> : <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg"><Gamepad2 className="w-5 h-5" /></div>}
                                <div>
                                  <span className="font-semibold text-lg">{code.description || code.code}</span>
                                  {code.code && code.code !== "-" && <div className="flex items-center gap-2 mt-1"><code className="px-2 py-0.5 rounded bg-primary/10 font-mono text-sm text-primary font-semibold">{code.code}</code><Button size="sm" variant="ghost" onClick={() => copyCode(code)} className="h-6 px-2">{copiedId === code.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}</Button></div>}
                                </div>
                              </div>
                              {code.url && <a href={code.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity" style={{ backgroundColor: `rgb(var(--primary))` }}>Satın Al <ExternalLink className="w-3.5 h-3.5" /></a>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                case "contact":
                  return (
                    <div className="mt-8">
                      <a href="mailto:contact@thepublishers.info" className="group flex items-center justify-center gap-3 px-6 py-4 rounded-xl border border-border/50 hover:border-primary/50 transition-all duration-300"
                        style={{ backgroundColor: `rgba(var(--card-rgb), ${(profile?.cardOpacity ?? 80) / 100})`, backdropFilter: "blur(8px)" }}>
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors"><Mail className="w-5 h-5 text-primary" /></div>
                        <div className="flex flex-col items-start"><span className="text-xs text-muted-foreground">İletişim</span><span className="text-sm font-medium text-foreground">contact@thepublishers.info</span></div>
                      </a>
                    </div>
                  );
                default:
                  return null;
              }
            };

            return (
              <div key={section.id} className="w-full">
                {renderContent()}
              </div>
            );
          })}
        </div>


        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Gamepad2 className="w-4 h-4 text-primary" />
            <span>{profile?.name || 'Link Hub'}</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
