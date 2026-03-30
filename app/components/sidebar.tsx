import {
  LayoutDashboard,
  Users,
  Car,
  DollarSign,
  MessageSquare,
  UserCircle,
  LogOut,
  Contact,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLocation } from "react-router";
import { NavLink } from "./nav-link";
import { toast } from "sonner";

const mainItems = [
  { title: "Overview", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "User Directory", url: "/admin/users", icon: Users },
  { title: "Verification Queue", url: "/admin/verification", icon: UserCircle },
  { title: "Deal Rooms", url: "/admin/deals", icon: Car },
  { title: "Content & Engagement", url: "/admin/content", icon: DollarSign },
  { title: "System & Management", url: "/admin/system", icon: MessageSquare },
  // { title: "Contacts", url: "/admin/contacts", icon: Contact },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const userName = localStorage.getItem("stp_user_name") || "Admin";
  const userEmail = localStorage.getItem("stp_user_email") || "";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  function logout() {
    localStorage.removeItem("stp_token");
    localStorage.removeItem("stp_user_name");
    localStorage.removeItem("stp_user_email");
    toast.success("Logged out successfully");
    window.location.replace("/login");
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className={`${open ? "px-6" : "mx-auto"} py-6`}>
          <h2 className="text-xl font-bold text-sidebar-primary">
            {open ? "Stp" : <Car className="w-6 h-6 text-sidebar-primary" />}
          </h2>
          {open && (
            <p className="text-xs text-sidebar-foreground/70 mt-1">
              Admin Dashboard
            </p>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2 transition-all duration-300 ease-in-out">
        <div
          className={`flex items-center w-full ${open ? "justify-between p-2" : "justify-center"} ${!open ? "flex-col gap-3" : "flex-row"}`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src="https://github.com/shadcn.png" alt="@user" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>

            {open && (
              <div className="flex flex-col items-start min-w-0 transition-opacity duration-300">
                <span className="text-sm font-medium leading-none truncate w-full">
                  John Doe
                </span>
                <span className="text-[10px] text-muted-foreground truncate w-[100px]">
                  john@example.com
                </span>
              </div>
            )}
          </div>

          {/* {open && ( */}
          <button
            onClick={logout}
            className="p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </button>
          {/* )} */}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
