
import { WorkSessionCard, WorkSession } from "@/components/time-tracker/WorkSessionCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface SessionsListProps {
  sessions: WorkSession[];
  isLoading: boolean;
  error: string | null;
}

export function SessionsList({ sessions, isLoading, error }: SessionsListProps) {
  if (isLoading) {
    return <div className="text-center py-8">Loading sessions...</div>;
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No sessions found for the selected date range.
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sessions.map((session) => (
        <WorkSessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}
