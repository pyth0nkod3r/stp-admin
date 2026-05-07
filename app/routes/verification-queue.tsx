import React, { useState } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  FileText, 
  Search, 
  AlertCircle,
  Clock,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAllUsers } from "@/hooks/useUsers";
import { useVerifyUserMutation, useRejectUserMutation } from "@/hooks/useUsersMutations";
import type { User } from "@/lib/type";

export default function VerificationQueuePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const verifyUserMutation = useVerifyUserMutation();
  const rejectUserMutation = useRejectUserMutation();

  const { data: allUsersResponse, isLoading, error } = useAllUsers();
  const allUsers = allUsersResponse?.data ?? [];
  const queue = allUsers.filter((u: User) => !u.isVerified);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    if (action === "approve") {
      try {
        await verifyUserMutation.mutateAsync(id);
      } catch (err: any) {
        // Error is handled by mutation hook
      }
    } else if (action === "reject") {
      try {
        await rejectUserMutation.mutateAsync(id);
      } catch (err: any) {
        // Error is handled by mutation hook
      }
    }
  };

  const filteredQueue = queue.filter((user: User) => {
    const name = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email?.toLowerCase() || "";
    return name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Verification Queue</h2>
        <p className="text-muted-foreground">
          Review and approve pending alumni registrations.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Filter queue..." 
            className="pl-9" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Badge variant="outline" className="px-3 py-1 border-blue-200 bg-blue-50 text-blue-700">
          {queue.length} Pending Reviews
        </Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead className="hidden md:table-cell">Details</TableHead>
                <TableHead>Document</TableHead>
                <TableHead className="hidden lg:table-cell">Applied</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading queue...
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-destructive">
                    Failed to load queue. Please try again.
                  </TableCell>
                </TableRow>
              ) : filteredQueue.length > 0 ? (
                filteredQueue.map((user: User) => {
                  const fullName = `${user.firstName} ${user.lastName}`;
                  return (
                  <TableRow key={user.userId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{`${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-sm truncate">{fullName}</span>
                          <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      <div className="text-muted-foreground">—</div>
                      <div className="text-xs text-muted-foreground">—</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs font-medium text-blue-600">
                        <FileText className="h-3.5 w-3.5" />
                        Account Verification
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {(user as any).createdAt ? new Date((user as any).createdAt).toLocaleDateString() : "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* View Document Dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" /> Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Review Credentials</DialogTitle>
                              <DialogDescription>
                                Verifying {fullName}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="aspect-video w-full bg-muted rounded-md flex flex-col items-center justify-center border-2 border-dashed">
                              <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Document Preview: Not available</p>
                              <Button variant="link" size="sm" disabled>Download Original</Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4">
                              <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Major</p>
                                <p className="text-sm font-medium">—</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Status</p>
                                <Badge variant="secondary">Manual Review</Badge>
                              </div>
                            </div>

                            <DialogFooter className="gap-2 sm:justify-between">
                              <Button 
                                variant="ghost" 
                                onClick={() => handleAction(user.userId, "reject")}
                                disabled={rejectUserMutation.isPending}
                              >
                                {rejectUserMutation.isPending ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="mr-2 h-4 w-4 text-destructive" />
                                )}
                                Reject Applicant
                              </Button>
                              <Button
                                onClick={() => handleAction(user.userId, "approve")}
                                disabled={verifyUserMutation.isPending}
                              >
                                {verifyUserMutation.isPending
                                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  : <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />}
                                Approve Alumni
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                )})
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <AlertCircle className="h-8 w-8 opacity-20" />
                      <p>Queue is empty. No pending verifications.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}