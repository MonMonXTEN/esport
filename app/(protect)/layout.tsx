import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import AppHeader from "@/components/dashboard/app-header";
import { Separator } from "@/components/ui/separator";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="h-full bg-white">
      <SidebarProvider>
        <AppSidebar />
        <section className="w-full">
          <AppHeader />
          <Separator />
          <div className="p-2">
            {children}
          </div>
        </section>
      </SidebarProvider>
    </main>
  );
}
