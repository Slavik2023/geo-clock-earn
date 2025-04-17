import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { MapPin } from "lucide-react";
import { LocationsManager } from "@/components/time-tracker/LocationsManager";
import { supabase } from "@/integrations/supabase/client";

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  hourlyRate: z.coerce.number().min(1, { message: "Hourly rate must be at least $1." }),
  overtimeRate: z.coerce.number().min(1, { message: "Overtime rate must be at least $1." }),
  overtimeThreshold: z.coerce.number().min(1, { message: "Overtime threshold must be at least 1 hour." }),
  enableLocationVerification: z.boolean().default(true),
  enableOvertimeCalculation: z.boolean().default(true),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function ProfilePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user when component mounts
  useEffect(() => {
    async function getCurrentUser() {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
        loadUserSettings();
      }
    }
    
    getCurrentUser();
  }, []);

  // Load user settings from localStorage
  const loadUserSettings = () => {
    try {
      const savedSettings = localStorage.getItem("userSettings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        form.reset({
          name: settings.name || "John Doe",
          hourlyRate: settings.hourlyRate || 25,
          overtimeRate: settings.overtimeRate || 37.5,
          overtimeThreshold: settings.overtimeThreshold || 8,
          enableLocationVerification: settings.enableLocationVerification !== false,
          enableOvertimeCalculation: settings.enableOvertimeCalculation !== false,
        });
      }
    } catch (error) {
      console.error("Error loading user settings:", error);
    }
  };

  // Default values for the form
  const defaultValues: Partial<ProfileFormValues> = {
    name: "John Doe",
    hourlyRate: 25,
    overtimeRate: 37.5,
    overtimeThreshold: 8,
    enableLocationVerification: true,
    enableOvertimeCalculation: true,
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true);
    
    try {
      // Save to localStorage
      localStorage.setItem("userSettings", JSON.stringify(data));
      
      toast({
        title: "Settings saved",
        description: "Your profile settings have been updated.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        title: "Error saving settings",
        description: "There was a problem saving your settings. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Profile & Settings</h2>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            Update your personal information and work preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Hourly Rate ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        step="0.01"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Your standard hourly pay rate (when no location specified)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="overtimeRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overtime Rate ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        step="0.01"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Your overtime hourly pay rate
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="overtimeThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overtime Threshold (hours)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        step="1"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Hours after which overtime rate applies
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="enableLocationVerification"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Location Verification
                      </FormLabel>
                      <FormDescription>
                        Require location verification for time tracking
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="enableOvertimeCalculation"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Overtime Calculation
                      </FormLabel>
                      <FormDescription>
                        Automatically calculate overtime rates
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Saved Locations
          </CardTitle>
          <CardDescription>
            Manage your work locations and hourly rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LocationsManager />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>App Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Updated</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            © 2025 WorkTime Tracker. All rights reserved.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
