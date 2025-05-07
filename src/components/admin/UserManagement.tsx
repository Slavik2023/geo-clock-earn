
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUserManagement } from "@/hooks/useUserManagement";
import { UserList } from "./UserList";
import { DeleteUserDialog } from "./dialogs/DeleteUserDialog";
import { EditUserDialog } from "./dialogs/EditUserDialog";
import { Skeleton } from "@/components/ui/skeleton";

export function UserManagement() {
  const {
    users,
    isLoading,
    fetchUsers,
    userToEdit,
    showEditDialog,
    setShowEditDialog,
    showDeleteDialog,
    setShowDeleteDialog,
    toggleAdminStatus,
    toggleBlockUser,
    confirmDeleteUser,
    handleDeleteUser,
    openEditUserDialog,
    handleEditUser
  } = useUserManagement();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Team Users</h2>
        <Button 
          onClick={() => fetchUsers()} 
          variant="outline" 
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <UserList 
          users={users}
          isLoading={isLoading}
          onEdit={openEditUserDialog}
          onToggleBlock={toggleBlockUser}
          onToggleAdmin={toggleAdminStatus}
          onDelete={confirmDeleteUser}
        />
      )}

      {/* Delete confirmation dialog */}
      <DeleteUserDialog 
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteUser}
      />

      {/* Edit user dialog */}
      <EditUserDialog 
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        userToEdit={userToEdit}
        onSave={handleEditUser}
      />
    </div>
  );
}
