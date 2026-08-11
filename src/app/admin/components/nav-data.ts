import {
  Building2,
  Compass,
  FileText,
  LayoutDashboard,
  MapPin,
  Percent,
  Route,
  ShoppingCart,
  Star,
  Tag,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
};

export type AdminNavGroup = {
  label: string | null;
  items: AdminNavItem[];
};

export const adminNavGroups: AdminNavGroup[] = [
  {
    label: null,
    items: [{ name: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Trip & Tempat",
    items: [
      { name: "Paket Trip", href: "/admin/trips", icon: Compass },
      { name: "Private Trip", href: "/admin/private-trips", icon: Route },
      { name: "Meeting Point", href: "/admin/meeting-points", icon: MapPin },
    ],
  },
  {
    label: "Pengguna & Partner",
    items: [
      { name: "Pengguna", href: "/admin/users", icon: UserCheck },
      { name: "HORECA", href: "/admin/horeca", icon: Building2 },
      { name: "Vendor", href: "/admin/vendors", icon: Users },
    ],
  },
  {
    label: "Marketing",
    items: [
      { name: "Promo", href: "/admin/promotions", icon: Tag },
      { name: "Komisi", href: "/admin/commissions", icon: Percent },
    ],
  },
  {
    label: "Order",
    items: [
      { name: "Pesanan", href: "/admin/pesanan", icon: ShoppingCart },
      { name: "Ulasan", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    label: "Konten",
    items: [{ name: "Blog", href: "/admin/blogs", icon: FileText }],
  },
];

export function getActiveMenu(pathname: string): AdminNavGroup & { activeItem: AdminNavItem } | null {
  for (const group of adminNavGroups) {
    for (const item of group.items) {
      const isActive =
        pathname === item.href ||
        (item.href !== "/admin" && pathname.startsWith(item.href));
      if (isActive) return { ...group, activeItem: item };
    }
  }
  return null;
}
