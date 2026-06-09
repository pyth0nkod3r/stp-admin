import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  Check, 
  Search, 
  ShieldCheck, 
  X, 
  Lock, 
  Unlock, 
  Users, 
  Eye, 
  Loader2, 
  AlertCircle,
  MoreVertical
} from "lucide-react";
import {
  getPendingGroups,
  approveGroup,
  rejectGroup,
  fetchGroups,
  fetchGroupById,
  fetchGroupMembers,
  fetchGroupReports,
  lockGroup,
  type GroupSummary,
  type GroupDetail,
  type GroupMember,
  type GroupReport,
} from "@/services/apiGroups";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function formatDate(value?: string): string {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
}

export default function GroupsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("active");
  const [search, setSearch] = useState("");
  
  // Modals state
  const [selectedGroup, setSelectedGroup] = useState<GroupSummary | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [lockOpen, setLockOpen] = useState(false);
  const [lockReason, setLockReason] = useState("");
  
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Queries
  const { data: allGroups = [], isLoading: allLoading, error: allErr } = useQuery({
    queryKey: ["groups-all", activeTab],
    queryFn: async () => {
      const res = await fetchGroups("ALL");
      return res.data;
    },
    enabled: activeTab === "active",
  });

  const { data: pendingGroups = [], isLoading: pendingLoading, error: pendingErr } = useQuery({
    queryKey: ["groups-pending", activeTab],
    queryFn: async () => {
      const res = await getPendingGroups();
      return res.data;
    },
    enabled: activeTab === "pending",
  });

  const { data: reports = [], isLoading: reportsLoading, error: reportsErr } = useQuery({
    queryKey: ["group-reports", activeTab],
    queryFn: async () => {
      const res = await fetchGroupReports();
      return res.data;
    },
    enabled: activeTab === "reports",
  });

  const { data: lockedGroups = [], isLoading: lockedLoading, error: lockedErr } = useQuery({
    queryKey: ["groups-locked", activeTab],
    queryFn: async () => {
      const res = await fetchGroups("LOCKED");
      return res.data;
    },
    enabled: activeTab === "locked",
  });

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (groupId: string) => approveGroup(groupId),
    onSuccess: () => {
      toast.success("Group approved successfully");
      queryClient.invalidateQueries({ queryKey: ["groups-pending"] });
    },
    onError: (mutationError: any) => {
      toast.error(mutationError?.message || "Failed to approve group");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ groupId, reason }: { groupId: string; reason: string }) =>
      rejectGroup(groupId, reason),
    onSuccess: () => {
      toast.success("Group rejected successfully");
      queryClient.invalidateQueries({ queryKey: ["groups-pending"] });
      setRejectOpen(false);
      setRejectReason("");
      setSelectedGroup(null);
    },
    onError: (mutationError: any) => {
      toast.error(mutationError?.message || "Failed to reject group");
    },
  });

  const lockMutation = useMutation({
    mutationFn: ({ groupId, reason }: { groupId: string; reason?: string }) =>
      lockGroup(groupId, reason),
    onSuccess: () => {
      toast.success("Group lock status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["groups-all"] });
      queryClient.invalidateQueries({ queryKey: ["groups-locked"] });
      setLockOpen(false);
      setLockReason("");
      setSelectedGroup(null);
    },
    onError: (mutationError: any) => {
      toast.error(mutationError?.message || "Failed to update group lock status");
    },
  });

  const filteredAll = useMemo(() => {
    if (!search.trim()) return allGroups;
    const query = search.toLowerCase();
    return allGroups.filter((g) =>
      [g.name, g.description, g.createdBy].filter(Boolean).some((v) => v!.toLowerCase().includes(query))
    );
  }, [allGroups, search]);

  const filteredPending = useMemo(() => {
    if (!search.trim()) return pendingGroups;
    const query = search.toLowerCase();
    return pendingGroups.filter((g) =>
      [g.name, g.description, g.createdBy].filter(Boolean).some((v) => v!.toLowerCase().includes(query))
    );
  }, [pendingGroups, search]);

  const filteredReports = useMemo(() => {
    if (!search.trim()) return reports;
    const query = search.toLowerCase();
    return reports.filter((r) =>
      [r.groupName, r.reason, r.reportedBy].filter(Boolean).some((v) => v!.toLowerCase().includes(query))
    );
  }, [reports, search]);

  const filteredLocked = useMemo(() => {
    if (!search.trim()) return lockedGroups;
    const query = search.toLowerCase();
    return lockedGroups.filter((g) =>
      [g.name, g.description, g.createdBy].filter(Boolean).some((v) => v!.toLowerCase().includes(query))
    );
  }, [lockedGroups, search]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight font-sans">Groups Management</h2>
        <p className="text-muted-foreground">
          Manage alumni communities, approve pending groups, or review reported activities.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-[600px] grid-cols-4">
          <TabsTrigger value="active">All Groups ({allGroups.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval ({pendingGroups.length})</TabsTrigger>
          <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>
          <TabsTrigger value="locked">Locked Groups ({lockedGroups.length})</TabsTrigger>
        </TabsList>

        {/* --- ALL GROUPS TAB --- */}
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>All Group Communities</CardTitle>
                <CardDescription>Directory of all registered and verified alumni groups.</CardDescription>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search groups..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 border-b">
                    <tr className="text-left">
                      <th className="px-4 py-3 font-semibold text-muted-foreground">Group</th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground">Created By</th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground">Members</th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allLoading ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          Loading groups...
                        </td>
                      </tr>
                    ) : allErr ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-destructive">
                          Failed to load groups.
                        </td>
                      </tr>
                    ) : filteredAll.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No groups found.
                        </td>
                      </tr>
                    ) : (
                      filteredAll.map((group) => (
                        <tr key={group.groupId} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-semibold text-sm">{group.name}</p>
                              <p className="text-muted-foreground text-xs line-clamp-1">{group.description || "No description"}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4">{group.createdBy || "-"}</td>
                          <td className="px-4 py-4">
                            <Badge variant="secondary">{group.memberCount ?? 0}</Badge>
                          </td>
                          <td className="px-4 py-4">
                            <Badge
                              variant={group.status === "LOCKED" ? "destructive" : "default"}
                              className={group.status === "LOCKED" ? "" : "bg-green-100 text-green-800 hover:bg-green-100"}
                            >
                              {group.status || "ACTIVE"}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="cursor-pointer" onClick={() => {
                                  setSelectedGroup(group);
                                  setDetailsOpen(true);
                                }}>
                                  <Eye className="mr-2 h-4 w-4" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => {
                                  setSelectedGroup(group);
                                  setMembersOpen(true);
                                }}>
                                  <Users className="mr-2 h-4 w-4" /> View Members
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="cursor-pointer text-destructive"
                                  onClick={() => {
                                    setSelectedGroup(group);
                                    setLockReason("");
                                    setLockOpen(true);
                                  }}
                                >
                                  {group.status === "LOCKED" ? (
                                    <>
                                      <Unlock className="mr-2 h-4 w-4 text-green-600" />
                                      <span className="text-green-600">Unlock Group</span>
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="mr-2 h-4 w-4" />
                                      Lock Group
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- PENDING APPROVAL TAB --- */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Pending Groups Approval</CardTitle>
                <CardDescription>
                  Review groups awaiting approval and decide whether to approve or reject.
                </CardDescription>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search groups..."
                  className="pl-8"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 border-b">
                    <tr className="text-left">
                      <th className="px-4 py-3 font-semibold text-muted-foreground">Group</th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground">Created By</th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground">Members</th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground">Date</th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingLoading ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          Loading pending groups...
                        </td>
                      </tr>
                    ) : pendingErr ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-destructive">
                          Failed to load pending groups.
                        </td>
                      </tr>
                    ) : filteredPending.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No pending groups found.
                        </td>
                      </tr>
                    ) : (
                      filteredPending.map((group) => (
                        <tr key={group.groupId} className="border-b last:border-0">
                          <td className="px-4 py-4">
                            <div className="flex items-start gap-2">
                              <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                              <div>
                                <p className="font-semibold text-sm">{group.name}</p>
                                <p className="text-muted-foreground text-xs">
                                  {group.description || "No description"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">{group.createdBy || "-"}</td>
                          <td className="px-4 py-4">
                            <Badge variant="outline">{group.memberCount ?? 0}</Badge>
                          </td>
                          <td className="px-4 py-4">{formatDate(group.createdAt)}</td>
                          <td className="px-4 py-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-200 text-green-700 hover:bg-green-50"
                                onClick={() => approveMutation.mutate(group.groupId)}
                                disabled={approveMutation.isPending || rejectMutation.isPending}
                              >
                                <Check className="mr-1.5 h-3.5 w-3.5" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-200 text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedGroup(group);
                                  setRejectReason("");
                                  setRejectOpen(true);
                                }}
                                disabled={approveMutation.isPending || rejectMutation.isPending}
                              >
                                <X className="mr-1.5 h-3.5 w-3.5" /> Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- GROUP REPORTS TAB --- */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Reported Activities</CardTitle>
                <CardDescription>
                  Review safety flags and reports raised against groups.
                </CardDescription>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 border-b">
                    <tr className="text-left">
                      <th className="px-4 py-3 font-semibold text-muted-foreground">Reported Group</th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground">Reason</th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground">Reported By</th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground">Date</th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportsLoading ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          Loading reports...
                        </td>
                      </tr>
                    ) : reportsErr ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-destructive">
                          Failed to load reports.
                        </td>
                      </tr>
                    ) : filteredReports.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No reports found.
                        </td>
                      </tr>
                    ) : (
                      filteredReports.map((report) => (
                        <tr key={report.reportId} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-4 font-semibold">{report.groupName}</td>
                          <td className="px-4 py-4 text-destructive font-medium flex items-center gap-1.5">
                            <AlertCircle className="h-4 w-4" />
                            {report.reason || "Safety Violation"}
                          </td>
                          <td className="px-4 py-4">{report.reportedBy}</td>
                          <td className="px-4 py-4">{formatDate(report.createdAt)}</td>
                          <td className="px-4 py-4 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setSelectedGroup({ groupId: report.groupId, name: report.groupName } as GroupSummary);
                                setLockReason(report.reason);
                                setLockOpen(true);
                              }}
                            >
                              <Lock className="mr-1.5 h-3.5 w-3.5" /> Lock Group
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- LOCKED GROUPS TAB --- */}
        <TabsContent value="locked" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Locked Groups</CardTitle>
                <CardDescription>Directory of locked alumni groups. Unlocked groups will automatically be removed from this list.</CardDescription>
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search locked groups..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 border-b">
                    <tr className="text-left">
                      <th className="px-4 py-3 font-semibold text-muted-foreground">Group</th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground">Created By</th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground">Members</th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground">Status</th>
                      <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lockedLoading ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          Loading locked groups...
                        </td>
                      </tr>
                    ) : lockedErr ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-destructive">
                          Failed to load locked groups.
                        </td>
                      </tr>
                    ) : filteredLocked.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No locked groups found.
                        </td>
                      </tr>
                    ) : (
                      filteredLocked.map((group) => (
                        <tr key={group.groupId} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-4">
                            <div>
                              <p className="font-semibold text-sm">{group.name}</p>
                              <p className="text-muted-foreground text-xs line-clamp-1">{group.description || "No description"}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4">{group.createdBy || "-"}</td>
                          <td className="px-4 py-4">
                            <Badge variant="secondary">{group.memberCount ?? 0}</Badge>
                          </td>
                          <td className="px-4 py-4">
                            <Badge variant="destructive">
                              {group.status || "LOCKED"}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="cursor-pointer" onClick={() => {
                                  setSelectedGroup({ ...group, status: "LOCKED" } as any);
                                  setDetailsOpen(true);
                                }}>
                                  <Eye className="mr-2 h-4 w-4" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => {
                                  setSelectedGroup({ ...group, status: "LOCKED" } as any);
                                  setMembersOpen(true);
                                }}>
                                  <Users className="mr-2 h-4 w-4" /> View Members
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="cursor-pointer text-green-600"
                                  onClick={() => {
                                    setSelectedGroup({ ...group, status: "LOCKED" } as any);
                                    setLockReason("");
                                    setLockOpen(true);
                                  }}
                                >
                                  <Unlock className="mr-2 h-4 w-4" />
                                  Unlock Group
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* --- DETAILS MODAL --- */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Group Details</DialogTitle>
            <DialogDescription>Overview and info for this community.</DialogDescription>
          </DialogHeader>
          {selectedGroup && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Group Name</p>
                  <p className="font-semibold text-foreground mt-0.5">{selectedGroup.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Created By</p>
                  <p className="mt-0.5">{selectedGroup.createdBy || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Members</p>
                  <p className="mt-0.5">{selectedGroup.memberCount ?? 0} members</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Date Created</p>
                  <p className="mt-0.5">{formatDate(selectedGroup.createdAt)}</p>
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Description</p>
                <p className="text-sm mt-1 text-muted-foreground leading-relaxed">
                  {selectedGroup.description || "No description provided."}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MEMBERS MODAL --- */}
      <GroupMembersModal
        groupId={selectedGroup?.groupId || null}
        groupName={selectedGroup?.name || ""}
        open={membersOpen}
        onClose={() => {
          setMembersOpen(false);
          setSelectedGroup(null);
        }}
      />

      {/* --- LOCK / UNLOCK DIALOG --- */}
      <Dialog open={lockOpen} onOpenChange={setLockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Group Lock Status</DialogTitle>
            <DialogDescription>
              {selectedGroup && (selectedGroup as any).status === "LOCKED" 
                ? `Are you sure you want to unlock ${selectedGroup.name}?`
                : `Provide a reason for locking the group ${selectedGroup?.name}.`
              }
            </DialogDescription>
          </DialogHeader>
          {selectedGroup && (selectedGroup as any).status !== "LOCKED" && (
            <div className="space-y-2 py-2">
              <Label htmlFor="lock-reason">Reason</Label>
              <Textarea
                id="lock-reason"
                placeholder="Violates alumni community policies..."
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setLockOpen(false);
                setLockReason("");
                setSelectedGroup(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!selectedGroup) return;
                const isLocked = (selectedGroup as any).status === "LOCKED";
                lockMutation.mutate({
                  groupId: selectedGroup.groupId,
                  reason: isLocked ? undefined : lockReason.trim() || undefined,
                });
              }}
              disabled={lockMutation.isPending}
            >
              {selectedGroup && (selectedGroup as any).status === "LOCKED" ? "Unlock Group" : "Lock Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- REJECT MODAL --- */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Group</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting <span className="font-semibold">{selectedGroup?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Reason</Label>
            <Textarea
              id="reject-reason"
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectOpen(false);
                setRejectReason("");
                setSelectedGroup(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!selectedGroup) return;
                if (!rejectReason.trim()) {
                  toast.error("Please provide a rejection reason.");
                  return;
                }
                rejectMutation.mutate({
                  groupId: selectedGroup.groupId,
                  reason: rejectReason.trim(),
                });
              }}
              disabled={rejectMutation.isPending}
            >
              Reject Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Support Group Members component
function GroupMembersModal({
  groupId,
  groupName,
  open,
  onClose,
}: {
  groupId: string | null;
  groupName: string;
  open: boolean;
  onClose: () => void;
}) {
  const { data: members = [], isLoading, error } = useQuery({
    queryKey: ["group-members", groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const res = await fetchGroupMembers(groupId);
      return res.data;
    },
    enabled: !!groupId && open,
  });

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Members List - {groupName}</DialogTitle>
          <DialogDescription>
            {members.length} member{members.length === 1 ? "" : "s"} in this group.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          {isLoading ? (
            <div className="flex justify-center py-6 text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading members...
            </div>
          ) : error ? (
            <p className="text-destructive text-center py-4 text-sm">Failed to load members.</p>
          ) : members.length === 0 ? (
            <p className="text-muted-foreground text-center py-4 text-sm">No members joined yet.</p>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted">
                  <tr className="text-left">
                    <th className="p-3 font-semibold">Name</th>
                    <th className="p-3 font-semibold">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.userId} className="border-t hover:bg-muted/10">
                      <td className="p-3 font-medium">{member.firstName} {member.lastName}</td>
                      <td className="p-3 text-muted-foreground">{member.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
