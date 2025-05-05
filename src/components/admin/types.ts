
export interface UserInfo {
  id: string;
  email: string | null;
  createdAt: string;
  name: string | null;
  isAdmin: boolean;
  role: string;
  hourlyRate: number;
}
