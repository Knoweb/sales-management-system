import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserManagement } from './UserManagement';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/Api';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../context/AuthContext');
vi.mock('../services/Api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
  }
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('UserManagement Modal Focus test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error Mocking dependency
    (useAuth).mockReturnValue({
      user: { email: 'admin@knoweb.lk', roles: ['SYSTEM_ADMIN'], permissions: ['USER_READ', 'USER_CREATE'] }
    });
    // @ts-expect-error Mocking dependency
    (apiClient.get).mockResolvedValue({ data: { content: [] } });
  });

  it('preserves focus on the active input field while typing in the Add User modal', async () => {
    renderWithRouter(<UserManagement />);

    // Click Add User button to open modal
    const addButton = screen.getByText('Add User');
    fireEvent.click(addButton);

    // Verify modal is open and first input gets focus
    const firstNameInput = screen.getByLabelText(/First Name/i) as HTMLInputElement;
    await waitFor(() => {
      expect(document.activeElement).toBe(firstNameInput);
    });

    // Type in First Name
    fireEvent.change(firstNameInput, { target: { value: 'J' } });
    expect(document.activeElement).toBe(firstNameInput);

    // Focus Last Name and type
    const lastNameInput = screen.getByLabelText(/Last Name/i) as HTMLInputElement;
    lastNameInput.focus();
    expect(document.activeElement).toBe(lastNameInput);
    fireEvent.change(lastNameInput, { target: { value: 'D' } });
    expect(document.activeElement).toBe(lastNameInput);

    // Focus Email Address and type
    const emailInput = screen.getByLabelText(/Email Address/i) as HTMLInputElement;
    emailInput.focus();
    expect(document.activeElement).toBe(emailInput);
    fireEvent.change(emailInput, { target: { value: 'j' } });
    expect(document.activeElement).toBe(emailInput);
  });
});
