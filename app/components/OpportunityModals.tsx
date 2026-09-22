import React, { useState, useRef } from "react";
import { 
  X, 
  Loader, 
  Upload, 
  File, 
  Search, 
  UserPlus, 
  Trash2, 
  Users, 
  Check, 
  AlertCircle,
  Mail,
  Building,
  Loader2,
  CheckCircle2,
  UserCheck
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchUsersByParams } from "@/services/apiUsers";
import { apiDealRooms, type DealRoom, type DealRoomMember } from "@/services/apiDealRooms";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";


// ============= CREATE OPPORTUNITY MODAL =============
interface CreateOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { roomName: string; roomDescription: string; document: File; images?: File[] }) => Promise<void>;
  isLoading?: boolean;
}

export const CreateOpportunityModal: React.FC<CreateOpportunityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    roomName: "",
    roomDescription: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const DOCUMENT_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    const accepted: File[] = [];

    selected.forEach((file) => {
      if (file.type.startsWith("image/")) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 5MB limit`);
          return;
        }
        accepted.push(file);
      } else if (DOCUMENT_TYPES.includes(file.type) || /\.pdf$|\.docx?$/.test(file.name.toLowerCase())) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 10MB limit`);
          return;
        }
        accepted.push(file);
      } else {
        toast.error(`${file.name} is not a supported file type`);
      }
    });

    if (accepted.length === 0) return;

    setFiles((prev) => {
      const next = [...prev, ...accepted];
      return next;
    });

    // reset input so selecting same files again works
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.roomName.trim()) {
      toast.error("Please enter an opportunity name");
      return;
    }
    if (!formData.roomDescription.trim()) {
      toast.error("Please enter an opportunity description");
      return;
    }
    // require at least one document file
    const documentFile = files.find((f) => DOCUMENT_TYPES.includes(f.type) || /\.pdf$|\.docx?$/.test(f.name.toLowerCase()));
    if (!documentFile) {
      toast.error("Please include at least one PDF or Word document");
      return;
    }

    const imagesFiles = files.filter((f) => f.type.startsWith("image/"));

    await onSubmit({
      ...formData,
      document: documentFile,
      images: imagesFiles.length > 0 ? imagesFiles : undefined,
    });

    setFormData({ roomName: "", roomDescription: "" });
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Opportunity</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new alumni opportunity
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roomName">Opportunity Name</Label>
            <Input
              id="roomName"
              placeholder="e.g., Q3 Funding Round"
              value={formData.roomName}
              onChange={(e) =>
                setFormData({ ...formData, roomName: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomDescription">Description</Label>
            <Textarea
              id="roomDescription"
              placeholder="Describe the opportunity..."
              value={formData.roomDescription}
              onChange={(e) =>
                setFormData({ ...formData, roomDescription: e.target.value })
              }
              disabled={isLoading}
              className="min-h-[100px]"
            />
          </div>

          {/* Files upload (documents + images) */}
          <div className="space-y-2">
            <Label htmlFor="files">Upload Files <span className="text-destructive">*</span></Label>
            <div className="relative">
              <input
                ref={fileInputRef}
                id="files"
                type="file"
                accept=".pdf,.doc,.docx,image/*"
                multiple
                onChange={handleFilesSelect}
                disabled={isLoading}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 hover:border-muted-foreground/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="h-4 w-4" />
                <span className="text-sm text-muted-foreground">
                  Click to upload documents and images
                </span>
              </button>
            </div>
           

            {files.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                {files.map((f, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden border border-muted-foreground/20 p-2 bg-secondary">
                    <div className="flex items-center gap-2">
                      <File className="h-5 w-5" />
                      <div className="min-w-0">
                        <div className="text-sm truncate">{f.name}</div>
                        <div className="text-xs text-muted-foreground">{(f.size / 1024 / 1024).toFixed(2)}MB</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveFile(idx)}
                      disabled={isLoading}
                      className="absolute top-2 right-2 bg-black/50 rounded p-1"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
            Create Opportunity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============= EDIT OPPORTUNITY MODAL =============
interface EditOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { roomName: string; roomDescription: string }) => Promise<void>;
  room?: DealRoom;
  isLoading?: boolean;
}

export const EditOpportunityModal: React.FC<EditOpportunityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  room,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    roomName: room?.roomName || "",
    roomDescription: room?.roomDescription || "",
  });

  React.useEffect(() => {
    if (room) {
      setFormData({
        roomName: room.roomName,
        roomDescription: room.roomDescription,
      });
    }
  }, [room, isOpen]);

  const handleSubmit = async () => {
    if (!formData.roomName.trim()) {
      toast.error("Please enter an opportunity name");
      return;
    }
    if (!formData.roomDescription.trim()) {
      toast.error("Please enter an opportunity description");
      return;
    }
    await onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Opportunity</DialogTitle>
          <DialogDescription>
            Update the opportunity details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editRoomName">Opportunity Name</Label>
            <Input
              id="editRoomName"
              placeholder="e.g., Q3 Funding Round"
              value={formData.roomName}
              onChange={(e) =>
                setFormData({ ...formData, roomName: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editRoomDescription">Description</Label>
            <Textarea
              id="editRoomDescription"
              placeholder="Describe the opportunity..."
              value={formData.roomDescription}
              onChange={(e) =>
                setFormData({ ...formData, roomDescription: e.target.value })
              }
              disabled={isLoading}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
            Update Opportunity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============= VIEW DETAILS MODAL =============
interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room?: DealRoom;
}

export const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({
  isOpen,
  onClose,
  room,
}) => {
  if (!room) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{room.roomName}</DialogTitle>
          <DialogDescription>Opportunity Details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Description</p>
            <p className="text-sm">{room.roomDescription}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Created By</p>
              <p className="text-sm font-medium">
                {room.firstName} {room.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{room.createdByEmail}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <Badge variant={room.isActive === "1" ? "default" : "secondary"}>
                {room.isActive === "1" ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Members</p>
              <p className="text-lg font-bold">{room.memberCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Created</p>
              <p className="text-sm">{new Date(room.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {room.documentUrl && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Document</p>
              <a
                href={room.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View Document
              </a>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============= DELETE CONFIRMATION MODAL =============
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  roomName?: string;
  isLoading?: boolean;
}

export const DeleteConfirmationModal: React.FC<
  DeleteConfirmationModalProps
> = ({
  isOpen,
  onClose,
  onConfirm,
  roomName = "Opportunity",
  isLoading = false,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete Opportunity?</DialogTitle>
          <DialogDescription>
            You are about to permanently delete "{roomName}". This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm text-destructive">
            All associated data including members and documents will be deleted.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
            Delete Opportunity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface StagedUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string | null;
}


// ============= MANAGE MEMBERS MODAL =============
interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  room?: DealRoom;
  onAddMembers: (members: string[]) => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
  isLoading?: boolean;
}

export const ManageMembersModal: React.FC<ManageMembersModalProps> = ({
  isOpen,
  onClose,
  room,
  onAddMembers,
  onRemoveMember,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<"add" | "current">("add");
  const [searchQuery, setSearchQuery] = useState("");
  const [stagedUsers, setStagedUsers] = useState<StagedUser[]>([]);
  const [filterExistingQuery, setFilterExistingQuery] = useState("");
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  // Live user search via API using name or email query
  const { data: usersResponse, isLoading: searchingUsers } = useQuery({
    queryKey: ["dealroom-user-search", searchQuery],
    queryFn: () => fetchUsersByParams({ page: 1, perPage: 25, search: searchQuery.trim() }),
    enabled: isOpen && searchQuery.trim().length >= 1,
    staleTime: 20 * 1000,
  });

  const searchResults = usersResponse?.data ?? [];

  // Query current room members to prevent duplicate adds and display for removal
  const { data: currentMembers = [], isLoading: loadingCurrentMembers, refetch: refetchCurrentMembers } = useQuery<DealRoomMember[]>({
    queryKey: ["dealRoomMembers", room?.roomId],
    queryFn: () => (room?.roomId ? apiDealRooms.fetchDealRoomMembers(room.roomId) : Promise.resolve([])),
    enabled: isOpen && !!room?.roomId,
  });

  const existingMemberUserIds = new Set(currentMembers.map((m) => m.userId));

  const handleStageUser = (user: any) => {
    if (existingMemberUserIds.has(user.userId)) {
      toast.info(`${user.firstName} ${user.lastName} is already a member of this deal room.`);
      return;
    }
    if (stagedUsers.some((u) => u.userId === user.userId)) {
      toast.info(`${user.firstName} ${user.lastName} is already staged.`);
      return;
    }
    setStagedUsers((prev) => [
      ...prev,
      {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        cohort: user.cohort,
        companyName: user.companyName,
      },
    ]);
  };

  const handleUnstageUser = (userId: string) => {
    setStagedUsers((prev) => prev.filter((u) => u.userId !== userId));
  };

  const handleSubmitAdd = async () => {
    if (stagedUsers.length === 0) {
      toast.error("Please search and select at least one alumni member to add.");
      return;
    }
    try {
      await onAddMembers(stagedUsers.map((u) => u.userId));
      setStagedUsers([]);
      setSearchQuery("");
      await refetchCurrentMembers();
      toast.success(`${stagedUsers.length} member(s) added successfully!`);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to add members");
    }
  };

  const handleRemoveExistingMember = async (userId: string, memberName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from this deal room?`)) {
      return;
    }
    setRemovingUserId(userId);
    try {
      await onRemoveMember(userId);
      await refetchCurrentMembers();
      toast.success(`${memberName} removed from deal room.`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to remove member");
    } finally {
      setRemovingUserId(null);
    }
  };

  // Filter existing room members by name or email
  const filteredCurrentMembers = currentMembers.filter((m) => {
    if (!filterExistingQuery.trim()) return true;
    const q = filterExistingQuery.toLowerCase();
    const fullName = `${m.firstName || ""} ${m.lastName || ""}`.toLowerCase();
    const email = (m.email || "").toLowerCase();
    return fullName.includes(q) || email.includes(q);
  });

  if (!room) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <DialogTitle className="text-xl font-bold">Manage Members</DialogTitle>
                <Badge variant="secondary" className="font-semibold text-xs">
                  {currentMembers.length} {currentMembers.length === 1 ? "Current Member" : "Current Members"}
                </Badge>
              </div>
              <DialogDescription>
                Add or remove alumni participating in <strong>"{room.roomName}"</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full flex-1 flex flex-col min-h-0 pt-3">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="add" className="flex items-center gap-1.5 text-xs font-semibold">
              <UserPlus className="h-3.5 w-3.5" /> Add Members {stagedUsers.length > 0 && `(${stagedUsers.length} selected)`}
            </TabsTrigger>
            <TabsTrigger value="current" className="flex items-center gap-1.5 text-xs font-semibold">
              <Users className="h-3.5 w-3.5" /> Current Members ({currentMembers.length})
            </TabsTrigger>
          </TabsList>

          {/* ================= TAB 1: ADD MEMBERS VIA SEARCH ================= */}
          <TabsContent value="add" className="flex-1 flex flex-col min-h-0 space-y-4 mt-0">
            {/* Search Input */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">Search Alumni by Name or Email</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Type alumni first name, last name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 h-9 text-sm"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Results Dropdown / Box */}
            <div className="flex-1 overflow-y-auto border rounded-lg p-2 min-h-[160px] max-h-[220px] bg-muted/10 space-y-1.5">
              {searchQuery.trim().length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                  <Search className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-xs font-medium">Search for alumni to add them to this deal room</p>
                  <p className="text-[11px] text-muted-foreground/70">Type at least 1 character to see live matching results.</p>
                </div>
              ) : searchingUsers ? (
                <div className="flex items-center justify-center py-8 text-xs text-muted-foreground gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" /> Searching directory...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No alumni found matching "{searchQuery}". Try a different name or email.
                </div>
              ) : (
                searchResults.map((user) => {
                  const isAlreadyInRoom = existingMemberUserIds.has(user.userId);
                  const isStaged = stagedUsers.some((u) => u.userId === user.userId);
                  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "U";

                  return (
                    <div
                      key={user.userId}
                      className="flex items-center justify-between p-2.5 rounded-md hover:bg-muted/40 transition-colors border border-transparent hover:border-border text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="h-8 w-8 border shrink-0">
                          {(user as any).avatar || (user as any).avatarUrl ? (
                            <AvatarImage src={(user as any).avatar || (user as any).avatarUrl} alt={user.firstName} />
                          ) : null}
                          <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>

                      <div className="shrink-0 ml-3">
                        {isAlreadyInRoom ? (
                          <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Already in Room
                          </Badge>
                        ) : isStaged ? (
                          <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                            <Check className="h-3 w-3 mr-1" /> Selected
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-2.5"
                            onClick={() => handleStageUser(user)}
                          >
                            <UserPlus className="h-3 w-3 mr-1" /> Select
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Staged Members Section */}
            {stagedUsers.length > 0 && (
              <div className="space-y-2 border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Selected to Add ({stagedUsers.length}):
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] text-muted-foreground hover:text-foreground px-2"
                    onClick={() => setStagedUsers([])}
                  >
                    Clear Selected
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-2 bg-muted/20 rounded-lg border">
                  {stagedUsers.map((u) => (
                    <Badge
                      key={u.userId}
                      variant="secondary"
                      className="pl-2 pr-1 py-1 text-xs flex items-center gap-1.5 bg-background border shadow-xs"
                    >
                      <span className="font-semibold text-foreground">{u.firstName} {u.lastName}</span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">({u.email})</span>
                      <button
                        type="button"
                        onClick={() => handleUnstageUser(u.userId)}
                        className="hover:bg-muted p-0.5 rounded-full text-muted-foreground hover:text-foreground transition-colors ml-0.5"
                        title="Remove"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ================= TAB 2: CURRENT MEMBERS & REMOVAL ================= */}
          <TabsContent value="current" className="flex-1 flex flex-col min-h-0 space-y-3 mt-0">
            {/* Filter Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter current members by name or email..."
                value={filterExistingQuery}
                onChange={(e) => setFilterExistingQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
              {filterExistingQuery && (
                <button
                  type="button"
                  onClick={() => setFilterExistingQuery("")}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Current Members List */}
            <div className="flex-1 overflow-y-auto border rounded-lg min-h-[220px] max-h-[300px]">
              {loadingCurrentMembers ? (
                <div className="flex items-center justify-center py-12 text-xs text-muted-foreground gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading room members...
                </div>
              ) : filteredCurrentMembers.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  {filterExistingQuery ? `No members matching "${filterExistingQuery}".` : "No members have joined this deal room yet."}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredCurrentMembers.map((member) => {
                    const initials = `${member.firstName?.[0] || ""}${member.lastName?.[0] || ""}`.toUpperCase() || "U";
                    const isBeingRemoved = removingUserId === member.userId;

                    return (
                      <div
                        key={member.userId}
                        className="flex items-center justify-between p-3 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-8 w-8 border shrink-0">
                            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                            {(member.companyName || member.title) && (
                              <p className="text-[11px] text-muted-foreground/80 truncate mt-0.5">
                                {[member.title, member.companyName].filter(Boolean).join(" at ")}
                              </p>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0 ml-2"
                          onClick={() => handleRemoveExistingMember(member.userId, `${member.firstName} ${member.lastName}`)}
                          disabled={isBeingRemoved || isLoading}
                        >
                          {isBeingRemoved ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-3 border-t flex flex-row items-center justify-between sm:justify-between">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading || !!removingUserId}>
            Cancel
          </Button>

          {activeTab === "add" ? (
            <Button
              size="sm"
              onClick={handleSubmitAdd}
              disabled={isLoading || stagedUsers.length === 0}
              className="font-semibold text-xs"
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              Add {stagedUsers.length > 0 ? `${stagedUsers.length} Selected Member${stagedUsers.length > 1 ? "s" : ""}` : "Members"}
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
