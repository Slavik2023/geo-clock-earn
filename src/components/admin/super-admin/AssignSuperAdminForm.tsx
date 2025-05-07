
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

interface AssignSuperAdminFormProps {
  setSuperAdminStatus: (email: string) => Promise<boolean>;
  fetchAllUsers: () => Promise<void>;
}

export function AssignSuperAdminForm({ setSuperAdminStatus, fetchAllUsers }: AssignSuperAdminFormProps) {
  const [emailInput, setEmailInput] = useState("");

  const handleAssignSuperAdmin = async () => {
    if (!emailInput.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailInput)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const success = await setSuperAdminStatus(emailInput);
    if (success) {
      setEmailInput("");
      fetchAllUsers();
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Assign Super Admin</h3>
      <div className="flex gap-2">
        <Input 
          placeholder="Enter email address" 
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
        />
        <Button onClick={handleAssignSuperAdmin}>
          <UserPlus className="mr-2 h-4 w-4" />
          Assign
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        The user will be granted super administrator privileges. Make sure they have registered first.
      </p>
    </div>
  );
}
