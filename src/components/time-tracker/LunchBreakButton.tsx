
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Coffee } from "lucide-react";

interface LunchBreakButtonProps {
  onBreakStart: (duration: number) => void;
  isTimerRunning: boolean;
  disabled?: boolean;
}

export function LunchBreakButton({ 
  onBreakStart, 
  isTimerRunning, 
  disabled = false 
}: LunchBreakButtonProps) {
  const [showOptions, setShowOptions] = useState(false);
  
  if (!isTimerRunning) {
    return null;
  }
  
  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setShowOptions(!showOptions)}
        disabled={disabled}
        className="flex items-center gap-2"
      >
        <Coffee size={16} />
        <span>Take Lunch Break</span>
      </Button>
      
      {showOptions && (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-10 w-48">
          <Button 
            variant="ghost" 
            className="w-full justify-start mb-1"
            onClick={() => {
              onBreakStart(30);
              setShowOptions(false);
            }}
          >
            30 Minute Break
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={() => {
              onBreakStart(60);
              setShowOptions(false);
            }}
          >
            1 Hour Break
          </Button>
        </div>
      )}
    </div>
  );
}
