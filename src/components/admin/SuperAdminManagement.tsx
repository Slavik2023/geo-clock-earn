
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { 
  Table, 
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Search, UserPlus, User, Users, Lock, Unlock, Ban } from "lucide-react";
import { toast } from "sonner";

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

  const [emailInput, setEmailInput] = useState("");

  // Function to format role name for display
  const formatRoleName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return "Super Admin";
      case 'admin':
        return "Administrator";
      case 'manager':
        return "Manager";
      case 'worker':
        return "Worker";
      case 'user':
        return "User";
      case 'blocked':
        return "Blocked";
      case 'deleted':
        return "Deleted";
      default:
        return role;
    }
  };

  // Function to get badge variant based on role
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return "default";
      case 'admin':
        return "secondary";
      case 'manager':
        return "outline";
      case 'worker':
        return "outline";
      case 'blocked':
        return "destructive";
      case 'deleted':
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleAssignSuperAdmin = async () => {
    if (!emailInput.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailInput)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const success = await setSuperAdminStatus(emailInput);
    if (success) {
      setEmailInput("");
      fetchAllUsers();
    }
  };

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
            <div>
              <h3 className="text-lg font-medium mb-2">Assign Super Admin</h3>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter email address" 
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
                <Button onClick={handleAssignSuperAdmin}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Assign
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                The user will be granted super administrator privileges. Make sure they have registered first.
              </p>
            </div>

            <div className="pt-4">
              <h3 className="text-lg font-medium mb-2">All System Users</h3>
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search users..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchAllUsers} 
                  disabled={isLoading}
                >
                  Refresh
                </Button>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Team Feature</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.user_id}>
                          <TableCell>
                            <div className="font-medium">{user.name || "No name"}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(user.role)}>
                              {formatRoleName(user.role)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.role !== 'super_admin' && user.role !== 'deleted' && user.role !== 'blocked' && (
                              <div className="flex items-center">
                                <Switch
                                  checked={user.role === 'admin' || user.role === 'super_admin'}
                                  onCheckedChange={() => handleToggleTeamFeature(
                                    user.user_id, 
                                    user.role === 'admin' || user.role === 'super_admin'
                                  )}
                                  disabled={user.role === 'super_admin'}
                                />
                                <span className="ml-2">
                                  {(user.role === 'admin' || user.role === 'super_admin') ? 'Enabled' : 'Disabled'}
                                </span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.role === 'blocked' ? (
                              <Badge variant="destructive">Blocked</Badge>
                            ) : user.role === 'deleted' ? (
                              <Badge variant="destructive">Deleted</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-50">Active</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.role !== 'super_admin' && user.role !== 'deleted' && (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant={user.role === 'blocked' ? "outline" : "secondary"} 
                                  size="sm"
                                  onClick={() => handleToggleBlockUser(user.user_id, user.role === 'blocked')}
                                >
                                  {user.role === 'blocked' ? (
                                    <><Unlock className="h-4 w-4 mr-1" /> Unblock</>
                                  ) : (
                                    <><Ban className="h-4 w-4 mr-1" /> Block</>
                                  )}
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
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
