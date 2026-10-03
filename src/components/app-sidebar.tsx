"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { isHrefActive } from "@/app/(admin)/admin/components/nav-data"
import { LayoutDashboard, Compass, Users, Tag, ShoppingCart, FileText, ScrollText, ExternalLink } from "lucide-react"

const data = {
  navMain: [
    {
      title: "Menu Utama",
      url: "#",
      icon: (
        <LayoutDashboard />
      ),
      items: [
        {
          title: "Dashboard",
          url: "/admin",
        },
        {
          title: "Notifikasi",
          url: "/admin/notifications",
        },
      ],
    },
    {
      title: "Trip & Tempat",
      url: "#",
      icon: (
        <Compass />
      ),
      items: [
        {
          title: "Paket Trip",
          url: "/admin/trips",
        },
        {
          title: "Private Trip",
          url: "/admin/private-trips",
        },
      ],
    },
    {
      title: "Pengguna & Partner",
      url: "#",
      icon: (
        <Users />
      ),
      items: [
        {
          title: "Pengguna",
          url: "/admin/users",
        },
        {
          title: "HORECA",
          url: "/admin/horeca",
        },
        {
          title: "Vendor",
          url: "/admin/vendors",
        },
      ],
    },
    {
      title: "Marketing",
      url: "#",
      icon: (
        <Tag />
      ),
      items: [
        {
          title: "Promo",
          url: "/admin/promotions",
        },
        {
          title: "History Referral",
          url: "/admin/referrals",
        },
      ],
    },
    {
      title: "Order",
      url: "#",
      icon: (
        <ShoppingCart />
      ),
      items: [
        {
          title: "Pesanan",
          url: "/admin/bookings",
        },
        {
          title: "Ulasan",
          url: "/admin/reviews",
        },
      ],
    },
    {
      title: "Konten",
      url: "#",
      icon: (
        <FileText />
      ),
      items: [
        {
          title: "Blog",
          url: "/admin/blogs",
        },
        {
          title: "Kategori Blog",
          url: "/admin/blog-categories",
        },
        {
          title: "Audit Log",
          url: "/admin/audit-log",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const navMain = data.navMain.map((item) => ({
    ...item,
    isActive: item.items.some((sub) => isHrefActive(pathname, sub.url)),
  }))
  return (
    <Sidebar collapsible="icon" className="admin-sidebar-dark" {...props}>
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
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Lihat Website"
              render={<a href="/" target="_blank" rel="noreferrer" />}
            >
              <ExternalLink className="size-4 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">Lihat Website</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
