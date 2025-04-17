
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { formatDistanceStrict, format } from "date-fns";
import { MapPinIcon, ClockIcon, DollarSignIcon } from "lucide-react";

export interface WorkSession {
  id: string;
  startTime: Date;
  endTime: Date;
  location: string;
  earnings: number;
}

interface WorkSessionCardProps {
  session: WorkSession;
}

export function WorkSessionCard({ session }: WorkSessionCardProps) {
  const duration = formatDistanceStrict(
    session.endTime, 
    session.startTime, 
    { addSuffix: false }
  );

  const formattedDate = format(session.startTime, "EEE, MMM d, yyyy");
  const startTimeFormatted = format(session.startTime, "h:mm a");
  const endTimeFormatted = format(session.endTime, "h:mm a");

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{formattedDate}</CardTitle>
            <CardDescription>
              {startTimeFormatted} - {endTimeFormatted}
            </CardDescription>
          </div>
          <span className="text-xl font-bold">${session.earnings.toFixed(2)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm">
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
            <span>Duration: {duration}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPinIcon className="h-4 w-4 text-muted-foreground" />
            <span>{session.location}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
