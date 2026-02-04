import { useQuery } from "@tanstack/react-query";
import { HeroSection } from "@/components/hero-section";
import { SocialLinksSection } from "@/components/social-links-section";
import { SponsorsSection } from "@/components/sponsors-section";
import { DiscountCodesSection } from "@/components/discount-codes-section";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";
import type { Profile, SocialLink, Sponsor, DiscountCode } from "@shared/schema";

export default function Home() {
  const { data: profile, isLoading: profileLoading } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

  const { data: socialLinks = [], isLoading: linksLoading } = useQuery<SocialLink[]>({
    queryKey: ["/api/social-links"],
  });

  const { data: sponsors = [], isLoading: sponsorsLoading } = useQuery<Sponsor[]>({
    queryKey: ["/api/sponsors"],
  });

  const { data: discountCodes = [], isLoading: codesLoading } = useQuery<DiscountCode[]>({
    queryKey: ["/api/discount-codes"],
  });

  return (
    <div className="min-h-screen bg-background" data-testid="page-home">
      <header className="fixed top-0 right-0 z-50 p-4">
        <ThemeToggle />
      </header>

      <main>
        <HeroSection 
          profile={profile || null} 
          isLoading={profileLoading} 
        />
        
        <SocialLinksSection 
          links={socialLinks} 
          isLoading={linksLoading} 
        />
        
        <SponsorsSection 
          sponsors={sponsors} 
          isLoading={sponsorsLoading} 
        />
        
        <DiscountCodesSection 
          codes={discountCodes}
          sponsors={sponsors}
          isLoading={codesLoading} 
        />
      </main>

      <motion.footer 
        className="py-8 px-4 border-t border-border"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container text-center">
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} - Tüm hakları saklıdır.
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
