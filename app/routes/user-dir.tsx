import React, { useState, useMemo } from "react";
import {
  MoreHorizontal,
  Search,
  UserPlus,
  GraduationCap,
  ShieldCheck,
  Clock,
  Trash2,
  ExternalLink,
  Filter,
  Loader2,
  FileDown,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Settings
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useUsers, useAllUsers } from "@/hooks/useUsers";
import { createUser, verifyUser, deleteUser, activateUser, deactivateUser, lockUser, unlockUser, changeUserRole } from "@/services/apiUsers";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@/lib/type";

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
};

export default function UserDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const handleStatusFilter = (filter: string) => {
    setStatusFilter(filter);
    setPage(1);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ firstName: "", lastName: "", emailAddress: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [roleChangeOpen, setRoleChangeOpen] = useState(false);
  const [userToChangeRole, setUserToChangeRole] = useState<User | null>(null);
  const [newRole, setNewRole] = useState("");
  const [isChangingRole, setIsChangingRole] = useState(false);
  const queryClient = useQueryClient();

  const { data: usersResponse, isLoading, error, hasNextPage } = useUsers(page, perPage);
  const users = usersResponse?.data ?? [];

  // Fetch all users for stat counts (independent of pagination)
  const { data: allUsersResponse, isLoading: allUsersLoading } = useAllUsers();
  const allUsers = allUsersResponse?.data ?? [];
  const totalCount = allUsers.length;
  const verifiedCount = allUsers.filter((u: User) => u.isVerified).length;
  const pendingCount = allUsers.filter((u: User) => !u.isVerified).length;

  // When filtering/searching, apply across all users (not just the current page)
  const isFiltering = statusFilter !== "ALL" || searchTerm !== "";

  const filteredUsers = useMemo(() => {
    // Use allUsers as source when filtering so results aren't limited to current page
    const source = isFiltering ? allUsers : users;

    let result = source;

    if (statusFilter === "VERIFIED") {
      result = result.filter(p => p.isVerified);
    } else if (statusFilter === "PENDING") {
      result = result.filter(p => !p.isVerified);
    }

    return result.filter((person) => {
      const searchable = [
        person.firstName,
        person.lastName,
        person.email,
        person.role,
      ];
      return searchable.some((val) =>
        val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [searchTerm, users, allUsers, statusFilter, isFiltering]);

  // When filtering client-side, paginate the filtered results manually
  const displayedUsers = isFiltering
    ? filteredUsers.slice((page - 1) * perPage, page * perPage)
    : filteredUsers;
  const totalFilteredPages = isFiltering ? Math.ceil(filteredUsers.length / perPage) : null;
  const showNextPage = isFiltering ? page < (totalFilteredPages ?? 1) : hasNextPage;

  const handleExportCSV = () => {
    const exportData = allUsers.map(u => ({
      "First Name": u.firstName,
      "Last Name": u.lastName,
      "Email Address": u.email,
      "Status": u.isVerified ? "Verified Alumni" : "Pending",
      "Role": u.role || "USER",
    }));

    if (exportData.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = Object.keys(exportData[0]).join(",");
    const rows = exportData.map(obj => Object.values(obj).map(val => `"${val}"`).join(","));
    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `alumni_directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported successfully");
  };

  const handleDelete = async (user: User) => {
    setUserToDelete(user);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      await deleteUser(userToDelete.userId);
      toast.success("User deleted successfully");
      setDeleteOpen(false);
      setUserToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users-all"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVerify = async (userId: string) => {
    try {
      await verifyUser(userId);
      toast.success("User verified successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users-all"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to verify user");
    }
  };

  const handleViewProfile = (user: User) => {
    setSelectedUser(user);
    setProfileOpen(true);
  };

  const handleActivateUser = async (userId: string) => {
    try {
      await activateUser(userId);
      toast.success("User activated successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users-all"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to activate user");
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      await deactivateUser(userId);
      toast.success("User deactivated successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users-all"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to deactivate user");
    }
  };

  const handleLockUser = async (userId: string) => {
    try {
      await lockUser(userId);
      toast.success("User locked successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users-all"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to lock user");
    }
  };

  const handleUnlockUser = async (userId: string) => {
    try {
      await unlockUser(userId);
      toast.success("User unlocked successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users-all"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to unlock user");
    }
  };

  const handleChangeRole = (user: User) => {
    setUserToChangeRole(user);
    setNewRole(user.role || "USER");
    setRoleChangeOpen(true);
  };

  const confirmChangeRole = async () => {
    if (!userToChangeRole || !newRole) return;

    setIsChangingRole(true);
    try {
      await changeUserRole(userToChangeRole.userId, newRole);
      toast.success("User role changed successfully");
      setRoleChangeOpen(false);
      setUserToChangeRole(null);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users-all"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to change user role");
    } finally {
      setIsChangingRole(false);
    }
  };

  const handleAddAlumni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.firstName || !addForm.lastName || !addForm.emailAddress) {
      toast.error("All fields are required");
      return;
    }
    setIsSubmitting(true);
    try {
      await createUser(addForm);
      toast.success("Alumni added successfully");
      setAddForm({ firstName: "", lastName: "", emailAddress: "" });
      setAddOpen(false);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users-all"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to add alumni");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatus = (user: User) => {
    if (user.isVerified) return "Verified Alumni";
    // TODO: Map additional statuses (e.g., isLocked → "Flagged")
    return "Pending";
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Alumni Directory</h2>
          <p className="text-muted-foreground text-sm">Manage and verify your university alumni network.</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto">
              <UserPlus className="mr-2 h-4 w-4" /> Add Alumni
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Alumni</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new alumni to the directory.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddAlumni} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  value={addForm.firstName}
                  onChange={(e) => setAddForm((f) => ({ ...f, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  value={addForm.lastName}
                  onChange={(e) => setAddForm((f) => ({ ...f, lastName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailAddress">Email Address</Label>
                <Input
                  id="emailAddress"
                  type="email"
                  placeholder="Enter email address"
                  value={addForm.emailAddress}
                  onChange={(e) => setAddForm((f) => ({ ...f, emailAddress: e.target.value }))}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Alumni
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Alumni" value={totalCount} icon={<GraduationCap />} sub="Total registered alumni" loading={allUsersLoading} />
        <StatCard title="Verified Alumni" value={verifiedCount} icon={<ShieldCheck />} sub="Officially verified alumni" loading={allUsersLoading} />
        <StatCard title="Pending Review" value={pendingCount} icon={<Clock />} sub="Awaiting admin approval" color="text-orange-500" loading={allUsersLoading} />
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alumni..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="outline" size="sm" className="hidden sm:flex">
                     <Filter className="mr-2 h-4 w-4" /> 
                     {statusFilter === "ALL" ? "Filter" : statusFilter === "VERIFIED" ? "Verified" : "Pending"}
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end">
                   <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                   <DropdownMenuItem className="cursor-pointer" onClick={() => handleStatusFilter("ALL")}>All Alumni</DropdownMenuItem>
                   <DropdownMenuItem className="cursor-pointer" onClick={() => handleStatusFilter("VERIFIED")}>Verified Alumni</DropdownMenuItem>
                   <DropdownMenuItem className="cursor-pointer" onClick={() => handleStatusFilter("PENDING")}>Pending Approval</DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
               <Button variant="outline" size="sm" onClick={handleExportCSV}>
                 <FileDown className="mr-2 h-4 w-4" /> Export CSV
               </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="rounded-md border-t sm:border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[250px]">Alumni</TableHead>
                  {/* TODO: Add "Class" column when API provides graduation year */}
                  <TableHead className="hidden md:table-cell">Class</TableHead>
                  {/* TODO: Add "Major" column when API provides major/department */}
                  <TableHead className="hidden lg:table-cell">Major</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading users...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-destructive">
                      Failed to load users. Please try again.
                    </TableCell>
                  </TableRow>
                ) : displayedUsers.length > 0 ? (
                  displayedUsers.map((person) => (
                    <TableRow key={person.userId} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(person.firstName, person.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium truncate text-sm sm:text-base">
                              {person.firstName} {person.lastName}
                            </span>
                            <span className="text-xs text-muted-foreground truncate hidden sm:block">
                              {person.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      {/* TODO: Replace with actual graduation class when available from API */}
                      <TableCell className="hidden md:table-cell text-muted-foreground">—</TableCell>
                      {/* TODO: Replace with actual major when available from API */}
                      <TableCell className="hidden lg:table-cell text-muted-foreground">—</TableCell>
                      <TableCell>
                        <Badge variant={
                          getStatus(person) === "Verified Alumni" ? "default" :
                          getStatus(person) === "Pending" ? "secondary" : "destructive"
                        } className="text-[10px] sm:text-xs">
                          {getStatus(person)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                           <DropdownMenuContent align="end" className="w-40">
                             <DropdownMenuLabel>Options</DropdownMenuLabel>
                             <DropdownMenuItem
                               className="cursor-pointer"
                               onClick={() => handleViewProfile(person)}
                             >
                               <ExternalLink className="mr-2 h-4 w-4" /> View Profile
                             </DropdownMenuItem>
                             {!person.isVerified && (
                               <DropdownMenuItem
                                 className="cursor-pointer text-blue-600"
                                 onClick={() => handleVerify(person.userId)}
                               >
                                 <ShieldCheck className="mr-2 h-4 w-4" /> Verify
                               </DropdownMenuItem>
                             )}
                             <DropdownMenuItem
                               className="cursor-pointer"
                               onClick={() => handleChangeRole(person)}
                             >
                               <Settings className="mr-2 h-4 w-4" /> Change Role
                             </DropdownMenuItem>
                             {person.isActive ? (
                               <DropdownMenuItem
                                 className="cursor-pointer text-orange-600"
                                 onClick={() => handleDeactivateUser(person.userId)}
                               >
                                 <UserX className="mr-2 h-4 w-4" /> Deactivate User
                               </DropdownMenuItem>
                             ) : (
                               <DropdownMenuItem
                                 className="cursor-pointer text-green-600"
                                 onClick={() => handleActivateUser(person.userId)}
                               >
                                 <UserCheck className="mr-2 h-4 w-4" /> Activate User
                               </DropdownMenuItem>
                             )}
                             {person.isLocked ? (
                               <DropdownMenuItem
                                 className="cursor-pointer text-green-600"
                                 onClick={() => handleUnlockUser(person.userId)}
                               >
                                 <Unlock className="mr-2 h-4 w-4" /> Unlock User
                               </DropdownMenuItem>
                             ) : (
                               <DropdownMenuItem
                                 className="cursor-pointer text-orange-600"
                                 onClick={() => handleLockUser(person.userId)}
                               >
                                 <Lock className="mr-2 h-4 w-4" /> Lock User
                               </DropdownMenuItem>
                             )}
                             <DropdownMenuSeparator />
                             <DropdownMenuItem
                               className="text-destructive cursor-pointer"
                               onClick={() => handleDelete(person)}
                             >
                               <Trash2 className="mr-2 h-4 w-4" /> Delete
                             </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No alumni found matching "{searchTerm}"
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination - only show when there are multiple pages */}
          {!isLoading && !error && (page > 1 || showNextPage) && (
            <div className="flex items-center justify-end gap-2 py-4 px-2">
              {page > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
              )}
              <span className="text-sm text-muted-foreground">Page {page}</span>
              {showNextPage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile View Dialog */}
      <ProfileViewDialog
        user={selectedUser}
        open={profileOpen}
        onOpenChange={setProfileOpen}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        user={userToDelete}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={confirmDelete}
      />

      {/* Change Role Dialog */}
      <ChangeRoleDialog
        user={userToChangeRole}
        open={roleChangeOpen}
        onOpenChange={setRoleChangeOpen}
        newRole={newRole}
        onRoleChange={setNewRole}
        onConfirm={confirmChangeRole}
        isLoading={isChangingRole}
      />

      {/*
        TODO: The following API response fields are not yet displayed in the UI:
        - role (USER / BACKOFFICE)
        - isOnboarded
        - passwordChangeRequired
        - isActive
        - isLocked
        - lastLogin
        - createdAt
        - updatedAt
      */}
    </div>
  );
}

// Profile View Dialog Component
function ProfileViewDialog({ user, open, onOpenChange }: { user: User | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            Detailed information about {user.firstName} {user.lastName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{user.firstName} {user.lastName}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge variant={user.isVerified ? "default" : "secondary"} className="mt-1">
                {user.isVerified ? "Verified" : "Pending"}
              </Badge>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Role:</span>
              <span className="text-sm text-muted-foreground">{user.role || "USER"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Status:</span>
              <span className="text-sm text-muted-foreground">
                {user.isActive ? "Active" : "Inactive"}
                {user.isLocked && " (Locked)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Onboarded:</span>
              <span className="text-sm text-muted-foreground">{user.isOnboarded ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Password Change Required:</span>
              <span className="text-sm text-muted-foreground">{user.passwordChangeRequired ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Last Login:</span>
              <span className="text-sm text-muted-foreground">
                {user.lastLogin ? formatDate(user.lastLogin) : "Never"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Created:</span>
              <span className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Updated:</span>
              <span className="text-sm text-muted-foreground">{formatDate(user.updatedAt)}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Delete Confirmation Dialog Component
function DeleteConfirmationDialog({ user, open, onOpenChange, onConfirm }: {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {user?.firstName} {user?.lastName}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Change Role Dialog Component
function ChangeRoleDialog({
  user,
  open,
  onOpenChange,
  newRole,
  onRoleChange,
  onConfirm,
  isLoading
}: {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newRole: string;
  onRoleChange: (role: string) => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  const roles = [
    { value: "USER", label: "User" },
    { value: "BACKOFFICE", label: "Back Office" },
    { value: "ADMIN", label: "Administrator" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogDescription>
            Change the role for {user?.firstName} {user?.lastName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">New Role</Label>
            <Select value={newRole} onValueChange={onRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading || !newRole}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Change Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Reusable Stat Card Component
function StatCard({ title, value, icon, sub, color = "text-muted-foreground", loading = false }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={color}>{React.cloneElement(icon, { size: 16 })}</div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16 mb-1" />
        ) : (
          <div className="text-2xl font-bold">{value !== null && value !== undefined ? value : 0}</div>
        )}
        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">{sub}</p>
      </CardContent>
    </Card>
  );
}
