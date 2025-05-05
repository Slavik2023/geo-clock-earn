
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Team } from "@/hooks/useTeamManagement";

export function TeamManagement() {
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      
      // Get all teams (admin has access to all)
      const { data, error } = await supabase
        .from("teams")
        .select("*");
      
      if (error) throw error;
      
      setTeams(data || []);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить список команд"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const updateTeamSubscription = async (teamId: string, plan: string) => {
    try {
      const { error } = await supabase
        .from("teams")
        .update({ subscription_plan: plan })
        .eq("id", teamId);
      
      if (error) throw error;
      
      toast({
        title: "Успех",
        description: `План подписки команды обновлен на ${plan}`
      });
      
      fetchTeams();
    } catch (error) {
      console.error("Error updating team subscription:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить план подписки команды"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Команды</h2>
        <Button 
          onClick={() => fetchTeams()} 
          variant="outline" 
          disabled={isLoading}
        >
          Обновить
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-4">Загрузка...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Компания</TableHead>
                <TableHead>План подписки</TableHead>
                <TableHead>Дата создания</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    Команды не найдены
                  </TableCell>
                </TableRow>
              ) : (
                teams.map((team) => (
                  <TableRow key={team.id}>
                    <TableCell>
                      <div className="font-medium">{team.company_name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={team.subscription_plan === "premium" ? "default" : "outline"}>
                        {team.subscription_plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(team.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateTeamSubscription(
                          team.id, 
                          team.subscription_plan === "free" ? "premium" : "free"
                        )}
                      >
                        {team.subscription_plan === "free" ? "Обновить до Premium" : "Понизить до Free"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
