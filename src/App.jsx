import { Routes, Route, Link } from 'react-router-dom';
import Home from './app/pages/Home/Home.jsx';
import Settings from './app/pages/Settings/Settings.jsx';
import Signin from './app/pages/Auth/Signin/Signin.jsx';
import Signup from './app/pages/Auth/Signup/Signup.jsx';
import Dashboard from './app/pages/Dashboard/Dashboard.jsx';
import Behavioral from './app/pages/Tools/Behavioral/Behavioral.jsx';
import InterviewResults from "./app/pages/Tools/Behavioral/results/result.jsx"
import ProtectedRoute from './components/ProtectedRoute.jsx'; 

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
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
      </Routes>
    </div>
  );
}

export default App;
