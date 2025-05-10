
import React from 'react';
import { Button } from '@/components/ui/button';
import { registerWithEmail } from '../services/authService';
import { toast } from 'sonner';

export function TestCredentials() {
  const testUsers = [
    { email: "test@example.com", password: "password123", name: "Test User" },
    { email: "admin@example.com", password: "admin123", name: "Admin User" },
    { email: "manager@example.com", password: "manager123", name: "Manager User" }
  ];
  
  const registerTestUser = async (email: string, password: string) => {
    try {
      toast.loading(`Creating test account: ${email}`);
      await registerWithEmail(email, password);
      toast.success(`Test account created: ${email}`);
    } catch (error: any) {
      // Ignore "already registered" errors as that's expected for test users
      if (error.message?.includes("already registered")) {
        toast.info(`Account ${email} already exists, you can log in with it`);
      } else {
        toast.error(`Failed to create test account: ${error.message}`);
      }
    }
  };
  
  const createAllTestUsers = async () => {
    for (const user of testUsers) {
      await registerTestUser(user.email, user.password);
    }
  };
  
  return (
    <div className="mt-8 pt-6 border-t border-slate-200">
      <p className="text-sm text-center text-muted-foreground mb-2">Test credentials:</p>
      <div className="bg-slate-50 p-3 rounded-md text-sm mb-4">
        {testUsers.map((user, index) => (
          <div key={index} className="mb-2">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Password:</strong> {user.password}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-1"
              onClick={() => registerTestUser(user.email, user.password)}
            >
              Create this account
            </Button>
          </div>
        ))}
        <p className="text-xs text-muted-foreground mt-3">
          For testing purposes only
        </p>
      </div>
      
      <div className="flex justify-center">
        <Button onClick={createAllTestUsers} variant="default">
          Create All Test Accounts
        </Button>
      </div>
    </div>
  );
}
