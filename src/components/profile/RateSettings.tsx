
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RateSettingsProps {
  hourlyRate: number;
  setHourlyRate: (rate: number) => void;
  overtimeRate: number;
  setOvertimeRate: (rate: number) => void;
  overtimeThreshold: number;
  setOvertimeThreshold: (threshold: number) => void;
}

export function RateSettings({
  hourlyRate,
  setHourlyRate,
  overtimeRate,
  setOvertimeRate,
  overtimeThreshold,
  setOvertimeThreshold
}: RateSettingsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="hourlyRate">Default Hourly Rate ($)</Label>
        <Input 
          id="hourlyRate" 
          type="number" 
          value={hourlyRate} 
          onChange={(e) => setHourlyRate(parseFloat(e.target.value))} 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="overtimeRate">Overtime Rate ($)</Label>
        <Input 
          id="overtimeRate" 
          type="number" 
          value={overtimeRate} 
          onChange={(e) => setOvertimeRate(parseFloat(e.target.value))} 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="overtimeThreshold">Overtime Threshold (hours)</Label>
        <Input 
          id="overtimeThreshold" 
          type="number" 
          value={overtimeThreshold} 
          onChange={(e) => setOvertimeThreshold(parseInt(e.target.value))} 
        />
      </div>
    </>
  );
}
