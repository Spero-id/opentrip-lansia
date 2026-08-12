"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ChevronDown } from "lucide-react";
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

  const isGroupActive = React.useCallback(
    (items: { href: string }[]) => items.some((item) => isActive(item.href)),
    [pathname]
  );

  // Controlled open-state per grup, key-nya group.label
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    adminNavGroups.forEach((group) => {
      if (group.label) initial[group.label] = isGroupActive(group.items);
    });
    return initial;
  });

  // Kalo pindah halaman ke grup lain, auto-buka grup yang lagi active
  // (gak nutup grup lain yang udah dibuka manual sama user)
  React.useEffect(() => {
    adminNavGroups.forEach((group) => {
      if (group.label && isGroupActive(group.items)) {
        setOpenGroups((prev) =>
          prev[group.label!] ? prev : { ...prev, [group.label!]: true }
        );
      }
    });
  }, [pathname, isGroupActive]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

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
              {adminNavGroups.map((group) => {
                // Grup tanpa label (misal Dashboard) tampil flat, gak perlu dropdown
                if (!group.label) {
                  return (
                    <SidebarGroup key="main" className="py-1">
                      <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                          {group.items.map((item) => {
                            const Icon = item.icon;
                            return (
                              <SidebarMenuItem key={item.name}>
                                <SidebarMenuButton
                                  isActive={isActive(item.href)}
                                  render={<Link href={item.href} />}
                                  className="h-9 rounded-md text-sidebar-foreground/80 hover:text-sidebar-foreground data-active:text-[#F49D1A] data-active:bg-[#F49D1A]/15 data-active:font-medium data-active:hover:bg-[#F49D1A]/20 data-active:hover:text-[#F49D1A]"
                                >
                                  <div className="flex items-center gap-2.5 pl-0 sm:pl-2">
                                    <Icon className="size-4 shrink-0" />
                                    <span>{item.name}</span>
                                  </div>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            );
                          })}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                  );
                }

                const label = group.label;
                const isOpen = openGroups[label] ?? false;
                const active = isGroupActive(group.items);

                return (
                  <SidebarGroup key={label} className="py-0.5">
                    <button
                      type="button"
                      onClick={() => toggleGroup(label)}
                      className="flex h-8 w-full items-center rounded-md px-2 cursor-pointer select-none text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground/80 transition-colors"
                    >
                      <span className="truncate">{label}</span>
                      {active && (
                        <span className="ml-2 size-1.5 shrink-0 rounded-full bg-[#F49D1A]" />
                      )}
                      <ChevronDown
                        className={`ml-auto size-3.5 shrink-0 text-sidebar-foreground/40 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <SidebarGroupContent className="pt-0.5">
                          <SidebarMenu className="gap-1">
                            {group.items.map((item) => {
                              const Icon = item.icon;
                              return (
                                <SidebarMenuItem key={item.name}>
                                  <SidebarMenuButton
                                    isActive={isActive(item.href)}
                                    render={<Link href={item.href} />}
                                    className="h-9 rounded-md text-sidebar-foreground/80 hover:text-sidebar-foreground data-active:text-[#F49D1A] data-active:bg-[#F49D1A]/15 data-active:font-medium data-active:hover:bg-[#F49D1A]/20 data-active:hover:text-[#F49D1A]"
                                  >
                                    <div className="flex items-center gap-2.5 pl-0 sm:pl-2">
                                      <Icon className="size-4 shrink-0" />
                                      <span>{item.name}</span>
                                    </div>
                                  </SidebarMenuButton>
                                </SidebarMenuItem>
                              );
                            })}
                          </SidebarMenu>
                        </SidebarGroupContent>
                      </div>
                    </div>
                  </SidebarGroup>
                );
              })}
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