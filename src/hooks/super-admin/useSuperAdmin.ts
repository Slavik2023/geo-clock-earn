
import { useEffect } from "react";
import { useSuperAdminState } from "./useSuperAdminState";
import { useSuperAdminQueries } from "./useSuperAdminQueries";
import { useSuperAdminActions } from "./useSuperAdminActions";

export function useSuperAdmin() {
  const { 
    users, 
    filteredUsers, 
    isLoading, 
    searchTerm,
    setUsers,
    setFilteredUsers,
    setIsLoading,
    setSearchTerm
  } = useSuperAdminState();

  const { fetchAllUsers } = useSuperAdminQueries(setUsers, setFilteredUsers, setIsLoading);
  const { updateUserRole, blockUser, setSuperAdminStatus } = useSuperAdminActions(setIsLoading, fetchAllUsers);

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

  return {
    isLoading,
    users: filteredUsers, // Return the filtered users
    searchTerm,
    setSearchTerm,
    fetchAllUsers,
    updateUserRole,
    blockUser,
    setSuperAdminStatus
  };
}
