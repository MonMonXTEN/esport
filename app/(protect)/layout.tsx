import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "@/components/sidebar/AppSidebar"
import NavHeader from "@/components/sidebar/NavHeader";
import { Separator } from "@/components/ui/separator";
import ReactQueryProvider from "@/components/providers/react-query-provider";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryProvider>
      <main className="h-full bg-white">
        <SidebarProvider>
          <AppSidebar />
          <section className="w-full">
            <NavHeader />
            <Separator />
            <div className="p-2">
              {children}
            </div>
          </section>
        </SidebarProvider>
      </main>
    </ReactQueryProvider>
  );
}
