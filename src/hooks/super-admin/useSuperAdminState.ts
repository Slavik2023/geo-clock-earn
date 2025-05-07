
import { useState } from "react";
import { SuperAdminState, SuperAdminActions, SuperAdminUser } from "./types";

export function useSuperAdminState(): SuperAdminState & SuperAdminActions {
  const [users, setUsers] = useState<SuperAdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<SuperAdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  return {
    // State
    users,
    filteredUsers,
    isLoading,
    searchTerm,
    // Actions
    setUsers,
    setFilteredUsers,
    setIsLoading,
    setSearchTerm,
  };
}
