import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiKick } from "react-icons/si";

interface KickWidgetProps {
    username: string;
    autoplay?: boolean;
}

export function KickWidget({ username, autoplay = true }: KickWidgetProps) {
    if (!username) return null;

    return (
        <Card className="overflow-hidden border-none shadow-lg bg-[#53FC18]/10">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-[#53FC18]">
                    <SiKick className="w-6 h-6" />
                    <span>Canlı Yayın</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 aspect-video">
                <iframe
                    src={`https://player.kick.com/${username}?autoplay=${autoplay}`}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; fullscreen; picture-in-picture"
                />
            </CardContent>
        </Card>
    );
}
