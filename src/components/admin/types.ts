
import { UserRoleType } from "@/hooks/user-settings";

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  isAdmin: boolean;
  role: UserRoleType;
  hourlyRate: number;
  isBlocked: boolean;
}

export interface UserFormData {
  name: string;
  role: string;
  hourlyRate: number;
  isAdmin: boolean;
}
