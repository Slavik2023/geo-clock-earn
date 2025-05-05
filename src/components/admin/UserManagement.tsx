
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { UserInfo, UserFormData } from "./types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Form schema
const userFormSchema = z.object({
  name: z.string().min(2, {
    message: "Имя должно содержать не менее 2 символов",
  }),
  role: z.string(),
  hourlyRate: z.coerce.number().positive({
    message: "Ставка должна быть положительным числом",
  }),
  isAdmin: z.boolean(),
});

export function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userToEdit, setUserToEdit] = useState<UserInfo | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      role: "user",
      hourlyRate: 25,
      isAdmin: false,
    },
  });

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
          isBlocked: user.banned_until !== null,
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

  const toggleBlockUser = async (userId: string, isCurrentlyBlocked: boolean) => {
    try {
      const bannedUntil = isCurrentlyBlocked ? null : '2100-01-01';
      
      const { error } = await supabase.auth.admin.updateUserById(
        userId,
        { banned_until: bannedUntil }
      );

      if (error) throw error;

      toast({
        title: "Успех",
        description: isCurrentlyBlocked ? "Пользователь разблокирован" : "Пользователь заблокирован"
      });

      // Refresh user list
      fetchUsers();
    } catch (error) {
      console.error("Error toggling user block status:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось изменить блокировку пользователя"
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

  const openEditUserDialog = (user: UserInfo) => {
    setUserToEdit(user);
    
    // Reset form with user data
    form.reset({
      name: user.name || "",
      role: user.role,
      hourlyRate: user.hourlyRate,
      isAdmin: user.isAdmin,
    });
    
    setShowEditDialog(true);
  };

  const handleEditUser = async (data: UserFormData) => {
    if (!userToEdit) return;
    
    try {
      const { error } = await supabase
        .from("user_settings")
        .update({
          name: data.name,
          role: data.role,
          hourly_rate: data.hourlyRate,
          is_admin: data.isAdmin
        })
        .eq("user_id", userToEdit.id);

      if (error) throw error;

      toast({
        title: "Успех",
        description: "Информация пользователя обновлена"
      });

      // Refresh user list
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить информацию пользователя"
      });
    } finally {
      setShowEditDialog(false);
      setUserToEdit(null);
    }
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
                <TableHead>Статус</TableHead>
                <TableHead>Дата регистрации</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
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
                      {user.isBlocked ? (
                        <Badge variant="destructive">Заблокирован</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50">Активен</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditUserDialog(user)}
                      >
                        Изменить
                      </Button>
                      <Button
                        variant={user.isBlocked ? "outline" : "secondary"}
                        size="sm"
                        onClick={() => toggleBlockUser(user.id, user.isBlocked || false)}
                      >
                        {user.isBlocked ? "Разблокировать" : "Блокировать"}
                      </Button>
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

      {/* Delete confirmation dialog */}
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

      {/* Edit user dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
            <DialogDescription>
              Измените настройки пользователя и нажмите Сохранить, когда закончите.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditUser)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите имя" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Роль</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите роль" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">Пользователь</SelectItem>
                        <SelectItem value="manager">Менеджер</SelectItem>
                        <SelectItem value="worker">Сотрудник</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Почасовая ставка (₽/час)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isAdmin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Администратор</FormLabel>
                      <FormDescription>
                        Предоставить права администратора
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Отмена
                </Button>
                <Button type="submit">Сохранить</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
