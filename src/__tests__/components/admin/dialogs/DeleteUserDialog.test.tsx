
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteUserDialog } from '@/components/admin/dialogs/DeleteUserDialog';

describe('DeleteUserDialog component', () => {
  const mockProps = {
    open: true,
    onOpenChange: jest.fn(),
    onConfirm: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the dialog when open is true', () => {
    render(<DeleteUserDialog {...mockProps} />);
    
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone. The user will be deleted along with all associated data.')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should not render the dialog when open is false', () => {
    render(<DeleteUserDialog {...mockProps} open={false} />);
    
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument();
  });

  it('should call onConfirm when Delete button is clicked', () => {
    render(<DeleteUserDialog {...mockProps} />);
    
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    
    expect(mockProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onOpenChange when Cancel button is clicked', () => {
    render(<DeleteUserDialog {...mockProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockProps.onOpenChange).toHaveBeenCalledWith(false);
  });
});
