import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface PremiumWidgetProps {
    url: string;
    title?: string;
    description?: string;
    imageUrls?: string[];
}

export function PremiumWidget({ url, title, description, imageUrls }: PremiumWidgetProps) {
    if (!url) return null;

    return (
        <Card className="overflow-hidden border-none shadow-lg relative group cursor-pointer" onClick={() => window.open(url, "_blank")}>
            <div className="absolute inset-0 z-0">
                {imageUrls && imageUrls.length > 0 ? (
                    <div className="w-full h-full grid grid-cols-2 gap-0.5 opacity-50">
                        {imageUrls.slice(0, 4).map((img, i) => (
                            <img key={i} src={img} className="w-full h-full object-cover blur-sm" />
                        ))}
                    </div>
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 blur-xl" />
                )}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            </div>

            <CardContent className="relative z-10 p-6 flex flex-col items-center justify-center text-center text-white h-full min-h-[200px] space-y-4">
                <div className="p-4 rounded-full bg-white/10 backdrop-blur-md mb-2 group-hover:scale-110 transition-transform">
                    <Lock className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-1">{title || "Premium İçerik"}</h3>
                    <p className="text-sm text-white/80 max-w-xs mx-auto">{description || "Kilitli içerikleri görmek için tıklayın."}</p>
                </div>
                <Button className="bg-white text-black hover:bg-white/90 mt-4 rounded-full font-bold">
                    Kilidi Aç
                </Button>
            </CardContent>
        </Card>
    );
}
