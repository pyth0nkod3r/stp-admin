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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBackofficeAdmins } from "@/services/apiAdmins";
import { register } from "@/services/apiAuth";
import { fetchUsers } from "@/services/apiUsers";
import {
  sendEmailNotification,
  type SendEmailNotificationPayload,
} from "@/services/apiNotifications";

export default function SystemManagementPage() {
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    recipientId: "",
    type: "SUPPORT_RESPONSE" as SendEmailNotificationPayload["type"],
    message: "",
    link: "",
  });
  const [adminForm, setAdminForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const {
    data: admins = [],
    isLoading: adminsLoading,
    error: adminsError,
  } = useQuery({
    queryKey: ["backoffice-admins"],
    queryFn: fetchBackofficeAdmins,
  });

  const { data: usersResponse, isLoading: usersLoading } = useQuery({
    queryKey: ["notification-users"],
    queryFn: () => fetchUsers(1, 10000),
  });

  const users = usersResponse?.data ?? [];

  const queryClient = useQueryClient();

  const createAdminMutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      toast.success("Admin account created successfully");
      setAdminForm({ firstName: "", lastName: "", email: "", password: "" });
      setIsAdminModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["backoffice-admins"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create admin account");
    },
  });

  const notificationMutation = useMutation({
    mutationFn: sendEmailNotification,
    onSuccess: () => {
      toast.success("Notification email sent successfully");
      setNotificationForm({
        recipientId: "",
        type: "SUPPORT_RESPONSE",
        message: "",
        link: "",
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to send notification email");
    },
  });

  const exportData = (type: string) => {
    toast.info(`Generating ${type} export...`);
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !adminForm.firstName.trim() ||
      !adminForm.lastName.trim() ||
      !adminForm.email.trim() ||
      !adminForm.password
    ) {
      toast.error("Please fill all admin fields.");
      return;
    }

    createAdminMutation.mutate({
      firstName: adminForm.firstName.trim(),
      lastName: adminForm.lastName.trim(),
      email: adminForm.email.trim(),
      emailAddress: adminForm.email.trim(),
      password: adminForm.password,
      is_onboarded: true,
      password_change_required: true,
    });
  };

  const handleSendNotification = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!notificationForm.recipientId.trim()) {
      toast.error("Please enter a recipient user ID.");
      return;
    }

    if (!notificationForm.message.trim()) {
      toast.error("Please enter a message.");
      return;
    }

    notificationMutation.mutate({
      recipient_id: notificationForm.recipientId.trim(),
      type: notificationForm.type,
      context_data: {
        message: notificationForm.message.trim(),
        ...(notificationForm.link.trim() ? { link: notificationForm.link.trim() } : {}),
      },
    });
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
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
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
              title="Networking Activity" 
              desc="Log of 'Connect' clicks and service inquiries."
              onExport={() => exportData("Networking")}
            />
            <ExportCard 
              title="Opportunity Logs" 
              desc="Record of Opportunity requests and document access."
              onExport={() => exportData("Opportunities")}
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
                desc="Require admin approval before a new 'Opportunity' goes live." 
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
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          placeholder="Jane"
                          value={adminForm.firstName}
                          onChange={(event) =>
                            setAdminForm((prev) => ({
                              ...prev,
                              firstName: event.target.value,
                            }))
                          }
                          disabled={createAdminMutation.isPending}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          placeholder="Doe"
                          value={adminForm.lastName}
                          onChange={(event) =>
                            setAdminForm((prev) => ({
                              ...prev,
                              lastName: event.target.value,
                            }))
                          }
                          disabled={createAdminMutation.isPending}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adminEmail">Work Email</Label>
                        <Input
                          id="adminEmail"
                          type="email"
                          placeholder="jane@stp-alumni.edu"
                          value={adminForm.email}
                          onChange={(event) =>
                            setAdminForm((prev) => ({
                              ...prev,
                              email: event.target.value,
                            }))
                          }
                          disabled={createAdminMutation.isPending}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adminPassword">Temporary Password</Label>
                        <Input
                          id="adminPassword"
                          type="password"
                          value={adminForm.password}
                          onChange={(event) =>
                            setAdminForm((prev) => ({
                              ...prev,
                              password: event.target.value,
                            }))
                          }
                          disabled={createAdminMutation.isPending}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsAdminModalOpen(false)}
                        disabled={createAdminMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createAdminMutation.isPending}>
                        {createAdminMutation.isPending ? "Creating..." : "Create Admin"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminsLoading ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    Loading administrators...
                  </div>
                ) : adminsError ? (
                  <div className="p-6 text-center text-sm text-destructive">
                    Failed to load administrators.
                  </div>
                ) : admins.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No administrators found.
                  </div>
                ) : (
                  admins.map((admin) => (
                  <div key={admin.userId || admin.email} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShieldUser className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {`${admin.firstName} ${admin.lastName}`.trim() || admin.email}
                        </p>
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
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" /> Manual Email Dispatch
              </CardTitle>
              <CardDescription>
                Send support responses or operational notifications to a specific user.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSendNotification}>
                <div className="space-y-2">
                  <Label>Recipient</Label>
                  <Select
                    value={notificationForm.recipientId}
                    onValueChange={(value) =>
                      setNotificationForm((prev) => ({
                        ...prev,
                        recipientId: value,
                      }))
                    }
                    disabled={notificationMutation.isPending || usersLoading}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          usersLoading ? "Loading users..." : "Select a user"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.userId} value={user.userId}>
                          {`${user.firstName} ${user.lastName}`.trim() || user.email} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Notification Type</Label>
                  <Select
                    value={notificationForm.type}
                    onValueChange={(value: SendEmailNotificationPayload["type"]) =>
                      setNotificationForm((prev) => ({ ...prev, type: value }))
                    }
                    disabled={notificationMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUPPORT_RESPONSE">Support Response</SelectItem>
                      <SelectItem value="ONBOARDING_WELCOME">Onboarding Welcome</SelectItem>
                      <SelectItem value="EVENT_UPDATE">Event Update</SelectItem>
                      <SelectItem value="NEW_NEWSFEED">New Newsfeed</SelectItem>
                      <SelectItem value="EVENT_APPROVAL_PENDING">Event Approval Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notificationMessage">Message</Label>
                  <Textarea
                    id="notificationMessage"
                    value={notificationForm.message}
                    onChange={(event) =>
                      setNotificationForm((prev) => ({
                        ...prev,
                        message: event.target.value,
                      }))
                    }
                    placeholder="Your issue has been resolved."
                    disabled={notificationMutation.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notificationLink">Link</Label>
                  <Input
                    id="notificationLink"
                    value={notificationForm.link}
                    onChange={(event) =>
                      setNotificationForm((prev) => ({
                        ...prev,
                        link: event.target.value,
                      }))
                    }
                    placeholder="https://stp-alumni-gfa.vercel.app/support"
                    disabled={notificationMutation.isPending}
                  />
                </div>

                <Button type="submit" disabled={notificationMutation.isPending}>
                  {notificationMutation.isPending ? "Sending..." : "Send Email"}
                </Button>
              </form>
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
