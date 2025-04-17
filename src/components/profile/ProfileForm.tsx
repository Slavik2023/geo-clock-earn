
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalDetails } from "./PersonalDetails";
import { RateSettings } from "./RateSettings";
import { FeatureToggles } from "./FeatureToggles";

interface ProfileFormProps {
  isLoading: boolean;
  name: string;
  setName: (name: string) => void;
  hourlyRate: number;
  setHourlyRate: (rate: number) => void;
  overtimeRate: number;
  setOvertimeRate: (rate: number) => void;
  overtimeThreshold: number;
  setOvertimeThreshold: (threshold: number) => void;
  enableLocationVerification: boolean;
  setEnableLocationVerification: (enable: boolean) => void;
  enableOvertimeCalculation: boolean;
  setEnableOvertimeCalculation: (enable: boolean) => void;
  onSave: () => void;
}

export function ProfileForm({
  isLoading,
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
  setEnableOvertimeCalculation,
  onSave
}: ProfileFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <PersonalDetails 
          name={name} 
          setName={setName} 
        />
        
        <RateSettings 
          hourlyRate={hourlyRate}
          setHourlyRate={setHourlyRate}
          overtimeRate={overtimeRate}
          setOvertimeRate={setOvertimeRate}
          overtimeThreshold={overtimeThreshold}
          setOvertimeThreshold={setOvertimeThreshold}
        />
        
        <FeatureToggles 
          enableLocationVerification={enableLocationVerification}
          setEnableLocationVerification={setEnableLocationVerification}
          enableOvertimeCalculation={enableOvertimeCalculation}
          setEnableOvertimeCalculation={setEnableOvertimeCalculation}
        />
        
        <Button 
          className="w-full mt-4" 
          onClick={onSave}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}
