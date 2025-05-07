
import { Badge } from "@/components/ui/badge";

interface UserRoleBadgeProps {
  role: string;
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
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

  return (
    <Badge variant={getRoleBadgeVariant(role)}>
      {formatRoleName(role)}
    </Badge>
  );
}
