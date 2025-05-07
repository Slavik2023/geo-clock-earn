
import { renderHook, act } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Mock dependencies
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    rpc: jest.fn().mockReturnThis(),
  }
}));

jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn().mockReturnValue({
    toast: jest.fn()
  })
}));

describe('useSuperAdmin hook - audit logging', () => {
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });

    // Mock successful auth user
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'test-admin-id' } },
      error: null
    });
  });

  // Test for the audit log creation
  it('should properly handle audit log creation', async () => {
    // Mock successful audit log insertion
    const mockAuditLogInsert = jest.fn().mockResolvedValue({
      error: null
    });

    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'audit_logs') {
        return {
          insert: mockAuditLogInsert
        };
      } else if (table === 'user_settings') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [{ user_id: 'existing-user-id' }],
              error: null
            })
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              error: null
            })
          })
        };
      }
      return {};
    });
    
    const { result } = renderHook(() => useSuperAdmin());

    await act(async () => {
      await result.current.setSuperAdminStatus('audit@example.com');
    });
    
    // Verify the audit log was created with the correct structure
    expect(mockAuditLogInsert).toHaveBeenCalledWith({
      user_id: 'test-admin-id',
      action: 'set_super_admin',
      entity_type: 'user_settings',
      details: { email: 'audit@example.com', role: 'super_admin' }
    });
  });
});
