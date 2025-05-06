
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, subDays } from "date-fns";

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
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <h2 className="text-lg font-medium">Date Range</h2>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              <span>
                {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="single"
              selected={startDate}
              onSelect={(date) => {
                if (date) {
                  onStartDateChange(date);
                  setCalendarOpen(false);
                }
              }}
              numberOfMonths={1}
              className="pointer-events-auto"
            />
            <Calendar
              initialFocus
              mode="single"
              selected={endDate}
              onSelect={(date) => {
                if (date) {
                  onEndDateChange(date);
                  setCalendarOpen(false);
                }
              }}
              numberOfMonths={1}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleQuickFilter(7)}
        >
          Last 7 Days
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleQuickFilter(30)}
        >
          Last 30 Days
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleQuickFilter(90)}
        >
          Last 90 Days
        </Button>
      </div>
    </div>
  );
}
