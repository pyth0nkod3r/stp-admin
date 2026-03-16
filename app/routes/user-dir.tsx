import React, { useState, useMemo } from "react";
import {
  MoreHorizontal,
  Search,
  UserPlus,
  GraduationCap,
  ShieldCheck,
  Mail,
  Trash2,
  ExternalLink,
  Filter,
  Loader2
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
import { toast } from "sonner";
import { useUsers } from "@/hooks/useUsers";
import { createUser } from "@/services/apiUsers";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@/lib/type";

export default function UserDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ firstName: "", lastName: "", emailAddress: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const { data: usersResponse, isLoading, error, hasNextPage } = useUsers(page, perPage);
  const users = usersResponse?.data ?? [];

  // Real-time Search Functionality
  const filteredUsers = useMemo(() => {
    return users.filter((person) => {
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
  }, [searchTerm, users]);

  const verifiedCount = users.filter((u) => u.isVerified).length;
  const pendingCount = users.filter((u) => !u.isVerified).length;

  // TODO: Implement delete via API endpoint
  const handleDelete = (userId: string) => {
    toast.error("Delete not yet connected to API");
  };

  // TODO: Implement verify via API endpoint
  const handleVerify = (userId: string) => {
    toast.success("Verify not yet connected to API");
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
    } catch (err: any) {
      toast.error(err.message || "Failed to add alumni");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
  };

  const getStatus = (user: User) => {
    if (user.isVerified) return "Verified";
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
        <StatCard title="Total Alumni" value={users.length} icon={<GraduationCap />} sub="Live count" />
        <StatCard title="Verified" value={verifiedCount} icon={<ShieldCheck />} sub="Active members" />
        <StatCard title="Pending" value={pendingCount} icon={<Mail />} sub="Requires action" color="text-orange-500" />
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
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
               <Button variant="outline" size="sm" className="hidden sm:flex">
                 <Filter className="mr-2 h-4 w-4" /> Filter
               </Button>
               <Button variant="outline" size="sm">Export CSV</Button>
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
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((person) => (
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
                          getStatus(person) === "Verified" ? "default" :
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
                            <DropdownMenuItem className="cursor-pointer">
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive cursor-pointer"
                              onClick={() => handleDelete(person.userId)}
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
          {!isLoading && !error && (page > 1 || hasNextPage) && (
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
              {hasNextPage && (
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

// Reusable Stat Card Component
function StatCard({ title, value, icon, sub, color = "text-muted-foreground" }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={color}>{React.cloneElement(icon, { size: 16 })}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">{sub}</p>
      </CardContent>
    </Card>
  );
}
