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
  Filter
} from "lucide-react"; // or lucide-react
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

// Initial Mock Data
const INITIAL_DATA = [
  { id: 1, name: "Alice Johnson", email: "alice.j@alumni.edu", class: "2018", major: "Computer Science", status: "Verified" },
  { id: 2, name: "Bob Smith", email: "bob.smith@gmail.com", class: "2020", major: "Mechanical Engineering", status: "Pending" },
  { id: 3, name: "Charlie Davis", email: "charlie.d@outlook.com", class: "2015", major: "Business Admin", status: "Verified" },
  { id: 4, name: "Diana Prince", email: "diana.p@alumni.edu", class: "2022", major: "Law", status: "Verified" },
  { id: 5, name: "Edward Norton", email: "ed.norton@tech.com", class: "2019", major: "Psychology", status: "Flagged" },
];

export default function UserDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [alumni, setAlumni] = useState(INITIAL_DATA);

  // Real-time Search Functionality
  const filteredAlumni = useMemo(() => {
    return alumni.filter((person) =>
      Object.values(person).some((val) =>
        val.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, alumni]);

  const handleDelete = (id: number) => {
    setAlumni(alumni.filter(a => a.id !== id));
    toast.error("Alumni record removed locally");
  };

  const handleVerify = (id: number) => {
    setAlumni(alumni.map(a => a.id === id ? { ...a, status: "Verified" } : a));
    toast.success("User verified!");
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Alumni Directory</h2>
          <p className="text-muted-foreground text-sm">Manage and verify your university alumni network.</p>
        </div>
        <Button className="w-full md:w-auto">
          <UserPlus className="mr-2 h-4 w-4" /> Add Alumni
        </Button>
      </div>

      {/* Stats Cards - Horizontal Scroll on Mobile */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Alumni" value={alumni.length} icon={<GraduationCap />} sub="Live count" />
        <StatCard title="Verified" value={alumni.filter(a => a.status === "Verified").length} icon={<ShieldCheck />} sub="Active members" />
        <StatCard title="Pending" value={alumni.filter(a => a.status === "Pending").length} icon={<Mail />} sub="Requires action" color="text-orange-500" />
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
                  <TableHead className="hidden md:table-cell">Class</TableHead>
                  <TableHead className="hidden lg:table-cell">Major</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlumni.length > 0 ? (
                  filteredAlumni.map((person) => (
                    <TableRow key={person.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {person.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium truncate text-sm sm:text-base">{person.name}</span>
                            <span className="text-xs text-muted-foreground truncate hidden sm:block">{person.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{person.class}</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">{person.major}</TableCell>
                      <TableCell>
                        <Badge variant={
                          person.status === "Verified" ? "default" : 
                          person.status === "Pending" ? "secondary" : "destructive"
                        } className="text-[10px] sm:text-xs">
                          {person.status}
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
                            {person.status !== "Verified" && (
                              <DropdownMenuItem 
                                className="cursor-pointer text-blue-600"
                                onClick={() => handleVerify(person.id)}
                              >
                                <ShieldCheck className="mr-2 h-4 w-4" /> Verify
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive cursor-pointer"
                              onClick={() => handleDelete(person.id)}
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
        </CardContent>
      </Card>
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