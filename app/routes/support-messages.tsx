import React, { useState, useEffect, useMemo } from "react";
import {
  Inbox,
  Search,
  Check,
  X,
  Eye,
  Clock,
  UserCheck,
  UserX,
  AlertCircle,
  Calendar,
  Loader2,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { fetchSupportMessages, updateSupportMessageStatus } from "@/services/apiSupportMessages";
import type { SupportMessage } from "@/lib/type";

export default function SupportMessagesPage() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Load messages
  const loadMessages = async (status: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiStatus = status === "ALL" ? undefined : status;
      const response = await fetchSupportMessages(apiStatus);
      setMessages(response.data);
    } catch (err: any) {
      setError(err?.message || "Failed to load support messages");
      toast.error(err?.message || "Failed to load support messages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages(statusFilter);
  }, [statusFilter]);

  // Handle Approve / Reject action
  const handleMessageAction = async (requestId: string, action: "approve" | "reject") => {
    setActionLoading(requestId);
    try {
      await updateSupportMessageStatus(requestId, action);
      toast.success(`Message ${action}d successfully`);
      
      if (selectedMessage?.requestId === requestId) {
        setDetailOpen(false);
        setSelectedMessage(null);
      }

      await loadMessages(statusFilter);
    } catch (err: any) {
      toast.error(err?.message || `Failed to ${action} message`);
    } finally {
      setActionLoading(null);
    }
  };

  // Filter messages locally by search term
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const term = searchTerm.toLowerCase();
      return (
        (msg.fullName && msg.fullName.toLowerCase().includes(term)) ||
        (msg.email && msg.email.toLowerCase().includes(term)) ||
        (msg.subject && msg.subject.toLowerCase().includes(term)) ||
        (msg.message && msg.message.toLowerCase().includes(term))
      );
    });
  }, [messages, searchTerm]);

  const handleViewDetails = (message: SupportMessage) => {
    setSelectedMessage(message);
    setDetailOpen(true);
  };

  const getInitials = (name: string) => {
    if (!name) return "SM";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      // Support space-separated dates from the API
      const date = new Date(dateString.replace(/-/g, "/"));
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 px-2 py-0.5 text-xs font-medium">
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive" className="px-2 py-0.5 text-xs font-medium">
            Rejected
          </Badge>
        );
      case "PENDING":
      default:
        return (
          <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/20 hover:bg-amber-500/20 px-2 py-0.5 text-xs font-medium">
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Support Messages</h2>
          <p className="text-muted-foreground text-sm">
            View and manage support requests, feedback, and membership applications submitted via the contact form.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading && statusFilter === "PENDING" ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                messages.filter((m) => m.status === "PENDING").length
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Requires admin review</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Messages</CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading && statusFilter === "APPROVED" ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                messages.filter((m) => m.status === "APPROVED").length
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Marked as approved/processed</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Messages</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading && statusFilter === "REJECTED" ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                messages.filter((m) => m.status === "REJECTED").length
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Declined or dismissed messages</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Filter & Table Card */}
      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages by sender, subject, content..."
                className="pl-9 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex bg-muted p-1 rounded-lg self-start md:self-auto">
              {["PENDING", "APPROVED", "REJECTED", "ALL"].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setSearchTerm("");
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    statusFilter === status
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="rounded-md border-t">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[280px] pl-6">Sender</TableHead>
                  <TableHead className="w-[200px]">Subject</TableHead>
                  <TableHead className="hidden md:table-cell">Message Preview</TableHead>
                  <TableHead className="w-[180px]">Date Submitted</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="text-right pr-6 w-[160px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-36 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-sm">Loading messages...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-36 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 text-destructive">
                        <AlertCircle className="h-6 w-6" />
                        <span className="text-sm font-medium">{error}</span>
                        <Button variant="outline" size="sm" onClick={() => loadMessages(statusFilter)} className="mt-2">
                          Retry
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredMessages.length > 0 ? (
                  filteredMessages.map((message) => (
                    <TableRow key={message.requestId} className="hover:bg-muted/30 transition-colors">
                      {/* Sender Name & Email */}
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-muted-foreground/10 shadow-sm">
                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-semibold">
                              {getInitials(message.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-sm text-foreground truncate">
                              {message.fullName || "Anonymous"}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                              {message.email || "No email"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Subject */}
                      <TableCell className="font-medium text-sm max-w-[200px] truncate text-foreground">
                        {message.subject || "No Subject"}
                      </TableCell>

                      {/* Message Preview */}
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[300px] truncate">
                        {message.message || "—"}
                      </TableCell>

                      {/* Submitted Date */}
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(message.createdAt)}</span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>{getStatusBadge(message.status)}</TableCell>

                      {/* Actions */}
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title="View Details"
                            onClick={() => handleViewDetails(message)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {message.status === "PENDING" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                                title="Approve"
                                disabled={actionLoading !== null}
                                onClick={() => handleMessageAction(message.requestId, "approve")}
                              >
                                {actionLoading === message.requestId ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                                title="Reject"
                                disabled={actionLoading !== null}
                                onClick={() => handleMessageAction(message.requestId, "reject")}
                              >
                                {actionLoading === message.requestId ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-36 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Inbox className="h-8 w-8 text-muted-foreground/60" />
                        <span className="text-sm">No messages found</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-xl sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Message Details</DialogTitle>
            <DialogDescription>
              Submitted on {selectedMessage && formatDate(selectedMessage.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-6 py-4">
              {/* Sender Details */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/40 border border-muted/30">
                <Avatar className="h-12 w-12 border border-muted-foreground/10 shadow-sm">
                  <AvatarFallback className="bg-primary/5 text-primary text-sm font-semibold">
                    {getInitials(selectedMessage.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-base text-foreground leading-tight">
                    {selectedMessage.fullName}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-0.5">{selectedMessage.email}</p>
                </div>
                <div>{getStatusBadge(selectedMessage.status)}</div>
              </div>

              {/* Subject & Message Content */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Subject
                </span>
                <p className="text-sm font-medium text-foreground p-3 rounded-md bg-muted/20 border border-muted/10">
                  {selectedMessage.subject || "No Subject"}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Message Content
                </span>
                <div className="text-sm text-foreground p-4 rounded-md bg-muted/20 border border-muted/10 whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto">
                  {selectedMessage.message || "No message content provided."}
                </div>
              </div>

              {/* Review Details if not PENDING */}
              {selectedMessage.status !== "PENDING" && (
                <div className="grid grid-cols-2 gap-4 border-t pt-4 text-xs text-muted-foreground">
                  <div>
                    <span className="font-semibold">Reviewed By:</span>{" "}
                    {selectedMessage.reviewedBy || "System / Admin"}
                  </div>
                  <div>
                    <span className="font-semibold">Reviewed At:</span>{" "}
                    {formatDate(selectedMessage.reviewedAt || selectedMessage.updatedAt)}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              Close
            </Button>
            {selectedMessage && selectedMessage.status === "PENDING" && (
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  disabled={actionLoading !== null}
                  onClick={() => handleMessageAction(selectedMessage.requestId, "reject")}
                  className="gap-1.5"
                >
                  {actionLoading === selectedMessage.requestId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  Reject Message
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                  disabled={actionLoading !== null}
                  onClick={() => handleMessageAction(selectedMessage.requestId, "approve")}
                >
                  {actionLoading === selectedMessage.requestId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Approve Message
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
