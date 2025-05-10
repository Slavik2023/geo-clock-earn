
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { registerWithEmail } from '../services/authService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function TestCredentials() {
  const [isCreatingAll, setIsCreatingAll] = useState(false);
  const [creatingUsers, setCreatingUsers] = useState<{[key: string]: boolean}>({});
  
  const testUsers = [
    { email: "test@example.com", password: "password123", name: "Test User" },
    { email: "admin@example.com", password: "admin123", name: "Admin User" },
    { email: "manager@example.com", password: "manager123", name: "Manager User" }
  ];
  
  const registerTestUser = async (email: string, password: string, name: string) => {
    try {
      setCreatingUsers(prev => ({ ...prev, [email]: true }));
      toast.loading(`Creating test account: ${email}`);
      
      // Use the name parameter when registering
      await registerWithEmail(email, password, name);
      
      toast.success(`Test account created: ${email}`);
    } catch (error: any) {
      // Ignore "already registered" errors as that's expected for test users
      if (error.message?.includes("already registered")) {
        toast.info(`Account ${email} already exists, you can log in with it`);
      } else {
        toast.error(`Failed to create test account: ${error.message}`);
        console.error("Registration error:", error);
      }
    } finally {
      setCreatingUsers(prev => ({ ...prev, [email]: false }));
    }
  };
  
  const createAllTestUsers = async () => {
    setIsCreatingAll(true);
    try {
      for (const user of testUsers) {
        await registerTestUser(user.email, user.password, user.name);
      }
    } finally {
      setIsCreatingAll(false);
    }
  };
  
  return (
    <div className="mt-8 pt-6 border-t border-slate-200">
      <p className="text-sm text-center text-muted-foreground mb-2">Test credentials:</p>
      <div className="bg-slate-50 p-3 rounded-md text-sm mb-4">
        {testUsers.map((user, index) => (
          <div key={index} className="mb-2 pb-2 border-b border-slate-200 last:border-0 last:pb-0">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Password:</strong> {user.password}</p>
            <p><strong>Name:</strong> {user.name}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-1 w-full"
              onClick={() => registerTestUser(user.email, user.password, user.name)}
              disabled={creatingUsers[user.email]}
            >
              {creatingUsers[user.email] ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : "Create this account"}
            </Button>
          </div>
        ))}
        <p className="text-xs text-muted-foreground mt-3">
          For testing purposes only
        </p>
      </div>
      
      <div className="flex justify-center">
        <Button 
          onClick={createAllTestUsers} 
          variant="default"
          disabled={isCreatingAll}
        >
          {isCreatingAll ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating All Accounts...
            </>
          ) : "Create All Test Accounts"}
        </Button>
      </div>
    </div>
  );
}
