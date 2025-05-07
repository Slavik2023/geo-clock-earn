
import { Switch } from "@/components/ui/switch";
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
import { Ban, Unlock } from "lucide-react";
import { SuperAdminUser } from "@/hooks/super-admin/types";
import { UserRoleBadge } from "./UserRoleBadge";

interface UsersTableProps {
  users: SuperAdminUser[];
  isLoading: boolean;
  handleToggleTeamFeature: (userId: string, hasTeamFeature: boolean) => Promise<void>;
  handleToggleBlockUser: (userId: string, isCurrentlyBlocked: boolean) => Promise<void>;
}

export function UsersTable({
  users,
  isLoading,
  handleToggleTeamFeature,
  handleToggleBlockUser,
}: UsersTableProps) {
  return (
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
                  <UserRoleBadge role={user.role} />
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
  );
}
