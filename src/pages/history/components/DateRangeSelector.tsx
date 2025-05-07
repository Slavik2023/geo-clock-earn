
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";

interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
}

export function DateRangeSelector({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange 
}: DateRangeSelectorProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleQuickFilter = (days: number) => {
    const newStartDate = subDays(new Date(), days);
    const newEndDate = new Date();
    onStartDateChange(newStartDate);
    onEndDateChange(newEndDate);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="space-x-2 flex flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleQuickFilter(7)}
            className="bg-background hover:bg-muted"
          >
            Last 7 Days
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleQuickFilter(30)}
            className="bg-background hover:bg-muted"
          >
            Last 30 Days
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleQuickFilter(90)}
            className="bg-background hover:bg-muted"
          >
            Last 90 Days
          </Button>
        </div>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-background"
            >
              <CalendarIcon className="h-4 w-4" />
              <span>
                {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="flex flex-col sm:flex-row gap-2 p-2">
              <div className="space-y-1">
                <p className="text-sm font-medium">Start Date</p>
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    if (date) {
                      onStartDateChange(date);
                    }
                  }}
                  className={cn("rounded border p-3 pointer-events-auto")}
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">End Date</p>
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    if (date) {
                      onEndDateChange(date);
                    }
                  }}
                  className={cn("rounded border p-3 pointer-events-auto")}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
