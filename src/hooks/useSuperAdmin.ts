
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/App";
import { useUserSettings } from "./user-settings";

export function useSuperAdmin() {
  const { user } = useAuth();
  const { isSuperAdmin } = useUserSettings();
  const [isLoading, setIsLoading] = useState(false); // Renamed from loading to isLoading
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAllUsers = async () => {
    if (!user || !isSuperAdmin) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*');
      
      if (error) throw error;
      
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAllUsers();
    }
  }, [isSuperAdmin, user]);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      user.name?.toLowerCase().includes(term) || 
      user.email?.toLowerCase().includes(term) ||
      user.role?.toLowerCase().includes(term)
    );
    
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const updateUserRole = async (userId: string, role: string) => {
    if (!user || !isSuperAdmin) return false;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({ role })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast.success('User role updated successfully');
      await fetchAllUsers();
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const blockUser = async (userId: string, isBlocked: boolean) => {
    if (!user || !isSuperAdmin) return false;
    
    setIsLoading(true);
    try {
      // If blocking, set role to 'blocked', otherwise back to 'user'
      const role = isBlocked ? 'blocked' : 'user';
      
      const { error } = await supabase
        .from('user_settings')
        .update({ role })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      toast.success(`User ${isBlocked ? 'blocked' : 'unblocked'} successfully`);
      await fetchAllUsers();
      return true;
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
      toast.error(`Failed to ${isBlocked ? 'block' : 'unblock'} user`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Add the setSuperAdminStatus function that's used in the tests
  const setSuperAdminStatus = async (email: string) => {
    if (!user || !isSuperAdmin) return false;
    
    setIsLoading(true);
    try {
      // Get user ID from email using RPC or direct query
      const { data: userId, error: userIdError } = await supabase
        .rpc('get_user_id_by_email', { email_param: email });
      
      if (userIdError || !userId) {
        toast.error('User with email ' + email + ' not found. The user must register first.', {
          variant: 'destructive'
        });
        return false;
      }
      
      const { error } = await supabase
        .from('user_settings')
        .update({ role: 'super_admin' })
        .eq('user_id', userId);
      
      if (error) throw error;
      
      // Log the action
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'set_super_admin',
        entity_type: 'user_settings',
        details: { email, role: 'super_admin' }
      });
      
      toast.success(`User ${email} has been assigned as system super administrator`);
      return true;
    } catch (error) {
      console.error('Error setting super admin:', error);
      toast.error('Failed to assign super admin', {
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading, // Renamed from loading to isLoading
    users: filteredUsers,
    searchTerm,
    setSearchTerm,
    fetchAllUsers,
    updateUserRole,
    blockUser,
    setSuperAdminStatus // Add this function to match tests
  };
}
