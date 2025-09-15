import { render, screen } from '@testing-library/react';
import App from './App';

// Mock window.location for routing tests
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost',
    href: 'http://localhost/',
  },
  writable: true,
});

test('renders welcome message', () => {
  render(<App />);
  const welcomeElement = screen.getByText(/welcome/i);
  expect(welcomeElement).toBeInTheDocument();
});