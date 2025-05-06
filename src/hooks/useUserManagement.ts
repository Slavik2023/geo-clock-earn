
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
  
  // Add missing properties to match the tests
  const [userToEdit, setUserToEdit] = useState<UserInfo | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  // Add missing property openEditUserDialog to match tests
  const openEditUserDialog = (user: UserInfo) => {
    setUserToEdit(user);
    setShowEditDialog(true);
    // For compatibility with existing code
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  // Add missing property handleEditUser to match tests
  const handleEditUser = async (formData: UserFormData) => {
    if (!userToEdit) return false;
    return await updateUser(userToEdit.id, formData);
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
      
      toast.success("User information updated");
      
      await fetchUsers();
      setShowEditDialog(false);
      setEditDialogOpen(false);
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error("Failed to update user");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Add missing property toggleAdminStatus to match tests
  const toggleAdminStatus = async (userId: string, isAdmin: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ is_admin: !isAdmin })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast.success(isAdmin ? "Admin status revoked" : "Admin status granted");
      
      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error toggling admin status:', error);
      toast.error("Failed to update admin status");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Add missing property toggleBlockUser to match tests
  const toggleBlockUser = async (userId: string, isBlocked: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ 
          role: isBlocked ? 'user' as UserRoleType : 'blocked' as UserRoleType
        })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast.success(isBlocked ? "User unblocked" : "User blocked");
      
      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error toggling block status:', error);
      toast.error("Failed to update user status");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Add missing property confirmDeleteUser to match tests
  const confirmDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteDialog(true);
  };

  // Update handleDeleteUser to match tests
  const handleDeleteUser = async () => {
    if (!userToDelete) return false;
    return await deleteUser(userToDelete);
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
      
      toast.success("User marked as deleted");
      
      await fetchUsers();
      setShowDeleteDialog(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error("Failed to delete user");
      return false;
    } finally {
      setIsLoading(false);
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
    updateUser,
    deleteUser,
    // Add missing properties to match tests
    userToEdit,
    setUserToEdit,
    showEditDialog,
    setShowEditDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    userToDelete,
    setUserToDelete,
    openEditUserDialog,
    handleEditUser,
    toggleAdminStatus,
    toggleBlockUser,
    confirmDeleteUser,
    handleDeleteUser
  };
}
