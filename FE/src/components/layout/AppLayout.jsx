import { Outlet, useLocation } from "react-router";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Header } from "@/components/layout/Header";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ROLE_SIDEBAR_NAV } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";
import { uiSidebarRoleFromPath } from "@/lib/ui-preview";

function getSidebarItems(role) {
  return ROLE_SIDEBAR_NAV[role] ?? ROLE_SIDEBAR_NAV.customer;
}

function AppLayout() {
  const { pathname } = useLocation();
  const sidebarRole = uiSidebarRoleFromPath(pathname);
  const sidebarItems = getSidebarItems(sidebarRole);

  return (
    <SidebarProvider>
      <AppSidebar role={sidebarRole} items={sidebarItems} />
      <SidebarInset className="min-h-screen bg-background">
        <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-background/95 px-4 py-2 backdrop-blur lg:hidden">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <span className="text-sm font-medium">Plantify</span>
        </div>
        <div className="hidden lg:block">
          <Header />
        </div>
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export { AppLayout };
