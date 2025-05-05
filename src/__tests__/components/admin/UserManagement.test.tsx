
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UserManagement } from '@/components/admin/UserManagement';
import { useUserManagement } from '@/hooks/useUserManagement';

// Mock the imported modules
jest.mock('@/hooks/useUserManagement', () => ({
  useUserManagement: jest.fn()
}));

describe('UserManagement component', () => {
  // Mock data and functions for useUserManagement
  const mockFetchUsers = jest.fn();
  const mockOpenEditUserDialog = jest.fn();
  const mockToggleBlockUser = jest.fn();
  const mockToggleAdminStatus = jest.fn();
  const mockConfirmDeleteUser = jest.fn();
  const mockHandleDeleteUser = jest.fn();
  const mockHandleEditUser = jest.fn();
  const mockUsers = [
    {
      id: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: new Date().toISOString(),
      isAdmin: true,
      role: 'admin',
      hourlyRate: 50,
      isBlocked: false
    },
    {
      id: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      createdAt: new Date().toISOString(),
      isAdmin: false,
      role: 'user',
      hourlyRate: 25,
      isBlocked: true
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup the mock implementation for useUserManagement
    (useUserManagement as jest.Mock).mockReturnValue({
      users: mockUsers,
      isLoading: false,
      fetchUsers: mockFetchUsers,
      userToEdit: null,
      showDeleteDialog: false,
      setShowDeleteDialog: jest.fn(),
      showEditDialog: false,
      setShowEditDialog: jest.fn(),
      toggleAdminStatus: mockToggleAdminStatus,
      toggleBlockUser: mockToggleBlockUser,
      confirmDeleteUser: mockConfirmDeleteUser,
      handleDeleteUser: mockHandleDeleteUser,
      openEditUserDialog: mockOpenEditUserDialog,
      handleEditUser: mockHandleEditUser
    });
  });

  it('should render successfully with users loaded', () => {
    render(<UserManagement />);
    
    // Check heading
    expect(screen.getByText('Users')).toBeInTheDocument();
    
    // Check if refresh button is present
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    
    // Check if user names are displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should show loading state while data is being fetched', () => {
    (useUserManagement as jest.Mock).mockReturnValue({
      users: [],
      isLoading: true,
      fetchUsers: mockFetchUsers,
      userToEdit: null,
      showDeleteDialog: false,
      setShowDeleteDialog: jest.fn(),
      showEditDialog: false,
      setShowEditDialog: jest.fn()
    });
    
    render(<UserManagement />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should call fetchUsers on mount', () => {
    render(<UserManagement />);
    
    expect(mockFetchUsers).toHaveBeenCalledTimes(1);
  });

  it('should call fetchUsers when refresh button is clicked', () => {
    render(<UserManagement />);
    
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);
    
    expect(mockFetchUsers).toHaveBeenCalledTimes(2);
  });

  it('should render delete dialog when showDeleteDialog is true', () => {
    (useUserManagement as jest.Mock).mockReturnValue({
      users: mockUsers,
      isLoading: false,
      fetchUsers: mockFetchUsers,
      userToEdit: null,
      showDeleteDialog: true,
      setShowDeleteDialog: jest.fn(),
      showEditDialog: false,
      setShowEditDialog: jest.fn(),
      handleDeleteUser: mockHandleDeleteUser
    });
    
    render(<UserManagement />);
    
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone. The user will be deleted along with all associated data.')).toBeInTheDocument();
  });

  it('should render edit dialog when showEditDialog is true', () => {
    (useUserManagement as jest.Mock).mockReturnValue({
      users: mockUsers,
      isLoading: false,
      fetchUsers: mockFetchUsers,
      userToEdit: mockUsers[0],
      showDeleteDialog: false,
      setShowDeleteDialog: jest.fn(),
      showEditDialog: true,
      setShowEditDialog: jest.fn(),
      handleEditUser: mockHandleEditUser
    });
    
    render(<UserManagement />);
    
    expect(screen.getByText('Edit User')).toBeInTheDocument();
    expect(screen.getByText('Modify user settings and click Save when finished.')).toBeInTheDocument();
  });
});
