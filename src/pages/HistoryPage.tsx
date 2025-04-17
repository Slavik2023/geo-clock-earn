
import { useState, useEffect } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { WorkSessionCard, WorkSession } from "@/components/time-tracker/WorkSessionCard";
import { addDays, subDays, startOfWeek, endOfWeek, format } from "date-fns";

export function HistoryPage() {
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [filter, setFilter] = useState("week");

  useEffect(() => {
    // In a real app, this data would come from an API or local storage
    const mockData: WorkSession[] = generateMockSessions();
    setSessions(mockData);
  }, []);

  // Filter sessions based on the selected time period
  const filteredSessions = sessions.filter(session => {
    const now = new Date();
    const sessionDate = new Date(session.startTime);
    
    switch (filter) {
      case "today":
        return sessionDate.toDateString() === now.toDateString();
      case "yesterday":
        const yesterday = subDays(now, 1);
        return sessionDate.toDateString() === yesterday.toDateString();
      case "week":
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      case "all":
        return true;
      default:
        return true;
    }
  });

  // Calculate total earnings for the filtered period
  const totalEarnings = filteredSessions.reduce(
    (sum, session) => sum + session.earnings, 
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Work History</h2>
          <p className="text-muted-foreground">
            View and manage your work sessions
          </p>
        </div>
        <Select 
          value={filter} 
          onValueChange={value => setFilter(value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total Earnings</span>
          <span className="text-2xl font-bold">${totalEarnings.toFixed(2)}</span>
        </div>
      </div>

      {filteredSessions.length > 0 ? (
        <div className="space-y-4">
          {filteredSessions.map(session => (
            <WorkSessionCard key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No work sessions found for this period.</p>
        </div>
      )}
    </div>
  );
}

// Helper function to generate mock data
function generateMockSessions(): WorkSession[] {
  const now = new Date();
  const yesterday = subDays(now, 1);
  const twoDaysAgo = subDays(now, 2);
  const threeDaysAgo = subDays(now, 3);
  
  return [
    {
      id: "1",
      startTime: new Date(now.setHours(9, 0, 0, 0)),
      endTime: new Date(now.setHours(17, 30, 0, 0)),
      location: "Construction Site A",
      earnings: 212.50,
    },
    {
      id: "2",
      startTime: new Date(yesterday.setHours(8, 30, 0, 0)),
      endTime: new Date(yesterday.setHours(16, 0, 0, 0)),
      location: "Construction Site B",
      earnings: 187.50,
    },
    {
      id: "3",
      startTime: new Date(twoDaysAgo.setHours(9, 15, 0, 0)),
      endTime: new Date(twoDaysAgo.setHours(18, 0, 0, 0)),
      location: "Construction Site A",
      earnings: 219.75,
    },
    {
      id: "4",
      startTime: new Date(threeDaysAgo.setHours(8, 0, 0, 0)),
      endTime: new Date(threeDaysAgo.setHours(15, 45, 0, 0)),
      location: "Construction Site C",
      earnings: 193.50,
    },
  ];
}
