import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from './AuthContext';
import { useContext } from 'react';

// Mock the API service
jest.mock('../services/api', () => {
  return {
    post: jest.fn(),
  };
});

// Import the mocked API
import api from '../services/api';

// Test component to consume the context
const TestComponent = () => {
  const { user, token, loading, login, logout } = useContext(require('./AuthContext').default);
  
  if (loading) {
    return <div data-testid="loading">Loading...</div>;
  }
  
  return (
    <div>
      <div data-testid="user-info">
        {user ? `User: ${user.email}` : 'No user'}
      </div>
      <div data-testid="token-info">
        {token ? `Token: ${token}` : 'No token'}
      </div>
      <button 
        data-testid="login-button" 
        onClick={async () => {
          try {
            await login('test@example.com', 'password123');
          } catch (error) {
            console.error(error.message);
          }
        }}
      >
        Login
      </button>
      <button data-testid="logout-button" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

// Test component wrapped with AuthProvider
const TestApp = () => (
  <AuthProvider>
    <TestComponent />
  </AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Mock console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error
    console.error.mockRestore();
  });

  test('provides initial state', async () => {
    render(<TestApp />);
    
    // Check if loading state is displayed initially
    // Since the component renders immediately, we might not see the loading state
    // but we can check that the component renders without error
    expect(screen.getByTestId('user-info')).toBeInTheDocument();
  });

  test('allows user to login', async () => {
    // Mock the API response
    api.post.mockResolvedValue({
      data: {
        user: { id: 'user-id', email: 'test@example.com' },
        token: 'jwt-token',
      },
    });

    render(<TestApp />);
    
    // Wait for loading to finish
    await screen.findByTestId('user-info');
    
    // Check initial state
    expect(screen.getByTestId('user-info')).toHaveTextContent('No user');
    expect(screen.getByTestId('token-info')).toHaveTextContent('No token');
    
    // Click login button
    const loginButton = screen.getByTestId('login-button');
    await userEvent.click(loginButton);
    
    // Wait for state to update
    await screen.findByText('User: test@example.com');
    
    // Check if user and token are set
    expect(screen.getByTestId('user-info')).toHaveTextContent('User: test@example.com');
    expect(screen.getByTestId('token-info')).toHaveTextContent('Token: jwt-token');
  });

  test('allows user to logout', async () => {
    // Mock the API response
    api.post.mockResolvedValue({
      data: {
        user: { id: 'user-id', email: 'test@example.com' },
        token: 'jwt-token',
      },
    });

    render(<TestApp />);
    
    // Wait for loading to finish
    await screen.findByTestId('user-info');
    
    // Click login button
    const loginButton = screen.getByTestId('login-button');
    await userEvent.click(loginButton);
    
    // Wait for state to update
    await screen.findByText('User: test@example.com');
    
    // Check if user and token are set
    expect(screen.getByTestId('user-info')).toHaveTextContent('User: test@example.com');
    expect(screen.getByTestId('token-info')).toHaveTextContent('Token: jwt-token');
    
    // Click logout button
    const logoutButton = screen.getByTestId('logout-button');
    await userEvent.click(logoutButton);
    
    // Check if user and token are cleared
    expect(screen.getByTestId('user-info')).toHaveTextContent('No user');
    expect(screen.getByTestId('token-info')).toHaveTextContent('No token');
  });

  test('persists user data in localStorage', async () => {
    // Mock the API response
    api.post.mockResolvedValue({
      data: {
        user: { id: 'user-id', email: 'test@example.com' },
        token: 'jwt-token',
      },
    });

    render(<TestApp />);
    
    // Wait for loading to finish
    await screen.findByTestId('user-info');
    
    // Click login button
    const loginButton = screen.getByTestId('login-button');
    await userEvent.click(loginButton);
    
    // Wait for state to update
    await screen.findByText('User: test@example.com');
    
    // Check if data is stored in localStorage
    expect(localStorage.getItem('token')).toBe('jwt-token');
    expect(localStorage.getItem('user')).toBe(JSON.stringify({ id: 'user-id', email: 'test@example.com' }));
  });

  test('handles login errors', async () => {
    // Mock the API to reject with an error
    api.post.mockRejectedValue({
      response: {
        data: {
          message: 'Invalid credentials',
        },
      },
    });

    render(<TestApp />);
    
    // Wait for loading to finish
    await screen.findByTestId('user-info');
    
    // Click login button
    const loginButton = screen.getByTestId('login-button');
    await userEvent.click(loginButton);
    
    // Wait for a bit to allow the error to be processed
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check that the error is logged
    // Since we're mocking console.error, we need to check if it was called
    expect(console.error).toHaveBeenCalled();
  });
});