import { useState } from "react";
import { useHouseholds, useCreateHousehold, useHouseholdMembers, useInviteMember } from "@/hooks/useHouseholds";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Users, Crown, User } from "lucide-react";

export const HouseholdManager = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [householdName, setHouseholdName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string>("");

  const { data: households, isLoading: householdsLoading } = useHouseholds();
  const createHousehold = useCreateHousehold();
  const inviteMember = useInviteMember();

  const handleCreateHousehold = () => {
    if (!householdName.trim()) return;
    
    createHousehold.mutate(
      { name: householdName },
      {
        onSuccess: () => {
          setHouseholdName("");
          setIsCreateDialogOpen(false);
        },
      }
    );
  };

  const handleInviteMember = () => {
    if (!inviteEmail.trim() || !selectedHouseholdId) return;
    
    inviteMember.mutate(
      { household_id: selectedHouseholdId, user_email: inviteEmail },
      {
        onSuccess: () => {
          setInviteEmail("");
          setIsInviteDialogOpen(false);
        },
      }
    );
  };

  if (householdsLoading) {
    return <div>Loading households...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Household Management</h2>
          <p className="text-muted-foreground">
            Share your financial data with family members
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Household
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Household</DialogTitle>
              <DialogDescription>
                Create a household to share financial data with family members.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="household-name">Household Name</Label>
                <Input
                  id="household-name"
                  placeholder="Enter household name"
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreateHousehold}
                disabled={createHousehold.isPending}
              >
                {createHousehold.isPending ? "Creating..." : "Create Household"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {households && households.length > 0 ? (
          households.map((household) => (
            <HouseholdCard
              key={household.id}
              household={household}
              onInvite={(householdId) => {
                setSelectedHouseholdId(householdId);
                setIsInviteDialogOpen(true);
              }}
            />
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No households yet</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Create a household to start sharing financial data with your family.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Household
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Family Member</DialogTitle>
            <DialogDescription>
              Enter the email address of the person you want to invite to your household.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleInviteMember}
              disabled={inviteMember.isPending}
            >
              {inviteMember.isPending ? "Inviting..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const HouseholdCard = ({ 
  household, 
  onInvite 
}: { 
  household: any; 
  onInvite: (householdId: string) => void;
}) => {
  const { data: members } = useHouseholdMembers(household.id);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {household.name}
              <Crown className="h-4 w-4 text-yellow-500" />
            </CardTitle>
            <CardDescription>
              Created on {new Date(household.created_at).toLocaleDateString()}
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => onInvite(household.id)}>
            <Plus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Members ({members?.length || 0})</h4>
            <div className="space-y-2">
              {members?.map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">User {member.user_id.slice(0, 8)}...</span>
                  </div>
                  <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};