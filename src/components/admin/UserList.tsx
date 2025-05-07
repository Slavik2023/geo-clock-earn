
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
        return "Супер-администратор";
      case 'admin':
        return "Администратор";
      case 'manager':
        return "Менеджер";
      case 'worker':
        return "Сотрудник";
      case 'user':
        return "Пользователь";
      case 'blocked':
        return "Заблокирован";
      case 'deleted':
        return "Удален";
      default:
        return role;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Имя / Email</TableHead>
            <TableHead>Роль</TableHead>
            <TableHead>Ставка</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                Загрузка...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4">
                Пользователи не найдены
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium">{user.name || "Без имени"}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {formatRoleName(user.role)}
                  </Badge>
                </TableCell>
                <TableCell>
                  ${user.hourlyRate}/час
                </TableCell>
                <TableCell>
                  {user.role === 'blocked' ? (
                    <Badge variant="destructive">Заблокирован</Badge>
                  ) : user.role === 'deleted' ? (
                    <Badge variant="destructive">Удален</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-50">Активен</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(user)}
                    disabled={user.role === 'deleted'}
                  >
                    Изменить
                  </Button>
                  {user.role !== 'super_admin' && user.role !== 'deleted' && (
                    <Button
                      variant={user.role === 'blocked' ? "outline" : "secondary"}
                      size="sm"
                      onClick={() => onToggleBlock(user.id, user.role === 'blocked')}
                    >
                      {user.role === 'blocked' ? "Разблокировать" : "Блокировать"}
                    </Button>
                  )}
                  {user.role !== 'super_admin' && user.role !== 'deleted' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleAdmin(user.id, user.isAdmin)}
                    >
                      {user.isAdmin ? "Убрать админа" : "Сделать админом"}
                    </Button>
                  )}
                  {user.role !== 'super_admin' && user.role !== 'deleted' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(user.id)}
                    >
                      Удалить
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
