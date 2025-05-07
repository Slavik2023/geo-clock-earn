
import { useState } from "react";
import { UserInfo } from "@/components/admin/types";
import { UserManagementState, UserManagementActions } from "./types";

export function useUserManagementState(): UserManagementState & UserManagementActions {
  // State
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [userToEdit, setUserToEdit] = useState<UserInfo | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return {
    // State
    users,
    isLoading,
    selectedUser,
    userToEdit,
    userToDelete,
    showEditDialog,
    showDeleteDialog,
    editDialogOpen,
    deleteDialogOpen,
    // Actions
    setUsers,
    setIsLoading,
    setSelectedUser,
    setUserToEdit,
    setUserToDelete,
    setShowEditDialog,
    setShowDeleteDialog,
    setEditDialogOpen,
    setDeleteDialogOpen,
  };
}
