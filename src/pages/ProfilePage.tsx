
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { PersonalDetails } from "@/components/profile/PersonalDetails";
import { RateSettings } from "@/components/profile/RateSettings";
import { FeatureToggles } from "@/components/profile/FeatureToggles";
import { TeamManagement } from "@/components/profile/TeamManagement";
import { useUserSettings } from "@/hooks/useUserSettings";
import { Button } from "@/components/ui/button";
import { useSuperAdminProfile } from "@/hooks/user-settings";
import { Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ProfilePage() {
  const { 
    userRole, 
    isSuperAdmin,
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
    setBio
  } = useUserSettings();
  
  const { createSuperAdminProfile, isUpdating } = useSuperAdminProfile();
  const [becomingSuperAdmin, setBecomingSuperAdmin] = useState(false);

  const handleBecomeSuperAdmin = async () => {
    setBecomingSuperAdmin(true);
    try {
      const success = await createSuperAdminProfile();
      if (success) {
        toast.success("You are now a super admin! Please refresh the page to see all admin features.");
      }
    } finally {
      setBecomingSuperAdmin(false);
    }
  };

  return (
    <div className="container max-w-5xl py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Super Admin Activation Section */}
      {!isSuperAdmin && (
        <Card className="p-4 mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Super Administrator Access</h3>
                <p className="text-sm text-muted-foreground">
                  Gain super admin privileges to manage all system functions
                </p>
              </div>
            </div>
            <Button 
              onClick={handleBecomeSuperAdmin} 
              disabled={becomingSuperAdmin || isUpdating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {(becomingSuperAdmin || isUpdating) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Become Super Admin
            </Button>
          </div>
        </Card>
      )}

      <Tabs defaultValue="personal">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="rates">Rates</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <PersonalDetails 
            name={name} 
            setName={setName} 
            email={email}
            bio={bio}
            setBio={setBio}
          />
        </TabsContent>

        <TabsContent value="rates" className="mt-6">
          <RateSettings 
            hourlyRate={hourlyRate}
            setHourlyRate={setHourlyRate}
            overtimeRate={overtimeRate}
            setOvertimeRate={setOvertimeRate}
            overtimeThreshold={overtimeThreshold}
            setOvertimeThreshold={setOvertimeThreshold}
          />
        </TabsContent>

        <TabsContent value="features" className="mt-6">
          <FeatureToggles 
            enableLocationVerification={enableLocationVerification}
            setEnableLocationVerification={setEnableLocationVerification}
            enableOvertimeCalculation={enableOvertimeCalculation}
            setEnableOvertimeCalculation={setEnableOvertimeCalculation}
          />
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <TeamManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
