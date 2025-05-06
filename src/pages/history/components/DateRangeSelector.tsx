
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";

interface DateRangeSelectorProps {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

export function DateRangeSelector({ dateRange, setDateRange }: DateRangeSelectorProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleQuickFilter = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date(),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Work History</h1>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              <span>
                {dateRange.from ? format(dateRange.from, "MMM d") : "Start date"} - 
                {dateRange.to ? format(dateRange.to, "MMM d, yyyy") : "End date"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              selected={dateRange}
              onSelect={(newRange) => {
                if (newRange) {
                  setDateRange(newRange);
                  setCalendarOpen(false);
                }
              }}
              numberOfMonths={2}
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
