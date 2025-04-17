
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface FeatureTogglesProps {
  enableLocationVerification: boolean;
  setEnableLocationVerification: (enable: boolean) => void;
  enableOvertimeCalculation: boolean;
  setEnableOvertimeCalculation: (enable: boolean) => void;
}

export function FeatureToggles({
  enableLocationVerification,
  setEnableLocationVerification,
  enableOvertimeCalculation,
  setEnableOvertimeCalculation
}: FeatureTogglesProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <Label htmlFor="locationVerification">Enable Location Verification</Label>
        <Switch 
          id="locationVerification" 
          checked={enableLocationVerification}
          onCheckedChange={setEnableLocationVerification}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <Label htmlFor="overtimeCalculation">Enable Overtime Calculation</Label>
        <Switch 
          id="overtimeCalculation" 
          checked={enableOvertimeCalculation}
          onCheckedChange={setEnableOvertimeCalculation}
        />
      </div>
    </>
  );
}
