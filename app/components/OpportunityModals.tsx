import React, { useState, useRef } from "react";
import { X, Loader, Upload, File } from "lucide-react";
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
import { toast } from "sonner";

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
  const [memberUserId, setMemberUserId] = useState("");
  const [removeUserId, setRemoveUserId] = useState("");
  const [members, setMembers] = useState<string[]>([]);

  const handleAddMember = async () => {
    if (!memberUserId.trim()) {
      toast.error("Please enter a member user ID");
      return;
    }
    setMembers([...members, memberUserId]);
    setMemberUserId("");
  };

  const handleRemoveMember = (userId: string) => {
    setMembers(members.filter((m) => m !== userId));
  };

  const handleSubmit = async () => {
    if (members.length === 0) {
      toast.error("Please add at least one member");
      return;
    }
    await onAddMembers(members);
    setMembers([]);
    setMemberUserId("");
    onClose();
  };

  const handleRemoveExistingMember = async () => {
    if (!removeUserId.trim()) {
      toast.error("Please enter the member user ID to remove");
      return;
    }
    await onRemoveMember(removeUserId.trim());
    setRemoveUserId("");
  };

  if (!room) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Members</DialogTitle>
          <DialogDescription>
            Add or remove members from "{room.roomName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              Current Members: {room.memberCount}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="memberUserId">Add Member (User ID / UUID)</Label>
            <div className="flex gap-2">
              <Input
                id="memberUserId"
                placeholder="e.g., 725d2748-878f-43df-8582-39003796e023"
                value={memberUserId}
                onChange={(e) => setMemberUserId(e.target.value)}
                disabled={isLoading}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddMember();
                  }
                }}
              />
              <Button
                onClick={handleAddMember}
                disabled={isLoading || !memberUserId}
                size="sm"
              >
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Paste the user's UUID to add them as a member
            </p>
          </div>

          {members.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <p className="text-xs text-muted-foreground">Members to add:</p>
              {members.map((userId) => (
                <div
                  key={userId}
                  className="flex items-center justify-between bg-secondary p-2 rounded text-sm"
                >
                  <span className="truncate font-mono">{userId}</span>
                  <button
                    onClick={() => handleRemoveMember(userId)}
                    disabled={isLoading}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2 border-t pt-4">
            <Label htmlFor="removeUserId">Remove Member (User ID / UUID)</Label>
            <div className="flex gap-2">
              <Input
                id="removeUserId"
                placeholder="Member UUID to remove"
                value={removeUserId}
                onChange={(e) => setRemoveUserId(e.target.value)}
                disabled={isLoading}
              />
              <Button
                variant="destructive"
                onClick={handleRemoveExistingMember}
                disabled={isLoading || !removeUserId}
                size="sm"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || members.length === 0}>
            {isLoading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
            Add Members
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
