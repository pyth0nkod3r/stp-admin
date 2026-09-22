import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Users,
  MapPin,
  Mail,
  Building,
  Calendar,
  AlertCircle,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import { apiDealRooms, type DealRoom, type DealRoomMember } from "@/services/apiDealRooms";

interface DealRoomMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  room?: DealRoom;
  onOpenManageModal?: () => void;
}

export const DealRoomMembersModal: React.FC<DealRoomMembersModalProps> = ({
  isOpen,
  onClose,
  room,
  onOpenManageModal,
}) => {
  const [members, setMembers] = useState<DealRoomMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = async () => {
    if (!room?.roomId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiDealRooms.fetchDealRoomMembers(room.roomId);
      setMembers(data);
    } catch (err: any) {
      const message = err?.message || "Failed to load deal room members from backend";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && room?.roomId) {
      loadMembers();
    } else {
      setMembers([]);
      setError(null);
    }
  }, [isOpen, room?.roomId]);

  if (!room) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="pb-3 border-b">
          <div className="flex items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <DialogTitle className="text-xl font-bold">Deal Room Members</DialogTitle>
                <Badge variant="secondary" className="font-semibold text-xs">
                  {members.length} {members.length === 1 ? "Member" : "Members"}
                </Badge>
              </div>
              <DialogDescription>
                Alumni participating in <strong>"{room.roomName}"</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Server Error State */}
        {error && (
          <Alert variant="destructive" className="my-3">
            <AlertCircle className="h-4 w-4" />
            <div className="flex-1">
              <AlertTitle className="text-sm font-semibold">Server-Side Request Error</AlertTitle>
              <AlertDescription className="text-xs mt-1 font-mono break-all">
                {error}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-2">
          {loading ? (
            <div className="space-y-3 py-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <div className="space-y-1.5 text-right">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-20 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : !error && members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/20 rounded-lg border border-dashed my-4">
              <Users className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
              <p className="text-sm font-semibold text-foreground">No Participating Members Yet</p>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                No users have joined or been added to this deal room yet.
              </p>
              {onOpenManageModal && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onOpenManageModal();
                  }}
                  className="mt-4 text-xs"
                >
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Add Members by ID
                </Button>
              )}
            </div>
          ) : !error && (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr className="text-left text-xs font-semibold text-muted-foreground">
                    <th className="px-4 py-3">Member Name</th>
                    <th className="px-4 py-3">Email Address</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Organization / Role</th>
                    <th className="px-4 py-3">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {members.map((member) => {
                    const initials = `${member.firstName?.[0] || ""}${member.lastName?.[0] || ""}`.toUpperCase() || "U";
                    const formattedDate = member.joinedAt
                      ? new Date(member.joinedAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—";

                    return (
                      <tr key={member.userId} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8 border">
                              <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-foreground">
                              {member.firstName} {member.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={`mailto:${member.email}`}
                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-mono"
                          >
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {member.email}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {member.location ? (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-primary/70 shrink-0" />
                              {member.location}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {member.companyName || member.title ? (
                            <span className="inline-flex items-center gap-1">
                              <Building className="h-3 w-3 text-muted-foreground shrink-0" />
                              {[member.title, member.companyName].filter(Boolean).join(" at ")}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 font-mono">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {formattedDate}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <DialogFooter className="pt-3 border-t flex-row items-center justify-between sm:justify-between">
          <div>
            {onOpenManageModal && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  onClose();
                  onOpenManageModal();
                }}
              >
                <UserPlus className="h-3.5 w-3.5 mr-1" /> Add / Remove by UUID
              </Button>
            )}
          </div>
          <Button variant="default" size="sm" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
