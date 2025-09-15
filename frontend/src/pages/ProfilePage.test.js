import { render, screen } from '@testing-library/react';
import ProfilePage from './ProfilePage';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock global localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock AuthContext to avoid context issues in tests
const mockAuthContext = {
  token: null,
  user: null,
  logout: jest.fn(),
};

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: () => mockAuthContext,
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('displays login prompt when not authenticated', () => {
    // Mock no token to simulate unauthenticated user
    mockLocalStorage.getItem.mockReturnValue(null);

    render(<ProfilePage />);

    // Check if login prompt is displayed
    expect(screen.getByText(/please log in to view your profile/i)).toBeInTheDocument();
  });

  test('displays loading state when authenticated', () => {
    // Mock token to simulate authenticated user
    mockAuthContext.token = 'jwt-token';
    mockAuthContext.user = { id: 'user-id', email: 'user@example.com' };

    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return 'jwt-token';
      if (key === 'user') return JSON.stringify({ id: 'user-id', email: 'user@example.com' });
      return null;
    });

    render(<ProfilePage />);

    // Check if loading state is displayed
    expect(screen.getByText(/loading profile/i)).toBeInTheDocument();
  });
});