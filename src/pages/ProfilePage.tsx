
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase, UserSettings } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function ProfilePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userSettingsId, setUserSettingsId] = useState<string | null>(null);
  
  // User profile settings
  const [name, setName] = useState('');
  const [hourlyRate, setHourlyRate] = useState(25);
  const [overtimeRate, setOvertimeRate] = useState(37.5);
  const [overtimeThreshold, setOvertimeThreshold] = useState(8);
  const [enableLocationVerification, setEnableLocationVerification] = useState(true);
  const [enableOvertimeCalculation, setEnableOvertimeCalculation] = useState(true);
  
  // Load user settings from Supabase
  useEffect(() => {
    async function loadUserSettings() {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          toast({
            title: "Authentication Required",
            description: "Please sign in to access your profile",
            variant: "destructive"
          });
          return;
        }
        
        setUserId(userData.user.id);
        
        const { data: settingsData, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userData.user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error loading settings:", error);
          toast({
            title: "Error",
            description: "Failed to load settings",
            variant: "destructive"
          });
          return;
        }
        
        if (settingsData) {
          setName(settingsData.name || '');
          setHourlyRate(settingsData.hourly_rate);
          setOvertimeRate(settingsData.overtime_rate || 37.5);
          setOvertimeThreshold(settingsData.overtime_threshold || 8);
          setEnableLocationVerification(settingsData.enable_location_verification ?? true);
          setEnableOvertimeCalculation(settingsData.enable_overtime_calculation ?? true);
          setUserSettingsId(settingsData.id);
        }
      } catch (error) {
        console.error("Error in profile page:", error);
      }
    }
    
    loadUserSettings();
  }, [toast]);
  
  const handleSaveSettings = async () => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your settings",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (userSettingsId) {
        // For updates, we don't need to include user_id
        const updateData = {
          name,
          hourly_rate: hourlyRate,
          overtime_rate: overtimeRate,
          overtime_threshold: overtimeThreshold,
          enable_location_verification: enableLocationVerification,
          enable_overtime_calculation: enableOvertimeCalculation,
          updated_at: new Date().toISOString()
        };
        
        const result = await supabase
          .from('user_settings')
          .update(updateData)
          .eq('id', userSettingsId);
          
        if (result.error) {
          throw result.error;
        }
      } else {
        // For inserts, we need to include user_id
        const insertData = {
          user_id: userId,
          name,
          hourly_rate: hourlyRate,
          overtime_rate: overtimeRate,
          overtime_threshold: overtimeThreshold,
          enable_location_verification: enableLocationVerification,
          enable_overtime_calculation: enableOvertimeCalculation,
          updated_at: new Date().toISOString()
        };
        
        const result = await supabase
          .from('user_settings')
          .insert(insertData);
          
        if (result.error) {
          throw result.error;
        }
      }
      
      toast({
        title: "Settings Saved",
        description: "Your profile settings have been updated successfully"
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Your name"
            />
          </div>
          
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
          
          <Button 
            className="w-full mt-4" 
            onClick={handleSaveSettings}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
