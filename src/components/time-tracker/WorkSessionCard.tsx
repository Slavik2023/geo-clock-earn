
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceStrict, format } from "date-fns";
import { MapPinIcon, ClockIcon, ChevronRightIcon } from "lucide-react";
import { useState } from "react";
import { SessionDetails } from "./SessionDetails";

export interface WorkSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  location: string;
  earnings: number;
}

interface WorkSessionCardProps {
  session: WorkSession;
}

export function WorkSessionCard({ session }: WorkSessionCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Check if endTime exists, if not use current time for duration calculation
  const endTimeValue = session.endTime || new Date();
  
  const duration = formatDistanceStrict(
    endTimeValue, 
    session.startTime, 
    { addSuffix: false }
  );

  const formattedDate = format(session.startTime, "EEE, MMM d, yyyy");
  const startTimeFormatted = format(session.startTime, "h:mm a");
  const endTimeFormatted = session.endTime 
    ? format(session.endTime, "h:mm a")
    : "In progress";

  return (
    <>
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
        <CardFooter>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto flex items-center"
            onClick={() => setShowDetails(true)}
          >
            Details <ChevronRightIcon className="ml-1 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <SessionDetails 
        session={session}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  );
}
