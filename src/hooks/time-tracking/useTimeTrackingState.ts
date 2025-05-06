
import { useState } from "react";
import { LocationDetails } from "@/components/time-tracker/types/LocationTypes";

export const useTimeTrackingState = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [locationDetails, setLocationDetails] = useState<LocationDetails | null>(null);
  const [localTimerActive, setLocalTimerActive] = useState<boolean>(false);
  const [errorOccurred, setErrorOccurred] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [retryAttempts, setRetryAttempts] = useState<number>(0);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);

  const setError = (message: string, code?: string, type?: string) => {
    setErrorMessage(message);
    setErrorOccurred(true);
    if (code) setErrorCode(code);
    if (type) setErrorType(type);
  };

  const clearError = () => {
    setErrorOccurred(false);
    setErrorMessage("");
    setErrorCode(null);
    setErrorType(null);
    setRetryAttempts(0);
  };

  return {
    isLoading,
    setIsLoading,
    locationDetails,
    setLocationDetails,
    localTimerActive,
    setLocalTimerActive,
    errorOccurred,
    setErrorOccurred,
    errorMessage,
    setErrorMessage,
    errorCode,
    errorType,
    setError,
    clearError,
    retryAttempts,
    setRetryAttempts
  };
};
