
import { useCallback, useEffect } from "react";
import { useAuth } from "@/App";
import { UserInfo, UserFormData } from "@/components/admin/types";
import { useUserManagementState } from "./useUserManagementState";
import { useUserManagementQueries } from "./useUserManagementQueries";
import { useUserManagementActions } from "./useUserManagementActions";

export function useUserManagement() {
  const { user } = useAuth();
  
  // Get state and state setters
  const {
    users,
    isLoading,
    selectedUser,
    userToEdit,
    userToDelete,
    showEditDialog,
    showDeleteDialog,
    editDialogOpen,
    deleteDialogOpen,
    setUsers,
    setIsLoading,
    setSelectedUser,
    setUserToEdit,
    setUserToDelete,
    setShowEditDialog,
    setShowDeleteDialog,
    setEditDialogOpen,
    setDeleteDialogOpen
  } = useUserManagementState();
  
  // Get queries
  const { fetchUsers: fetchUsersQuery } = useUserManagementQueries(setUsers, setIsLoading);
  
  // Get mutations
  const { 
    updateUser, 
    deleteUser, 
    toggleAdminStatus, 
    toggleBlockUser 
  } = useUserManagementActions(fetchUsersQuery, setIsLoading);

  // Wrap fetchUsers in useCallback to prevent infinite loop
  const fetchUsers = useCallback(() => {
    if (user) {
      return fetchUsersQuery();
    }
    return Promise.resolve();
  }, [user, fetchUsersQuery]);

  // Fetch users on initial load
  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user, fetchUsers]);

  // Helper function to open edit dialog
  const openEditUserDialog = useCallback((user: UserInfo) => {
    setUserToEdit(user);
    setShowEditDialog(true);
    // Also set these for backward compatibility
    setSelectedUser(user);
    setEditDialogOpen(true);
  }, [setUserToEdit, setShowEditDialog, setSelectedUser, setEditDialogOpen]);

  // Helper function to handle user edit
  const handleEditUser = useCallback(async (formData: UserFormData) => {
    if (!userToEdit) return false;
    const success = await updateUser(userToEdit.id, formData);
    if (success) {
      setShowEditDialog(false);
      setEditDialogOpen(false);
      setUserToEdit(null);
    }
    return success;
  }, [userToEdit, updateUser, setShowEditDialog, setEditDialogOpen, setUserToEdit]);

  // Helper function to confirm delete
  const confirmDeleteUser = useCallback((userId: string) => {
    setUserToDelete(userId);
    setShowDeleteDialog(true);
    setDeleteDialogOpen(true);
  }, [setUserToDelete, setShowDeleteDialog, setDeleteDialogOpen]);

  // Helper function to handle delete
  const handleDeleteUser = useCallback(async () => {
    if (!userToDelete) return false;
    const result = await deleteUser(userToDelete);
    if (result) {
      setShowDeleteDialog(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
    return result;
  }, [userToDelete, deleteUser, setShowDeleteDialog, setDeleteDialogOpen, setUserToDelete]);

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
    // Expose additional properties to maintain the same API
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
