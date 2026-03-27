import { useState, useEffect, useRef } from "react";
import {
  Car,
  Plus,
  Users,
  FileText,
  TrendingUp,
  MoreVertical,
  Lock,
  Unlock,
  MessageSquare,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  X,
  Upload,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { fetchDealRooms, createDealRoom } from "@/services/apiDealRooms";
import type { DealRoom } from "@/lib/type";

export default function DealRoomsPage() {
  const [dealRooms, setDealRooms] = useState<DealRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [memberInput, setMemberInput] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const documentRef = useRef<HTMLInputElement>(null);

  function loadRooms() {
    setLoading(true);
    fetchDealRooms()
      .then((res) => setDealRooms(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadRooms();
  }, []);

  function addMember() {
    const id = memberInput.trim();
    if (!id) return;
    if (members.includes(id)) {
      toast.error("Member already added.");
      return;
    }
    setMembers((prev) => [...prev, id]);
    setMemberInput("");
  }

  function removeMember(id: string) {
    setMembers((prev) => prev.filter((m) => m !== id));
  }

  async function handleCreate() {
    if (!roomName.trim()) {
      toast.error("Please enter a room name.");
      return;
    }
    if (!roomDescription.trim()) {
      toast.error("Please enter a description.");
      return;
    }

    setCreating(true);
    try {
      const result = await createDealRoom({
        roomName: roomName.trim(),
        roomDescription: roomDescription.trim(),
        members,
        document: documentRef.current?.files?.[0],
      });
      toast.success(result.message || "Deal room created!");
      setDialogOpen(false);
      setRoomName("");
      setRoomDescription("");
      setMembers([]);
      setMemberInput("");
      if (documentRef.current) documentRef.current.value = "";
      loadRooms();
    } catch (error: any) {
      toast.error(error?.message || "Failed to create deal room");
    } finally {
      setCreating(false);
    }
  }

  const activeRooms = dealRooms.filter((r) => r.isActive === "1");
  const archivedRooms = dealRooms.filter((r) => r.isActive !== "1");

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Opportunity Module</h2>
          <p className="text-muted-foreground">Oversee private deal rooms, investments, and partnerships.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Create New Deal Room
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Deal Room</DialogTitle>
              <DialogDescription>
                Set up a new deal room for collaboration.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="roomName">Room Name</Label>
                <Input
                  id="roomName"
                  placeholder="e.g. Tech Hub Lagos: Seed Round"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomDescription">Description</Label>
                <Textarea
                  id="roomDescription"
                  placeholder="Describe the purpose of this deal room"
                  value={roomDescription}
                  onChange={(e) => setRoomDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Members (User IDs)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter member user ID"
                    value={memberInput}
                    onChange={(e) => setMemberInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addMember();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addMember}>
                    Add
                  </Button>
                </div>
                {members.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {members.map((id) => (
                      <Badge key={id} variant="secondary" className="gap-1 pr-1">
                        <span className="max-w-[120px] truncate text-xs">{id}</span>
                        <button
                          onClick={() => removeMember(id)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="document">Document (optional)</Label>
                <Input
                  id="document"
                  type="file"
                  ref={documentRef}
                  className="cursor-pointer"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreate}
                disabled={creating}
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Deal Room"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* High-Level Deal Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Not available</div>
            <p className="text-xs text-muted-foreground">Aggregate opportunity value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Not available</div>
            <p className="text-xs text-muted-foreground">Alumni requesting room access</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Doc Downloads</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Not available</div>
            <p className="text-xs text-muted-foreground">Whitepapers & pitch decks viewed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Rooms</TabsTrigger>
          <TabsTrigger value="requests">Access Requests</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardHeader className="space-y-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-9 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeRooms.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No active deal rooms.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeRooms.map((room) => (
                <DealRoomCard key={room.roomId} room={room} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Access Requests</CardTitle>
              <CardDescription>Review alumni asking for permission to enter private deal rooms.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-4">Not available</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archived">
          {archivedRooms.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No archived deal rooms.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {archivedRooms.map((room) => (
                <DealRoomCard key={room.roomId} room={room} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DealRoomCard({ room }: { room: DealRoom }) {
  const isActive = room.isActive === "1";

  return (
    <Card className="hover:border-primary/50 transition-all">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? <Unlock className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <CardTitle className="text-xl">{room.roomName}</CardTitle>
          <CardDescription>{room.roomDescription}</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem><ArrowUpRight className="h-4 w-4 mr-2"/> View Live Room</DropdownMenuItem>
            <DropdownMenuItem><Users className="h-4 w-4 mr-2"/> Manage Members</DropdownMenuItem>
            <DropdownMenuItem><MessageSquare className="h-4 w-4 mr-2"/> View Q&A Log</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Close Deal Room</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Opportunity</p>
            <p className="text-lg font-bold">Not available</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Members</p>
            <p className="text-lg font-bold">{room.totalMembers}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span>Funding/Completion Progress</span>
            <span>Not available</span>
          </div>
          <Progress value={0} className="h-2" />
        </div>

        <Button className="w-full variant-outline bg-muted/50 text-foreground hover:bg-primary hover:text-primary-foreground">
          Audit Documents & Threads
        </Button>
      </CardContent>
    </Card>
  );
}