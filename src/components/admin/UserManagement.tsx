
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { UserInfo } from "./types";

export function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userToEdit, setUserToEdit] = useState<UserInfo | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Fetch all users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Get users with their settings joined
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;

      if (!authUsers?.users) {
        setUsers([]);
        return;
      }

      // Get user settings
      const { data: userSettings, error: settingsError } = await supabase
        .from("user_settings")
        .select("*");

      if (settingsError) throw settingsError;

      // Combine the data
      const combinedUsers = authUsers.users.map(user => {
        const settings = userSettings?.find(s => s.user_id === user.id) || {
          name: "",
          is_admin: false,
          role: "user",
          hourly_rate: 25
        };
        
        return {
          id: user.id,
          email: user.email,
          createdAt: user.created_at,
          name: settings.name || "",
          isAdmin: settings.is_admin || false,
          role: settings.role || "user",
          hourlyRate: settings.hourly_rate || 25,
        };
      });

      setUsers(combinedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить список пользователей"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleAdminStatus = async (userId: string, isCurrentlyAdmin: boolean) => {
    try {
      const { error } = await supabase
        .from("user_settings")
        .update({ is_admin: !isCurrentlyAdmin })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Успех",
        description: `Статус администратора ${isCurrentlyAdmin ? "отозван" : "назначен"}`
      });

      // Refresh user list
      fetchUsers();
    } catch (error) {
      console.error("Error toggling admin status:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось изменить статус пользователя"
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      const { error } = await supabase.auth.admin.deleteUser(
        userToDelete
      );

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Пользователь удален"
      });

      // Refresh user list
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить пользователя"
      });
    } finally {
      setShowDeleteDialog(false);
      setUserToDelete(null);
    }
  };

  const confirmDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteDialog(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Пользователи</h2>
        <Button 
          onClick={() => fetchUsers()} 
          variant="outline" 
          disabled={isLoading}
        >
          Обновить
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Загрузка...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя / Email</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Почасовая ставка</TableHead>
                <TableHead>Дата регистрации</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
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
                      {user.isAdmin ? (
                        <Badge variant="default">Администратор</Badge>
                      ) : (
                        <Badge variant="outline">{user.role}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.hourlyRate} ₽/час
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAdminStatus(user.id, user.isAdmin)}
                      >
                        {user.isAdmin ? "Отменить админа" : "Сделать админом"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => confirmDeleteUser(user.id)}
                      >
                        Удалить
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие необратимо. Пользователь будет удален со всеми связанными данными.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
