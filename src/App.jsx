import { Routes, Route } from 'react-router-dom';
import Home from './app/pages/Home/Home.jsx';
import SettingsPage from './app/pages/Settings/SettingsPage.jsx';
import Signin from './app/pages/Auth/Signin/Signin.jsx';
import Signup from './app/pages/Auth/Signup/Signup.jsx';
import Onboarding from './app/pages/Auth/Onboarding/Onboarding.jsx';
import Dashboard from './app/pages/Dashboard/Dashboard.jsx';
import Behavioral from './app/pages/Tools/Behavioral/Behavioral.jsx';
import InterviewResults from "./app/pages/Tools/Behavioral/results/result.jsx"
import RetryQuestionPage from "./app/pages/Tools/Behavioral/components/RetryQuestionPage.jsx"
import PrivacyPolicy from './app/pages/PrivacyPolicy/PrivacyPolicy.jsx';
import TermsService from './app/pages/TermsService/TermsService.jsx';
import UpdatePassword from './app/pages/Auth/UpdatePassword/UpdatePassword.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import Statistics from './app/pages/Statistics/Statistics.jsx';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/privacy" element = {<PrivacyPolicy/>}/>
        <Route path="/terms" element = {<TermsService/>}/>
        <Route path="/update-password" element = {<UpdatePassword/>}/>
        <Route path="/"
          element={
            <PublicRoute>
              <Home />
            </PublicRoute>
          }
        />
        <Route path="/signin"
          element={
            <PublicRoute>
              <Signin />
            </PublicRoute>
          }
        />
        <Route path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path ="/statistics"
        element={
          <ProtectedRoute>
              <Statistics />
            </ProtectedRoute>
        }
        />
        <Route path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/behavioral"
          element={
            <ProtectedRoute>
              <Behavioral />
            </ProtectedRoute>
          }
        />
        <Route path="/behavioral/results"
          element={
            <ProtectedRoute>
              <InterviewResults />
            </ProtectedRoute>
          }
        />
        <Route path="/behavioral/retry"
          element={
            <ProtectedRoute>
              <RetryQuestionPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
