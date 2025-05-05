
import { useState } from "react";

export type UserRoleType = 'super_admin' | 'admin' | 'manager' | 'worker' | 'user' | 'blocked' | 'deleted';

export function useUserRole() {
  const [userRole, setUserRole] = useState<UserRoleType>('user');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  // Update admin status whenever role changes
  const updateUserRole = (role: UserRoleType) => {
    setUserRole(role);
    setIsAdmin(role === 'admin' || role === 'super_admin');
    setIsSuperAdmin(role === 'super_admin');
  };

  return {
    userRole,
    setUserRole: updateUserRole,
    isAdmin,
    isSuperAdmin
  };
}
