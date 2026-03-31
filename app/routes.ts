import { type RouteConfig, route, layout, index } from "@react-router/dev/routes";

export default [
  // "/" → redirect to login
  index("routes/home.tsx"),

  // Login page without layout
  route("login", "routes/login.tsx"),

  // Dashboard layout for all admin pages
  layout("routes/layout.tsx", [
    route("admin/dashboard", "routes/dashboard.tsx"),
    route("admin/users", "routes/user-dir.tsx"),
    // route("admin/riders/:id", "routes/riders-details.tsx"),
    route("admin/verification", "routes/verification-queue.tsx"),
    // route("admin/drivers/:id", "routes/drivers-details.tsx"),
    route("admin/opportunities", "routes/opportunities.tsx"),
    // route("admin/trips/:rideId", "routes/trip-details.tsx"),
    route("admin/content", "routes/content-engagement.tsx"),
    route("admin/system", "routes/system-mangement.tsx"),
    // route("admin/contacts", "routes/contacts.tsx"),
  ]),
] satisfies RouteConfig;

