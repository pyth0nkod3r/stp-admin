import React, { useState } from "react";
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
  ArrowUpRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function DealRoomsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Opportunity Module</h2>
          <p className="text-muted-foreground">Oversee private deal rooms, investments, and partnerships.</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Create New Deal Room
        </Button>
      </div>

      {/* High-Level Deal Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4.2M</div>
            <p className="text-xs text-muted-foreground">Aggregate opportunity value</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Alumni requesting room access</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Doc Downloads</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">892</div>
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

        <TabsContent value="active" className="grid gap-4 md:grid-cols-2">
          {/* Example Deal Room Card 1 */}
          <DealRoomCard 
            title="Tech Hub Lagos: Seed Round"
            owner="Adebayo C. (Class of '14)"
            status="Active"
            members={12}
            progress={65}
            valuation="$500k"
            category="Fintech"
          />
          {/* Example Deal Room Card 2 */}
          <DealRoomCard 
            title="Renewable Energy JV"
            owner="Sarah Jenkins (Class of '09)"
            status="Private"
            members={5}
            progress={20}
            valuation="$2.1M"
            category="Energy"
          />
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Access Requests</CardTitle>
              <CardDescription>Review alumni asking for permission to enter private deal rooms.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">John Smith requested access to "Tech Hub Lagos"</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" /> 14 mins ago • <ShieldCheck className="h-3 w-3 text-green-600" /> Verified Alumnus
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Decline</Button>
                      <Button size="sm">Grant Access</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DealRoomCard({ title, owner, status, members, progress, valuation, category }: any) {
  return (
    <Card className="hover:border-primary/50 transition-all">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant={status === "Active" ? "default" : "secondary"}>
              {status === "Active" ? <Unlock className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
              {status}
            </Badge>
            <Badge variant="outline">{category}</Badge>
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>Posted by {owner}</CardDescription>
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
            <p className="text-lg font-bold">{valuation}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Members</p>
            <p className="text-lg font-bold">{members}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span>Funding/Completion Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Button className="w-full variant-outline bg-muted/50 text-foreground hover:bg-primary hover:text-primary-foreground">
          Audit Documents & Threads
        </Button>
      </CardContent>
    </Card>
  );
}