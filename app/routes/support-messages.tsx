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
  HelpCircle,
  Mail,
  RefreshCw,
  MessageSquare,
  ShieldCheck,
  UserPlus
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { fetchSupportMessages, updateSupportMessageStatus } from "@/services/apiSupportMessages";
import {
  fetchSupportTickets,
  fetchUnreadSupportCount,
  updateSupportTicketStatus,
  type SupportTicket,
} from "@/services/apiSupport";
import type { SupportMessage } from "@/lib/type";

export default function SupportMessagesPage() {
  const [activeMainTab, setActiveMainTab] = useState<"tickets" | "requests">("tickets");

  // ================= 1. USER SUPPORT TICKETS STATE (/backoffice/support) =================
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState<string | null>(null);
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>("UNREAD");
  const [ticketSearchTerm, setTicketSearchTerm] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketDetailOpen, setTicketDetailOpen] = useState(false);
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);

  const loadSupportTickets = async (status: string) => {
    setTicketsLoading(true);
    setTicketsError(null);
    try {
      const res = await fetchSupportTickets(status);
      setTickets(res.data);
    } catch (err: any) {
      const msg = err?.message || "Failed to load support tickets from backend";
      setTicketsError(msg);
    } finally {
      setTicketsLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await fetchUnreadSupportCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to load unread support count", err);
    }
  };

  useEffect(() => {
    loadSupportTickets(ticketStatusFilter);
    loadUnreadCount();
  }, [ticketStatusFilter]);

  const handleResolveTicket = async (ticket: SupportTicket) => {
    const id = ticket.supportId || ticket.id;
    if (!id) return;
    setResolvingTicketId(id);
    try {
      await updateSupportTicketStatus(id, "RESOLVED");
      toast.success("Support ticket marked as resolved");
      if (selectedTicket?.supportId === id || selectedTicket?.id === id) {
        setTicketDetailOpen(false);
        setSelectedTicket(null);
      }
      await Promise.all([
        loadSupportTickets(ticketStatusFilter),
        loadUnreadCount(),
      ]);
    } catch (err: any) {
      toast.error(err?.message || "Failed to resolve ticket");
    } finally {
      setResolvingTicketId(null);
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const term = ticketSearchTerm.toLowerCase();
      return (
        (t.userName && t.userName.toLowerCase().includes(term)) ||
        (t.userEmail && t.userEmail.toLowerCase().includes(term)) ||
        (t.subject && t.subject.toLowerCase().includes(term)) ||
        (t.message && t.message.toLowerCase().includes(term))
      );
    });
  }, [tickets, ticketSearchTerm]);

  // ================= 2. ACCOUNT REQUESTS STATE (/backoffice/account-requests) =================
  const [requests, setRequests] = useState<SupportMessage[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>("PENDING");
  const [requestSearchTerm, setRequestSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<SupportMessage | null>(null);
  const [requestDetailOpen, setRequestDetailOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [requestStats, setRequestStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [requestStatsLoading, setRequestStatsLoading] = useState(true);

  const loadRequestStats = async () => {
    try {
      setRequestStatsLoading(true);
      const [allRes, pendingRes, approvedRes, rejectedRes] = await Promise.allSettled([
        fetchSupportMessages(),
        fetchSupportMessages("PENDING"),
        fetchSupportMessages("APPROVED"),
        fetchSupportMessages("REJECTED"),
      ]);

      let pending = 0;
      let approved = 0;
      let rejected = 0;

      if (pendingRes.status === "fulfilled") {
        pending = pendingRes.value.pagination?.totalItems ?? pendingRes.value.data.length;
      }
      if (approvedRes.status === "fulfilled") {
        approved = approvedRes.value.pagination?.totalItems ?? approvedRes.value.data.length;
      }
      if (rejectedRes.status === "fulfilled") {
        rejected = rejectedRes.value.pagination?.totalItems ?? rejectedRes.value.data.length;
      }

      if (pending === 0 && approved === 0 && rejected === 0 && allRes.status === "fulfilled") {
        const allData = allRes.value.data || [];
        pending = allData.filter((m) => m.status === "PENDING").length;
        approved = allData.filter((m) => m.status === "APPROVED").length;
        rejected = allData.filter((m) => m.status === "REJECTED").length;
      }

      setRequestStats({ pending, approved, rejected });
    } catch (err) {
      console.error("Failed to load request stats:", err);
    } finally {
      setRequestStatsLoading(false);
    }
  };

  const loadAccountRequests = async (status: string) => {
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const apiStatus = status === "ALL" ? undefined : status;
      const response = await fetchSupportMessages(apiStatus);
      setRequests(response.data);
    } catch (err: any) {
      setRequestsError(err?.message || "Failed to load account requests from backend");
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    loadAccountRequests(requestStatusFilter);
    loadRequestStats();
  }, [requestStatusFilter]);

  const handleRequestAction = async (requestId: string, action: "approve" | "reject") => {
    setActionLoading(requestId);
    try {
      await updateSupportMessageStatus(requestId, action);
      toast.success(`Account request ${action}d successfully`);
      if (selectedRequest?.requestId === requestId) {
        setRequestDetailOpen(false);
        setSelectedRequest(null);
      }
      await Promise.all([
        loadAccountRequests(requestStatusFilter),
        loadRequestStats(),
      ]);
    } catch (err: any) {
      toast.error(err?.message || `Failed to ${action} request`);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((msg) => {
      const term = requestSearchTerm.toLowerCase();
      return (
        (msg.fullName && msg.fullName.toLowerCase().includes(term)) ||
        (msg.email && msg.email.toLowerCase().includes(term)) ||
        (msg.subject && msg.subject.toLowerCase().includes(term)) ||
        (msg.message && msg.message.toLowerCase().includes(term))
      );
    });
  }, [requests, requestSearchTerm]);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
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

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Support & Inquiries Hub</h2>
          <p className="text-muted-foreground text-sm">
            Manage user-submitted support inquiries and prospective alumni membership requests.
          </p>
        </div>
      </div>

      <Tabs value={activeMainTab} onValueChange={(val: any) => setActiveMainTab(val)} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span>Alumni Support</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="h-4 px-1.5 text-[10px] font-bold rounded-full ml-1">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span>Account Requests</span>
            {requestStats.pending > 0 && (
              <Badge variant="secondary" className="h-4 px-1.5 text-[10px] font-bold rounded-full ml-1">
                {requestStats.pending}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* TAB 1: ALUMNI SUPPORT TICKETS (/backoffice/support) */}
        {/* ========================================================================= */}
        <TabsContent value="tickets" className="space-y-6 mt-0">
          {/* Quick Metrics */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unread Tickets</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unreadCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Pending response from support admin</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ticket Scope</CardTitle>
                <MessageSquare className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tickets.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Loaded for {ticketStatusFilter} status</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Support Channel</CardTitle>
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active</div>
                <p className="text-xs text-muted-foreground mt-1">Connected to Backoffice Support API</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Status Filters */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-1 items-center gap-2 max-w-sm">
                  <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search support tickets..."
                      value={ticketSearchTerm}
                      onChange={(e) => setTicketSearchTerm(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground font-medium">Status:</span>
                  {(["UNREAD", "RESOLVED", "ALL"] as const).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={ticketStatusFilter === status ? "default" : "outline"}
                      onClick={() => setTicketStatusFilter(status)}
                      className="h-8 text-xs capitalize"
                    >
                      {status.toLowerCase()}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      loadSupportTickets(ticketStatusFilter);
                      loadUnreadCount();
                    }}
                    className="h-8 w-8 text-muted-foreground"
                    title="Refresh Tickets"
                    disabled={ticketsLoading}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${ticketsLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Server Error Display */}
              {ticketsError && (
                <div className="p-4 m-4 border border-destructive/30 bg-destructive/10 rounded-lg flex items-center justify-between">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-xs text-destructive">Backend Request Failed</p>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">{ticketsError}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="w-[200px]">User</TableHead>
                      <TableHead className="w-[220px]">Subject</TableHead>
                      <TableHead className="hidden md:table-cell">Message Preview</TableHead>
                      <TableHead className="w-[140px]">Date</TableHead>
                      <TableHead className="w-[110px]">Status</TableHead>
                      <TableHead className="text-right w-[140px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ticketsLoading ? (
                      <tr>
                        <td colSpan={6} className="h-36 text-center">
                          <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-sm">Loading support tickets...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredTickets.length > 0 ? (
                      filteredTickets.map((t) => (
                        <tr key={t.supportId || t.id} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <Avatar className="h-8 w-8 border">
                                <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                                  {getInitials(t.userName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-medium text-xs text-foreground truncate">{t.userName}</p>
                                <p className="text-[11px] text-muted-foreground truncate font-mono">{t.userEmail}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-xs text-foreground line-clamp-1">{t.subject}</span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[340px]">
                              {t.message || "—"}
                            </p>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(t.createdAt)}
                          </TableCell>
                          <TableCell>
                            {t.status === "RESOLVED" ? (
                              <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-[11px]">
                                Resolved
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/20 text-[11px]">
                                Unread
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs px-2"
                                onClick={() => {
                                  setSelectedTicket(t);
                                  setTicketDetailOpen(true);
                                }}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" /> View
                              </Button>
                              {t.status !== "RESOLVED" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 px-2"
                                  onClick={() => handleResolveTicket(t)}
                                  disabled={resolvingTicketId === (t.supportId || t.id)}
                                >
                                  {resolvingTicketId === (t.supportId || t.id) ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5 mr-1" />
                                  )}
                                  Resolve
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="h-36 text-center text-muted-foreground">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <HelpCircle className="h-8 w-8 text-muted-foreground/40" />
                            <span className="text-sm">No support tickets found for this criteria</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* TAB 2: MEMBERSHIP ACCOUNT REQUESTS (/backoffice/account-requests) */}
        {/* ========================================================================= */}
        <TabsContent value="requests" className="space-y-6 mt-0">
          {/* Stats Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {requestStatsLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : requestStats.pending}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Requires admin review & onboarding</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Requests</CardTitle>
                <UserCheck className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {requestStatsLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : requestStats.approved}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Accepted alumni membership requests</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected Requests</CardTitle>
                <UserX className="h-4 w-4 text-rose-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {requestStatsLoading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : requestStats.rejected}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Declined applications</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-1 items-center gap-2 max-w-sm">
                  <div className="relative w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search prospective requests..."
                      value={requestSearchTerm}
                      onChange={(e) => setRequestSearchTerm(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground font-medium">Status:</span>
                  {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={requestStatusFilter === status ? "default" : "outline"}
                      onClick={() => setRequestStatusFilter(status)}
                      className="h-8 text-xs capitalize"
                    >
                      {status.toLowerCase()}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      loadAccountRequests(requestStatusFilter);
                      loadRequestStats();
                    }}
                    className="h-8 w-8 text-muted-foreground"
                    title="Refresh Requests"
                    disabled={requestsLoading}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${requestsLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {requestsError && (
                <div className="p-4 m-4 border border-destructive/30 bg-destructive/10 rounded-lg flex items-center justify-between">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-xs text-destructive">Backend Request Failed</p>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">{requestsError}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="w-[200px]">Applicant</TableHead>
                      <TableHead className="w-[220px]">Subject</TableHead>
                      <TableHead className="hidden md:table-cell">Note Preview</TableHead>
                      <TableHead className="w-[140px]">Date</TableHead>
                      <TableHead className="w-[110px]">Status</TableHead>
                      <TableHead className="text-right w-[180px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requestsLoading ? (
                      <tr>
                        <td colSpan={6} className="h-36 text-center">
                          <div className="flex items-center justify-center gap-2 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span className="text-sm">Loading account requests...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredRequests.length > 0 ? (
                      filteredRequests.map((msg) => (
                        <tr key={msg.requestId} className="border-b last:border-0 hover:bg-muted/10 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <Avatar className="h-8 w-8 border">
                                <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                                  {getInitials(msg.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-medium text-xs text-foreground truncate">{msg.fullName}</p>
                                <p className="text-[11px] text-muted-foreground truncate font-mono">{msg.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-xs text-foreground line-clamp-1">{msg.subject}</span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[340px]">
                              {msg.message || "—"}
                            </p>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDate(msg.createdAt)}
                          </TableCell>
                          <TableCell>
                            {msg.status === "APPROVED" ? (
                              <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-[11px]">
                                Approved
                              </Badge>
                            ) : msg.status === "REJECTED" ? (
                              <Badge variant="destructive" className="text-[11px]">
                                Rejected
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/20 text-[11px]">
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs px-2"
                                onClick={() => {
                                  setSelectedRequest(msg);
                                  setRequestDetailOpen(true);
                                }}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" /> View
                              </Button>

                              {msg.status === "PENDING" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 px-2"
                                    onClick={() => handleRequestAction(msg.requestId, "approve")}
                                    disabled={actionLoading === msg.requestId}
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs border-rose-300 text-rose-700 hover:bg-rose-50 px-2"
                                    onClick={() => handleRequestAction(msg.requestId, "reject")}
                                    disabled={actionLoading === msg.requestId}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="h-36 text-center text-muted-foreground">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Inbox className="h-8 w-8 text-muted-foreground/40" />
                            <span className="text-sm">No account requests found</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ticket Details Dialog */}
      <Dialog open={ticketDetailOpen} onOpenChange={setTicketDetailOpen}>
        <DialogContent className="max-w-xl sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              Support Ticket Details
            </DialogTitle>
            <DialogDescription>
              Submitted on {selectedTicket && formatDate(selectedTicket.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4 py-3">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/40 border border-muted/30">
                <Avatar className="h-10 w-10 border">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {getInitials(selectedTicket.userName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-foreground">{selectedTicket.userName}</h4>
                  <p className="text-xs text-muted-foreground font-mono">{selectedTicket.userEmail}</p>
                </div>
                <div>
                  <Badge variant={selectedTicket.status === "RESOLVED" ? "secondary" : "default"}>
                    {selectedTicket.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Subject</span>
                <p className="text-sm font-medium p-3 rounded-md bg-muted/20 border">{selectedTicket.subject}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Inquiry Message</span>
                <div className="text-sm p-4 rounded-md bg-muted/20 border whitespace-pre-wrap leading-relaxed max-h-[220px] overflow-y-auto">
                  {selectedTicket.message}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setTicketDetailOpen(false)}>
              Close
            </Button>
            {selectedTicket && selectedTicket.status !== "RESOLVED" && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                onClick={() => handleResolveTicket(selectedTicket)}
                disabled={resolvingTicketId !== null}
              >
                {resolvingTicketId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Mark as Resolved
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Request Details Dialog */}
      <Dialog open={requestDetailOpen} onOpenChange={setRequestDetailOpen}>
        <DialogContent className="max-w-xl sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Account Request Details
            </DialogTitle>
            <DialogDescription>
              Submitted on {selectedRequest && formatDate(selectedRequest.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-3">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/40 border border-muted/30">
                <Avatar className="h-10 w-10 border">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {getInitials(selectedRequest.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-foreground">{selectedRequest.fullName}</h4>
                  <p className="text-xs text-muted-foreground font-mono">{selectedRequest.email}</p>
                </div>
                <div>
                  <Badge variant={selectedRequest.status === "APPROVED" ? "default" : selectedRequest.status === "REJECTED" ? "destructive" : "secondary"}>
                    {selectedRequest.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Subject</span>
                <p className="text-sm font-medium p-3 rounded-md bg-muted/20 border">{selectedRequest.subject}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Application Note</span>
                <div className="text-sm p-4 rounded-md bg-muted/20 border whitespace-pre-wrap leading-relaxed max-h-[220px] overflow-y-auto">
                  {selectedRequest.message}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRequestDetailOpen(false)}>
              Close
            </Button>
            {selectedRequest && selectedRequest.status === "PENDING" && (
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  disabled={actionLoading !== null}
                  onClick={() => handleRequestAction(selectedRequest.requestId, "reject")}
                >
                  Reject Request
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={actionLoading !== null}
                  onClick={() => handleRequestAction(selectedRequest.requestId, "approve")}
                >
                  Approve Request
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
