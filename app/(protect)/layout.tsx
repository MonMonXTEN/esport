import { cookies } from "next/headers"
import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "@/components/sidebar/AppSidebar"
import NavHeader from "@/components/sidebar/NavHeader"
import { Separator } from "@/components/ui/separator"
import ReactQueryProvider from "@/components/providers/react-query-provider"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"
  return (
    <ReactQueryProvider>
      <main className="h-full bg-white">
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <section className="w-full">
            <NavHeader />
            <Separator />
            {children}
          </section>
        </SidebarProvider>
      </main>
    </ReactQueryProvider>
  );
}
