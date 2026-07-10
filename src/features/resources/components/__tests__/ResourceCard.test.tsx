import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResourceCard } from '../ResourceCard';
import { translations } from "@/i18n/translations";
const t = translations.en;
import { Resource } from '../../types';
import { update, push } from 'firebase/database';
import { useCustomToast } from '@/hooks/use-custom-toast';

// Mock the toast hook
jest.mock('@/hooks/use-custom-toast', () => ({
  useCustomToast: jest.fn(() => ({
    success: jest.fn(),
    error: jest.fn(),
  })),
}));

const mockResource: Resource = {
  id: 'r1',
  title: 'Test Resource',
  slug: 'test-resource',
  description: 'This is a test resource description',
  url: 'https://example.com',
  provider: 'TestProvider',
  sourceType: 'external',
  resourceType: 'Course',
  isFree: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  tags: ['react', 'testing'],
  difficultyLevel: 'Beginner' as any,
  language: 'en',
  estimatedDuration: '10 mins',
  skillIds: [],
  careerPathIds: [],
  academicCategoryIds: [],
  qualityScore: 100,
  isActive: true,
};

describe('ResourceCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with given resource data', () => {
    render(<ResourceCard resource={mockResource} />);
    
    expect(screen.getByText('Test Resource')).toBeInTheDocument();
    expect(screen.getByText('TestProvider')).toBeInTheDocument();
    expect(screen.getByText('This is a test resource description')).toBeInTheDocument();
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('Course')).toBeInTheDocument();
    
    // Tags
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('testing')).toBeInTheDocument();
    
    // Details
    expect(screen.getByText('• Beginner')).toBeInTheDocument();
    
    // Open button link
    const openBtn = screen.getByRole('link', { name: /open/i });
    expect(openBtn).toHaveAttribute('href', 'https://example.com');
  });

  it('handles "Save to Plan" click successfully', async () => {
    const mockToastSuccess = jest.fn();
    (useCustomToast as jest.Mock).mockReturnValue({
      success: mockToastSuccess,
      error: jest.fn(),
    });

    render(<ResourceCard resource={mockResource} />);
    
    const saveBtn = screen.getByRole('button', { name: /save to plan/i });
    fireEvent.click(saveBtn);
    
    expect(saveBtn).toHaveTextContent('Saving...');
    
    await waitFor(() => {
      expect(push).toHaveBeenCalled();
      expect(update).toHaveBeenCalled();
      expect(mockToastSuccess).toHaveBeenCalledWith(
        t.resources.saved,
        t.resources.savedDesc.replace("{title}", "Test Resource")
      );
    });
  });

  it('handles "Save to Plan" click failure', async () => {
    const mockToastError = jest.fn();
    (useCustomToast as jest.Mock).mockReturnValue({
      success: jest.fn(),
      error: mockToastError,
    });
    
    (update as jest.Mock).mockRejectedValueOnce(new Error('Firebase Error'));

    render(<ResourceCard resource={mockResource} />);
    
    const saveBtn = screen.getByRole('button', { name: /save to plan/i });
    fireEvent.click(saveBtn);
    
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(t.contact.error, t.resources.saveFailed);
      expect(saveBtn).toHaveTextContent(t.resources.saveToPlan);
    });
  });
});
