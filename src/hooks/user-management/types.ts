
import { UserFormData, UserInfo } from "@/components/admin/types";
import { UserRoleType } from "@/hooks/user-settings";

export interface UserManagementState {
  users: UserInfo[];
  isLoading: boolean;
  selectedUser: UserInfo | null;
  userToEdit: UserInfo | null;
  userToDelete: string | null;
  showEditDialog: boolean;
  showDeleteDialog: boolean;
  editDialogOpen: boolean;
  deleteDialogOpen: boolean;
}

export interface UserManagementActions {
  setUsers: (users: UserInfo[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setSelectedUser: (user: UserInfo | null) => void;
  setUserToEdit: (user: UserInfo | null) => void;
  setUserToDelete: (userId: string | null) => void;
  setShowEditDialog: (show: boolean) => void;
  setShowDeleteDialog: (show: boolean) => void;
  setEditDialogOpen: (open: boolean) => void;
  setDeleteDialogOpen: (open: boolean) => void;
}

export interface UserManagementQueries {
  fetchUsers: () => Promise<void>;
}

export interface UserManagementMutations {
  updateUser: (userId: string, userData: UserFormData) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  toggleAdminStatus: (userId: string, isAdmin: boolean) => Promise<boolean>;
  toggleBlockUser: (userId: string, isBlocked: boolean) => Promise<boolean>;
}
