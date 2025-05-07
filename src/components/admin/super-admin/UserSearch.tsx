
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UserSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fetchAllUsers: () => Promise<void>;
  isLoading: boolean;
}

export function UserSearch({ searchTerm, setSearchTerm, fetchAllUsers, isLoading }: UserSearchProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Search className="h-4 w-4 text-muted-foreground" />
      <Input 
        placeholder="Search users..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <Button 
        variant="outline" 
        size="sm" 
        onClick={fetchAllUsers} 
        disabled={isLoading}
      >
        Refresh
      </Button>
    </div>
  );
}
