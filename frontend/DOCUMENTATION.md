# Digital Guidance Platform - Frontend Documentation

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [UI Components](#ui-components)
5. [Pages](#pages)
6. [State Management](#state-management)
7. [Styling System](#styling-system)
8. [Responsive Design](#responsive-design)
9. [Accessibility](#accessibility)
10. [Performance Optimizations](#performance-optimizations)
11. [Testing](#testing)
12. [Deployment](#deployment)

## Overview

The Digital Guidance Platform frontend is a modern, responsive web application built with React that provides students with personalized career and education guidance. The UI has been designed with a focus on usability, accessibility, and visual appeal.

## Technology Stack

- **React 18+**: Core framework for building user interfaces
- **React Router v6+**: Client-side routing
- **CSS3**: Modern styling techniques
- **Context API**: State management
- **Axios**: HTTP client for API requests
- **Webpack**: Module bundler (via Create React App)

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

## UI Components

### Header
The header component provides navigation and authentication status display.

**Features:**
- Responsive design with mobile-friendly menu
- Dynamic navigation based on authentication status
- Gradient background for visual appeal
- Smooth hover transitions

### Input
A reusable input component with consistent styling.

**Features:**
- Support for all HTML input types
- Focus states with visual feedback
- Integration with form validation
- Accessible labeling

### PrivateRoute
A wrapper component that protects routes requiring authentication.

**Features:**
- Automatic redirect to login for unauthenticated users
- Loading state during authentication verification
- Seamless integration with React Router

## Pages

### HomePage
The main landing page that introduces the platform to users.

**Features:**
- Hero section with value proposition
- Feature highlights with clear benefits
- Call-to-action buttons
- Responsive grid layout

### LoginPage
Secure authentication interface for user login.

**Features:**
- Form validation
- Loading states during authentication
- Error messaging
- "Remember me" functionality
- Link to registration (if implemented)

### QuizPage
Interactive career guidance quiz.

**Features:**
- Progress tracking with visual indicator
- Question navigation controls
- Answer selection with visual feedback
- Results display with recommendations
- Ability to retake quiz

### ProfilePage
User profile management interface.

**Features:**
- Personal information display
- Account settings management
- Logout functionality
- Loading states for data fetching

## State Management

### AuthContext
Centralized authentication state management using React Context API.

**State:**
- `user`: Current user object
- `token`: JWT authentication token
- `loading`: Authentication loading state

**Functions:**
- `login(email, password)`: Authenticate user
- `logout()`: End user session

## Styling System

### CSS Architecture
The application uses a component-based CSS approach with:

1. **Modern CSS Reset**: Consistent base styles across browsers
2. **BEM Methodology**: Consistent class naming convention
3. **CSS Variables**: Theme consistency
4. **Responsive Units**: rem, em, % for scalability

### Color Palette
- Primary: #4361ee (Indigo)
- Secondary: #3a0ca3 (Dark Indigo)
- Success: #2ec4b6 (Teal)
- Warning: #ff9f1c (Orange)
- Error: #e71d36 (Red)
- Neutral: #f8f9fa, #e9ecef, #dee2e6, #adb5bd, #6c757d, #495057, #343a40

### Typography
- Primary font: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- Font weights: 400 (regular), 500 (medium), 700 (bold)
- Font sizes: 0.875rem (small), 1rem (base), 1.125rem (large), 1.25rem (xl), 1.5rem (2xl), 2rem (3xl)

### Spacing System
- Base unit: 0.25rem (4px)
- Scale: 0.25rem, 0.5rem, 0.75rem, 1rem, 1.5rem, 2rem, 3rem, 4rem
- Consistent padding and margin using scale

### Shadow System
- Subtle: 0 2px 10px rgba(0, 0, 0, 0.1)
- Medium: 0 4px 20px rgba(0, 0, 0, 0.08)
- Strong: 0 8px 30px rgba(0, 0, 0, 0.12)

## Responsive Design

The application is designed to work on all device sizes using:

1. **Mobile-First Approach**: Base styles for mobile, enhanced for larger screens
2. **Flexible Grid System**: CSS Grid and Flexbox for layouts
3. **Media Queries**: Breakpoints at 768px and 1024px
4. **Touch-Friendly Controls**: Adequate sizing for touch interactions

### Breakpoints
- Small: 0px - 768px (Mobile)
- Medium: 769px - 1024px (Tablet)
- Large: 1025px+ (Desktop)

## Accessibility

The application follows accessibility best practices:

1. **Semantic HTML**: Proper use of HTML5 elements
2. **ARIA Attributes**: Enhanced accessibility for dynamic content
3. **Keyboard Navigation**: Full keyboard support
4. **Color Contrast**: Minimum 4.5:1 contrast ratio for text
5. **Screen Reader Support**: Proper labeling and landmarks
6. **Focus Management**: Visible focus indicators

## Performance Optimizations

1. **Efficient Rendering**: Minimal re-renders through proper state management
2. **Code Splitting**: Component-based code splitting
3. **Asset Optimization**: Optimized images and resources
4. **Lazy Loading**: Non-critical components loaded on demand
5. **Bundle Analysis**: Regular analysis of bundle size

## Testing

The application includes:

1. **Unit Tests**: Component testing with React Testing Library
2. **Integration Tests**: User flow testing
3. **Accessibility Audits**: Automated accessibility testing
4. **Cross-Browser Testing**: Compatibility testing
5. **Performance Testing**: Load and performance testing

## Deployment

### Build Process
```bash
npm run build
```

The build process:
1. Compiles JavaScript with Babel
2. Optimizes and minifies assets
3. Generates static files in `build/` directory
4. Creates production-ready bundle

### Deployment Options
1. **Vercel**: One-click deployment
2. **Netlify**: Drag-and-drop deployment
3. **GitHub Pages**: Static site hosting
4. **AWS S3**: Cloud storage hosting
5. **Traditional Hosting**: Upload build files to any web server

### Environment Variables
Create a `.env` file in the root directory:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests if applicable
5. Commit your changes
6. Push to the branch
7. Create a pull request

## License

This project is licensed under the MIT License.