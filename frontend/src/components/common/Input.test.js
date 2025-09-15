import { render, screen } from '@testing-library/react';
import Input from './Input';

test('renders input element', () => {
  render(<Input placeholder="Enter text" />);
  const inputElement = screen.getByPlaceholderText(/enter text/i);
  expect(inputElement).toBeInTheDocument();
});