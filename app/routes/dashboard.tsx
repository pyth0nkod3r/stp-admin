import React, { useEffect, useState } from "react";
import { 
  Users, 
  Briefcase, 
  ShieldAlert, 
  MousePointer2, 
  TrendingUp, 
  ArrowUpRight,
  CalendarDays
} from "lucide-react";
import { MessageSquare, Zap, FileDown, PlusCircle } from "lucide-react";

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { fetchDashboardSummary, type DashboardSummary } from "@/services/apiDashboard";
import { fetchUsers } from "@/services/apiUsers";
import type { User } from "@/lib/type";
import { Skeleton } from "@/components/ui/skeleton";

// Mock Data for Charts
const engagementData = [
  { name: "Mon", clicks: 40 },
  { name: "Tue", clicks: 30 },
  { name: "Wed", clicks: 65 },
  { name: "Thu", clicks: 45 },
  { name: "Fri", clicks: 90 },
  { name: "Sat", clicks: 25 },
  { name: "Sun", clicks: 15 },
];

export default function AdminOverview() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    fetchDashboardSummary()
      .then((res) => setSummary(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));

    fetchUsers(1, 100)
      .then((res) => setUsers(res.data))
      .catch(() => {})
      .finally(() => setUsersLoading(false));
  }, []);

  const verifiedCount = users.filter((u) => u.isVerified).length;
  const pendingCount = users.filter((u) => !u.isVerified).length;

  const userDistribution = [
    { name: "Verified Alumni", value: verifiedCount, color: "#0f172a" },
    { name: "Pending", value: pendingCount, color: "#f97316" },
  ];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
      </div>

      {/* Top Level Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Total Alumni" 
          value={summary?.totalUsers} 
          description="Total registered alumni" 
          icon={<Users className="h-4 w-4 text-muted-foreground" />} 
          loading={loading}
        />
        <MetricCard 
          title="Active Alumni" 
          value={summary?.activeUsers} 
          description="Currently active alumni" 
          icon={<Zap className="h-4 w-4 text-muted-foreground" />} 
          loading={loading}
        />
        <MetricCard
          title="Active Groups"
          value={summary?.totalGroups}
          description={`${summary?.pendingGroups || 0} pending approval`}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
          highlight={summary?.pendingGroups ? summary.pendingGroups > 0 : false}
        />
        <MetricCard 
          title="Active Events" 
          value={summary?.totalEvents} 
          description={`${summary?.pendingEvents || 0} pending approval`} 
          icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />} 
          loading={loading}
          highlight={summary?.pendingEvents ? summary.pendingEvents > 0 : false}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Engagement Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Alumni Connections</CardTitle>
            <CardDescription>Total "Connect" and "Chat" clicks initiated</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="clicks" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Alumni Distribution */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Alumni Distribution</CardTitle>
            <CardDescription>Verified vs. Pending Verification</CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="h-[300px] w-full flex items-center justify-center">
                <Skeleton className="h-40 w-40 rounded-full" />
              </div>
            ) : (
              <>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userDistribution}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {userDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {userDistribution.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>


{/* Bottom Row - Recent Activity & System Health */}
<div className="grid gap-4 md:grid-cols-2">
  {/* 1. Recent Activity Feed */}
  <Card>
    <CardHeader>
      <CardTitle>Recent Activity</CardTitle>
      <CardDescription>Live updates from the STP network</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        {[
          { icon: <PlusCircle className="text-blue-500" />, text: "New Opportunity Posted", sub: "Tech Startup Seed Funding", time: "12m ago" },
          { icon: <Zap className="text-yellow-500" />, text: "New Alumni joined", sub: "Dr. Sarah Jenkins (Class of '18)", time: "45m ago" },
          { icon: <MessageSquare className="text-green-500" />, text: "Connection Request", sub: "Interest in 'UI Design Service'", time: "2h ago" },
          { icon: <FileDown className="text-muted-foreground" />, text: "Resource Downloaded", sub: "Investment_Template.pdf", time: "3h ago" },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="mt-1 p-1 bg-muted rounded-full">{item.icon}</div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{item.text}</p>
              <p className="text-xs text-muted-foreground">{item.sub}</p>
            </div>
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
              {item.time}
            </div>
          </div>
        ))}
      </div>
      <Button variant="ghost" className="w-full mt-4 text-xs text-muted-foreground hover:text-primary">
        View All Activity
      </Button>
    </CardContent>
  </Card>

  {/* 2. System Health & Quick Controls */}
  <Card className="flex flex-col justify-between">
    <CardHeader>
      <CardTitle>System Health</CardTitle>
      <CardDescription>Infrastructure & Database status</CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="flex items-center gap-4 border p-3 rounded-lg bg-muted/30">
        <div className="relative">
          <TrendingUp className="h-5 w-5 text-green-600" />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-ping" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium">Server Status: Operational</p>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full w-[98%]" />
          </div>
        </div>
      </div>
{/* 
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Storage</p>
          <p className="text-sm font-semibold">42.5 GB / 100 GB</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase">Response</p>
          <p className="text-sm font-semibold">124ms</p>
        </div>
      </div> */}

      <div className="flex flex-col gap-2">
        <Button variant="outline" className="w-full text-xs h-9" asChild>
          <a href="/admin/system">
            Manage Resources <ArrowUpRight className="ml-2 h-3 w-3" />
          </a>
        </Button>
        <Button variant="secondary" className="w-full text-xs h-9">
          Download Platform Report
        </Button>
      </div>
    </CardContent>
  </Card>
</div>
    </div>
  );
}

function MetricCard({ title, value, description, icon, highlight = false, loading = false }: any) {
  return (
    <Card className={highlight ? "border-orange-200 bg-orange-50/30" : ""}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16 mb-1" />
        ) : (
          <div className="text-2xl font-bold">{value !== null && value !== undefined ? value : 0}</div>
        )}
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}