import { useState, useEffect } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgeVerificationModalProps {
    enabled: boolean;
    redirectUrl?: string; // URL to redirect if "Yes" is clicked (optional, otherwise just closes modal)
}

export function AgeVerificationModal({ enabled, redirectUrl }: AgeVerificationModalProps) {
    const [open, setOpen] = useState(false);
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        // Check local storage or session storage
        const isVerified = localStorage.getItem("age-verified");
        if (enabled && !isVerified) {
            setOpen(true);
        }
    }, [enabled]);

    const handleVerify = () => {
        localStorage.setItem("age-verified", "true");
        setVerified(true);
        setOpen(false);
        if (redirectUrl) {
            window.location.href = redirectUrl;
        }
    };

    const handleExit = () => {
        window.location.href = "https://www.google.com";
    };

    if (!enabled || verified) return null;

    return (
        <AlertDialog open={open}>
            <AlertDialogContent className="bg-background border-border">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-500">
                        <AlertTriangle className="w-6 h-6" />
                        +18 Yaş Uyarısı
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-foreground/90">
                        Bu site +18 yaş ve üzeri içerikler barındırabilir. Devam etmek için 18 yaşından büyük olduğunuzu doğrulamanız gerekmektedir.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={handleExit} className="w-full sm:w-auto">
                        Hayır, 18 yaşından küçüğüm
                    </Button>
                    <Button variant="destructive" onClick={handleVerify} className="w-full sm:w-auto">
                        Evet, 18 yaşından büyüğüm
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
