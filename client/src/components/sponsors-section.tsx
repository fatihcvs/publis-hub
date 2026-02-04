import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Building2 } from "lucide-react";
import type { Sponsor } from "@shared/schema";

interface SponsorsSectionProps {
  sponsors: Sponsor[];
  isLoading: boolean;
}

export function SponsorsSection({ sponsors, isLoading }: SponsorsSectionProps) {
  const activeSponsors = sponsors.filter(s => s.isActive).sort((a, b) => a.displayOrder - b.displayOrder);

  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-muted/30">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">Sponsorlarım</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Beni destekleyen harika markalar
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (activeSponsors.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 bg-muted/30" data-testid="section-sponsors">
      <div className="container max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl font-bold mb-4">Sponsorlarım</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Beni destekleyen harika markalar
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeSponsors.map((sponsor, index) => (
            <motion.div
              key={sponsor.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group h-full transition-all duration-300 hover:border-primary/30">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-start gap-4 mb-4">
                    {sponsor.logoUrl ? (
                      <img 
                        src={sponsor.logoUrl} 
                        alt={sponsor.name}
                        className="w-16 h-16 object-contain rounded-md bg-background p-2"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg" data-testid={`text-sponsor-name-${sponsor.id}`}>
                        {sponsor.name}
                      </h3>
                    </div>
                  </div>
                  
                  {sponsor.description && (
                    <p className="text-muted-foreground text-sm flex-1 mb-4" data-testid={`text-sponsor-description-${sponsor.id}`}>
                      {sponsor.description}
                    </p>
                  )}

                  <Button 
                    asChild 
                    variant="outline" 
                    className="w-full mt-auto group-hover:border-primary/50 group-hover:text-primary transition-colors"
                  >
                    <a 
                      href={sponsor.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      data-testid={`link-sponsor-${sponsor.id}`}
                    >
                      <span>Siteyi Ziyaret Et</span>
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
