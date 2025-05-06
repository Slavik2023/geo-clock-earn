
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/App";
import { UserInfo, UserFormData } from "@/components/admin/types";
import { UserRoleType } from "./user-settings";

export function useUserManagement() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchUsers = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*');
      
      if (error) throw error;
      
      // Map database fields to UserInfo format
      const mappedUsers: UserInfo[] = (data || []).map(userSetting => ({
        id: userSetting.user_id,
        name: userSetting.name || 'Unnamed User',
        email: '', // We'll need to get this from a separate query or store it in user_settings
        createdAt: userSetting.updated_at || new Date().toISOString(),
        isAdmin: userSetting.is_admin || false,
        role: userSetting.role as UserRoleType,
        hourlyRate: userSetting.hourly_rate || 0,
        isBlocked: userSetting.role === 'blocked'
      }));
      
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  const handleEditUser = (user: UserInfo) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleDeleteUser = (user: UserInfo) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const updateUser = async (userId: string, userData: UserFormData) => {
    if (!user) return false;
    
    setIsLoading(true);
    try {
      // Update user settings in the database
      const { error } = await supabase
        .from('user_settings')
        .update({
          name: userData.name,
          role: userData.role as UserRoleType,
          hourly_rate: userData.hourlyRate,
          is_admin: userData.isAdmin
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast.success('User updated successfully');
      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
      return false;
    } finally {
      setIsLoading(false);
      setEditDialogOpen(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!user) return false;
    
    setIsLoading(true);
    try {
      // We don't actually delete the user, just mark them as deleted
      const { error } = await supabase
        .from('user_settings')
        .update({ 
          role: 'deleted' as UserRoleType
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast.success('User deleted successfully');
      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
      return false;
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  return {
    users,
    isLoading,
    selectedUser,
    setSelectedUser,
    editDialogOpen,
    setEditDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    fetchUsers,
    handleEditUser,
    handleDeleteUser,
    updateUser,
    deleteUser
  };
}
