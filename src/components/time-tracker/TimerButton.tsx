
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";

interface TimerButtonProps {
  isActive: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function TimerButton({ 
  isActive, 
  onToggle, 
  isLoading = false,
  disabled = false 
}: TimerButtonProps) {
  return (
    <Button
      onClick={onToggle}
      disabled={disabled || isLoading}
      className={cn(
        "w-32 h-32 rounded-full transition-all duration-300",
        isActive 
          ? "bg-red-500 hover:bg-red-600" 
          : "bg-brand-blue hover:bg-brand-blue-600",
        isLoading && "opacity-70"
      )}
    >
      <div className="flex flex-col items-center justify-center">
        {isLoading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        ) : (
          <>
            {isActive ? (
              <>
                <Square size={32} className="mb-1" />
                <span className="text-sm font-medium">STOP</span>
              </>
            ) : (
              <>
                <Play size={32} className="mb-1" />
                <span className="text-sm font-medium">START</span>
              </>
            )}
          </>
        )}
      </div>
    </Button>
  );
}
