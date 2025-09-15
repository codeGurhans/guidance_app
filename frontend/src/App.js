import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import ComparisonPage from './pages/ComparisonPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import ProfileManagementPage from './pages/ProfileManagementPage';
import ExtendedRegistrationPage from './pages/ExtendedRegistrationPage';
import PrivateRoute from './components/common/PrivateRoute';
import Header from './components/common/Header';
import RecommendationsPage from './pages/RecommendationsPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import CollegesPage from './pages/CollegesPage';
import CollegeDetailsPage from './pages/CollegeDetailsPage';
import AdmissionCalendarPage from './pages/AdmissionCalendarPage';
import EligibilityCheckerPage from './pages/EligibilityCheckerPage';
import ApplicationsPage from './pages/ApplicationsPage';
import CutoffPredictorPage from './pages/CutoffPredictorPage';
import ApplicationDetailsPage from './pages/ApplicationDetailsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <a href="#main-content" className="skip-link">Skip to main content</a>
          <Header />
          <main className="main-content" id="main-content" tabIndex="-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/quiz" element={<HomePage />} />
              <Route path="/quiz/:id" element={<QuizPage />} />
              <Route 
                path="/quiz/:id/results" 
                element={
                  <PrivateRoute>
                    <ResultsPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/comparison" 
                element={
                  <PrivateRoute>
                    <ComparisonPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/analytics" 
                element={
                  <PrivateRoute>
                    <AnalyticsDashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile/manage" 
                element={
                  <PrivateRoute>
                    <ProfileManagementPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/extended-registration" 
                element={
                  <PrivateRoute>
                    <ExtendedRegistrationPage />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/recommendations/:id" 
                element={
                  <PrivateRoute>
                    <RecommendationsPage />
                  </PrivateRoute>
                } 
              />
              <Route path="/colleges" element={<CollegesPage />} />
              <Route path="/colleges/:id" element={<CollegeDetailsPage />} />
              <Route path="/admission-calendar" element={<AdmissionCalendarPage />} />
              <Route path="/eligibility-checker" element={<EligibilityCheckerPage />} />
              <Route path="/applications" element={<ApplicationsPage />} />
              <Route path="/applications/:id" element={<ApplicationDetailsPage />} />
              <Route path="/cutoff-predictor" element={<CutoffPredictorPage />} />
            </Routes>
          </main>
          <footer className="footer" role="contentinfo">
            <div className="footer-container">
              <p>&copy; 2023 GuidanceHub. Empowering students for a brighter future.</p>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
