import {
  LayoutDashboard,
  Users,
  Briefcase,
  Megaphone,
  Settings,
  ShieldCheck,
  LogOut,
  UserPlus,
  type LucideIcon,
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

type SidebarItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  roles?: string[];
};

const mainItems: SidebarItem[] = [
  { title: "Overview", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "User Directory", url: "/admin/users", icon: Users },
  { title: "Groups", url: "/admin/groups", icon: ShieldCheck },
  // { title: "Verification Queue", url: "/admin/verification", icon: ShieldCheck }, // NOTE: No longer needed
  { title: "Opportunities", url: "/admin/opportunities", icon: Briefcase },
  { title: "Content & Engagement", url: "/admin/content", icon: Megaphone },
  {
    title: "Register Admin",
    url: "/admin/register-admin",
    icon: UserPlus,
    roles: ["BACKOFFICE", "ADMIN"],
  },
  { title: "System & Management", url: "/admin/system", icon: Settings },
  // { title: "Contacts", url: "/admin/contacts", icon: Contact },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const userName = localStorage.getItem("stp_user_name") || "Admin";
  const userEmail = localStorage.getItem("stp_user_email") || "";
  const userRole = localStorage.getItem("stp_user_role") || "";
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
    localStorage.removeItem("stp_user_role");
    toast.success("Logged out successfully");
    window.location.replace("/login");
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className={`${open ? "px-6" : "mx-auto"} py-6 flex items-center gap-3`}>
          <img src="/logo.png" alt="STP Alumni Logo" className={open ? "w-10 h-10 object-contain drop-shadow" : "w-8 h-8 object-contain drop-shadow"} />
          {open && (
            <div>
              <h2 className="text-xl font-bold text-sidebar-primary leading-tight">
                STP Alumni Network
              </h2>
              <p className="text-xs text-sidebar-foreground/70 mt-1">
                Admin Dashboard
              </p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                item.roles && userRole && !item.roles.includes(userRole) ? null : (
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
                )
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
              <AvatarImage src={`https://i.pravatar.cc/150?u=${userEmail}`} alt={userName} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            {open && (
              <div className="flex flex-col items-start min-w-0 transition-opacity duration-300">
                <span className="text-sm font-medium leading-none truncate w-full">
                  {userName}
                </span>
                <span className="text-[10px] text-muted-foreground truncate w-[100px]">
                  {userEmail}
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
