
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { MapPin } from "lucide-react";
import { WorkSession } from "./WorkSessionCard";

interface SessionDetailsProps {
  session: WorkSession;
  isOpen: boolean;
  onClose: () => void;
}

export function SessionDetails({ session, isOpen, onClose }: SessionDetailsProps) {
  // Format dates and calculate duration
  const formattedDate = format(session.startTime, "EEEE, MMMM d, yyyy");
  const startTimeFormatted = format(session.startTime, "h:mm a");
  const endTimeFormatted = session.endTime 
    ? format(session.endTime, "h:mm a") 
    : "In progress";
  
  // Calculate total hours
  const durationHours = session.endTime 
    ? (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60 * 60) 
    : (new Date().getTime() - session.startTime.getTime()) / (1000 * 60 * 60);
    
  // Calculate hourly rate based on earnings and duration
  const hourlyRate = durationHours > 0 
    ? (session.earnings / durationHours).toFixed(2) 
    : "N/A";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Session Details</DialogTitle>
          <DialogDescription>
            {formattedDate}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Location:</span> {session.location}
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{startTimeFormatted}</TableCell>
                <TableCell>{endTimeFormatted}</TableCell>
                <TableCell>{durationHours.toFixed(2)} hours</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          
          <Table>
            <TableCaption>Earnings breakdown for this session</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Hourly Rate</TableHead>
                <TableHead>Total Earnings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>${hourlyRate}/hr</TableCell>
                <TableCell className="font-medium">${session.earnings.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
