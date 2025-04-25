
import { Button } from "@/components/ui/button";
import { useUserSettings } from "@/hooks/useUserSettings";
import { ProfileForm } from "@/components/profile/ProfileForm";

export function ProfilePage() {
  const {
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
    saveSettings,
    createSuperAdminProfile
  } = useUserSettings();
  
  return (
    <div className="space-y-6">
      <ProfileForm 
        isLoading={isLoading}
        name={name}
        setName={setName}
        hourlyRate={hourlyRate}
        setHourlyRate={setHourlyRate}
        overtimeRate={overtimeRate}
        setOvertimeRate={setOvertimeRate}
        overtimeThreshold={overtimeThreshold}
        setOvertimeThreshold={setOvertimeThreshold}
        enableLocationVerification={enableLocationVerification}
        setEnableLocationVerification={setEnableLocationVerification}
        enableOvertimeCalculation={enableOvertimeCalculation}
        setEnableOvertimeCalculation={setEnableOvertimeCalculation}
        onSave={saveSettings}
      />
      
      <div className="mt-8">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={createSuperAdminProfile}
        >
          Create Super Admin Profile
        </Button>
      </div>
    </div>
  );
}
