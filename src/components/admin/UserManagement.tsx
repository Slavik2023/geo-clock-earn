
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useUserManagement } from "@/hooks/useUserManagement";
import { UserList } from "./UserList";
import { DeleteUserDialog } from "./dialogs/DeleteUserDialog";
import { EditUserDialog } from "./dialogs/EditUserDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw, Search, UserPlus } from "lucide-react";
import { useAuth } from "@/App";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export function UserManagement() {
  const { user } = useAuth();
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
  const [searchTerm, setSearchTerm] = useState("");

  // Reset error state on refresh
  const handleRefresh = () => {
    setHasError(false);
    console.log("Refreshing users data...");
    fetchUsers().catch(() => {
      setHasError(true);
      console.error("Failed to fetch users on refresh");
    });
  };

  useEffect(() => {
    console.log("UserManagement component mounted, current user ID:", user?.id);
    fetchUsers().catch((e) => {
      console.error("Error in initial users fetch:", e);
      setHasError(true);
    });
  }, [fetchUsers, user]);

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) || 
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  // Log users data for debugging
  useEffect(() => {
    console.log("Current users data:", users);
    if (users.length === 0 && !isLoading) {
      console.log("No users found. This could be due to permissions or data issues.");
    }
  }, [users, isLoading]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Пользователи команды</h2>
        <div className="flex gap-2">
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Поиск по имени или email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
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
            <p>Ошибка загрузки пользователей. Проверьте подключение и попробуйте снова.</p>
          </div>
          <Button 
            onClick={handleRefresh}
            variant="outline"
            className="mt-2"
            size="sm"
          >
            Попробовать снова
          </Button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-8 border rounded-md">
          <p className="text-muted-foreground">
            {searchTerm ? "Пользователи по запросу не найдены" : "Пользователи не найдены"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {searchTerm 
              ? "Попробуйте изменить параметры поиска" 
              : "Это может быть связано с настройками разрешений или отсутствием пользователей в системе."
            }
          </p>
          <Button onClick={handleRefresh} variant="link" size="sm">
            Обновить
          </Button>
        </div>
      ) : (
        <UserList 
          users={filteredUsers}
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
