import { Routes, Route } from 'react-router-dom';
import Home from './app/pages/Home/Home.jsx';
import SettingsProfile from './app/pages/Settings/SettingsProfile.jsx';
import SettingsBillings from './app/pages/Settings/SettingsBillings.jsx';
import SettingsPlan from './app/pages/Settings/SettingsPlan.jsx';
import SettingsNotifications from './app/pages/Settings/SettingsNotifications.jsx';
import Signin from './app/pages/Auth/Signin/Signin.jsx';
import Signup from './app/pages/Auth/Signup/Signup.jsx';
import Dashboard from './app/pages/Dashboard/Dashboard.jsx';
import Behavioral from './app/pages/Tools/Behavioral/Behavioral.jsx';
import InterviewResults from "./app/pages/Tools/Behavioral/results/result.jsx"
import RetryQuestionPage from "./app/pages/Tools/Behavioral/components/RetryQuestionPage.jsx"
import PrivacyPolicy from './app/pages/PrivacyPolicy/PrivacyPolicy.jsx'; 
import TermsService from './app/pages/TermsService/TermsService.jsx'; 
import UpdatePassword from './app/pages/Auth/UpdatePassword/UpdatePassword.jsx'; 
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicRoute from './components/PublicRoute.jsx'; 

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
        <Route path="/settings/profile"
          element={
            <ProtectedRoute>
              <SettingsProfile />
            </ProtectedRoute>
          }
        />
        <Route path="/settings/billings"
          element={
            <ProtectedRoute>
              <SettingsBillings />
            </ProtectedRoute>
          }
        />
        <Route path="/settings/plan"
          element={
            <ProtectedRoute>
              <SettingsPlan/>
            </ProtectedRoute>
          }
        />
        <Route path="/settings/notifications"
          element={
            <ProtectedRoute>
              <SettingsNotifications />
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
