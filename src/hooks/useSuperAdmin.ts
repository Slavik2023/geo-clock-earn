
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/App";
import { useUserSettings } from "./user-settings";

export function useSuperAdmin() {
  const { user } = useAuth();
  const { isSuperAdmin } = useUserSettings();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAllUsers = async () => {
    if (!user || !isSuperAdmin) return;
    
    setLoading(true);
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
      setLoading(false);
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
    
    setLoading(true);
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
      setLoading(false);
    }
  };

  const blockUser = async (userId: string, isBlocked: boolean) => {
    if (!user || !isSuperAdmin) return false;
    
    setLoading(true);
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
      setLoading(false);
    }
  };

  return {
    loading,
    users: filteredUsers,
    searchTerm,
    setSearchTerm,
    fetchAllUsers,
    updateUserRole,
    blockUser
  };
}
