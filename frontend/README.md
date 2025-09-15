# Digital Guidance Platform - Frontend

A modern, responsive frontend for the Digital Guidance Platform built with React.

## Features

- Modern UI/UX design with responsive layout
- User authentication (login/logout)
- Protected routes for authenticated users
- Career guidance quiz
- User profile management
- Responsive design for all device sizes

## Technology Stack

- React 18+
- React Router v6+
- CSS3 with modern styling techniques
- Context API for state management
- Axios for HTTP requests

## Project Structure

```
src/
├── components/
│   └── common/
│       ├── Header.js
│       ├── Input.js
│       ├── PrivateRoute.js
│       └── ...
├── contexts/
│   └── AuthContext.js
├── pages/
│   ├── HomePage.js
│   ├── LoginPage.js
│   ├── ProfilePage.js
│   ├── QuizPage.js
│   └── ...
├── services/
│   └── api.js
├── App.js
├── App.css
└── index.js
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Design Principles

### Modern UI/UX
- Clean, minimalist design with ample whitespace
- Consistent color scheme and typography
- Intuitive navigation and user flows
- Responsive layout for all device sizes

### Accessibility
- Semantic HTML structure
- Proper contrast ratios for text
- Keyboard navigation support
- Screen reader compatibility

### Performance
- Optimized bundle size
- Lazy loading for non-critical components
- Efficient state management
- Minimal re-renders

## Components

### Header
Navigation bar with logo and menu items. Shows login/logout based on authentication status.

### PrivateRoute
Wrapper component that protects routes requiring authentication.

### Input
Custom input component with consistent styling.

### QuizPage
Interactive career guidance quiz with progress tracking.

### ProfilePage
User profile display with account settings.

## Styling

The application uses a component-based CSS approach with:
- Modern CSS reset
- CSS variables for consistent theming
- Flexbox and Grid for layouts
- Responsive breakpoints
- BEM naming convention

## State Management

Authentication state is managed through React Context API with:
- User object
- JWT token
- Loading states
- Login/logout functions

## API Integration

The frontend integrates with the backend API through:
- Axios for HTTP requests
- Centralized API service
- Request/response interceptors
- Error handling

## Testing

Run tests with:
```bash
npm test
```

## Deployment

Build the application for production:
```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.