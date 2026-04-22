import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Search, ShieldCheck, X } from "lucide-react";
import { getPendingGroups, approveGroup, rejectGroup, type GroupSummary } from "@/services/apiGroups";
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

function formatDate(value?: string): string {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
}

export default function GroupsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<GroupSummary | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { data: groups = [], isLoading, error } = useQuery({
    queryKey: ["groups-pending"],
    queryFn: async () => {
      const result = await getPendingGroups();
      return result.data;
    },
  });

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

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groups;

    const query = search.toLowerCase();
    return groups.filter((group) =>
      [group.name, group.description, group.createdBy]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query))
    );
  }, [groups, search]);

  const pendingCount = filteredGroups.length;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Groups Moderation</h2>
        <p className="text-muted-foreground">
          Review groups awaiting approval and decide whether to approve or reject.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Pending Groups</CardTitle>
            <CardDescription>
              {pendingCount} group{pendingCount === 1 ? "" : "s"} in current view
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
                  <th className="px-4 py-3 font-semibold text-muted-foreground text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Loading pending groups...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-destructive">
                      Failed to load pending groups.
                    </td>
                  </tr>
                ) : filteredGroups.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No pending groups found.
                    </td>
                  </tr>
                ) : (
                  filteredGroups.map((group) => (
                    <tr key={group.groupId} className="border-b last:border-0">
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-2">
                          <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium">{group.name}</p>
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
                            <Check className="mr-1.5 h-3.5 w-3.5" />
                            Approve
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
                            <X className="mr-1.5 h-3.5 w-3.5" />
                            Reject
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

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Group</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting{" "}
              <span className="font-medium">{selectedGroup?.name || "this group"}</span>.
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
