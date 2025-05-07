
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useUserManagement } from "@/hooks/useUserManagement";
import { UserList } from "./UserList";
import { DeleteUserDialog } from "./dialogs/DeleteUserDialog";
import { EditUserDialog } from "./dialogs/EditUserDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";

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

  const [hasError, setHasError] = useState(false);

  // Reset error state on refresh
  const handleRefresh = () => {
    setHasError(false);
    fetchUsers().catch(() => setHasError(true));
  };

  useEffect(() => {
    fetchUsers().catch(() => setHasError(true));
  }, [fetchUsers]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Team Users</h2>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : hasError ? (
        <div className="rounded-md border border-red-200 p-4 bg-red-50">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load users. Please check your connection and try again.</p>
          </div>
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="mt-2"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <p className="text-muted-foreground">No users found</p>
          <Button onClick={handleRefresh} variant="link" size="sm">
            Refresh
          </Button>
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
