# Local Development Setup Guide

## Prerequisites
1. Node.js (version 14 or higher)
2. MongoDB running locally

## Steps to Run the Application Locally

### 1. Start MongoDB
Make sure MongoDB is running on your system:
- On Windows: MongoDB service should be running
- On Mac/Linux: Run `mongod` in a terminal

### 2. Run the Backend
Open a new terminal and navigate to the backend directory:
```bash
cd guidance-platform/backend
```

Install dependencies (if not already done):
```bash
npm install
```

Start the backend server:
```bash
npm run dev
```

You should see output similar to:
```
Server is running on port 5000
MongoDB Connected: localhost
```

### 3. Run the Frontend
Open another terminal and navigate to the frontend directory:
```bash
cd guidance-platform/frontend
```

Install dependencies (if not already done):
```bash
npm install
```

Start the frontend development server:
```bash
npm start
```

The frontend should automatically open in your browser at `http://localhost:3000`

## Troubleshooting Common Issues

### Issue 1: MongoDB Connection Error
If you see "Error connecting to MongoDB" in the backend console:
1. Make sure MongoDB is running
2. Check that the connection string in `backend/.env` is correct:
   ```
   MONGO_URI=mongodb://localhost:27017/guidance-platform
   ```
3. Try connecting to MongoDB using a MongoDB client to verify it's accessible

### Issue 2: Port Already in Use
If you get an error that port 5000 or 3000 is already in use:
1. Change the PORT in `backend/.env` to a different port (e.g., 5001)
2. Update the proxy setting in `frontend/package.json` to match the new port

### Issue 3: CORS Errors
If you see CORS errors in the browser console:
1. Make sure the backend is running
2. Check that the proxy setting in `frontend/package.json` is correct:
   ```json
   "proxy": "http://localhost:5000"
   ```

### Issue 4: Environment Variables Not Loading
If environment variables are not being loaded:
1. Make sure the `.env` files are in the correct directories
2. Restart both the backend and frontend servers after making changes to `.env` files

### Issue 5: Dependencies Not Found
If you get errors about missing dependencies:
1. Run `npm install` in both the backend and frontend directories
2. Make sure you're in the correct directory when running commands

## Testing the Application

Once both servers are running:

1. Open your browser and go to `http://localhost:3000`
2. You should see the homepage
3. Navigate to the login page
4. Try to register a new user
5. Try to login with the registered user
6. Access the profile page (should be protected and only accessible when logged in)

## API Endpoints

The backend API is available at `http://localhost:5000/api`:

- `GET /api/health` - Health check endpoint
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - User profile (protected)

## Stopping the Application

To stop the servers:
1. In each terminal, press `Ctrl + C`
2. Confirm by pressing `Y` if prompted

## Common Commands

### Backend
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Start production server
npm start
```

### Frontend
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```