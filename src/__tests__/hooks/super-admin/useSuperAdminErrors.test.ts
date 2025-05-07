
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

describe('useSuperAdmin hook - error handling', () => {
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

  it('should handle user not found in auth error', async () => {
    // Mock user not found in auth
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'user_settings') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          })
        };
      }
      return {};
    });
    
    // Mock RPC function error for getting user ID
    (supabase.rpc as jest.Mock).mockImplementation((funcName, params) => {
      if (funcName === 'get_user_id_by_email') {
        return Promise.resolve({
          data: null,
          error: new Error('User not found')
        });
      }
      return {};
    });

    const { result } = renderHook(() => useSuperAdmin());
    
    let success;
    await act(async () => {
      success = await result.current.setSuperAdminStatus('unknown@example.com');
    });
    
    expect(success).toBe(false);
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'User with email unknown@example.com not found. The user must register first.',
      variant: 'destructive'
    });
  });

  it('should handle database error', async () => {
    // Mock database error
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'user_settings') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: null,
              error: new Error('Database error')
            })
          })
        };
      }
      return {};
    });

    const { result } = renderHook(() => useSuperAdmin());
    
    let success;
    await act(async () => {
      success = await result.current.setSuperAdminStatus('test@example.com');
    });
    
    expect(success).toBe(false);
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Failed to assign super admin',
      variant: 'destructive'
    });
  });
});
