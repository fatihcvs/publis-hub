import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "@/components/admin/pages/AdminDashboard";
import { AdminProfilePage } from "@/components/admin/pages/AdminProfilePage";
import { AdminAppearancePage } from "@/components/admin/pages/AdminAppearancePage";
import { AdminWidgetsPage } from "@/components/admin/pages/AdminWidgetsPage";
import { AdminSocialPage } from "@/components/admin/pages/AdminSocialPage";
import { AdminSponsorsPage } from "@/components/admin/pages/AdminSponsorsPage";
import { AdminCodesPage } from "@/components/admin/pages/AdminCodesPage";
import { AdminGamesPage } from "@/components/admin/pages/AdminGamesPage";
import { AdminContactPage } from "@/components/admin/pages/AdminContactPage";
import { AdminLayoutPage } from "@/components/admin/pages/AdminLayoutPage";
import { AdminSettingsPage } from "@/components/admin/pages/AdminSettingsPage";
import { useRoute } from "wouter";
import { useEffect, useState } from "react";

export default function Admin() {
    const [, params] = useRoute("/admin/:page?");
    const page = params?.page;
    const [authStatus, setAuthStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

    useEffect(() => {
        fetch("/api/auth/user", { credentials: "include" })
            .then((res) => {
                if (res.ok) {
                    setAuthStatus("authenticated");
                } else {
                    setAuthStatus("unauthenticated");
                }
            })
            .catch(() => setAuthStatus("unauthenticated"));
    }, []);

    if (authStatus === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (authStatus === "unauthenticated") {
        window.location.href = "/api/login";
        return null;
    }

    return (
        <AdminLayout>
            {!page && <AdminDashboard />}
            {page === "profile" && <AdminProfilePage />}
            {page === "appearance" && <AdminAppearancePage />}
            {page === "widgets" && <AdminWidgetsPage />}
            {page === "social" && <AdminSocialPage />}
            {page === "sponsors" && <AdminSponsorsPage />}
            {page === "codes" && <AdminCodesPage />}
            {page === "games" && <AdminGamesPage />}
            {page === "contact" && <AdminContactPage />}
            {page === "layout" && <AdminLayoutPage />}
            {page === "settings" && <AdminSettingsPage />}
        </AdminLayout>
    );
}
