
import { useAutoRetry } from "./useAutoRetry";
import { useManualRetry } from "./useManualRetry";

interface UseConnectionRetryProps {
  errorOccurred: boolean;
  isTracking: boolean;
  retryAttempts: number;
  setRetryAttempts: (attempts: number) => void;
  setErrorOccurred: (error: boolean) => void;
  startTime: Date | null;
  user: { id?: string } | null;
  createSession: (now: Date) => Promise<string | null>;
  saveSessionId: (id: string) => void;
  errorMessage?: string;
  setErrorMessage?: (message: string) => void;
}

export const useConnectionRetry = (props: UseConnectionRetryProps) => {
  const MAX_RETRY_ATTEMPTS = 3;
  
  // Use auto retry hook
  useAutoRetry({
    ...props,
    maxRetryAttempts: MAX_RETRY_ATTEMPTS
  });
  
  // Use manual retry hook with error categorization
  const { retryConnection, isPerformingRetry } = useManualRetry(props);

  return {
    retryConnection,
    isPerformingRetry,
    MAX_RETRY_ATTEMPTS
  };
};
