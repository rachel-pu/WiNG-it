import { Routes, Route, Link } from 'react-router-dom';
import Home from './app/pages/Home/Home.jsx';
import Dashboard from './app/pages/Dashboard/Dashboard.jsx';
import Behavioral from './app/pages/Behavioral/Behavioral.jsx';
import Signin from './app/pages/Signin/Signin.jsx';
import Signup from './app/pages/Signup/Signup.jsx';
import InterviewResults from "./app/pages/Behavioral/results/result.jsx"

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/behavioral" element={<Behavioral />} />
        <Route path="/behavioral/results" element={<InterviewResults />} />
      </Routes>
    </div>
  );
}

export default App;
