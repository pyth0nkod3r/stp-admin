import React, { useState } from "react";
import { 
  Download, ShieldCheck, FileText, Trash2, 
  Lock, History, Info, Plus, Moon, Sun, 
  KeyRound, Mail, Check,
  ShieldUser
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

export default function SystemManagementPage() {
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const exportData = (type: string) => {
    toast.info(`Generating ${type} export...`);
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Admin invitation sent successfully");
    setIsAdminModalOpen(false);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">System & Management</h2>
        <p className="text-muted-foreground">Manage the STP Alumni governance, security, and data.</p>
      </div>

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="reports">Data Exports</TabsTrigger>
          <TabsTrigger value="governance">Platform Rules</TabsTrigger>
          <TabsTrigger value="admins">Admin Access</TabsTrigger>
          <TabsTrigger value="settings">My Settings</TabsTrigger>
        </TabsList>

        {/* --- DATA EXPORTS --- */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ExportCard 
              title="Full Alumni Registry" 
              desc="Names, emails, graduation years, and verification status."
              onExport={() => exportData("Registry")}
            />
            <ExportCard 
              title="Marketplace Activity" 
              desc="Log of 'Connect' clicks and service inquiries."
              onExport={() => exportData("Marketplace")}
            />
            <ExportCard 
              title="Opportunity Logs" 
              desc="Record of Deal Room requests and document access."
              onExport={() => exportData("Deal Rooms")}
            />
          </div>
        </TabsContent>

        {/* --- GOVERNANCE --- */}
        <TabsContent value="governance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content & Privacy Rules</CardTitle>
              <CardDescription>Control how alumni interact with the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RuleToggle 
                label="Strict Verification" 
                desc="Users cannot see directory details until verified by an admin." 
                defaultChecked 
              />
              <RuleToggle 
                label="Opportunity Moderation" 
                desc="Require admin approval before a new 'Deal Room' goes live." 
                defaultChecked 
              />
              <RuleToggle 
                label="Allow Guest View" 
                desc="Enable a limited landing page for unauthenticated visitors." 
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- ADMIN ACCESS (With Working Modal) --- */}
        <TabsContent value="admins" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>System Administrators</CardTitle>
                <CardDescription>Manage team members with dashboard access.</CardDescription>
              </div>
              
              <Dialog open={isAdminModalOpen} onOpenChange={setIsAdminModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Add Admin</Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleAddAdmin}>
                    <DialogHeader>
                      <DialogTitle>Invite New Administrator</DialogTitle>
                      <DialogDescription>
                        Send an invitation to a team member to manage the STP platform.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="e.g. Jane Doe" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Work Email</Label>
                        <Input id="email" type="email" placeholder="jane@stp-alumni.edu" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Access Level</Label>
                        <Select defaultValue="editor">
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="owner">Owner (Full Access)</SelectItem>
                            <SelectItem value="editor">Editor (Content & Users)</SelectItem>
                            <SelectItem value="viewer">Viewer (Reports Only)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="ghost" onClick={() => setIsAdminModalOpen(false)}>Cancel</Button>
                      <Button type="submit">Send Invite</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Super Admin", email: "admin@stp-alumni.edu", role: "Owner" },
                  { name: "Registrar Office", email: "verify@stp-alumni.edu", role: "Editor" },
                ].map((admin, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShieldUser className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{admin.name}</p>
                        <p className="text-xs text-muted-foreground">{admin.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">{admin.role}</Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- SETTINGS: Security & Appearance --- */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5" /> Security
                </CardTitle>
                <CardDescription>Update your administrator password.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input type="password" />
                </div>
                <Button className="w-full">Update Password</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="h-5 w-5" /> Appearance
                </CardTitle>
                <CardDescription>Personalize your dashboard experience.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-xs text-muted-foreground">Switch between light and dark themes.</p>
                  </div>
                  <Switch />
                </div>
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex gap-2">
                    {['bg-slate-950', 'bg-blue-600', 'bg-emerald-600', 'bg-indigo-600'].map((color) => (
                      <button key={color} className={`h-6 w-6 rounded-full ${color} border-2 border-transparent hover:border-white`} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Sub-components for cleaner code
function RuleToggle({ label, desc, defaultChecked = false }: any) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="space-y-0.5">
        <Label className="text-sm font-semibold">{label}</Label>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

function ExportCard({ title, desc, onExport }: any) {
  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
        <CardDescription className="text-xs line-clamp-2">{desc}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onExport} variant="outline" size="sm" className="w-full">
          <Download className="h-3.5 w-3.5 mr-2" /> Download CSV
        </Button>
      </CardContent>
    </Card>
  );
}

function Badge({ children, variant, className }: any) {
  const styles = variant === "secondary" ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground";
  return (
    <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${styles} ${className}`}>
      {children}
    </span>
  );
}