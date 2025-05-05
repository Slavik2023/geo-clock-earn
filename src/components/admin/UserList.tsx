
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserInfo } from "./types";

interface UserListProps {
  users: UserInfo[];
  isLoading: boolean;
  onEdit: (user: UserInfo) => void;
  onToggleBlock: (userId: string, isBlocked: boolean) => void;
  onToggleAdmin: (userId: string, isAdmin: boolean) => void;
  onDelete: (userId: string) => void;
}

export function UserList({
  users,
  isLoading,
  onEdit,
  onToggleBlock,
  onToggleAdmin,
  onDelete,
}: UserListProps) {
  // Function to get role badge variant based on role
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name / Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Hourly Rate</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
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
              <TableRow key={user.id}>
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
                  ${user.hourlyRate}/hr
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
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(user)}
                    disabled={user.role === 'deleted'}
                  >
                    Edit
                  </Button>
                  {user.role !== 'super_admin' && user.role !== 'deleted' && (
                    <Button
                      variant={user.role === 'blocked' ? "outline" : "secondary"}
                      size="sm"
                      onClick={() => onToggleBlock(user.id, user.role === 'blocked')}
                    >
                      {user.role === 'blocked' ? "Unblock" : "Block"}
                    </Button>
                  )}
                  {user.role !== 'super_admin' && user.role !== 'deleted' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleAdmin(user.id, user.isAdmin)}
                    >
                      {user.isAdmin ? "Remove Admin" : "Make Admin"}
                    </Button>
                  )}
                  {user.role !== 'super_admin' && user.role !== 'deleted' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(user.id)}
                    >
                      Delete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
