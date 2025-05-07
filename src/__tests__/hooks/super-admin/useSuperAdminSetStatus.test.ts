
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

describe('useSuperAdmin hook - setSuperAdminStatus functionality', () => {
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

  it('should handle setting super admin status successfully', async () => {
    // Mock successful user lookup
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'user_settings') {
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
          }),
          insert: jest.fn().mockResolvedValue({
            error: null
          })
        };
      } else if (table === 'audit_logs') {
        return {
          insert: jest.fn().mockResolvedValue({
            error: null
          })
        };
      }
      return {};
    });

    const { result } = renderHook(() => useSuperAdmin());
    
    let success;
    await act(async () => {
      success = await result.current.setSuperAdminStatus('existing@example.com');
    });
    
    expect(success).toBe(true);
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'User existing@example.com has been assigned as system super administrator',
    });
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle user not found case by creating a new user record', async () => {
    // Mock user not found but auth lookup successful
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'user_settings') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          }),
          insert: jest.fn().mockResolvedValue({
            error: null
          })
        };
      } else if (table === 'audit_logs') {
        return {
          insert: jest.fn().mockResolvedValue({
            error: null
          })
        };
      }
      return {};
    });
    
    // Mock RPC function for getting user ID
    (supabase.rpc as jest.Mock).mockImplementation((funcName, params) => {
      if (funcName === 'get_user_id_by_email') {
        return Promise.resolve({
          data: 'new-user-id',
          error: null
        });
      }
      return {};
    });

    const { result } = renderHook(() => useSuperAdmin());
    
    let success;
    await act(async () => {
      success = await result.current.setSuperAdminStatus('new@example.com');
    });
    
    expect(success).toBe(true);
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'User new@example.com has been assigned as system super administrator',
    });
  });
});
