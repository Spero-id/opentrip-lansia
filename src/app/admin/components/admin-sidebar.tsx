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
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { adminNavGroups } from "./nav-data";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(href));

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
            <div className="flex flex-col gap-0 pr-3">
              {adminNavGroups.map((group) => (
                <SidebarGroup key={group.label ?? "main"}>
                  {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
                  <SidebarGroupContent>
                    <SidebarMenu className="gap-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <SidebarMenuItem key={item.name}>
                            <SidebarMenuButton
                              isActive={isActive(item.href)}
                              render={<Link href={item.href} />}
                              className="data-active:bg-[#F49D1A]/15 data-active:text-[#F49D1A] data-active:font-medium data-active:hover:bg-[#F49D1A]/20 data-active:hover:text-[#F49D1A]"
                            >
                              <Icon />
                              <span>{item.name}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </div>
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter>
          <div className="border-t border-sidebar-border pt-2">
            <Link
              href="/"
              className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground transition"
            >
              <ArrowLeft className="size-4 shrink-0 text-[#F49D1A]" />
              <span className="group-data-[collapsible=icon]:hidden">
                Kembali ke Website Utama
              </span>
            </Link>
          </div>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
