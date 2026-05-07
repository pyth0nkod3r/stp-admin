import React, { useState } from "react";
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
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
    approveMutation,
    rejectMutation,
  } = useDealRooms();
  const [selectedTab, setSelectedTab] = useState("active");

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [manageMembersModalOpen, setManageMembersModalOpen] = useState(false);
  
  const [selectedRoom, setSelectedRoom] = useState<DealRoom | undefined>(undefined);

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

  const handleViewDetails = (room: DealRoom) => {
    setSelectedRoom(room);
    setViewDetailsModalOpen(true);
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

  const handleRejectOpportunity = async (roomId: string) => {
    const reason = window.prompt("Reason for rejecting this opportunity");
    await rejectMutation.mutateAsync({ roomId, reason: reason?.trim() || undefined });
  };

  const activeRooms = dealRooms.filter(room => room.isActive === "1");
  const totalVolume = activeRooms.length > 0 ? "$" + (activeRooms.length * 1.5).toFixed(1) + "M" : "$0";
  const activeRequests = activeRooms.reduce((sum, room) => sum + room.memberCount, 0);
  const totalMembers = dealRooms.reduce((sum, room) => sum + room.memberCount, 0);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Alumni Opportunities</h2>
          <p className="text-muted-foreground">Oversee private opportunities, investments, and partnerships.</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Post New Opportunity
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load opportunities. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {pendingDealRoomsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load pending opportunities. Please try again later.
          </AlertDescription>
        </Alert>
      )}

      {/* High-Level Deal Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Opportunities</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRooms.length}</div>
            <p className="text-xs text-muted-foreground">Active deal rooms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">Across all opportunities</p>
          </CardContent>
        </Card>
        <Card>
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
          <TabsTrigger value="active">Active Opportunities ({activeRooms.length})</TabsTrigger>
          <TabsTrigger value="all">All Opportunities ({dealRooms.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval ({pendingDealRooms.length})</TabsTrigger>
        </TabsList>

        {isLoading || pendingDealRoomsLoading ? (
          <div className="flex items-center justify-center py-12 px-4">
            <div className="text-center">
              <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading opportunities...</p>
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
                  />
                ))
              ) : (
                <div className="col-span-2 text-center py-12 text-muted-foreground">
                  <p>No active opportunities found</p>
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
                  />
                ))
              ) : (
                <div className="col-span-2 text-center py-12 text-muted-foreground">
                  <p>No opportunities found</p>
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
                    onReject={() => handleRejectOpportunity(room.roomId)}
                    isModerating={approveMutation.isPending || rejectMutation.isPending}
                  />
                ))
              ) : (
                <div className="col-span-2 text-center py-12 text-muted-foreground">
                  <ShieldCheck className="h-8 w-8 mx-auto mb-3 opacity-60" />
                  <p>No pending opportunities found</p>
                </div>
              )}
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
        onRemoveMember={async () => {}}
        isLoading={addMembersMutation.isPending}
      />
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
  isModerating = false,
}: {
  room: DealRoom;
  onViewDetails: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onManageMembers: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  isModerating?: boolean;
}) {
  const status = room.isActive === "1" ? "Active" : "Inactive";

  return (
    <Card className="hover:border-primary/50 transition-all">
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
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-2"/>Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Opportunity</p>
            <p className="text-lg font-bold">${(Math.random() * 5).toFixed(1)}M</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Members</p>
            <p className="text-lg font-bold">{room.memberCount}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span>Funding/Completion Progress</span>
            <span>{Math.floor(Math.random() * 100)}%</span>
          </div>
          <Progress value={Math.floor(Math.random() * 100)} className="h-2" />
        </div>

        {onApprove && onReject ? (
          <div className="grid grid-cols-2 gap-2">
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
          <Button className="w-full" variant="outline">
            Audit Documents & Threads
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
