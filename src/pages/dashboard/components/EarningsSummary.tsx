
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface EarningsSummaryProps {
  stats: {
    todayEarnings: number;
    weekEarnings: number;
    monthEarnings: number;
    todayHours: number;
    weekHours: number;
    monthHours: number;
    totalSessions: number;
    averageHourlyRate: number;
  };
}

export function EarningsSummary({ stats }: EarningsSummaryProps) {
  // Calculate percentage of month earnings compared to a goal
  // Using $1000 as an example monthly goal
  const monthlyGoal = 1000;
  const monthProgress = Math.min(Math.round((stats.monthEarnings / monthlyGoal) * 100), 100);
  
  // Weekly goal as 25% of monthly goal
  const weeklyGoal = monthlyGoal * 0.25;
  const weekProgress = Math.min(Math.round((stats.weekEarnings / weeklyGoal) * 100), 100);
  
  // Daily goal as 5% of monthly goal
  const dailyGoal = monthlyGoal * 0.05;
  const dayProgress = Math.min(Math.round((stats.todayEarnings / dailyGoal) * 100), 100);
  
  return (
    <div className="grid gap-4 grid-cols-1">
      <Card>
        <CardHeader>
          <CardTitle>Earnings Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Today</span>
                <span className="text-xs text-muted-foreground">Goal: ${dailyGoal.toFixed(2)}</span>
              </div>
              <span className="text-sm font-medium">${stats.todayEarnings.toFixed(2)}</span>
            </div>
            <Progress value={dayProgress} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium">This Week</span>
                <span className="text-xs text-muted-foreground">Goal: ${weeklyGoal.toFixed(2)}</span>
              </div>
              <span className="text-sm font-medium">${stats.weekEarnings.toFixed(2)}</span>
            </div>
            <Progress value={weekProgress} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium">This Month</span>
                <span className="text-xs text-muted-foreground">Goal: ${monthlyGoal.toFixed(2)}</span>
              </div>
              <span className="text-sm font-medium">${stats.monthEarnings.toFixed(2)}</span>
            </div>
            <Progress value={monthProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
