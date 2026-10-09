"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth/client";
import { adminNavGroups, isHrefActive } from "./nav-data";
import { ScrollArea } from "@/components/ui/scroll-area";

const menuButtonClass =
  "h-9 rounded-md text-sidebar-foreground/80 hover:text-sidebar-foreground data-active:text-primary data-active:bg-primary/15 data-active:font-medium data-active:hover:bg-primary/20 data-active:hover:text-primary";

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = React.useCallback(
    (href: string) => isHrefActive(pathname, href),
    [pathname]
  );

  const userName = session?.user?.name?.trim() || "Admin";
  const userEmail = session?.user?.email || "";

  return (
    <div className="admin-sidebar-dark flex h-svh">
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <div className="flex items-center gap-3 px-2 py-1.5">
            <Image
              src="/Jelajah-Memoria-01.png"
              alt="Jelajah Memoria"
              width={60}
              height={60}
              className="h-15 w-auto group-data-[collapsible=icon]:hidden"
            />
            <span className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold tracking-wide text-sidebar-foreground">
                Panel Admin
              </span>
              <span className="text-xs font-medium text-sidebar-foreground/50">
                Halaman Administrasi
              </span>
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent className="overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex flex-col gap-1 px-1 pr-3">
              {adminNavGroups.map((group) => (
                <SidebarGroup key={group.label ?? "main"} className="py-1">
                  {group.label ? (
                    <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                  ) : null}
                  <SidebarMenu className="gap-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.name}>
                          <SidebarMenuButton
                            isActive={isActive(item.href)}
                            tooltip={item.name}
                            render={<Link href={item.href} />}
                            className={menuButtonClass}
                          >
                            <Icon className="size-4 shrink-0" />
                            <span className="group-data-[collapsible=icon]:hidden">
                              {item.name}
                            </span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroup>
              ))}
            </div>
          </ScrollArea>
        </SidebarContent>

        <SidebarFooter>
          <div className="border-t border-sidebar-border pt-2">
            <div className="px-2 pb-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-xs font-semibold text-sidebar-foreground">
                {userName}
              </p>
              <p className="truncate text-[11px] text-sidebar-foreground/50">
                {userEmail}
              </p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground transition"
            >
              <ArrowLeft className="size-4 shrink-0 text-primary" />
              <span className="group-data-[collapsible=icon]:hidden">
                Kembali ke Website Utama
              </span>
            </Link>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </div>
  );
}
