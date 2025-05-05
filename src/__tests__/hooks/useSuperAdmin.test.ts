
import { renderHook, act } from '@testing-library/react-hooks';
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

describe('useSuperAdmin hook', () => {
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

  it('should initialize correctly', () => {
    const { result } = renderHook(() => useSuperAdmin());
    
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.setSuperAdminStatus).toBe('function');
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

  // Fix for the infinite type instantiation error in useSuperAdmin
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
