
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserFormData, UserInfo } from "@/components/admin/types";
import { UserRoleType } from "./user-settings/useUserRole";

export function useUserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userToEdit, setUserToEdit] = useState<UserInfo | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Fetch all users with a direct approach to avoid recursion errors
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // First get users from auth
      const { data: authUsers, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.error("Auth error:", authError);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please check your login or refresh the page"
        });
        setUsers([]);
        return;
      }

      if (!authUsers?.session) {
        console.log("No authenticated session found");
        setUsers([]);
        return;
      }

      // Get all users from the user_settings table instead of auth.admin
      const { data: userSettings, error: settingsError } = await supabase
        .from("user_settings")
        .select("*");

      if (settingsError) {
        console.error("Error fetching user settings:", settingsError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user data"
        });
        return;
      }

      // Get current user for additional details
      const { data: userData } = await supabase.auth.getUser();
      console.log("Current user:", userData?.user?.email);
      
      // Transform the data to the expected format
      const combinedUsers: UserInfo[] = userSettings ? userSettings.map(settings => {
        // Create a properly-typed UserInfo object
        return {
          id: settings.user_id,
          // Use the email from settings or fallback to user_id
          email: settings.email || `user-${settings.user_id}`, 
          createdAt: new Date().toISOString(),
          name: settings.name || "",
          isAdmin: settings.is_admin || settings.role === 'admin' || settings.role === 'super_admin',
          role: settings.role as UserRoleType || "user",
          hourlyRate: settings.hourly_rate || 25,
          isBlocked: settings.role === "blocked" || false
        };
      }) : [];

      console.log("Fetched users:", combinedUsers);
      setUsers(combinedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load user list"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, isCurrentlyAdmin: boolean) => {
    try {
      // Determine the new role based on current admin status
      const newRole = isCurrentlyAdmin ? 'user' : 'admin';
      
      const { error } = await supabase
        .from("user_settings")
        .update({ 
          is_admin: !isCurrentlyAdmin,
          role: newRole as UserRoleType
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Admin status ${isCurrentlyAdmin ? "revoked" : "assigned"}`
      });

      // Refresh user list
      fetchUsers();
    } catch (error) {
      console.error("Error toggling admin status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to change user status"
      });
    }
  };

  const toggleBlockUser = async (userId: string, isCurrentlyBlocked: boolean) => {
    try {
      // Update the user_settings table directly
      const { error } = await supabase
        .from("user_settings")
        .update({ 
          role: isCurrentlyBlocked ? "user" as UserRoleType : "blocked" as UserRoleType
        })
        .eq("user_id", userId);
          
      if (error) throw error;
        
      toast({
        title: "Success",
        description: isCurrentlyBlocked ? "User unblocked" : "User blocked"
      });
        
      fetchUsers();
    } catch (error) {
      console.error("Error toggling user block status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to change user block status"
      });
    }
  };

  const confirmDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteDialog(true);
  };
  
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      // Update user_settings to mark as deleted
      const { error } = await supabase
        .from("user_settings")
        .update({ role: "deleted" as UserRoleType })
        .eq("user_id", userToDelete);
  
      if (error) throw error;
  
      toast({
        title: "Success",
        description: "User marked as deleted"
      });
  
      // Refresh user list
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user"
      });
    } finally {
      setShowDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  const openEditUserDialog = (user: UserInfo) => {
    setUserToEdit(user);
    setShowEditDialog(true);
  };

  const handleEditUser = async (data: UserFormData) => {
    if (!userToEdit) return;
    
    try {
      const { error } = await supabase
        .from("user_settings")
        .update({
          name: data.name,
          role: data.role as UserRoleType,
          hourly_rate: data.hourlyRate,
          is_admin: data.isAdmin
        })
        .eq("user_id", userToEdit.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User information updated"
      });

      // Refresh user list
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user information"
      });
    } finally {
      setShowEditDialog(false);
      setUserToEdit(null);
    }
  };

  return {
    users,
    isLoading,
    fetchUsers,
    userToEdit,
    setUserToEdit,
    showDeleteDialog,
    setShowDeleteDialog,
    showEditDialog,
    setShowEditDialog,
    userToDelete,
    setUserToDelete,
    toggleAdminStatus,
    toggleBlockUser,
    confirmDeleteUser,
    handleDeleteUser,
    openEditUserDialog,
    handleEditUser
  };
}
