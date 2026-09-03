"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ChevronDown, type LucideIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { adminNavGroups, isHrefActive, type AdminNavItem } from "./nav-data";
import { ScrollArea } from "@/components/ui/scroll-area";

const menuButtonClass =
  "h-9 rounded-md text-sidebar-foreground/80 hover:text-sidebar-foreground data-active:text-[#F49D1A] data-active:bg-[#F49D1A]/15 data-active:font-medium data-active:hover:bg-[#F49D1A]/20 data-active:hover:text-[#F49D1A]";

function NavLink({
  item,
  active,
}: {
  item: AdminNavItem;
  active: boolean;
}) {
  const Icon: LucideIcon = item.icon;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={active}
        render={<Link href={item.href} />}
        className={menuButtonClass}
      >
        <div className="flex items-center gap-2.5 pl-0 sm:pl-2">
          <Icon className="size-4 shrink-0" />
          <span>{item.name}</span>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function FlatGroup({
  items,
  isActive,
}: {
  items: AdminNavItem[];
  isActive: (href: string) => boolean;
}) {
  return (
    <SidebarGroup className="py-1">
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {items.map((item) => (
            <NavLink key={item.name} item={item} active={isActive(item.href)} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function CollapsibleGroup({
  label,
  items,
  isOpen,
  isGroupActive,
  isActive,
  onToggle,
}: {
  label: string;
  items: AdminNavItem[];
  isOpen: boolean;
  isGroupActive: boolean;
  isActive: (href: string) => boolean;
  onToggle: () => void;
}) {
  return (
    <SidebarGroup className="py-0.5">
      <button
        type="button"
        onClick={onToggle}
        className={`flex h-8 w-full items-center rounded-md px-2 cursor-pointer select-none text-[11px] font-semibold uppercase tracking-wider transition-colors hover:bg-sidebar-accent/50 ${
          isGroupActive
            ? "text-[#F49D1A]"
            : "text-sidebar-foreground/50 hover:text-sidebar-foreground/80"
        }`}
      >
        <span className="truncate">{label}</span>
        <ChevronDown
          className={`ml-auto size-3.5 shrink-0 transition-transform duration-200 ${
            isGroupActive ? "text-[#F49D1A]/70" : "text-sidebar-foreground/40"
          } ${isOpen ? "rotate-180" : ""}`}
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
              {items.map((item) => (
                <NavLink key={item.name} item={item} active={isActive(item.href)} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </div>
      </div>
    </SidebarGroup>
  );
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  const isActive = React.useCallback(
    (href: string) => isHrefActive(pathname, href),
    [pathname]
  );

  const isGroupActive = React.useCallback(
    (items: AdminNavItem[]) => items.some((item) => isActive(item.href)),
    [isActive]
  );

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
      const label = group.label;
      if (label && isGroupActive(group.items)) {
        setOpenGroups((prev) => (prev[label] ? prev : { ...prev, [label]: true }));
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
                const label = group.label;
                return !label ? (
                  <FlatGroup key="main" items={group.items} isActive={isActive} />
                ) : (
                  <CollapsibleGroup
                    key={label}
                    label={label}
                    items={group.items}
                    isOpen={openGroups[label] ?? false}
                    isGroupActive={isGroupActive(group.items)}
                    isActive={isActive}
                    onToggle={() => toggleGroup(label)}
                  />
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