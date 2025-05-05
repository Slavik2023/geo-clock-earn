
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserList } from '@/components/admin/UserList';
import { UserInfo } from '@/components/admin/types';

describe('UserList component', () => {
  const mockUsers: UserInfo[] = [
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

  const mockHandlers = {
    onEdit: jest.fn(),
    onToggleBlock: jest.fn(),
    onToggleAdmin: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render a table with users', () => {
    render(
      <UserList 
        users={mockUsers}
        isLoading={false}
        onEdit={mockHandlers.onEdit}
        onToggleBlock={mockHandlers.onToggleBlock}
        onToggleAdmin={mockHandlers.onToggleAdmin}
        onDelete={mockHandlers.onDelete}
      />
    );
    
    // Check if user names are displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    
    // Check if emails are displayed
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    
    // Check if hourly rates are displayed
    expect(screen.getByText('$50/hr')).toBeInTheDocument();
    expect(screen.getByText('$25/hr')).toBeInTheDocument();
    
    // Check if status badges are displayed
    expect(screen.getByText('Administrator')).toBeInTheDocument();
    expect(screen.getByText('Blocked')).toBeInTheDocument();
  });

  it('should render loading state when isLoading is true', () => {
    render(
      <UserList 
        users={[]}
        isLoading={true}
        onEdit={mockHandlers.onEdit}
        onToggleBlock={mockHandlers.onToggleBlock}
        onToggleAdmin={mockHandlers.onToggleAdmin}
        onDelete={mockHandlers.onDelete}
      />
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render empty state when no users are found', () => {
    render(
      <UserList 
        users={[]}
        isLoading={false}
        onEdit={mockHandlers.onEdit}
        onToggleBlock={mockHandlers.onToggleBlock}
        onToggleAdmin={mockHandlers.onToggleAdmin}
        onDelete={mockHandlers.onDelete}
      />
    );
    
    expect(screen.getByText('No users found')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(
      <UserList 
        users={mockUsers}
        isLoading={false}
        onEdit={mockHandlers.onEdit}
        onToggleBlock={mockHandlers.onToggleBlock}
        onToggleAdmin={mockHandlers.onToggleAdmin}
        onDelete={mockHandlers.onDelete}
      />
    );
    
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('should call onToggleBlock when block/unblock button is clicked', () => {
    render(
      <UserList 
        users={mockUsers}
        isLoading={false}
        onEdit={mockHandlers.onEdit}
        onToggleBlock={mockHandlers.onToggleBlock}
        onToggleAdmin={mockHandlers.onToggleAdmin}
        onDelete={mockHandlers.onDelete}
      />
    );
    
    // For non-blocked user, should show "Block" button
    const blockButton = screen.getByText('Block');
    fireEvent.click(blockButton);
    
    expect(mockHandlers.onToggleBlock).toHaveBeenCalledWith('user1', false);
    
    // For blocked user, should show "Unblock" button
    const unblockButton = screen.getByText('Unblock');
    fireEvent.click(unblockButton);
    
    expect(mockHandlers.onToggleBlock).toHaveBeenCalledWith('user2', true);
  });

  it('should call onToggleAdmin when admin toggle button is clicked', () => {
    render(
      <UserList 
        users={mockUsers}
        isLoading={false}
        onEdit={mockHandlers.onEdit}
        onToggleBlock={mockHandlers.onToggleBlock}
        onToggleAdmin={mockHandlers.onToggleAdmin}
        onDelete={mockHandlers.onDelete}
      />
    );
    
    // For admin user, should show "Remove Admin" button
    const removeAdminButton = screen.getByText('Remove Admin');
    fireEvent.click(removeAdminButton);
    
    expect(mockHandlers.onToggleAdmin).toHaveBeenCalledWith('user1', true);
    
    // For non-admin user, should show "Make Admin" button
    const makeAdminButton = screen.getByText('Make Admin');
    fireEvent.click(makeAdminButton);
    
    expect(mockHandlers.onToggleAdmin).toHaveBeenCalledWith('user2', false);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <UserList 
        users={mockUsers}
        isLoading={false}
        onEdit={mockHandlers.onEdit}
        onToggleBlock={mockHandlers.onToggleBlock}
        onToggleAdmin={mockHandlers.onToggleAdmin}
        onDelete={mockHandlers.onDelete}
      />
    );
    
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    expect(mockHandlers.onDelete).toHaveBeenCalledWith('user1');
  });
});
