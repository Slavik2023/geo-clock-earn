
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EditUserDialog } from '@/components/admin/dialogs/EditUserDialog';
import { UserInfo } from '@/components/admin/types';
import userEvent from '@testing-library/user-event';

describe('EditUserDialog component', () => {
  const mockUser: UserInfo = {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date().toISOString(),
    isAdmin: true,
    role: 'manager',
    hourlyRate: 50,
    isBlocked: false // Add the missing property
  };

  const mockProps = {
    open: true,
    onOpenChange: jest.fn(),
    userToEdit: mockUser,
    onSave: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the dialog when open is true', () => {
    render(<EditUserDialog {...mockProps} />);
    
    expect(screen.getByText('Edit User')).toBeInTheDocument();
    expect(screen.getByText('Modify user settings and click Save when finished.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByLabelText('Hourly Rate ($/hour)')).toHaveValue(50);
    expect(screen.getByText('Administrator')).toBeInTheDocument();
  });

  it('should not render the dialog when open is false', () => {
    render(<EditUserDialog {...mockProps} open={false} />);
    
    expect(screen.queryByText('Edit User')).not.toBeInTheDocument();
  });

  it('should reset form when user changes', async () => {
    const { rerender } = render(<EditUserDialog {...mockProps} userToEdit={mockUser} />);
    
    // Verify initial form values
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByLabelText('Hourly Rate ($/hour)')).toHaveValue(50);
    
    // Change user
    const newUser: UserInfo = {
      ...mockUser,
      id: 'user2',
      name: 'Jane Smith',
      hourlyRate: 75,
      isAdmin: false,
      isBlocked: false // Add the missing property
    };
    
    rerender(<EditUserDialog {...mockProps} userToEdit={newUser} />);
    
    // Verify form is reset to new user values
    expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
    expect(screen.getByLabelText('Hourly Rate ($/hour)')).toHaveValue(75);
  });

  it('should call onOpenChange when Cancel button is clicked', () => {
    render(<EditUserDialog {...mockProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should call onSave with form data when Save button is clicked', async () => {
    render(<EditUserDialog {...mockProps} />);
    
    // Edit the form
    userEvent.clear(screen.getByLabelText('Name'));
    userEvent.type(screen.getByLabelText('Name'), 'Updated Name');
    
    userEvent.clear(screen.getByLabelText('Hourly Rate ($/hour)'));
    userEvent.type(screen.getByLabelText('Hourly Rate ($/hour)'), '75');
    
    // Toggle administrator status
    const adminSwitch = screen.getByRole('switch');
    fireEvent.click(adminSwitch);
    
    // Submit the form
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockProps.onSave).toHaveBeenCalledWith({
        name: 'Updated Name',
        role: 'manager', // This should keep the initial value
        hourlyRate: 75,
        isAdmin: false // Should be toggled from true to false
      });
    });
  });

  it('should show validation errors for invalid data', async () => {
    render(<EditUserDialog {...mockProps} />);
    
    // Clear required field
    userEvent.clear(screen.getByLabelText('Name'));
    
    // Enter invalid hourly rate
    userEvent.clear(screen.getByLabelText('Hourly Rate ($/hour)'));
    userEvent.type(screen.getByLabelText('Hourly Rate ($/hour)'), '-10');
    
    // Submit the form
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText('Name must contain at least 2 characters')).toBeInTheDocument();
      expect(screen.getByText('Rate must be a positive number')).toBeInTheDocument();
    });
    
    // Ensure onSave was not called
    expect(mockProps.onSave).not.toHaveBeenCalled();
  });
});
