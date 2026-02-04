import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ExternalLink, Tag, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DiscountCode, Sponsor } from "@shared/schema";

interface DiscountCodesSectionProps {
  codes: DiscountCode[];
  sponsors: Sponsor[];
  isLoading: boolean;
}

export function DiscountCodesSection({ codes, sponsors, isLoading }: DiscountCodesSectionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const activeCodes = codes.filter(c => c.isActive).sort((a, b) => a.displayOrder - b.displayOrder);

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
        description: "Lütfen kodu manuel olarak kopyalayın.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 px-4">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">İndirim Kodları</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Bana özel indirim kodlarıyla tasarruf edin
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-40 bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (activeCodes.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4" data-testid="section-discount-codes">
      <div className="container max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl font-bold mb-4">İndirim Kodları</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Bana özel indirim kodlarıyla tasarruf edin
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {activeCodes.map((code, index) => {
            const sponsorName = getSponsorName(code.sponsorId);
            const isCopied = copiedId === code.id;

            return (
              <motion.div
                key={code.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full overflow-hidden group hover:border-primary/30 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        {sponsorName && (
                          <p className="text-sm text-muted-foreground mb-1">{sponsorName}</p>
                        )}
                        {code.description && (
                          <h3 className="font-semibold text-lg" data-testid={`text-discount-description-${code.id}`}>
                            {code.description}
                          </h3>
                        )}
                      </div>
                      {code.discountPercent && (
                        <Badge variant="secondary" className="shrink-0 bg-primary/10 text-primary border-primary/20">
                          <Percent className="w-3 h-3 mr-1" />
                          {code.discountPercent}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md border border-border mb-4">
                      <Tag className="w-5 h-5 text-primary shrink-0" />
                      <code className="font-mono text-lg font-semibold flex-1 tracking-wide" data-testid={`text-discount-code-${code.id}`}>
                        {code.code}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyCode(code)}
                        className="shrink-0"
                        data-testid={`button-copy-code-${code.id}`}
                      >
                        <AnimatePresence mode="wait">
                          {isCopied ? (
                            <motion.div
                              key="check"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              <Check className="w-4 h-4 text-primary" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="copy"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              <Copy className="w-4 h-4" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Button>
                    </div>

                    {code.url && (
                      <Button 
                        asChild 
                        className="w-full"
                      >
                        <a 
                          href={code.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          data-testid={`link-discount-${code.id}`}
                        >
                          <span>Kullanmaya Başla</span>
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
