
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { toast } from "sonner";
import { AssignSuperAdminForm } from "./super-admin/AssignSuperAdminForm";
import { UserSearch } from "./super-admin/UserSearch";
import { UsersTable } from "./super-admin/UsersTable";

export function SuperAdminManagement() {
  const { 
    users, 
    isLoading, 
    searchTerm, 
    setSearchTerm, 
    fetchAllUsers,
    updateUserRole,
    blockUser,
    setSuperAdminStatus
  } = useSuperAdmin();

  const handleToggleTeamFeature = async (userId: string, hasTeamFeature: boolean) => {
    const role = hasTeamFeature ? 'user' : 'admin';
    const success = await updateUserRole(userId, role);
    if (success) {
      toast.success(`Team feature ${hasTeamFeature ? 'disabled' : 'enabled'} for user`);
      fetchAllUsers();
    }
  };

  const handleToggleBlockUser = async (userId: string, isCurrentlyBlocked: boolean) => {
    const success = await blockUser(userId, isCurrentlyBlocked);
    if (success) {
      toast.success(`User ${isCurrentlyBlocked ? 'unblocked' : 'blocked'} successfully`);
      fetchAllUsers();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Super Administrator Controls</CardTitle>
          <CardDescription>
            Manage system users and permissions. These controls are only available to Super Administrators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AssignSuperAdminForm 
              setSuperAdminStatus={setSuperAdminStatus} 
              fetchAllUsers={fetchAllUsers} 
            />

            <div className="pt-4">
              <h3 className="text-lg font-medium mb-2">All System Users</h3>
              <UserSearch 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                fetchAllUsers={fetchAllUsers} 
                isLoading={isLoading} 
              />
              
              <UsersTable 
                users={users}
                isLoading={isLoading}
                handleToggleTeamFeature={handleToggleTeamFeature}
                handleToggleBlockUser={handleToggleBlockUser}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            With great power comes great responsibility. These actions are logged for security purposes.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
