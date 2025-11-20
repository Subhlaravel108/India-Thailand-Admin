import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Users,
  LogIn,
  FileText,
  Home,
  Menu,
  X,
  Grid2x2Plus,
  Boxes,
  ShoppingCart,
  Percent,
  ChevronLeft,
  Car,
  ChevronDown,
  LocateIcon,
  MapPin,
  Contact,
  StarIcon,
} from "lucide-react";

type MenuChild = {
  label: string;
  to?: string;
  children?: MenuChild[];
};

type MenuItem = {
  icon: React.ElementType;
  label: string;
  to: string;
  children?: MenuChild[];
};

const SidebarItem = ({
  icon: Icon,
  label,
  to,
  isActive,
  isCollapsed,
}: {
  icon: React.ElementType;
  label: string;
  to: string;
  isActive: boolean;
  isCollapsed: boolean;
}) => (
  <Link to={to}>
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 pl-4 py-3 rounded-xl font-medium transition-all duration-200 text-sm",
        isActive
          ? "bg-gradient-to-r from-sidebar-accent/80 to-sidebar-accent text-sidebar-accent-foreground shadow-md"
          : "hover:bg-sidebar-accent/30 hover:text-sidebar-accent-foreground text-sidebar-foreground/90"
      )}
    >
      <Icon size={20} className="text-sidebar-foreground/90" />
      {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
    </Button>
  </Link>
);

const COLLAPSE_KEY = "admin.sidebar.collapsed";

const AdminSidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(COLLAPSE_KEY);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, JSON.stringify(isCollapsed));
    document.body.classList.toggle("sidebar-collapsed", isCollapsed);
    window.dispatchEvent(
      new CustomEvent("sidebar:collapseChanged", { detail: { isCollapsed } })
    );
  }, [isCollapsed]);

  const menuItems: MenuItem[] = [
    { icon: Home, label: "Dashboard", to: "/dashboard" },


    {
      icon: Car,
      label: "Tour Management",
      to: "/tours",
      children: [
        {
          label: "Tours",
          children: [
            { label: "Add Tour", to: "/tours/add" },
            { label: "Tour List", to: "/tours" },
          ],
        },
        {
          label: "Tour Packages",
          children: [
            { label: "Add Tour Package", to: "/tours/packages/add" },
            { label: "Package List", to: "/tours/packages" },
          ],
        },
      ],
    },
    {
      icon: MapPin,
      label: "Destination",
      to: "/destination",
          children: [
            { label: "Add Destination", to: "/destination/add" },
            { label: "Destination List", to: "/destination" },
          ],

      
    },
      {
    icon: FileText,
    label: "Blog Management",
    to: "/blogs",
    children: [
      {
        label: "Blog",
        children: [
          { label: "Add Blog", to: "/blogs/add" },
          { label: "Blog List", to: "/blogs" },
        ],
      },
      {
        label: "Blog Categories",
        children: [
          { label: "Add Blog Category", to: "/blogs/categories/add" },
          { label: "Category List", to: "/blogs/categories" },
        ],
      },
    ],
  },
    { icon: Users, label: "Users", to: "/users" },
    { icon: Contact, label: "Bookings", to: "/bookings" },
    { icon: StarIcon, label: "Feedbacks", to: "/feedbacks" },
    { icon: Contact, label: "Contacts", to: "/contacts" },
    { icon: Settings, label: "Settings", to: "/settings" },
    { icon: LogIn, label: "Logout", to: "/logout" },
  ];

  const renderSubmenu = (items: MenuChild[], level = 1) => (
    <div className={`ml-${level * 4} mt-1 space-y-1 border-l border-sidebar-border/30 pl-3`}>
      {items.map((child) => (
        <div key={child.label}>
          {child.children ? (
            <>
              <button
                onClick={() => toggleMenu(child.label)}
                className="flex items-center justify-between w-full text-sm font-medium py-2 px-2 rounded-lg hover:bg-sidebar-accent/20 text-sidebar-foreground/80 transition-all"
              >
                <span>{child.label}</span>
                <ChevronDown
                  size={16}
                  className={cn(
                    "transition-transform",
                    openMenus[child.label] && "rotate-180"
                  )}
                />
              </button>
              {openMenus[child.label] && renderSubmenu(child.children, level + 1)}
            </>
          ) : (
            <Link to={child.to!}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sm pl-5 rounded-lg hover:bg-sidebar-accent/20",
                  location.pathname === child.to &&
                    "bg-sidebar-accent/50 text-sidebar-accent-foreground"
                )}
              >
                {child.label}
              </Button>
            </Link>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-sidebar-accent/90 text-white rounded-full shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </Button>

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-sidebar text-sidebar-foreground shadow-2xl transition-all border-r border-sidebar-border/30 backdrop-blur",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-4 py-4 border-b border-sidebar-border/30 bg-sidebar/90">
            <div className="flex h-12 items-center">
              <Link to="/dashboard" className="flex items-center gap-3 flex-1">
                <span className="bg-sidebar-primary text-white p-2 rounded-xl shadow">
                  J-T
                </span>
                {!isCollapsed && (
                  <div>
                    <h1 className="text-base font-semibold tracking-wide">
                      Jaipur-Thailand
                    </h1>
                    <p className="text-xs opacity-70">Admin Portal</p>
                  </div>
                )}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex ml-2 rounded-full hover:bg-sidebar-accent/30"
                onClick={() => setIsCollapsed((v) => !v)}
              >
                <ChevronLeft
                  className={cn(isCollapsed ? "rotate-180" : "")}
                  size={18}
                />
              </Button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname.startsWith(item.to);

              if (item.children) {
                return (
                  <div key={item.label}>
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className={cn(
                        "flex items-center justify-between w-full pl-4 py-3 rounded-xl font-medium text-sm transition-all duration-200",
                        isActive
                          ? "bg-sidebar-accent/70 text-sidebar-accent-foreground shadow"
                          : "hover:bg-sidebar-accent/20 text-sidebar-foreground/90"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={20} />
                        {!isCollapsed && <span>{item.label}</span>}
                      </div>
                      {!isCollapsed && (
                        <ChevronDown
                          size={18}
                          className={cn(
                            "transition-transform",
                            openMenus[item.label] && "rotate-180"
                          )}
                        />
                      )}
                    </button>
                    {!isCollapsed &&
                      openMenus[item.label] &&
                      renderSubmenu(item.children)}
                  </div>
                );
              }

              return (
                <SidebarItem
                  key={item.to}
                  icon={item.icon}
                  label={item.label}
                  to={item.to}
                  isActive={isActive}
                  isCollapsed={isCollapsed}
                />
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border/30 text-xs opacity-70 text-center">
            {!isCollapsed && "Jaipur-Thailand Admin v1.0"}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
