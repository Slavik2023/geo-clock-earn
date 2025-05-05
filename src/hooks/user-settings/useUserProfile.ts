
import { useState } from "react";

export function useUserProfile() {
  // User profile settings
  const [name, setName] = useState('');
  const [hourlyRate, setHourlyRate] = useState(25);
  const [overtimeRate, setOvertimeRate] = useState(37.5);
  const [overtimeThreshold, setOvertimeThreshold] = useState(8);
  const [enableLocationVerification, setEnableLocationVerification] = useState(true);
  const [enableOvertimeCalculation, setEnableOvertimeCalculation] = useState(true);

  return {
    name,
    setName,
    hourlyRate,
    setHourlyRate,
    overtimeRate,
    setOvertimeRate,
    overtimeThreshold,
    setOvertimeThreshold,
    enableLocationVerification,
    setEnableLocationVerification,
    enableOvertimeCalculation,
    setEnableOvertimeCalculation
  };
}
