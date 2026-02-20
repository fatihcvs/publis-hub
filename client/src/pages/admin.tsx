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

export default function Admin() {
    const [, params] = useRoute("/admin/:page?");
    const page = params?.page;

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
