
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { MapPinIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { WorkSession } from "@/components/time-tracker/WorkSessionCard";
import { SessionDetails } from "@/components/time-tracker/SessionDetails";

interface RecentSessionsListProps {
  sessions: WorkSession[];
  isLoading: boolean;
}

export function RecentSessionsList({ sessions, isLoading }: RecentSessionsListProps) {
  const [selectedSession, setSelectedSession] = useState<WorkSession | null>(null);
  
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recent sessions found. Start tracking your time to see sessions here.
      </div>
    );
  }

  const formatDuration = (start: Date, end?: Date) => {
    if (!end) return "In progress";
    
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Earnings</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell>
                  <div className="font-medium">
                    {format(session.startTime, "MMM d, yyyy")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(session.startTime, "h:mm a")}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={!session.endTime ? "secondary" : "outline"}>
                    {formatDuration(session.startTime, session.endTime)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <MapPinIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                    <span className="truncate max-w-[150px]">
                      {session.location}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${session.earnings.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedSession(session)}
                  >
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedSession && (
        <SessionDetails
          session={selectedSession}
          isOpen={!!selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </>
  );
}
