
import { useEffect } from "react";
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
  const { fetchUsers } = useUserManagementQueries(setUsers, setIsLoading);
  
  // Get mutations
  const { 
    updateUser, 
    deleteUser, 
    toggleAdminStatus, 
    toggleBlockUser 
  } = useUserManagementActions(fetchUsers, setIsLoading);

  // Fetch users on initial load
  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  // Helper function to open edit dialog
  const openEditUserDialog = (user: UserInfo) => {
    setUserToEdit(user);
    setShowEditDialog(true);
    // For compatibility with existing code
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  // Helper function to handle user edit
  const handleEditUser = async (formData: UserFormData) => {
    if (!userToEdit) return false;
    return await updateUser(userToEdit.id, formData);
  };

  // Helper function to confirm delete
  const confirmDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteDialog(true);
  };

  // Helper function to handle delete
  const handleDeleteUser = async () => {
    if (!userToDelete) return false;
    const result = await deleteUser(userToDelete);
    if (result) {
      setShowDeleteDialog(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
    return result;
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
