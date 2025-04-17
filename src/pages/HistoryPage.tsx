
import { useState } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { WorkSessionCard, WorkSession } from "@/components/time-tracker/WorkSessionCard";
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek } from "date-fns";
import { fetchSessions, fetchSessionsByDateRange } from "@/components/time-tracker/services/sessionService";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export function HistoryPage() {
  const [filter, setFilter] = useState("week");
  
  // Get date range based on selected filter
  const getDateRange = () => {
    const now = new Date();
    
    switch (filter) {
      case "today":
        return { start: startOfDay(now), end: endOfDay(now) };
      case "yesterday":
        const yesterday = subDays(now, 1);
        return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
      case "week":
        return { 
          start: startOfWeek(now, { weekStartsOn: 1 }), 
          end: endOfWeek(now, { weekStartsOn: 1 }) 
        };
      case "all":
      default:
        // For "all", we'll fetch all sessions without date filtering
        return null;
    }
  };
  
  const dateRange = getDateRange();
  
  // Fetch sessions data with error handling
  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ["sessions", filter],
    queryFn: async () => {
      try {
        if (dateRange) {
          return await fetchSessionsByDateRange(dateRange.start, dateRange.end);
        } else {
          return await fetchSessions();
        }
      } catch (err) {
        console.error("Error fetching sessions:", err);
        throw err;
      }
    },
  });

  // Calculate total earnings for the filtered period
  const totalEarnings = sessions.reduce(
    (sum, session) => sum + (session.earnings || 0), 
    0
  );

  if (error) {
    console.error("Error loading sessions:", error);
  }

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
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <span className="text-2xl font-bold">${totalEarnings.toFixed(2)}</span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-4 border rounded-lg">
              <Skeleton className="h-6 w-36 mb-2" />
              <Skeleton className="h-4 w-48 mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map(session => (
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
