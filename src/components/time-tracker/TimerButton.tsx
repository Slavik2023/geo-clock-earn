
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Play, Square, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TimerButtonProps {
  isActive: boolean;
  onToggle: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  hasError?: boolean;
}

export function TimerButton({ 
  isActive, 
  onToggle, 
  isLoading = false,
  disabled = false,
  hasError = false
}: TimerButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onToggle}
            disabled={disabled || isLoading}
            className={cn(
              "w-32 h-32 rounded-full transition-all duration-300 relative",
              isActive 
                ? "bg-red-500 hover:bg-red-600" 
                : "bg-brand-blue hover:bg-brand-blue-600",
              isLoading && "opacity-70"
            )}
            aria-label={isActive ? "Stop timer" : "Start timer"}
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
            
            {hasError && isActive && (
              <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-1">
                <AlertCircle size={16} />
              </div>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {hasError && isActive 
            ? "Timer is running locally only (server connection issue)" 
            : isActive 
              ? "Stop timer" 
              : "Start timer"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
