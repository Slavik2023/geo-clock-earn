
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/App";
import { useToast } from "@/components/ui/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { UserManagement } from "@/components/admin/UserManagement";
import { TeamManagement } from "@/components/admin/TeamManagement";
import { SettingsManagement } from "@/components/admin/SettingsManagement";
import { SuperAdminManagement } from "@/components/admin/SuperAdminManagement";
import { Navigate } from "react-router-dom";

export function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string>('user');
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if current user is a super admin or admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("user_settings")
          .select("is_admin, role")
          .eq("user_id", user.id)
          .single();
        
        if (error) throw error;
        
        // Check user role based on the new enum system
        setUserRole(data?.role || 'user');
        setIsAdminUser(data?.is_admin || data?.role === 'admin' || data?.role === 'super_admin');
        setIsSuperAdmin(data?.role === 'super_admin');
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify administrator permissions"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminStatus();
  }, [user, toast]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Redirect non-admin users
  if (!isAdminUser) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="space-y-6 p-2">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Administrator Panel</h1>
        <p className="text-muted-foreground">
          Manage users, teams, and system settings
        </p>
      </div>
      
      {isSuperAdmin && (
        <div className="mb-6">
          <SuperAdminManagement />
        </div>
      )}
      
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          <UserManagement />
        </TabsContent>
        <TabsContent value="teams" className="space-y-4">
          <TeamManagement />
        </TabsContent>
        <TabsContent value="settings" className="space-y-4">
          <SettingsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
