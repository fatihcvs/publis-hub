import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
    children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className="flex min-h-screen bg-background">
            <AdminSidebar />

            {/* Main Content */}
            <main className="flex-1 lg:ml-64">
                <div className="container mx-auto p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
