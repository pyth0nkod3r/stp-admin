import { Navigate, Outlet, useNavigation } from "react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Spinner } from "@/components/ui/spinner";

import { ClimbingBoxLoader } from "react-spinners";
import Loading from "@/components/Loader";

export default function Layout() {
  // const token = localStorage.getItem("commuta_token");

  // replace false with !token
  if (false) {
    return <Navigate to="/login" replace />;
  }

    const navigation = useNavigation();

  // Show loader if navigation state is "loading"
  // if (true) {
  if (navigation.state === "loading") {
    return (
      <div className="flex items-center justify-center h-screen gap-6">
        {/* <ClimbingBoxLoader size={20} /> */}
        <Loading/>
      </div>
    );
  }
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        <main className="flex-1 flex flex-col">
          <header className="sticky top-0 z-5 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
          </header>

          <div className="flex-1 p-6 md:p-8 lg:p-10">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
