import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SkillsPage } from './SkillsPage';
import { SkillApi } from '../../services/SkillApi';
import { useAuth } from '../../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('../../services/SkillApi');
vi.mock('../../context/AuthContext');

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('SkillsPage', () => {
  const mockSkills = [
    {
      id: '1',
      code: 'JAVA_DEV',
      name: 'Java Development',
      description: 'Java programming',
      active: true,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders skills list and Add Skill button for admins', async () => {
    // @ts-expect-error Mocking dependency
    (useAuth).mockReturnValue({
      user: { permissions: ['SKILL_CATALOG_MANAGE'] }
    });
    
    // @ts-expect-error Mocking dependency
    (SkillApi.search).mockResolvedValue({ content: mockSkills });

    renderWithRouter(<SkillsPage />);

    expect(screen.getByText('Loading skills...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('JAVA_DEV')).toBeInTheDocument();
      expect(screen.getByText('Java Development')).toBeInTheDocument();
    });

    expect(screen.getByText('Add Skill')).toBeInTheDocument();
    expect(screen.getByTitle('Edit Skill')).toBeInTheDocument();
    expect(screen.getByTitle('Deactivate')).toBeInTheDocument();
  });

  it('hides management actions for users without permission', async () => {
    // @ts-expect-error Mocking dependency
    (useAuth).mockReturnValue({
      user: { permissions: ['SOME_OTHER_PERMISSION'] }
    });
    
    // @ts-expect-error Mocking dependency
    (SkillApi.search).mockResolvedValue({ content: mockSkills });

    renderWithRouter(<SkillsPage />);

    await waitFor(() => {
      expect(screen.getByText('JAVA_DEV')).toBeInTheDocument();
    });

    expect(screen.queryByText('Add Skill')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Edit Skill')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Deactivate')).not.toBeInTheDocument();
  });
});
