
export interface UserInfo {
  id: string;
  email: string | null;
  createdAt: string;
  name: string | null;
  isAdmin: boolean;
  role: string;
  hourlyRate: number;
  isBlocked?: boolean;
}

export interface UserFormData {
  name: string;
  role: string;
  hourlyRate: number;
  isAdmin: boolean;
}
