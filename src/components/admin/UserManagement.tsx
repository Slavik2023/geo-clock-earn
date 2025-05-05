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
    message: "Name must contain at least 2 characters",
  }),
  role: z.string(),
  hourlyRate: z.coerce.number().positive({
    message: "Rate must be a positive number",
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

  // Fetch all users with a direct approach to avoid recursion errors
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // First get users from auth
      const { data: authUsers, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.error("Auth error:", authError);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please check your login or refresh the page"
        });
        setUsers([]);
        return;
      }

      if (!authUsers?.session) {
        console.log("No authenticated session found");
        setUsers([]);
        return;
      }

      // Get all users from the user_settings table instead of auth.admin
      const { data: userSettings, error: settingsError } = await supabase
        .from("user_settings")
        .select("*");

      if (settingsError) {
        console.error("Error fetching user settings:", settingsError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user data"
        });
        return;
      }

      // Get current user for additional details
      const { data: userData } = await supabase.auth.getUser();
      console.log("Current user:", userData?.user?.email);
      
      // Transform the data to the expected format
      const combinedUsers: UserInfo[] = userSettings ? userSettings.map(settings => {
        // Create a properly-typed UserInfo object
        return {
          id: settings.user_id,
          email: settings.user_id, // Fixed: Using user_id instead of email
          createdAt: new Date().toISOString(),
          name: settings.name || "",
          isAdmin: settings.is_admin || false,
          role: settings.role || "user",
          hourlyRate: settings.hourly_rate || 25,
          isBlocked: settings.role === "blocked" || false
        };
      }) : [];

      console.log("Fetched users:", combinedUsers);
      setUsers(combinedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load user list"
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
        title: "Success",
        description: `Admin status ${isCurrentlyAdmin ? "revoked" : "assigned"}`
      });

      // Refresh user list
      fetchUsers();
    } catch (error) {
      console.error("Error toggling admin status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to change user status"
      });
    }
  };

  const toggleBlockUser = async (userId: string, isCurrentlyBlocked: boolean) => {
    try {
      // Instead of RPC, update the user_settings table directly
      const { error } = await supabase
        .from("user_settings")
        .update({ 
          role: isCurrentlyBlocked ? "user" : "blocked"
        })
        .eq("user_id", userId);
          
      if (error) throw error;
        
      toast({
        title: "Success",
        description: isCurrentlyBlocked ? "User unblocked" : "User blocked"
      });
        
      fetchUsers();
    } catch (error) {
      console.error("Error toggling user block status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to change user block status"
      });
    }
  };

  const confirmDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteDialog(true);
  };
  
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      // Instead of using auth.admin.deleteUser, update user_settings to mark as deleted
      const { error } = await supabase
        .from("user_settings")
        .update({ role: "deleted" })
        .eq("user_id", userToDelete);
  
      if (error) throw error;
  
      toast({
        title: "Success",
        description: "User marked as deleted"
      });
  
      // Refresh user list
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete user"
      });
    } finally {
      setShowDeleteDialog(false);
      setUserToDelete(null);
    }
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
        title: "Success",
        description: "User information updated"
      });

      // Refresh user list
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user information"
      });
    } finally {
      setShowEditDialog(false);
      setUserToEdit(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Users</h2>
        <Button 
          onClick={() => fetchUsers()} 
          variant="outline" 
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
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
              {users.length === 0 ? (
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
                      {user.isAdmin ? (
                        <Badge variant="default">Administrator</Badge>
                      ) : (
                        <Badge variant="outline">{user.role}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      ${user.hourlyRate}/hr
                    </TableCell>
                    <TableCell>
                      {user.isBlocked ? (
                        <Badge variant="destructive">Blocked</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditUserDialog(user)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant={user.isBlocked ? "outline" : "secondary"}
                        size="sm"
                        onClick={() => toggleBlockUser(user.id, user.isBlocked || false)}
                      >
                        {user.isBlocked ? "Unblock" : "Block"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAdminStatus(user.id, user.isAdmin)}
                      >
                        {user.isAdmin ? "Remove Admin" : "Make Admin"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => confirmDeleteUser(user.id)}
                      >
                        Delete
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The user will be deleted along with all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit user dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Modify user settings and click Save when finished.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditUser)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
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
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="worker">Worker</SelectItem>
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
                    <FormLabel>Hourly Rate ($/hour)</FormLabel>
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
                      <FormLabel>Administrator</FormLabel>
                      <FormDescription>
                        Grant administrator privileges
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
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
