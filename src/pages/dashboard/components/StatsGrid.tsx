
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  DollarSignIcon,
  ClockIcon,
  CalendarIcon,
  TrendingUpIcon
} from "lucide-react";

interface StatsGridProps {
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

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
          <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.todayEarnings.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {stats.todayHours.toFixed(1)} hours worked
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Weekly Earnings</CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.weekEarnings.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {stats.weekHours.toFixed(1)} hours this week
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.monthEarnings.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {stats.monthHours.toFixed(1)} hours this month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
          <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.averageHourlyRate.toFixed(2)}/h</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalSessions} total sessions
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
