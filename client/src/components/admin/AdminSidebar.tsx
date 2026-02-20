import { Link, useLocation } from "wouter";
import {
    LayoutDashboard,
    User,
    Palette,
    Link as LinkIcon,
    Gamepad2,
    DollarSign,
    Gift,
    Target,
    Mail,
    Layout,
    Settings,
    Menu,
    X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
    label: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
    { label: "Genel Bakış", path: "/admin", icon: LayoutDashboard },
    { label: "Profil & Biyografi", path: "/admin/profile", icon: User },
    { label: "Görünüm & Tema", path: "/admin/appearance", icon: Palette },
    { label: "Widget'lar", path: "/admin/widgets", icon: Gamepad2 },
    { label: "Sosyal Medya", path: "/admin/social", icon: LinkIcon },
    { label: "Sponsorlar", path: "/admin/sponsors", icon: DollarSign },
    { label: "Oyunlar", path: "/admin/codes", icon: Gift },
    { label: "İletişim", path: "/admin/contact", icon: Mail },
    { label: "Layout Düzenleyici", path: "/admin/layout", icon: Layout },
    { label: "Site Ayarları", path: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
    const [location] = useLocation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background border rounded-md shadow-lg"
            >
                {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 h-screen w-64 bg-background border-r transition-transform duration-300 z-40",
                    "lg:translate-x-0",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b">
                        <h1 className="text-xl font-bold">Admin Panel</h1>
                        <p className="text-sm text-muted-foreground">Link Hub Yönetimi</p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto p-4">
                        <ul className="space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location === item.path;

                                return (
                                    <li key={item.path}>
                                        <Link href={item.path}>
                                            <a
                                                className={cn(
                                                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                                                    "hover:bg-accent hover:text-accent-foreground",
                                                    isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
                                                )}
                                                onClick={() => setIsMobileOpen(false)}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span className="text-sm font-medium">{item.label}</span>
                                            </a>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t">
                        <Link href="/">
                            <a className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                                <LinkIcon className="w-4 h-4" />
                                <span>Siteye Dön</span>
                            </a>
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    );
}
