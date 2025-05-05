
import { renderHook, act } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';
import { useUserManagement } from '@/hooks/useUserManagement';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Mock dependencies
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn()
    }
  }
}));

jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn().mockReturnValue({
    toast: jest.fn()
  })
}));

describe('useUserManagement hook', () => {
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });

    // Mock successful auth session
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: { id: 'test-user-id' } } },
      error: null
    });

    // Mock successful user data
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null
    });

    // Mock from.select chain for user_settings
    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'user_settings') {
        return {
          select: jest.fn().mockResolvedValue({
            data: [
              {
                user_id: 'user1',
                name: 'Test User',
                is_admin: true,
                role: 'admin',
                hourly_rate: 50,
              }
            ],
            error: null
          }),
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null })
          })
        };
      }
      return {};
    });
  });

  it('should fetch users on initialization', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useUserManagement());
    
    expect(result.current.isLoading).toBe(true);
    
    await waitForNextUpdate();
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.users.length).toBe(1);
    expect(result.current.users[0].name).toBe('Test User');
    expect(supabase.from).toHaveBeenCalledWith('user_settings');
  });

  it('should handle toggling admin status', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useUserManagement());
    await waitForNextUpdate();
    
    // Setup mock for the update function
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null })
    });
    (supabase.from as jest.Mock).mockImplementation(() => ({
      update: mockUpdate
    }));

    // Call the toggle function
    await act(async () => {
      await result.current.toggleAdminStatus('user1', true);
    });

    // Check that the function updated the database correctly
    expect(mockUpdate).toHaveBeenCalledWith({ is_admin: false });
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Admin status revoked'
    });
  });

  it('should handle toggling block status', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useUserManagement());
    await waitForNextUpdate();
    
    // Setup mock for the update function
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null })
    });
    (supabase.from as jest.Mock).mockImplementation(() => ({
      update: mockUpdate
    }));

    // Call the toggle function
    await act(async () => {
      await result.current.toggleBlockUser('user1', false);
    });

    // Check that the function updated the database correctly
    expect(mockUpdate).toHaveBeenCalledWith({ 
      role: 'blocked'
    });
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'User blocked'
    });
  });

  it('should handle edit user dialog', async () => {
    const { result } = renderHook(() => useUserManagement());
    
    // Open edit dialog
    act(() => {
      result.current.openEditUserDialog({
        id: 'user1',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date().toISOString(),
        isAdmin: true,
        role: 'admin',
        hourlyRate: 50
      });
    });

    expect(result.current.showEditDialog).toBe(true);
    expect(result.current.userToEdit?.id).toBe('user1');
    expect(result.current.userToEdit?.name).toBe('Test User');
  });

  it('should handle edit user submission', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useUserManagement());
    await waitForNextUpdate();
    
    // Setup mock for the update function
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null })
    });
    (supabase.from as jest.Mock).mockImplementation(() => ({
      update: mockUpdate
    }));

    // Set up user to edit
    act(() => {
      result.current.setUserToEdit({
        id: 'user1',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date().toISOString(),
        isAdmin: true,
        role: 'admin',
        hourlyRate: 50
      });
    });

    // Submit edit
    await act(async () => {
      await result.current.handleEditUser({
        name: 'Updated User',
        role: 'manager',
        hourlyRate: 60,
        isAdmin: false
      });
    });

    expect(mockUpdate).toHaveBeenCalledWith({
      name: 'Updated User',
      role: 'manager',
      hourly_rate: 60,
      is_admin: false
    });
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'User information updated'
    });
  });

  it('should handle delete confirmation dialog', () => {
    const { result } = renderHook(() => useUserManagement());
    
    act(() => {
      result.current.confirmDeleteUser('user1');
    });

    expect(result.current.showDeleteDialog).toBe(true);
    expect(result.current.userToDelete).toBe('user1');
  });

  it('should handle delete user action', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useUserManagement());
    await waitForNextUpdate();
    
    // Setup mock for the update function
    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null })
    });
    (supabase.from as jest.Mock).mockImplementation(() => ({
      update: mockUpdate
    }));

    // Set up user to delete
    act(() => {
      result.current.setUserToDelete('user1');
    });

    // Delete user
    await act(async () => {
      await result.current.handleDeleteUser();
    });

    expect(mockUpdate).toHaveBeenCalledWith({ role: 'deleted' });
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'User marked as deleted'
    });
    expect(result.current.showDeleteDialog).toBe(false);
    expect(result.current.userToDelete).toBe(null);
  });
});
