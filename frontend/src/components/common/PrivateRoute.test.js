import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../../contexts/AuthContext';
import PrivateRoute from './PrivateRoute';
import { BrowserRouter } from 'react-router-dom';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to }) => <div data-testid="navigate" data-to={to}>Redirected to {to}</div>,
}));

// Wrapper component to provide router context
const RouterWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

// Mock child component
const MockComponent = () => <div>Protected Content</div>;

// Mock AuthContext consumer
const MockAuthContextConsumer = ({ token, loading }) => {
  return (
    <RouterWrapper>
      <AuthProvider>
        <PrivateRoute>
          <MockComponent />
        </PrivateRoute>
      </AuthProvider>
    </RouterWrapper>
  );
};

describe('PrivateRoute', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('renders children when user is authenticated', () => {
    // Mock localStorage to simulate authenticated user
    localStorage.setItem('token', 'jwt-token');
    localStorage.setItem('user', JSON.stringify({ id: 'user-id', email: 'test@example.com' }));

    render(<MockAuthContextConsumer />);

    // Check if protected content is rendered
    expect(screen.getByText(/protected content/i)).toBeInTheDocument();
  });

  test('redirects to login when user is not authenticated', () => {
    // Clear localStorage to simulate unauthenticated user
    localStorage.clear();

    render(<MockAuthContextConsumer />);

    // Check if redirect to login page is rendered
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
  });
});