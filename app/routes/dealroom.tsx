import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Users, 
  FileText, 
  TrendingUp, 
  MoreVertical, 
  Lock, 
  Unlock, 
  MessageSquare,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  AlertCircle,
  Loader,
  Loader2,
  Edit,
  Trash2,
  Eye,
  History
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useDealRooms } from "@/hooks/useDealRoomsNew";

type DealRoom = {
  roomId: string;
  roomName: string;
  roomDescription: string;
  isActive: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  createdByEmail: string;
  memberCount: number;
  documentUrl: string;
};
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  CreateOpportunityModal,
  EditOpportunityModal,
  ViewDetailsModal,
  DeleteConfirmationModal,
  ManageMembersModal,
} from "@/components/OpportunityModals";

export default function OpportunitiesPage() {
  const { 
    dealRooms, 
    isLoading, 
    error,
    pendingDealRooms,
    pendingDealRoomsLoading,
    pendingDealRoomsError,
    createMutation,
    updateMutation,
    deleteMutation,
    addMembersMutation,
    removeMemberMutation,
    approveMutation,
    rejectMutation,
    lockRoomMutation,
    fetchRoomDetail,
    fetchAuditLog,
    fetchLogs,
  } = useDealRooms();
  const [selectedTab, setSelectedTab] = useState("active");

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [manageMembersModalOpen, setManageMembersModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  
  // Logs and lock states
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [lockRoomReason, setLockRoomReason] = useState("");
  
  const [selectedRoom, setSelectedRoom] = useState<DealRoom | undefined>(undefined);

  useEffect(() => {
    if (selectedTab === "logs") {
      setLogsLoading(true);
      fetchLogs()
        .then((res) => setLogs(res.data || []))
        .catch(() => toast.error("Failed to load logs"))
        .finally(() => setLogsLoading(false));
    }
  }, [selectedTab]);

  // Handlers for modals
  const handleCreateOpportunity = async (data: {
    roomName: string;
    roomDescription: string;
    members?: string[];
    document: File;
    images?: File[];
  }) => {
    await createMutation.mutateAsync(data);
  };

  const handleEditClick = (room: DealRoom) => {
    setSelectedRoom(room);
    setEditModalOpen(true);
  };

  const handleEditOpportunity = async (data: {
    roomName: string;
    roomDescription: string;
  }) => {
    if (selectedRoom) {
      await updateMutation.mutateAsync({
        roomId: selectedRoom.roomId,
        updateData: data,
      });
      setEditModalOpen(false);
    }
  };

  const handleViewDetails = async (room: DealRoom) => {
    setSelectedRoom(room);
    setViewDetailsModalOpen(true);
    try {
      const detail = await fetchRoomDetail(room.roomId);
      setSelectedRoom(detail);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load opportunity details");
    }
  };

  const handleDeleteClick = (room: DealRoom) => {
    setSelectedRoom(room);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedRoom) {
      await deleteMutation.mutateAsync(selectedRoom.roomId);
      setDeleteModalOpen(false);
    }
  };

  const handleManageMembersClick = (room: DealRoom) => {
    setSelectedRoom(room);
    setManageMembersModalOpen(true);
  };

  const handleAddMembers = async (members: string[]) => {
    if (selectedRoom) {
      await addMembersMutation.mutateAsync({
        roomId: selectedRoom.roomId,
        members,
      });
      setManageMembersModalOpen(false);
    }
  };

  const handleApproveOpportunity = async (roomId: string) => {
    await approveMutation.mutateAsync(roomId);
  };

  const handleRejectClick = (room: DealRoom) => {
    setSelectedRoom(room);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleRejectOpportunity = async () => {
    if (!selectedRoom) return;
    await rejectMutation.mutateAsync({
      roomId: selectedRoom.roomId,
      reason: rejectReason.trim() || undefined,
    });
    setRejectModalOpen(false);
    setRejectReason("");
    setSelectedRoom(undefined);
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedRoom) return;
    await removeMemberMutation.mutateAsync({
      roomId: selectedRoom.roomId,
      userId,
    });
  };

  const handleViewAuditLog = async (room: DealRoom) => {
    setSelectedRoom(room);
    setAuditLoading(true);
    setAuditModalOpen(true);
    try {
      const res = await fetchAuditLog(room.roomId);
      setAuditLog(res.data || []);
    } catch (err) {
      toast.error("Failed to load audit trail");
      setAuditModalOpen(false);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleLockClick = async (room: DealRoom) => {
    setSelectedRoom(room);
    if (room.isActive === "0") {
      // Unlock directly
      await lockRoomMutation.mutateAsync({ roomId: room.roomId });
    } else {
      // Ask lock reason
      setLockRoomReason("");
      setLockDialogOpen(true);
    }
  };

  const handleLockConfirm = async () => {
    if (selectedRoom) {
      await lockRoomMutation.mutateAsync({
        roomId: selectedRoom.roomId,
        reason: lockRoomReason.trim() || undefined,
      });
      setLockDialogOpen(false);
      setLockRoomReason("");
    }
  };

  const activeRooms = dealRooms.filter(room => room.isActive === "1");
  const totalVolume = activeRooms.length > 0 ? "$" + (activeRooms.length * 1.5).toFixed(1) + "M" : "$0";
  const activeRequests = activeRooms.reduce((sum, room) => sum + room.memberCount, 0);
  const totalMembers = dealRooms.reduce((sum, room) => sum + room.memberCount, 0);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Alumni Dealrooms</h2>
          <p className="text-muted-foreground">Oversee private dealrooms, investments, and partnerships.</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Post New Dealroom
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dealrooms. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {pendingDealRoomsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load pending dealrooms. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {/* High-Level Deal Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-400 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Dealrooms</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRooms.length}</div>
            <p className="text-xs text-muted-foreground">Active deal rooms</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-400 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">Across all dealrooms</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-400 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingDealRooms.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Dealrooms ({activeRooms.length})</TabsTrigger>
          <TabsTrigger value="all">All Dealrooms ({dealRooms.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval ({pendingDealRooms.length})</TabsTrigger>
          <TabsTrigger value="logs">Master Log</TabsTrigger>
        </TabsList>

        {isLoading || pendingDealRoomsLoading ? (
          <div className="flex items-center justify-center py-12 px-4">
            <div className="text-center">
              <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading dealrooms...</p>
            </div>
          </div>
        ) : (
          <>
            <TabsContent value="active" className="grid gap-4 md:grid-cols-2">
              {activeRooms.length > 0 ? (
                activeRooms.map((room) => (
                  <OpportunityCard 
                    key={room.roomId}
                    room={room}
                    onViewDetails={() => handleViewDetails(room)}
                    onEdit={() => handleEditClick(room)}
                    onDelete={() => handleDeleteClick(room)}
                    onManageMembers={() => handleManageMembersClick(room)}
                    onViewAudit={() => handleViewAuditLog(room)}
                    onLockUnlock={() => handleLockClick(room)}
                  />
                ))
              ) : (
                <div className="col-span-2 text-center py-12 text-muted-foreground">
                  <p>No active dealrooms found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="grid gap-4 md:grid-cols-2">
              {dealRooms.length > 0 ? (
                dealRooms.map((room) => (
                  <OpportunityCard 
                    key={room.roomId}
                    room={room}
                    onViewDetails={() => handleViewDetails(room)}
                    onEdit={() => handleEditClick(room)}
                    onDelete={() => handleDeleteClick(room)}
                    onManageMembers={() => handleManageMembersClick(room)}
                    onViewAudit={() => handleViewAuditLog(room)}
                    onLockUnlock={() => handleLockClick(room)}
                  />
                ))
              ) : (
                <div className="col-span-2 text-center py-12 text-muted-foreground">
                  <p>No dealrooms found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending" className="grid gap-4 md:grid-cols-2">
              {pendingDealRooms.length > 0 ? (
                pendingDealRooms.map((room) => (
                  <OpportunityCard
                    key={room.roomId}
                    room={room}
                    onViewDetails={() => handleViewDetails(room)}
                    onEdit={() => handleEditClick(room)}
                    onDelete={() => handleDeleteClick(room)}
                    onManageMembers={() => handleManageMembersClick(room)}
                    onApprove={() => handleApproveOpportunity(room.roomId)}
                    onReject={() => handleRejectClick(room)}
                    isModerating={approveMutation.isPending || rejectMutation.isPending}
                  />
                ))
              ) : (
                <div className="col-span-2 text-center py-12 text-muted-foreground">
                  <ShieldCheck className="h-8 w-8 mx-auto mb-3 opacity-60" />
                  <p>No pending dealrooms found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <Card className="border-zinc-400 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle>System Activity Logs</CardTitle>
                  <CardDescription>
                    History of actions performed in all deal rooms.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {logsLoading ? (
                    <div className="flex items-center justify-center p-8 text-muted-foreground gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading logs...
                    </div>
                  ) : logs.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No logs found.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/40 border-b">
                          <tr className="text-left">
                            <th className="px-4 py-3 font-semibold text-muted-foreground">Dealroom</th>
                            <th className="px-4 py-3 font-semibold text-muted-foreground">Action</th>
                            <th className="px-4 py-3 font-semibold text-muted-foreground">Performed By</th>
                            <th className="px-4 py-3 font-semibold text-muted-foreground">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {logs.map((log, idx) => (
                            <tr key={log.logId || idx} className="border-b last:border-0 hover:bg-muted/10">
                              <td className="px-4 py-4 font-medium">{log.roomName}</td>
                              <td className="px-4 py-4">{log.action}</td>
                              <td className="px-4 py-4">{log.performedBy}</td>
                              <td className="px-4 py-4 text-muted-foreground text-xs">
                                {log.timestamp ? new Date(log.timestamp).toLocaleString() : "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Modals */}
      <CreateOpportunityModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateOpportunity}
        isLoading={createMutation.isPending}
      />

      <EditOpportunityModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditOpportunity}
        room={selectedRoom}
        isLoading={updateMutation.isPending}
      />

      <ViewDetailsModal
        isOpen={viewDetailsModalOpen}
        onClose={() => setViewDetailsModalOpen(false)}
        room={selectedRoom}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        roomName={selectedRoom?.roomName}
        isLoading={deleteMutation.isPending}
      />

      <ManageMembersModal
        isOpen={manageMembersModalOpen}
        onClose={() => setManageMembersModalOpen(false)}
        room={selectedRoom}
        onAddMembers={handleAddMembers}
        onRemoveMember={handleRemoveMember}
        isLoading={addMembersMutation.isPending || removeMemberMutation.isPending}
      />

      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Dealroom</DialogTitle>
            <DialogDescription>
              Add an optional reason for rejecting {selectedRoom?.roomName || "this dealroom"}.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="Reason for rejection..."
            disabled={rejectMutation.isPending}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectModalOpen(false)}
              disabled={rejectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectOpportunity}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject Dealroom"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Audit Trail Modal */}
      <Dialog open={auditModalOpen} onOpenChange={setAuditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Trail: {selectedRoom?.roomName}</DialogTitle>
            <DialogDescription>
              Chronological history of activities in this deal room.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 my-4">
            {auditLoading ? (
              <div className="flex items-center justify-center p-8 text-muted-foreground gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading audit trail...
              </div>
            ) : auditLog.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                No activity history found.
              </div>
            ) : (
              <div className="relative border-l border-muted pl-6 ml-3 space-y-6">
                {auditLog.map((log, idx) => (
                  <div key={log.auditId || idx} className="relative">
                    <div className="absolute -left-[31px] bg-background border rounded-full p-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{log.action}</span>
                        <span className="text-xs text-muted-foreground">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : "-"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Performed by <span className="font-medium">{log.performedBy || log.email || "System"}</span>
                      </p>
                      {log.reason && (
                        <p className="text-xs italic bg-muted/50 text-muted-foreground p-2 rounded mt-2">
                          Reason: {log.reason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setAuditModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lock Room Dialog */}
      <Dialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lock Dealroom</DialogTitle>
            <DialogDescription>
              Provide a reason for locking {selectedRoom?.roomName}. This room will be set to inactive and users will not be able to interact with it.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={lockRoomReason}
            onChange={(e) => setLockRoomReason(e.target.value)}
            placeholder="Reason for locking this room..."
            className="min-h-[100px]"
            disabled={lockRoomMutation.isPending}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLockDialogOpen(false)}
              disabled={lockRoomMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLockConfirm}
              disabled={lockRoomMutation.isPending}
            >
              {lockRoomMutation.isPending ? "Locking..." : "Lock Room"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OpportunityCard({ 
  room,
  onViewDetails,
  onEdit,
  onDelete,
  onManageMembers,
  onApprove,
  onReject,
  onViewAudit,
  onLockUnlock,
  isModerating = false,
}: {
  room: DealRoom;
  onViewDetails: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onManageMembers: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onViewAudit?: () => void;
  onLockUnlock?: () => void;
  isModerating?: boolean;
}) {
  const status = room.isActive === "1" ? "Active" : "Inactive";

  return (
    <Card className="border-zinc-400 dark:border-zinc-800 hover:border-primary/50 transition-all">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={status === "Active" ? "default" : "secondary"}>
              {status === "Active" ? <Unlock className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
              {status}
            </Badge>
            <Badge variant="outline" className="truncate">{room.roomDescription.substring(0, 20)}...</Badge>
          </div>
          <CardTitle className="text-lg line-clamp-2">{room.roomName}</CardTitle>
          <CardDescription className="line-clamp-1">Posted by {room.firstName} {room.lastName}</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onViewDetails}>
              <Eye className="h-4 w-4 mr-2"/> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onManageMembers}>
              <Users className="h-4 w-4 mr-2"/> Manage Members
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2"/> Edit
            </DropdownMenuItem>
            {onViewAudit && (
              <DropdownMenuItem onClick={onViewAudit}>
                <History className="h-4 w-4 mr-2"/> View Audit Trail
              </DropdownMenuItem>
            )}
            {onLockUnlock && (
              <DropdownMenuItem onClick={onLockUnlock}>
                {status === "Active" ? (
                  <>
                    <Lock className="h-4 w-4 mr-2"/> Lock Room
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4 mr-2"/> Unlock Room
                  </>
                )}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-2"/>Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-xs font-medium text-muted-foreground">Total Members</span>
          <span className="text-sm font-bold text-foreground">{room.memberCount}</span>
        </div>

        {onApprove && onReject ? (
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50"
              onClick={onReject}
              disabled={isModerating}
            >
              Reject
            </Button>
            <Button
              variant="outline"
              className="border-green-200 text-green-700 hover:bg-green-50"
              onClick={onApprove}
              disabled={isModerating}
            >
              Approve
            </Button>
          </div>
        ) : (
          <Button className="w-full pt-2" variant="outline" onClick={onViewDetails}>
            Audit Documents & Threads
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
