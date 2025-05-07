
export interface SuperAdminUser {
  user_id: string;
  email: string;
  name?: string;
  role: string;
}

export interface SuperAdminState {
  users: SuperAdminUser[];
  filteredUsers: SuperAdminUser[];
  isLoading: boolean;
  searchTerm: string;
}

export interface SuperAdminActions {
  setUsers: (users: SuperAdminUser[]) => void;
  setFilteredUsers: (users: SuperAdminUser[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setSearchTerm: (searchTerm: string) => void;
}

export interface SuperAdminQueries {
  fetchAllUsers: () => Promise<void>;
}

export interface SuperAdminMutations {
  updateUserRole: (userId: string, role: string) => Promise<boolean>;
  blockUser: (userId: string, isBlocked: boolean) => Promise<boolean>;
  setSuperAdminStatus: (email: string) => Promise<boolean>;
}
