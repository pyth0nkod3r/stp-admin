import React, { useState } from "react";
import {
  MessageSquare,
  Newspaper,
  Calendar as CalendarIcon,
  FileBox,
  Plus,
  Check,
  X,
  MoreVertical,
  Download,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Globe,
  Lock,
  ImageIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function ContentEngagementPage() {
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Content & Engagement
          </h2>
          <p className="text-muted-foreground">
            Manage the feed, official news, and alumni resources.
          </p>
        </div>
        <div className="flex gap-3">
          {/* BEEFED UP NEWS MODAL */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Newspaper className="h-4 w-4 mr-2" /> Draft News
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Post Official News</DialogTitle>
                <DialogDescription>
                  This will appear in the "Official" section of the user app.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Headline</Label>
                  <Input placeholder="e.g. New Research Grant Announced" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="announcement">
                          Announcement
                        </SelectItem>
                        <SelectItem value="achievement">Achievement</SelectItem>
                        <SelectItem value="press">Press Release</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Featured Image</Label>
                    <Button variant="secondary" className="w-full text-xs h-9">
                      <ImageIcon className="mr-2 h-4 w-4" /> Upload
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Article Content</Label>
                  <Textarea
                    className="min-h-[150px]"
                    placeholder="Start writing the story..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button className="w-full">Publish News Feed</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* BEEFED UP EVENT MODAL */}
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Configure Alumni Event</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2 space-y-2">
                  <Label>Event Name</Label>
                  <Input placeholder="Alumni Homecoming 2026" />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Location / Meeting Link</Label>
                  <Input placeholder="Physical address or Zoom link" />
                </div>
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Public (All Alumni)</SelectItem>
                      <SelectItem value="verified">Verified Only</SelectItem>
                      <SelectItem value="invitation">
                        Invitation Only
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>RSVP Limit</Label>
                  <Input
                    type="number"
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button className="w-full">Launch Event</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="feed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feed">User Feed Moderation</TabsTrigger>
          <TabsTrigger value="news">Official News Feed</TabsTrigger>
          <TabsTrigger value="events">Events Calendar</TabsTrigger>
          <TabsTrigger value="resources">Resource Library</TabsTrigger>
        </TabsList>

        {/* --- USER FEED MODERATION --- */}
        <TabsContent value="feed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending User Posts</CardTitle>
              <CardDescription>
                Review and approve posts from the alumni community.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    user: "David K.",
                    content:
                      "Just landed a role at Google! Thanks to the STP network for the prep...",
                    status: "Pending",
                    time: "1h ago",
                  },
                  {
                    user: "Linda M.",
                    content:
                      "Anyone interested in a weekend hackathon for Fintech? Looking for partners.",
                    status: "Flagged",
                    time: "3h ago",
                  },
                ].map((post, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between p-4 border rounded-lg bg-muted/30"
                  >
                    <div className="flex gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{post.user[0]}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {post.user}
                          </span>
                          <span className="text-[10px] text-muted-foreground uppercase">
                            {post.time}
                          </span>
                          {post.status === "Flagged" && (
                            <Badge
                              variant="destructive"
                              className="h-4 text-[9px]"
                            >
                              Flagged
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-snug">
                          {post.content}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-green-600 h-8 w-8"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- OFFICIAL NEWS FEED --- */}
        <TabsContent value="news" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Annual Alumni Gala 2026",
                date: "Feb 15, 2026",
                views: "1.2k",
              },
              {
                title: "New Resource: Career Transition Guide",
                date: "Jan 28, 2026",
                views: "850",
              },
              {
                title: "Campus Development Update",
                date: "Jan 12, 2026",
                views: "430",
              },
            ].map((news, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Badge variant="outline" className="w-fit mb-2">
                    Official
                  </Badge>
                  <CardTitle className="text-base line-clamp-1">
                    {news.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Published: {news.date}</span>
                    <span>{news.views} reads</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="secondary" size="sm" className="">
                      Edit
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        {/* --- EVENTS: Grid & Calendar View --- */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-end mb-4">
            <div className="inline-flex border rounded-md p-1 bg-muted">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "calendar" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("calendar")}
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <div className="h-32 bg-slate-200 rounded-t-lg animate-pulse" />
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">
                      Tech Alumni Networking
                    </CardTitle>
                    <CardDescription>
                      March 12 • Victoria Island
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold">February 2026</h3>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden border">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div
                    key={d}
                    className="bg-muted/50 p-2 text-center text-xs font-bold"
                  >
                    {d}
                  </div>
                ))}
                {Array.from({ length: 28 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-background min-h-[80px] p-2 border-t"
                  >
                    <span className="text-xs">{i + 1}</span>
                    {i === 11 && (
                      <div className="mt-1 p-1 bg-blue-100 text-blue-700 text-[10px] rounded truncate">
                        Networking
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>
        {/* --- RESOURCE LIBRARY --- */}
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Resource Performance</CardTitle>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" /> Analytics
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr className="text-left">
                    <th className="p-4 font-semibold text-muted-foreground">
                      Asset Name
                    </th>
                    <th className="p-4 font-semibold text-muted-foreground">
                      Category
                    </th>
                    <th className="p-4 font-semibold text-muted-foreground">
                      Visibility
                    </th>
                    <th className="p-4 font-semibold text-muted-foreground text-center">
                      Downloads
                    </th>
                    <th className="p-4 font-semibold text-muted-foreground text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      name: "Alumni_Business_Directory_2026.pdf",
                      cat: "Business",
                      vis: "Verified",
                      dls: "1,240",
                    },
                    {
                      name: "VC_Pitch_Deck_Master_Template.pptx",
                      cat: "Investment",
                      vis: "Verified",
                      dls: "458",
                    },
                    {
                      name: "Code_of_Conduct_v2.docx",
                      cat: "Compliance",
                      vis: "All",
                      dls: "2.1k",
                    },
                    {
                      name: "Grant_Proposal_Structure.pdf",
                      cat: "Funding",
                      vis: "Verified",
                      dls: "112",
                    },
                  ].map((file, i) => (
                    <tr
                      key={i}
                      className="border-b last:border-0 hover:bg-muted/10 transition-colors"
                    >
                      <td className="p-4 flex items-center gap-3 font-medium">
                        <div className="p-2 bg-blue-100 rounded-md">
                          <FileBox className="h-4 w-4 text-blue-600" />
                        </div>
                        {file.name}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-[10px]">
                          {file.cat}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          {file.vis === "All" ? (
                            <Globe className="h-3 w-3" />
                          ) : (
                            <Lock className="h-3 w-3" />
                          )}
                          {file.vis}
                        </div>
                      </td>
                      <td className="p-4 text-center font-bold text-blue-600 font-mono">
                        {file.dls}
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer">
                              Edit Metadata
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              Archive Asset
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
