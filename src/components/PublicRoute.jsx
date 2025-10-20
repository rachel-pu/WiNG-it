import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabase.js';

const PublicRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Fetch current session
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session);
      setLoading(false);
    };
    fetchSession();

    // Listen for login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <div></div>;
  // If session → redirect to /dashboard
  if (session) return <Navigate to="/dashboard" replace />;

  // Otherwise, render protected page
  return children;
};

export default PublicRoute;
