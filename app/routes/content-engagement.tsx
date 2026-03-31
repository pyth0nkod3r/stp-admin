import React, { useRef, useState } from "react";
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
  Loader2,
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { createEvent } from "@/services/apiEvents";
import { TimePicker } from "@/components/ui/time-picker";
import { useEvents } from "@/hooks/useEvents";
import { useQueryClient } from "@tanstack/react-query";

export default function ContentEngagementPage() {
  const { events, isLoading: eventsLoading } = useEvents();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");
  const [eventStatusFilter, setEventStatusFilter] = useState("all");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [eventLoading, setEventLoading] = useState(false);
  const [eventForm, setEventForm] = useState({
    name: "",
    type: "online",
    date: undefined as Date | undefined,
    timeHour: "",
    timeMinute: "",
    timePeriod: "AM",
    location: "",
    description: "",
    visibility: "all",
    rsvpLimit: "",
  });
  const coverImageRef = useRef<HTMLInputElement>(null);

  function handleEventChange(field: string, value: string) {
    setEventForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreateEvent() {
    if (!eventForm.name) {
      toast.error("Please enter an event name.");
      return;
    }
    if (!eventForm.date) {
      toast.error("Please select a date.");
      return;
    }
    if (!eventForm.timeHour || !eventForm.timeMinute) {
      toast.error("Please select hour and minute.");
      return;
    }
    if (!eventForm.description.trim()) {
      toast.error("Please enter a description.");
      return;
    }
    if (!coverImageRef.current?.files?.[0]) {
      toast.error("Please upload a cover image.");
      return;
    }

    let hour24 = parseInt(eventForm.timeHour);
    if (eventForm.timePeriod === "AM" && hour24 === 12) hour24 = 0;
    if (eventForm.timePeriod === "PM" && hour24 !== 12) hour24 += 12;

    const dateStr = format(eventForm.date, "yyyy-MM-dd");
    const timeStr = `${hour24.toString().padStart(2, "0")}:${eventForm.timeMinute}`;
    const startTime = `${dateStr}T${timeStr}:00Z`;

    setEventLoading(true);
    try {
      const result = await createEvent({
        name: eventForm.name,
        startTime,
        // TODO: No endTime field in UI — defaults to startTime
        endTime: startTime,
        address: eventForm.type === "physical" ? eventForm.location : "",
        type: eventForm.type,
        timeZone: "UTC",
        description: eventForm.description,
        externalLink: eventForm.type === "online" ? eventForm.location : "",
        // TODO: No "venue" field in UI — sending empty string
        venue: "",
        coverImage: coverImageRef.current?.files?.[0],
      });
      toast.success(result.message || "Event created successfully!");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setEventDialogOpen(false);
      setEventForm({
        name: "",
        type: "online",
        date: undefined,
        timeHour: "",
        timeMinute: "",
        timePeriod: "AM",
        location: "",
        description: "",
        visibility: "all",
        rsvpLimit: "",
      });
      if (coverImageRef.current) coverImageRef.current.value = "";
    } catch (error: any) {
      toast.error(error?.message || "Failed to create event");
    } finally {
      setEventLoading(false);
    }
  }

  const filteredEvents = events.filter((e) => {
    if (eventStatusFilter !== "all" && e.eventStatus !== eventStatusFilter) return false;
    if (eventTypeFilter !== "all" && e.type !== eventTypeFilter) return false;
    return true;
  });

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
          <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Configure Alumni Event</DialogTitle>
                <DialogDescription>
                  Set up a new event for the alumni community.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2 space-y-2">
                  <Label>Event Name</Label>
                  <Input
                    placeholder="Alumni Homecoming 2026"
                    value={eventForm.name}
                    onChange={(e) => handleEventChange("name", e.target.value)}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Event Type</Label>
                  <Select
                    value={eventForm.type}
                    onValueChange={(v) => handleEventChange("type", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="physical">Physical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !eventForm.date ? "text-muted-foreground" : ""
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {eventForm.date
                          ? format(eventForm.date, "MMM dd, yyyy")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        captionLayout="dropdown"
                        fromYear={new Date().getFullYear()}
                        toYear={new Date().getFullYear() + 5}
                        selected={eventForm.date}
                        onSelect={(date) =>
                          setEventForm((prev) => ({ ...prev, date }))
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <TimePicker
                    hour={eventForm.timeHour}
                    minute={eventForm.timeMinute}
                    period={eventForm.timePeriod}
                    onHourChange={(v) => handleEventChange("timeHour", v)}
                    onMinuteChange={(v) => handleEventChange("timeMinute", v)}
                    onPeriodChange={(v) => handleEventChange("timePeriod", v)}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>
                    {eventForm.type === "online"
                      ? "Meeting Link"
                      : "Location / Address"}
                  </Label>
                  <Input
                    placeholder={
                      eventForm.type === "online"
                        ? "https://zoom.us/j/..."
                        : "Physical address"
                    }
                    value={eventForm.location}
                    onChange={(e) =>
                      handleEventChange("location", e.target.value)
                    }
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe your event..."
                    className="min-h-[80px]"
                    value={eventForm.description}
                    onChange={(e) =>
                      handleEventChange("description", e.target.value)
                    }
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Cover Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    ref={coverImageRef}
                    className="cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <Select
                    value={eventForm.visibility}
                    onValueChange={(v) => handleEventChange("visibility", v)}
                  >
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
                    value={eventForm.rsvpLimit}
                    onChange={(e) =>
                      handleEventChange("rsvpLimit", e.target.value)
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  className="w-full"
                  onClick={handleCreateEvent}
                  disabled={eventLoading}
                >
                  {eventLoading && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Launch Event
                </Button>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex flex-wrap items-center gap-2 border rounded-md p-1 bg-muted/50 w-full sm:w-auto">
              <Select value={eventStatusFilter} onValueChange={setEventStatusFilter}>
                <SelectTrigger className="h-8 border-0 bg-transparent shadow-none focus:ring-0 w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger className="h-8 border-0 bg-transparent shadow-none focus:ring-0 w-[120px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="physical">Physical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-1 items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span> Approved
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span> Pending
              </div>
            </div>

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

          {eventsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.length === 0 ? (
                <p className="text-muted-foreground col-span-full text-center py-8">
                  No events found.
                </p>
              ) : (
                filteredEvents.map((event) => (
                  <Card key={event.eventId} className="overflow-hidden">
                    <div className="relative">
                      {event.coverImageUrl ? (
                        <img
                          src={event.coverImageUrl}
                          alt={event.name}
                          className="h-32 w-full object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="h-32 bg-slate-200 rounded-t-lg flex items-center justify-center">
                          <CalendarIcon className="h-8 w-8 text-slate-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge 
                          variant={event.eventStatus === 'pending' ? "secondary" : "default"}
                          className={event.eventStatus === 'pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200' : 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200'}
                        >
                          {event.eventStatus === 'pending' ? 'Pending Validation' : 'Approved'}
                        </Badge>
                      </div>
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base line-clamp-1">
                        {event.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-1">
                        {format(new Date(event.startTime), "MMM dd")}
                        {event.address ? ` • ${event.address}` : event.venue ? ` • ${event.venue}` : ""}
                      </CardDescription>
                      {event.eventStatus === 'pending' && (
                         <div className="pt-2 flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1 border-green-200 hover:bg-green-50 text-green-700">Approve</Button>
                            <Button size="sm" variant="outline" className="flex-1 border-red-200 hover:bg-red-50 text-red-700">Decline</Button>
                         </div>
                      )}
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold">
                  {format(calendarMonth, "MMMM yyyy")}
                </h3>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      setCalendarMonth(
                        new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
                      )
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() =>
                      setCalendarMonth(
                        new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
                      )
                    }
                  >
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
                {(() => {
                  const year = calendarMonth.getFullYear();
                  const month = calendarMonth.getMonth();
                  const firstDay = new Date(year, month, 1).getDay();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const cells = [];

                  // Empty cells before the 1st
                  for (let i = 0; i < firstDay; i++) {
                    cells.push(
                      <div key={`empty-${i}`} className="bg-background min-h-[80px] p-2 border-t" />
                    );
                  }

                  for (let day = 1; day <= daysInMonth; day++) {
                    const currentDayDate = new Date(year, month, day);
                    const dayEvents = filteredEvents.filter((e) => {
                      const d = new Date(e.startTime);
                      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
                    });
                    cells.push(
                      <div 
                        key={day} 
                        className="bg-background min-h-[80px] p-2 border-t hover:bg-muted/10 cursor-pointer transition-colors relative"
                        onClick={() => {
                          setEventForm(prev => ({ ...prev, date: currentDayDate }));
                          setEventDialogOpen(true);
                        }}
                      >
                        <span className="text-xs text-muted-foreground">{day}</span>
                        {dayEvents.map((e) => (
                          <Popover key={e.eventId}>
                            <PopoverTrigger asChild>
                              <div
                                onClick={(ev) => ev.stopPropagation()}
                                className={`mt-1 p-1 text-[10px] rounded truncate cursor-pointer hover:opacity-80 transition-opacity ${
                                  e.eventStatus === 'pending'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                                title={e.name}
                              >
                                {e.eventStatus === 'pending' ? '⏳ ' : ''}{e.name}
                              </div>
                            </PopoverTrigger>
                            <PopoverContent 
                              align="start" 
                              className="w-[300px] p-0 overflow-hidden" 
                              onClick={(ev) => ev.stopPropagation()}
                            >
                              {e.coverImageUrl ? (
                                <img src={e.coverImageUrl} className="w-full h-32 object-cover" alt="cover" />
                              ) : (
                                <div className="w-full h-24 bg-slate-100 flex items-center justify-center">
                                  <CalendarIcon className="h-8 w-8 text-slate-300" />
                                </div>
                              )}
                              <div className="p-4 space-y-3">
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <Badge variant={e.eventStatus === 'pending' ? "secondary" : "default"} className={e.eventStatus === 'pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : ''}>
                                      {e.eventStatus === 'pending' ? 'Pending' : 'Approved'}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground uppercase">{format(new Date(e.startTime), 'h:mm a')}</span>
                                  </div>
                                  <h4 className="font-bold leading-tight mt-2">{e.name}</h4>
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{e.description || "No description provided."}</p>
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                  {e.type === 'online' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                  {e.address || e.venue || (e.type === 'online' ? "Online Event" : "No location set")}
                                </div>
                                <div className="pt-3 flex gap-2 border-t mt-3">
                                  {e.eventStatus === 'pending' ? (
                                    <>
                                      <Button size="sm" variant="outline" className="flex-1 border-green-200 hover:bg-green-50 text-green-700">Approve</Button>
                                      <Button size="sm" variant="outline" className="flex-1 border-red-200 hover:bg-red-50 text-red-700">Decline</Button>
                                    </>
                                  ) : (
                                    <Button size="sm" variant="outline" className="w-full">Edit Event</Button>
                                  )}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        ))}
                      </div>
                    );
                  }

                  return cells;
                })()}
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
