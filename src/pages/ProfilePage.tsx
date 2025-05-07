
import { Button } from "@/components/ui/button";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useSuperAdminProfile } from "@/hooks/user-settings/useSuperAdminProfile";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfilePage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const {
    isLoading,
    name,
    setName,
    email,
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
    bio,
    setBio,
    saveSettings,
    userRole,
    isAdmin,
    isSuperAdmin
  } = useUserSettings();
  
  const { createSuperAdminProfile, isUpdating } = useSuperAdminProfile();
  
  // Add a handler function that properly handles the button click event
  const handleCreateSuperAdmin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await createSuperAdminProfile();
  };
  
  // Add a handler to save profile settings with success/error feedback
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await saveSettings();
      toast({
        title: "Profile updated",
        description: "Your profile settings have been saved successfully."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error saving profile",
        description: "There was a problem saving your profile settings. Please try again."
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            {userRole && (
              <div className="flex items-center gap-2">
                <span>Current Role:</span>
                <span className="font-medium capitalize">{userRole}</span>
                {isAdmin && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Admin</span>
                )}
                {isSuperAdmin && (
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Super Admin</span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <ProfileForm 
        isLoading={isLoading || isSaving}
        name={name}
        setName={setName}
        email={email}
        bio={bio}
        setBio={setBio}
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
        onSave={handleSaveSettings}
      />
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Advanced Options</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleCreateSuperAdmin}
              disabled={isUpdating || isSuperAdmin}
            >
              {isUpdating ? "Processing..." : isSuperAdmin ? "You are a Super Admin" : "Become Super Admin"}
            </Button>
            
            {isSuperAdmin && (
              <p className="text-xs text-muted-foreground mt-2">
                You already have Super Admin privileges.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
