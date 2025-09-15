# Digital Guidance Platform - Development Documentation

## Executive Summary

The Digital Guidance Platform is a comprehensive solution designed to address the critical gap in career awareness among students in India, particularly those from government schools who often lack access to personalized guidance. Our platform serves as a one-stop personalized career and education advisor, helping students make informed decisions about their academic and career paths.

## App Philosophy

Our approach is rooted in three core principles:

1. **Accessibility**: Ensuring that quality career guidance is available to all students, regardless of their socio-economic background or geographical location.

2. **Personalization**: Using data-driven insights to provide tailored recommendations based on individual interests, aptitudes, and circumstances.

3. **Empowerment**: Equipping students with the knowledge and tools they need to make confident decisions about their future.

We believe that every student deserves access to quality career guidance, and our platform aims to democratize this access by leveraging technology to reach underserved communities.

## Technology Stack

### Backend
- **Node.js**: JavaScript runtime for server-side development
- **Express.js**: Web application framework for RESTful API development
- **MongoDB**: NoSQL database for flexible data storage
- **Mongoose**: ODM for MongoDB integration
- **JWT**: Secure authentication and authorization
- **Bcrypt.js**: Password hashing for security
- **Jest**: Testing framework for unit and integration tests
- **Supertest**: API testing utilities

### Frontend
- **React**: JavaScript library for building user interfaces
- **React Router**: Client-side routing for SPA navigation
- **Context API**: State management for authentication and global state
- **Axios**: HTTP client for API communication
- **CSS3**: Modern styling with responsive design
- **Jest & React Testing Library**: Testing frameworks for frontend components

### DevOps & Infrastructure
- **GitHub Actions**: CI/CD pipeline for automated testing and deployment
- **MongoDB Atlas**: Cloud database hosting
- **Docker**: Containerization for consistent environments (future implementation)
- **Heroku/Netlify**: Deployment platforms (for initial launch)

## Current Implementation Status

### ✅ Phase 0: Foundation & Project Scaffolding

#### Subtask 0.1: Backend Environment Setup (Node.js & Express)
- [x] Create a root project directory named `guidance-platform`
- [x] Inside, create a `backend` directory
- [x] Navigate into the `backend` directory
- [x] Run `npm init -y` to create a `package.json` file
- [x] Install Express: `npm install express`
- [x] Install development dependencies: `npm install --save-dev nodemon jest supertest eslint prettier`
- [x] Create a `.gitignore` file and add `node_modules` and `.env`
- [x] Create a `src` directory for the main application code
- [x] Create a basic server file `src/server.js`
- [x] In `package.json`, add a "start" script: `"node src/server.js"`
- [x] In `package.json`, add a "dev" script: `"nodemon src/server.js"`
- [x] In `package.json`, configure the "test" script: `"jest"`
- [x] Create a `jest.config.js` file for custom Jest configurations
- [x] Create a `src/app.js` file to hold the express app logic, separating it from the server bootstrap
- [x] **TDD:** Create a test file `src/app.test.js`
- [x] **TDD:** In `app.test.js`, write a failing test using Supertest to check for a 404 on a non-existent route like `GET /api`
- [x] **TDD:** In `app.test.js`, write a failing test to expect a `GET /api/health` endpoint to return a 200 status code with a success message
- [x] Create a `routes` directory inside `src`
- [x] Create a health check route in `src/routes/health.js`
- [x] Implement the health check route and controller logic in `app.js` to make the test pass
- [x] Refactor the server and app setup for clarity and separation of concerns
- [x] Run `npm test` to confirm all tests are passing

#### Subtask 0.2: Frontend Environment Setup (React)
- [x] In the root project directory, run `npx create-react-app frontend`
- [x] Navigate into the `frontend` directory
- [x] Remove default files: `App.test.js`, `logo.svg`, `setupTests.js`
- [x] Clean up `App.js` and `index.css` to be minimal
- [x] Install development dependencies: `npm install --save-dev eslint prettier`
- [x] Install production dependencies: `npm install axios react-router-dom`
- [x] Create a `jsconfig.json` file to support absolute imports (e.g., `src/components`)
- [x] Create a new folder structure inside `src`: `components`, `pages`, `services`, `hooks`, `contexts`
- [x] Create placeholder files: `src/pages/HomePage.js`, `src/pages/LoginPage.js`, `src/pages/QuizPage.js`
- [x] Create a `src/components/common` directory for reusable components (Button, Input, etc.)
- [x] **TDD:** Create a test file `src/App.test.js`
- [x] **TDD:** In `App.test.js`, write a failing test using React Testing Library to check if the text "Welcome" is rendered by the App component
- [x] Modify `App.js` to render the "Welcome" text and make the test pass
- [x] Set up basic routing in `App.js` using `react-router-dom`
- [x] **TDD:** Write a test to verify that navigating to the `/login` path renders the `LoginPage` component
- [x] Implement the router logic to make the navigation test pass
- [x] Create a `src/services/api.js` file to configure a base Axios instance for backend communication
- [x] Add a proxy to the `frontend/package.json` file to avoid CORS issues during development (e.g., `"proxy": "http://localhost:5000"`)
- [x] Create a `.env` file in the `frontend` directory for environment-specific variables
- [x] **TDD:** Write a test for a basic `Input` component in `src/components/common/Input.test.js`
- [x] Implement the `Input` component to pass the test
- [x] Run `npm test` to confirm all frontend tests pass

#### Subtask 0.3: Database & CI/CD Setup (MongoDB & Initial Pipeline)
- [x] Create a free cluster on MongoDB Atlas
- [x] Get the connection string for your cluster
- [x] In the `backend` directory, install Mongoose: `npm install mongoose`
- [x] Install `dotenv` to manage environment variables: `npm install dotenv`
- [x] Create a `.env` file in the `backend` root
- [x] Add your `MONGO_URI` and a `PORT` number to the `.env` file
- [x] In `src/server.js`, require `dotenv` at the very top
- [x] Create a `src/config` directory
- [x] Create a `src/config/db.js` file to handle the MongoDB connection logic
- [x] **TDD:** In a new test file `src/config/db.test.js`, write a test to check if the mongoose connection can be established (this may require mocking)
- [x] Implement the `connectDB` function in `db.js` and call it from `server.js`
- [x] Create a `src/models` directory
- [x] Define a basic `User.js` schema in the models directory (e.g., with email and password fields)
- [x] **TDD:** Write a test to ensure the User model can be created and saved to the database (requires a test database connection)
- [x] Create a `.github/workflows` directory in the project root
- [x] Create a `ci.yml` file inside the workflows directory
- [x] Define a job to run on push/pull_request to the main branch
- [x] The job should specify a Node.js environment
- [x] Add a step to checkout the code
- [x] Add a step to `npm install` in the `backend` directory
- [x] Add a step to run `npm test` in the `backend` directory
- [x] Commit the file and check the Actions tab in your GitHub repository to see the pipeline run

### ✅ Phase 1: MVP Development - The Core Guidance Loop

#### Subtask 1.1: TDD for User Registration API
- [x] In `backend`, install `bcryptjs` for password hashing: `npm install bcryptjs`
- [x] Create a new test file: `src/tests/user.test.js`
- [x] **TDD:** Write a test for `POST /api/users/register` that fails with a 400 error if no email is provided
- [x] **TDD:** Write a test for `POST /api/users/register` that fails with a 400 error if no password is provided
- [x] **TDD:** Write a test for `POST /api/users/register` that fails with a 400 error for an invalid email format
- [x] Create `src/controllers/userController.js` and `src/routes/userRoutes.js`
- [x] Implement the initial route and controller logic to handle validation and make the first 3 tests pass
- [x] Refactor the validation logic, perhaps into a separate middleware
- [x] **TDD:** Write a test to ensure a user cannot register with an email that already exists (expects a 400 or 409 error)
- [x] Implement the logic to check for an existing user in the database
- [x] **TDD:** Write a test for a successful registration (`POST /api/users/register`) that returns a 201 status code
- [x] **TDD:** Extend the success test to verify that the returned user object does NOT contain the password
- [x] Implement the user creation logic in the controller
- [x] Use the `bcryptjs` library to hash the password before saving the user to the database
- [x] Ensure the password field is selected as `false` in the Mongoose model response
- [x] Refactor the registration controller for clarity
- [x] **TDD:** Write a unit test for the password hashing function itself
- [x] **TDD:** Write a test for the User model to ensure the pre-save hook for hashing works as expected
- [x] Implement the pre-save hook in `src/models/User.js`
- [x] Run all tests to ensure nothing has broken
- [x] Document the registration endpoint using comments or a separate documentation file

#### Subtask 1.2: TDD for User Login API
- [x] In `backend`, install `jsonwebtoken`: `npm install jsonwebtoken`
- [x] Add a `JWT_SECRET` to your `.env` file
- [x] In `src/tests/user.test.js`, add a new describe block for the login endpoint
- [x] **TDD:** Write a test for `POST /api/users/login` that fails with a 401 error if the user does not exist
- [x] **TDD:** Write a test for `POST /api/users/login` that fails with a 401 error if the email exists but the password is incorrect
- [x] **TDD:** Write a test for `POST /api/users/login` that succeeds with a 200 status code for correct credentials
- [x] **TDD:** Extend the success test to verify that the response body contains a `token`
- [x] Create a `loginUser` function in `src/controllers/userController.js`
- [x] Implement the logic to find the user by email
- [x] Add a method to the User schema to compare the candidate password with the stored hashed password using `bcryptjs`
- [x] **TDD:** Write a unit test for this new password comparison method on the User model
- [x] Implement the password comparison logic in the controller to make the failing login tests pass
- [x] Create a utility function to generate a JWT
- [x] **TDD:** Write a unit test for the JWT generation utility
- [x] Use the utility in the `loginUser` controller upon successful authentication
- [x] Return the token in the response body
- [x] Refactor the login controller and utility functions
- [x] **TDD:** Write a test to ensure the returned user object on login does not contain the password
- [x] **TDD:** Write a test to ensure the generated token can be decoded and contains the user's ID
- [x] Run all tests to ensure both registration and login are working correctly
- [x] Document the login endpoint

#### Subtask 1.3: TDD for Protected Routes & Frontend Login
- [x] **Backend:** Create a `src/middleware` directory
- [x] **Backend:** Create an `authMiddleware.js` file
- [x] **TDD (Backend):** Write a test for a new protected endpoint (e.g., `GET /api/users/profile`) that fails with a 401 error if no token is provided
- [x] **TDD (Backend):** Write a test that fails with a 401 if the token is invalid or malformed
- [x] **TDD (Backend):** Write a test that succeeds with a 200 and returns user data if a valid token is provided in the `Authorization` header
- [x] **Backend:** Implement the middleware to decode the JWT from the header, verify it, and attach the user to the request object
- [x] **Backend:** Apply the middleware to the profile route and implement the controller to return the user's data
- [x] **Frontend:** Create a `src/pages/LoginPage.js` component with a form containing email and password inputs and a submit button
- [x] **TDD (Frontend):** Write tests for the `LoginPage` to ensure it renders the form elements correctly
- [x] **TDD (Frontend):** Write a test to simulate user input and a button click
- [x] **Frontend:** Create a `src/contexts/AuthContext.js` to manage user state and tokens globally
- [x] **TDD (Frontend):** Write tests for the `AuthContext` provider and consumer/hook
- [x] **Frontend:** Implement the `login` function in the `AuthContext` that calls the backend API using the Axios service
- [x] **Frontend:** On successful login, store the user data and token in the context state and local storage
- [x] **TDD (Frontend):** Mock the API call using `jest.mock('axios')` and test the entire login flow from the component's perspective
- [x] **Frontend:** Create a `PrivateRoute` component that checks for a valid token in the `AuthContext`
- [x] **TDD (Frontend):** Write tests for the `PrivateRoute` component. It should render the child component if logged in, and redirect to `/login` if not
- [x] **Frontend:** Implement the `PrivateRoute` logic
- [x] **Frontend:** Wrap a new `ProfilePage` component with the `PrivateRoute` in your main router
- [x] **Frontend:** The `ProfilePage` should fetch and display user data from the protected backend endpoint
- [x] **TDD (Frontend):** Write tests for the `ProfilePage` to ensure it displays user data when logged in
- [x] Manually test the full end-to-end flow in the browser

## Updated Feature Roadmap Based on Idea.txt Requirements

### ✅ Phase 3: AI-Powered Recommendation System

#### Subtask 3.1: Aptitude & Interest Assessment Engine
- [x] Design comprehensive quiz system with:
  - Multiple question types (MCQ, rating scales, scenario-based)
  - Adaptive questioning based on responses
  - Timed assessments with pause/resume functionality
- [x] Implement quiz scoring algorithms
- [x] Create visualization tools for quiz results
- [x] Develop comparative analysis features (different career paths)
- [x] Implement accessibility features for diverse user needs

#### Subtask 3.2: Machine Learning Recommendation Engine
- [x] Research and implement ML algorithms for personalized recommendations
- [x] Create training data pipeline from user interactions
- [x] Develop recommendation scoring system
- [x] Implement A/B testing framework for recommendation algorithms
- [x] Create feedback loop for continuous improvement of recommendations

#### Subtask 3.3: Course-to-Career Path Mapping System
- [x] Design visual mapping interface for career pathways
- [x] Create database of degree programs and corresponding careers
- [x] Implement industry trend analysis integration
- [x] Develop salary projection models
- [x] Create pathway comparison tools

### ✅ Phase 3: AI-Powered Recommendation System

#### Subtask 3.1: Aptitude & Interest Assessment Engine
- [x] Design comprehensive quiz system with:
  - Multiple question types (MCQ, rating scales, scenario-based)
  - Adaptive questioning based on responses
  - Timed assessments with pause/resume functionality
- [x] Implement quiz scoring algorithms
- [x] Create visualization tools for quiz results
- [x] Develop comparative analysis features (different career paths)
- [x] Implement accessibility features for diverse user needs

#### Subtask 3.2: Machine Learning Recommendation Engine
- [ ] Research and implement ML algorithms for personalized recommendations
- [ ] Create training data pipeline from user interactions
- [ ] Develop recommendation scoring system
- [ ] Implement A/B testing framework for recommendation algorithms
- [ ] Create feedback loop for continuous improvement of recommendations

#### Subtask 3.3: Course-to-Career Path Mapping System
- [ ] Design visual mapping interface for career pathways
- [ ] Create database of degree programs and corresponding careers
- [ ] Implement industry trend analysis integration
- [ ] Develop salary projection models
- [ ] Create pathway comparison tools

### 🏫 Phase 4: Government College Directory System

#### Subtask 4.1: College Database & Geolocation System
- [ ] Create comprehensive database of government colleges
- [ ] Implement geolocation services for nearby college discovery
- [ ] Develop filtering system based on:
  - Location radius
  - Degree programs offered
  - Admission requirements
  - Facilities available
- [ ] Create detailed college profile pages
- [ ] Implement review/rating system for colleges

#### Subtask 4.2: Admission & Eligibility Tracking
- [ ] Create admission calendar with important dates
- [ ] Implement eligibility checker for different programs
- [ ] Develop cutoff prediction models
- [ ] Create application status tracking system
- [ ] Implement notification system for admission deadlines

### ⏰ Phase 5: Timeline & Notification System

#### Subtask 5.1: Event Calendar & Scheduler
- [ ] Design interactive calendar interface
- [ ] Implement event creation and management system
- [ ] Create recurring event templates
- [ ] Develop timezone-aware scheduling
- [ ] Implement calendar sharing capabilities

#### Subtask 5.2: Intelligent Notification Engine
- [ ] Create multi-channel notification system (SMS, Email, Push)
- [ ] Implement notification preferences management
- [ ] Develop intelligent timing for notifications
- [ ] Create notification templates for different user segments
- [ ] Implement notification analytics and optimization

### 📚 Phase 6: Resource Library & Learning Materials

#### Subtask 6.1: Educational Resource Repository
- [ ] Create categorized library of educational resources
- [ ] Implement search and filtering capabilities
- [ ] Develop bookmarking and personal collection features
- [ ] Create resource rating and review system
- [ ] Implement offline access capabilities

#### Subtask 6.2: Scholarship & Financial Aid Portal
- [ ] Create comprehensive database of scholarships
- [ ] Implement scholarship matching algorithms
- [ ] Develop application tracking system
- [ ] Create financial planning tools
- [ ] Implement partnership system with scholarship providers

### 🌐 Phase 7: Offline Capabilities & Low-Bandwidth Optimization

#### Subtask 7.1: Progressive Web App Implementation
- [ ] Convert web application to Progressive Web App (PWA)
- [ ] Implement service workers for offline functionality
- [ ] Create installable application experience
- [ ] Optimize for low-bandwidth environments
- [ ] Implement data synchronization strategies

#### Subtask 7.2: Content Caching & Compression
- [ ] Develop intelligent content caching strategies
- [ ] Implement image compression and optimization
- [ ] Create progressive loading for large datasets
- [ ] Develop fallback mechanisms for low-connectivity scenarios
- [ ] Implement bandwidth detection and adaptive loading

### 👥 Phase 8: Stakeholder Collaboration Platform

#### Subtask 8.1: Counselor & Educator Portal
- [ ] Create dedicated portal for counselors and educators
- [ ] Implement student progress tracking dashboards
- [ ] Develop communication tools between stakeholders
- [ ] Create resource sharing capabilities
- [ ] Implement analytics and reporting features

#### Subtask 8.2: Government Department Integration
- [ ] Develop API integrations with government education databases
- [ ] Create reporting dashboards for policy makers
- [ ] Implement data privacy and security measures for institutional data
- [ ] Develop bulk import/export capabilities
- [ ] Create audit trail for data modifications

### 📊 Phase 9: Analytics & Impact Measurement

#### Subtask 9.1: User Engagement Analytics
- [ ] Implement comprehensive user behavior tracking
- [ ] Create engagement funnel analysis
- [ ] Develop retention and churn analysis tools
- [ ] Implement cohort analysis for feature effectiveness
- [ ] Create real-time dashboard for key metrics

#### Subtask 9.2: Educational Outcome Tracking
- [ ] Develop system for tracking educational outcomes
- [ ] Implement long-term impact measurement
- [ ] Create correlation analysis between platform usage and success metrics
- [ ] Develop predictive models for student success
- [ ] Implement feedback collection from educational institutions

### 🚀 Phase 10: Pilot Program & Scaling Strategy

#### Subtask 10.1: District-Level Pilot Implementation
- [ ] Select pilot districts based on need and feasibility
- [ ] Implement localized content and language support
- [ ] Create training programs for local stakeholders
- [ ] Develop feedback collection mechanisms
- [ ] Implement iterative improvements based on pilot results

#### Subtask 10.2: National Rollout Framework
- [ ] Design scalable architecture for national deployment
- [ ] Create regional customization framework
- [ ] Implement multilingual support
- [ ] Develop partner ecosystem for sustainable growth
- [ ] Create monitoring and evaluation framework for nationwide impact

## Current UI/UX Implementation

### Modern Design Principles Applied
1. **Clean Aesthetic**: Minimalist design with ample whitespace
2. **Professional Color Scheme**: Indigo-based palette for trust and professionalism
3. **Responsive Layout**: Mobile-first approach with flexible grids
4. **Intuitive Navigation**: Clear user flows and information hierarchy
5. **Accessible Design**: WCAG-compliant contrast ratios and semantic HTML

### Implemented Components
- Header with responsive navigation
- Homepage with value proposition and feature highlights
- Login form with validation and error handling
- Interactive quiz interface with progress tracking
- User profile dashboard
- Protected routes system
- PrivateRoute component for authenticated views

## Future Enhancements Roadmap

### Short-term Goals (Next 3 Months)
1. Implement extended user registration with personal information
2. Develop comprehensive quiz system for aptitude assessment
3. Create basic recommendation engine
4. Implement college directory with geolocation features
5. Develop event calendar and notification system

### Medium-term Goals (3-6 Months)
1. Launch pilot program in selected districts
2. Implement AI-powered recommendation algorithms
3. Develop offline capabilities for low-connectivity areas
4. Create counselor and educator portal
5. Establish partnerships with government education departments

### Long-term Vision (6-12 Months)
1. Achieve full national rollout through government schools
2. Implement advanced analytics and impact measurement
3. Develop multilingual support for regional languages
4. Create mobile app versions for Android and iOS
5. Establish sustainable funding and scaling model

## Development Best Practices Followed

1. **Test-Driven Development (TDD)**: All core functionality developed with tests first
2. **Modular Architecture**: Clear separation of concerns with component-based design
3. **Security First**: Password hashing, JWT authentication, and input validation
4. **Scalable Design**: Cloud-native architecture with horizontal scaling capabilities
5. **Accessibility Compliance**: WCAG guidelines followed throughout development
6. **Performance Optimization**: Efficient algorithms and lazy loading where appropriate
7. **Continuous Integration**: Automated testing through GitHub Actions
8. **Documentation**: Comprehensive code comments and system documentation

## Conclusion

The Digital Guidance Platform represents a significant step toward democratizing access to quality career guidance for students across India. By combining modern web technologies with data-driven insights and AI-powered recommendations, we're creating a tool that empowers students to make informed decisions about their educational and career paths.

Our current implementation provides a solid foundation with user authentication and a modern UI. The expanded roadmap based on the requirements in idea.txt positions us to develop a comprehensive platform that addresses the multifaceted challenges students face in accessing quality career guidance.

Through continued development, stakeholder collaboration, and thoughtful implementation of the planned features, we aim to create lasting positive impact on educational outcomes and career trajectories for students across the nation.