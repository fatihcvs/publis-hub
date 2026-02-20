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

function LoginPage({ onLogin }: { onLogin: () => void }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username, password }),
            });
            if (res.ok) {
                onLogin();
            } else {
                const data = await res.json();
                setError(data.message || "Giriş başarısız");
            }
        } catch {
            setError("Sunucuya bağlanılamadı");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-full max-w-sm p-8 bg-card border border-border rounded-xl shadow-lg">
                <h1 className="text-2xl font-bold text-center text-foreground mb-2">Admin Paneli</h1>
                <p className="text-sm text-muted-foreground text-center mb-6">Devam etmek için giriş yapın</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Kullanıcı Adı</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="admin"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Şifre</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function Admin() {
    const [, params] = useRoute("/admin/:page?");
    const page = params?.page;
    const [authStatus, setAuthStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

    const checkAuth = () => {
        fetch("/api/auth/user", { credentials: "include" })
            .then((res) => {
                if (res.ok) {
                    setAuthStatus("authenticated");
                } else {
                    setAuthStatus("unauthenticated");
                }
            })
            .catch(() => setAuthStatus("unauthenticated"));
    };

    useEffect(() => {
        checkAuth();
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
        return <LoginPage onLogin={() => setAuthStatus("authenticated")} />;
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
