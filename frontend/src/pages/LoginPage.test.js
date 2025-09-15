import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './LoginPage';

// Mock the API service
jest.mock('../services/api', () => {
  return {
    post: jest.fn(),
  };
});

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  Link: ({ children }) => <a href="#">{children}</a>,
}));

// Mock AuthContext
jest.mock('../contexts/AuthContext', () => ({
  __esModule: true,
  default: {
    Consumer: ({ children }) => children({}),
  },
}));

// Create a mock AuthContext provider for testing
const mockLogin = jest.fn();
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: () => ({
    login: mockLogin,
  }),
}));

test('renders login form elements', () => {
  render(<LoginPage />);
  
  // Check if the email input is rendered
  const emailInput = screen.getByPlaceholderText(/email/i);
  expect(emailInput).toBeInTheDocument();
  expect(emailInput).toHaveAttribute('type', 'email');
  
  // Check if the password input is rendered
  const passwordInput = screen.getByPlaceholderText(/password/i);
  expect(passwordInput).toBeInTheDocument();
  expect(passwordInput).toHaveAttribute('type', 'password');
  
  // Check if the submit button is rendered
  const submitButton = screen.getByRole('button', { name: /login/i });
  expect(submitButton).toBeInTheDocument();
});

test('allows users to fill in the form and submit', async () => {
  render(<LoginPage />);
  
  // Fill in the email input
  const emailInput = screen.getByPlaceholderText(/email/i);
  await userEvent.type(emailInput, 'test@example.com');
  expect(emailInput).toHaveValue('test@example.com');
  
  // Fill in the password input
  const passwordInput = screen.getByPlaceholderText(/password/i);
  await userEvent.type(passwordInput, 'password123');
  expect(passwordInput).toHaveValue('password123');
  
  // Click the submit button
  const submitButton = screen.getByRole('button', { name: /login/i });
  await userEvent.click(submitButton);
});