
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

describe('useSuperAdmin hook - basic functionality', () => {
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
});
