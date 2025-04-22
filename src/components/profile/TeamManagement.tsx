
import { useState } from 'react';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function TeamManagement() {
  const [newTeamName, setNewTeamName] = useState('');
  const { teams, isLoading, createTeam } = useTeamManagement();

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    await createTeam(newTeamName);
    setNewTeamName('');
  };

  return (
    <div className="space-y-4">
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

      <div className="space-y-2">
        <h4 className="font-medium">Your Teams</h4>
        {teams.map((team) => (
          <div
            key={team.id}
            className="p-4 border rounded-lg flex items-center justify-between"
          >
            <div>
              <p className="font-medium">{team.company_name}</p>
              <p className="text-sm text-muted-foreground">
                Plan: {team.subscription_plan}
              </p>
            </div>
          </div>
        ))}
        {!isLoading && teams.length === 0 && (
          <p className="text-muted-foreground">You haven't created any teams yet.</p>
        )}
      </div>
    </div>
  );
}
