
import { useState, useEffect } from 'react';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle, Plus, UserPlus, Settings, Shield } from 'lucide-react';

export function TeamManagement() {
  const [newTeamName, setNewTeamName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('worker');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  
  const { 
    teams, 
    teamMembers,
    isLoading, 
    isAdmin,
    createTeam, 
    fetchTeamMembers, 
    addTeamMember,
    removeTeamMember,
    upgradeSubscription,
    cancelSubscription
  } = useTeamManagement();
  
  const { toast } = useToast();

  useEffect(() => {
    if (selectedTeam) {
      fetchTeamMembers(selectedTeam);
    }
  }, [selectedTeam, fetchTeamMembers]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    await createTeam(newTeamName);
    setNewTeamName('');
  };

  const handleAddTeamMember = async () => {
    if (!selectedTeam || !newMemberEmail.trim()) return;
    
    const success = await addTeamMember({
      teamId: selectedTeam,
      email: newMemberEmail,
      role: newMemberRole
    });
    
    if (success) {
      setNewMemberEmail('');
      setNewMemberRole('worker');
      setIsAddMemberDialogOpen(false);
      toast({
        title: "Team member added",
        description: `Invitation sent to ${newMemberEmail}`,
      });
    }
  };

  const handleRemoveTeamMember = async (memberId: string) => {
    if (!selectedTeam) return;
    
    await removeTeamMember(selectedTeam, memberId);
  };

  const handleUpgradeSubscription = async () => {
    if (!selectedTeam) return;
    
    const success = await upgradeSubscription(selectedTeam);
    
    if (success) {
      setIsSubscriptionDialogOpen(false);
      toast({
        title: "Subscription upgraded",
        description: "Your team has been upgraded to Premium",
      });
    }
  };

  const handleCancelSubscription = async () => {
    if (!selectedTeam) return;
    
    const success = await cancelSubscription(selectedTeam);
    
    if (success) {
      setIsSubscriptionDialogOpen(false);
      toast({
        title: "Subscription canceled",
        description: "Your subscription will be active until the end of the billing period",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Team Management</h3>
      
      <form onSubmit={handleCreateTeam} className="space-y-4">
        <div>
          <Label htmlFor="teamName">New Team Name</Label>
          <Input
            id="teamName"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="Enter company name"
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          Create Team
        </Button>
      </form>

      <div className="space-y-4">
        <h4 className="font-medium">Your Teams</h4>
        {teams.map((team) => (
          <div
            key={team.id}
            className={`p-4 border rounded-lg space-y-3 ${selectedTeam === team.id ? 'border-primary' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{team.company_name}</p>
                <p className="text-sm text-muted-foreground">
                  Plan: <span className={team.subscription_plan === 'premium' ? 'text-green-500 font-medium' : ''}>
                    {team.subscription_plan.charAt(0).toUpperCase() + team.subscription_plan.slice(1)}
                  </span>
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedTeam(selectedTeam === team.id ? null : team.id)}
                >
                  {selectedTeam === team.id ? 'Hide Details' : 'Show Details'}
                </Button>
                
                <Dialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-1" />
                      Subscription
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Manage Team Subscription</DialogTitle>
                      <DialogDescription>
                        {team.subscription_plan === 'premium' 
                          ? 'You are currently on the Premium plan.' 
                          : 'Upgrade to Premium for advanced features.'}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium">Premium Plan</h4>
                        <p className="text-sm text-muted-foreground mb-2">$5/month</p>
                        <ul className="text-sm space-y-1">
                          <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Unlimited locations</li>
                          <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> PDF & Excel exports</li>
                          <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Cloud sync</li>
                          <li className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Priority support</li>
                        </ul>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      {team.subscription_plan === 'premium' ? (
                        <Button variant="destructive" onClick={handleCancelSubscription}>
                          Cancel Subscription
                        </Button>
                      ) : (
                        <Button onClick={handleUpgradeSubscription}>
                          Upgrade to Premium
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {selectedTeam === team.id && (
              <div className="pt-4 border-t mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="font-medium">Team Members</h5>
                  
                  <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Team Member</DialogTitle>
                        <DialogDescription>
                          Send an invitation to join this team.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="memberEmail">Email</Label>
                          <Input
                            id="memberEmail"
                            placeholder="member@example.com"
                            value={newMemberEmail}
                            onChange={(e) => setNewMemberEmail(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="memberRole">Role</Label>
                          <select
                            id="memberRole"
                            className="w-full p-2 border rounded-md"
                            value={newMemberRole}
                            onChange={(e) => setNewMemberRole(e.target.value)}
                          >
                            <option value="worker">Worker</option>
                            <option value="manager">Manager</option>
                            {isAdmin && <option value="admin">Admin</option>}
                          </select>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button onClick={handleAddTeamMember}>
                          Send Invitation
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {teamMembers && teamMembers.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>{member.user_id}</TableCell>
                          <TableCell>
                            <span className="flex items-center">
                              {member.role === 'admin' && <Shield className="h-4 w-4 mr-1 text-blue-500" />}
                              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(member.joined_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRemoveTeamMember(member.id)}
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">No team members yet.</p>
                )}
              </div>
            )}
          </div>
        ))}
        {!isLoading && teams.length === 0 && (
          <p className="text-muted-foreground">You haven't created any teams yet.</p>
        )}
      </div>
    </div>
  );
}
