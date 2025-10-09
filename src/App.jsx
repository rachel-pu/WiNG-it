import { Routes, Route, Link } from 'react-router-dom';
import Home from './App/Pages/Home/Home.jsx';
import Settings from './App/Pages/Settings/Settings.jsx';
import Signin from './App/Pages/Auth/Signin/Signin.jsx';
import Signup from './App/Pages/Auth/Signup/Signup.jsx';
import Dashboard from './App/Pages/Dashboard/Dashboard.jsx';
import Behavioral from './App/Pages/Tools/Behavioral/Behavioral.jsx';
import InterviewResults from "./App/Pages/Tools/Behavioral/results/result.jsx"
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
