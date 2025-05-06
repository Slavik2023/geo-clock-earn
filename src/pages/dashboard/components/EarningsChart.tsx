
import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { startOfDay, format, parseISO, eachDayOfInterval, subDays } from "date-fns";
import { WorkSession } from "@/components/time-tracker/WorkSessionCard";

interface EarningsChartProps {
  sessions: WorkSession[];
  isLoading: boolean;
}

export function EarningsChart({ sessions, isLoading }: EarningsChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (isLoading || sessions.length === 0) return;

    // Create an array of the last 14 days
    const today = new Date();
    const fourteenDaysAgo = subDays(today, 13);
    
    // Generate all dates in the range
    const dateRange = eachDayOfInterval({
      start: startOfDay(fourteenDaysAgo),
      end: startOfDay(today),
    });
    
    // Initialize data for each date
    const initialData = dateRange.map(date => ({
      date: format(date, 'yyyy-MM-dd'),
      displayDate: format(date, 'MMM d'),
      earnings: 0,
      hours: 0,
    }));
    
    // Map sessions to dates
    sessions.forEach(session => {
      const sessionDate = format(session.startTime, 'yyyy-MM-dd');
      const dataPoint = initialData.find(d => d.date === sessionDate);
      
      if (dataPoint) {
        dataPoint.earnings += session.earnings;
        
        if (session.endTime) {
          const durationHours = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60 * 60);
          dataPoint.hours += durationHours;
        }
      }
    });
    
    setChartData(initialData);
  }, [sessions, isLoading]);

  if (isLoading) {
    return <Skeleton className="h-full w-full" />;
  }

  if (sessions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No data available to display
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border p-3 rounded-lg shadow">
          <p className="font-medium">{payload[0].payload.displayDate}</p>
          <p className="text-sm text-muted-foreground">
            Earnings: ${payload[0].value.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
            Hours: {payload[1].value.toFixed(1)}h
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="displayDate" 
          tickLine={false}
          axisLine={true}
          interval="preserveStartEnd"
        />
        <YAxis 
          yAxisId="left"
          tickFormatter={(value) => `$${value}`}
          tickLine={false}
          axisLine={true}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          tickFormatter={(value) => `${value}h`}
          tickLine={false}
          axisLine={true}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar yAxisId="left" dataKey="earnings" name="Earnings ($)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar yAxisId="right" dataKey="hours" name="Hours" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
