
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceStrict } from "date-fns";

interface EarningsCardProps {
  hourlyRate: number;
  overtimeRate?: number;
  startTime?: Date | null;
  isActive?: boolean;
}

export function EarningsCard({ 
  hourlyRate, 
  overtimeRate, 
  startTime, 
  isActive = false 
}: EarningsCardProps) {
  const getEarnings = (): string => {
    if (!startTime) return "$0.00";
    
    const now = new Date();
    const durationMs = now.getTime() - startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    
    // Basic calculation - in a real app you'd handle overtime thresholds
    const earnings = durationHours * hourlyRate;
    
    return `$${earnings.toFixed(2)}`;
  };
  
  const getDuration = (): string => {
    if (!startTime) return "0h 0m";
    return formatDistanceStrict(new Date(), startTime, { addSuffix: false });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Current Earnings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <div className="text-3xl font-bold">
            {isActive ? getEarnings() : "$0.00"}
          </div>
          
          <div className="flex flex-col gap-1 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Hourly Rate:</span>
              <span>${hourlyRate.toFixed(2)}/hr</span>
            </div>
            
            {overtimeRate && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overtime Rate:</span>
                <span>${overtimeRate.toFixed(2)}/hr</span>
              </div>
            )}
            
            {isActive && startTime && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time Worked:</span>
                  <span>{getDuration()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Start Time:</span>
                  <span>
                    {startTime.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
