import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SiKick, SiYoutube, SiTwitch, SiX, SiInstagram, SiDiscord, SiTiktok, SiGithub, SiFacebook, SiLinkedin } from "react-icons/si";
import { Globe, ExternalLink } from "lucide-react";
import type { SocialLink } from "@shared/schema";

interface SocialLinksSectionProps {
  links: SocialLink[];
  isLoading: boolean;
}

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
  kick: "hover:border-[#53fc18]/50 hover:bg-[#53fc18]/10",
  youtube: "hover:border-[#ff0000]/50 hover:bg-[#ff0000]/10",
  twitch: "hover:border-[#9146ff]/50 hover:bg-[#9146ff]/10",
  twitter: "hover:border-foreground/50 hover:bg-foreground/10",
  x: "hover:border-foreground/50 hover:bg-foreground/10",
  instagram: "hover:border-[#e4405f]/50 hover:bg-[#e4405f]/10",
  discord: "hover:border-[#5865f2]/50 hover:bg-[#5865f2]/10",
  tiktok: "hover:border-[#000000]/50 hover:bg-[#000000]/10 dark:hover:border-white/50 dark:hover:bg-white/10",
  github: "hover:border-[#333]/50 hover:bg-[#333]/10 dark:hover:border-white/50 dark:hover:bg-white/10",
  facebook: "hover:border-[#1877f2]/50 hover:bg-[#1877f2]/10",
  linkedin: "hover:border-[#0a66c2]/50 hover:bg-[#0a66c2]/10",
};

const platformTextColors: Record<string, string> = {
  kick: "group-hover:text-[#53fc18]",
  youtube: "group-hover:text-[#ff0000]",
  twitch: "group-hover:text-[#9146ff]",
  twitter: "group-hover:text-foreground",
  x: "group-hover:text-foreground",
  instagram: "group-hover:text-[#e4405f]",
  discord: "group-hover:text-[#5865f2]",
  tiktok: "group-hover:text-foreground",
  github: "group-hover:text-foreground",
  facebook: "group-hover:text-[#1877f2]",
  linkedin: "group-hover:text-[#0a66c2]",
};

export function SocialLinksSection({ links, isLoading }: SocialLinksSectionProps) {
  const activeLinks = links.filter(l => l.isActive).sort((a, b) => a.displayOrder - b.displayOrder);

  if (isLoading) {
    return (
      <section className="py-12 px-4">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Beni Takip Et</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (activeLinks.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4" data-testid="section-social-links">
      <div className="container max-w-4xl mx-auto">
        <motion.h2 
          className="text-2xl font-bold text-center mb-8"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Beni Takip Et
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {activeLinks.map((link, index) => {
            const Icon = platformIcons[link.platform.toLowerCase()] || Globe;
            const colorClass = platformColors[link.platform.toLowerCase()] || "hover:border-primary/50 hover:bg-primary/10";
            const textColorClass = platformTextColors[link.platform.toLowerCase()] || "group-hover:text-primary";

            return (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center gap-3 p-4 rounded-md border border-border bg-card transition-all duration-300 ${colorClass}`}
                  data-testid={`link-social-${link.platform.toLowerCase()}`}
                >
                  <Icon className={`w-6 h-6 transition-colors ${textColorClass}`} />
                  <span className={`font-medium capitalize flex-1 transition-colors ${textColorClass}`}>
                    {link.platform}
                  </span>
                  <ExternalLink className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${textColorClass}`} />
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
