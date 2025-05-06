
import { toast } from "sonner";

export const useTimerErrorHandler = () => {
  const handleError = (error: any) => {
    console.error("Error toggling timer:", error);
    toast.error("An error occurred. Please try again.");
  };

  return { handleError };
};
