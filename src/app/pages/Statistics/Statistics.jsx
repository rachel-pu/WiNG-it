import { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import './Statistics.css';
import DefaultAppLayout from '../../DefaultAppLayout.jsx';
import { Target, Activity, ExternalLink, ChevronDown, ChevronUp, Award, TrendingUp } from 'lucide-react';
import { ref, get } from "firebase/database";
import { database } from '../../../lib/firebase.jsx';

const Statistics = () => {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [behavioralData, setBehavioralData] = useState(null);
  const [expandedSessions, setExpandedSessions] = useState({});
  const [notification, setNotification] = useState('');

  // Get user ID from cookie
  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const userIdFromCookie = getCookie('user_id');
    if (userIdFromCookie) {
      setUserId(userIdFromCookie);
    }
  }, []);

  // Fetch behavioral interview data from Firebase
  useEffect(() => {
    const fetchBehavioralData = async () => {
      if (!userId) {
        console.log('No userId available yet');
        return;
      }

      console.log('Fetching data for userId:', userId);
      setLoading(true);
      try {
        // Fetch all responses
        const responsesSnapshot = await get(ref(database, `responses`));
        console.log('Responses snapshot exists:', responsesSnapshot.exists());

        if (!responsesSnapshot.exists()) {
          console.log('No responses found');
          setBehavioralData({
            totalSessions: 0,
            totalQuestions: 0,
            averageScore: 0,
            totalTime: '0h 0m',
            improvement: '0%',
            monthlyProgress: [],
            topicScores: [],
            sessionHistory: []
          });
          setLoading(false);
          return;
        }

        const allResponses = responsesSnapshot.val();
        console.log('All responses data:', allResponses);

        const userTierSnapshot = await get(ref(database, `userTiers/free/${userId}`));

        if (userTierSnapshot.exists()) {
          setNotification("Interviews older than 30 days will be deleted. Upgrade to Pro or Premium to retain all sessions.");
        }

        setLoading(false);

        // Filter responses by userId and group by sessionId
        const sessionMap = {};
        Object.entries(allResponses).forEach(([_responseId, responseData]) => {
          if (responseData.userId === userId) {
            const sessionId = responseData.sessionId;
            if (!sessionMap[sessionId]) {
              sessionMap[sessionId] = {
                sessionId,
                responses: [],
                timestamp: parseInt(sessionId.replace('session-', ''))
              };
            }
            sessionMap[sessionId].responses.push(responseData);
          }
        });

        console.log('Session map:', sessionMap);

        // Convert to array and process sessions
        const sessions = Object.values(sessionMap).map(session => {
          const date = new Date(session.timestamp);
          return {
            sessionId: session.sessionId,
            date: date.toISOString().split('T')[0],
            timestamp: session.timestamp,
            responseCount: session.responses.length
          };
        });

        console.log('Processed sessions:', sessions);

        // Sort sessions by date (newest first)
        sessions.sort((a, b) => b.timestamp - a.timestamp);

        // Calculate statistics
        const totalSessions = sessions.length;
        const recentSessions = sessions.slice(0, 10); // Last 10 sessions

        setBehavioralData({
          totalSessions,
          totalQuestions: 0,
          averageScore: 0,
          totalTime: '0h 0m',
          improvement: '0%',
          monthlyProgress: [],
          topicScores: [],
          sessionHistory: recentSessions.map((session, index) => ({
            id: index + 1,
            sessionId: session.sessionId,
            date: session.date,
            responseCount: session.responseCount,
            score: 0,
            duration: '0min'
          }))
        });

      } catch (error) {
        console.error('Error fetching behavioral data:', error);
        setBehavioralData({
          totalSessions: 0,
          totalQuestions: 0,
          averageScore: 0,
          totalTime: '0h 0m',
          improvement: '0%',
          monthlyProgress: [],
          topicScores: [],
          sessionHistory: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBehavioralData();
  }, [userId]);

  const toggleSession = (sessionId) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  const renderOverviewCards = () => {
    if (!behavioralData || loading) return null;

    return (
      <div className="stats-overview-cards">
        <div className="stat-card">
          <div className="stat-icon">
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <h3>{behavioralData.totalSessions}</h3>
            <p>Total Sessions</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-info">
            <h3>{behavioralData.totalQuestions || 0}</h3>
            <p>Questions Answered</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Award size={24} />
          </div>
          <div className="stat-info">
            <h3>{behavioralData.averageScore || 0}%</h3>
            <p>Average Score</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>{behavioralData.improvement}</h3>
            <p>Improvement</p>
          </div>
        </div>
      </div>
    );
  };

  const renderBehavioralStats = () => {
    if (loading) {
      return (
        <div className="tool-section">
          <div className="section-header">
            <h2>Behavioral Interview Statistics</h2>
            <p>Loading your statistics...</p>
          </div>
        </div>
      );
    }

    if (!behavioralData) {
      return (
        <div className="tool-section">
          <div className="section-header">
            <h2>Behavioral Interview Statistics</h2>
            <p>No data available yet. Start your first interview!</p>
          </div>
        </div>
      );
    }

    return (
      <div className="tool-section">
        <div className="section-header">
          <h2>Behavioral Interview Statistics</h2>
          <p>Track your progress and performance in behavioral interview simulations</p>
        </div>

        {renderOverviewCards()}

        {/* Session History */}
        <div className="history-section">
          <h3>Recent Sessions</h3>
          {behavioralData.sessionHistory.length > 0 ? (
            <div className="history-table">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}></th>
                    <th>Date</th>
                    <th>Session ID</th>
                    <th>Questions Answered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {behavioralData.sessionHistory.map(session => (
                    <Fragment key={session.id}>
                      <tr className="session-row">
                        <td>
                          <button
                            className="expand-btn"
                            onClick={() => toggleSession(session.sessionId)}
                            aria-label="Expand session details"
                          >
                            {expandedSessions[session.sessionId] ? (
                              <ChevronUp size={18} />
                            ) : (
                              <ChevronDown size={18} />
                            )}
                          </button>
                        </td>
                        <td>{session.date}</td>
                        <td className="session-id">{session.sessionId.substring(0, 8)}...</td>
                        <td>
                          <span className="question-count-badge">
                            {session.responseCount} questions
                          </span>
                        </td>
                        <td>
                          <Link
                            to={`/behavioral/results?userId=${userId}&sessionId=${session.sessionId}&expectedQuestions=${session.responseCount}`}
                            className="view-results-btn"
                          >
                            <ExternalLink size={16} />
                            View Results
                          </Link>
                        </td>
                      </tr>
                      {expandedSessions[session.sessionId] && (
                        <tr key={`${session.id}-details`} className="session-details-row">
                          <td colSpan="5">
                            <div className="session-details">
                              <h4>Session Details</h4>
                              <div className="details-grid">
                                <div className="detail-item">
                                  <span className="detail-label">Date:</span>
                                  <span className="detail-value">
                                    {new Date(session.date).toLocaleDateString('en-US', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                                <div className="detail-item">
                                  <span className="detail-label">Questions:</span>
                                  <span className="detail-value">{session.responseCount}</span>
                                </div>
                              </div>
                              <p style={{ marginTop: '12px', fontSize: '0.9rem', color: '#64748b' }}>
                                Click "View Results" to see full details of this session.
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-sessions">No sessions found. Start your first interview!</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <DefaultAppLayout>
      <div className="statistics-page">
        <div className="statistics-header">
          <h1>Your Statistics</h1>
          <p>
            {notification ? notification : "Track your progress and performance in behavioral interview simulations"}
          </p>
        </div>

        <div className="statistics-content">
          {renderBehavioralStats()}
        </div>
      </div>
    </DefaultAppLayout>
  );
};

export default Statistics;
