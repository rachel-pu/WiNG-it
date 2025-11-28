import { useState, useEffect, Fragment } from 'react';
import { Target, Activity, Award, TrendingUp, TrendingDown, MessageSquare, Clock, Zap, ChevronDown, ChevronUp, ExternalLink, BarChart3, PieChart } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Statistics.css';
import DefaultAppLayout from "../../DefaultAppLayout.jsx";
import Box from '@mui/material/Box';
import { database } from '../../../lib/firebase.jsx';
import { ref, get, remove } from "firebase/database";
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const Statistics = () => {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedSessions, setExpandedSessions] = useState({});
  const [behavioralData, setBehavioralData] = useState(null);
  const [notification, setNotification] = useState('');

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

  useEffect(() => {
    const fetchBehavioralData = async () => {
      if (!userId) {
        return;
      }

      setLoading(true);
      try {
        const interviewsSnapshot = await get(ref(database, `interviews/${userId}`));
        
        if (!interviewsSnapshot.exists()) {
          setBehavioralData({
            totalSessions: 0,
            totalQuestions: 0,
            averageQuestionsPerSession: 0,
            averageScore: 0,
            scoreImprovement: '0%',
            weeklyProgress: [],
            monthlyProgress: [],
            categoryScores: {},
            categoryBreakdown: {},
            topCategory: {name: "Unknown", score: 0},
            avgFillerWords: 0,
            avgActionWords: 0,
            avgSpeakingTime: 0,
            coverageScores: {},
            last5SessionsScores: [],
            sessionHistory: []
          });
          setLoading(false);
          return;
        }

        const allInterviews = interviewsSnapshot.val();
        const sessions = Object.entries(allInterviews);
        
        const userTierSnapshot = await get(ref(database, `userTiers/free/${userId}`));
        if (userTierSnapshot.exists()) {
          setNotification("Interviews older than 30 days will be deleted. Upgrade to Pro or Premium to retain all sessions.");
        }

        const processedSessions = [];
        let totalQuestions = 0;
        let totalScore = 0;
        let totalFillerWords = 0;
        let totalActionWords = 0;
        let totalSpeakingTime = 0;
        let questionsWithScores = 0;
        let questionsWithMetrics = 0;
        
        const categoryScores = {};
        const categoryCount = {};
        const questionTypeCount = {};
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        let weeklyCount = 0;
        let monthlyCount = 0;

        sessions.forEach(([sessionId, sessionData]) => {
          const timestamp = parseInt(sessionId.replace('session-', ''));
          const sessionDate = new Date(timestamp);
          const responses = sessionData.responses || [];
          
          if (sessionDate >= oneWeekAgo) weeklyCount++;
          if (sessionDate >= oneMonthAgo) monthlyCount++;
          
          let sessionScore = 0;
          let sessionQuestions = 0;
          let sessionFillerWords = 0;
          let sessionActionWords = 0;
          let sessionSpeakingTime = 0;
          const fillerWordCounts = {};
          const actionWordCounts = {};
          
          responses.forEach((response, index) => {
            if (!response || index === 0) return;
            
            totalQuestions++;
            sessionQuestions++;
            
            if (response.analysis?.overallScore) {
              const score = response.analysis.overallScore;
              totalScore += score;
              sessionScore += score;
              questionsWithScores++;
            }
            
            if (response.analysis?.fillerWordList) {
              totalFillerWords += response.analysis.fillerWordList.length;
              sessionFillerWords += response.analysis.fillerWordList.length;
              questionsWithMetrics++;
            }
            if (response.analysis?.actionWordList) {
              totalActionWords += response.analysis.actionWordList.length;
              sessionActionWords += response.analysis.actionWordList.length;
            }
            
            if (response.recordedTime) {
              totalSpeakingTime += response.recordedTime;
              sessionSpeakingTime += response.recordedTime;
            }
            
            if (response.analysis?.questionTypes) {
              response.analysis.questionTypes.forEach(type => {
                categoryCount[type] = (categoryCount[type] || 0) + 1;
                questionTypeCount[type] = (questionTypeCount[type] || 0) + 1;
                
                if (response.analysis?.overallScore) {
                  if (!categoryScores[type]) {
                    categoryScores[type] = { total: 0, count: 0 };
                  }
                  categoryScores[type].total += response.analysis.overallScore;
                  categoryScores[type].count++;
                }
              });
            }

            // Aggregate filler words
            response.analysis?.fillerWordList?.forEach(word => {
              fillerWordCounts[word] = (fillerWordCounts[word] || 0) + 1;
            });

            // Aggregate action words
            response.analysis?.actionWordList?.forEach(word => {
              actionWordCounts[word] = (actionWordCounts[word] || 0) + 1;
            });
          });

          const topFillerWords = Object.entries(fillerWordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([word, count]) => `${word} (${count})`);

          const topActionWords = Object.entries(actionWordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([word, count]) => `${word} (${count})`);

          processedSessions.push({
            sessionId,
            date: sessionDate.toISOString().split('T')[0],
            timestamp,
            questionCount: sessionQuestions,
            averageScore: Number((sessionScore / sessionQuestions).toFixed(1)),
            fillerWords: sessionFillerWords,
            actionWords: sessionActionWords,
            speakingTime: sessionSpeakingTime,
            topFillerWords,
            topActionWords
          });
        });
        
        processedSessions.sort((a, b) => b.timestamp - a.timestamp);
        
        const categoryAverages = {};
        Object.entries(categoryScores).forEach(([category, data]) => {
          categoryAverages[category] = (data.total / data.count).toFixed(1);
        });
        
        let topCategory = null;
        let topScore = 0;
        Object.entries(categoryAverages).forEach(([category, score]) => {
          if (parseFloat(score) > topScore) {
            topScore = parseFloat(score);
            topCategory = category;
          }
        });
        
        let scoreImprovement = '0%';
        if (processedSessions.length >= 2) {
          const lastScore = parseFloat(processedSessions[0].averageScore);
          const previousScore = parseFloat(processedSessions[1].averageScore);
          if (previousScore > 0) {
            const improvement = ((lastScore - previousScore) / previousScore * 100).toFixed(1);
            scoreImprovement = `${improvement > 0 ? '+' : ''}${improvement}%`;
          }
        }
        
        const last5Sessions = processedSessions.slice(0, 5).reverse();
        
        const coverageCategories = ['Leadership', 'Problem-solving', 'Teamwork', 'Situational'];
        const coverageScores = {};
        coverageCategories.forEach(cat => {
          coverageScores[cat] = categoryAverages[cat] || 0;
        });

        // Aggregate all filler and action words across all sessions
        const allFillerWords = {};
        const allActionWords = {};
        
        sessions.forEach(([sessionId, sessionData]) => {
          const responses = sessionData.responses || [];
          responses.forEach((response, index) => {
            if (!response || index === 0) return;
            
            response.analysis?.fillerWordList?.forEach(word => {
              allFillerWords[word] = (allFillerWords[word] || 0) + 1;
            });
            
            response.analysis?.actionWordList?.forEach(word => {
              allActionWords[word] = (allActionWords[word] || 0) + 1;
            });
          });
        });
        
        const topOverallFillerWords = Object.entries(allFillerWords)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([word, count]) => ({ word, count }));
        
        const topOverallActionWords = Object.entries(allActionWords)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([word, count]) => ({ word, count }));

        setBehavioralData({
          totalSessions: processedSessions.length,
          sessionsThisWeek: weeklyCount,
          sessionsThisMonth: monthlyCount,
          totalQuestions,
          averageQuestionsPerSession: processedSessions.length > 0 ? (totalQuestions / processedSessions.length).toFixed(1) : 0,
          averageScore: questionsWithScores > 0 ? (totalScore / questionsWithScores).toFixed(1) : 0,
          scoreImprovement,
          categoryScores: categoryAverages,
          categoryBreakdown: questionTypeCount,
          topCategory: topCategory ? { name: topCategory, score: topScore } : {name: "unknown",score: 0},
          avgFillerWords: questionsWithMetrics > 0 ? (totalFillerWords / questionsWithMetrics).toFixed(1) : 0,
          avgActionWords: questionsWithMetrics > 0 ? (totalActionWords / questionsWithMetrics).toFixed(1) : 0,
          avgSpeakingTime: totalQuestions > 0 ? (totalSpeakingTime / totalQuestions).toFixed(0) : 0,
          coverageScores,
          last5SessionsScores: last5Sessions,
          sessionHistory: processedSessions.slice(0, 10),
          topOverallFillerWords,
          topOverallActionWords
        });
      } catch (error) {
        console.error('Error fetching behavioral data:', error);
        setBehavioralData({
          totalSessions: 0,
          totalQuestions: 0,
          averageQuestionsPerSession: 0,
          averageScore: 0,
          scoreImprovement: '0%',
          categoryScores: {},
          categoryBreakdown: {},
          topCategory: {},
          avgFillerWords: 0,
          avgActionWords: 0,
          avgSpeakingTime: 0,
          coverageScores: {},
          last5SessionsScores: [],
          sessionHistory: [],
          topOverallFillerWords: [],
          topOverallActionWords: []
        });
      } finally {
        setLoading(false);
      }
    };
    fetchBehavioralData();
  }, [userId]);

  const handleDelete = async (sessionId) => {
    const result = await Swal.fire({
      title: "Delete this session's results?",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;

    try {
      await remove(ref(database, `interviews/${userId}/${sessionId}`));

      setBehavioralData(prev => ({
        ...prev,
        sessionHistory: prev.sessionHistory.filter(s => s.sessionId !== sessionId)
      }));
      
      Swal.fire("Deleted!", "The session results were removed.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Could not delete results.", "error");
    }
  };

  const toggleSession = (sessionId) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  const COLORS = ['#2850d9', '#60a5fa', '#34d399', '#fbbf24', '#f87171'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="Statistics-custom-tooltip">
          <p className="Statistics-tooltip-label">{label}</p>
          <p className="Statistics-tooltip-value">{`Score: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading || !behavioralData) {
    return (
      <Box>
        <DefaultAppLayout>
          <div className="Statistics-statistics-page" />
        </DefaultAppLayout>
      </Box>
    );
  }

  const categoryScoreData = Object.entries(behavioralData.categoryScores).map(([name, score]) => ({
    category: name,
    score: parseFloat(score)
  }));

  const categoryBreakdownData = Object.entries(behavioralData.categoryBreakdown).map(([name, count]) => ({
    name,
    value: count
  }));

  const radarData = Object.entries(behavioralData.coverageScores).map(([category, score]) => ({
    category,
    score: parseFloat(score),
    fullMark: 100
  }));

  const trendData = behavioralData.last5SessionsScores?.map((session, index) => ({
    session: `Session ${index + 1}`,
    score: parseFloat(session.averageScore),
    date: session.date
  })) || [];

  const fillerTrendData = behavioralData.last5SessionsScores?.map((session, index) => ({
    session: `Session ${index + 1}`,
    fillerWords: session.fillerWords || 0,
    date: session.date
  })) || [];

  const actionTrendData = behavioralData.last5SessionsScores?.map((session, index) => ({
    session: `Session ${index + 1}`,
    actionWords: session.actionWords || 0,
    date: session.date
  })) || [];

  return (
    <Box>
      <DefaultAppLayout>
        <div className="Statistics-statistics-page">
          {/* Header */}
          <div className="Statistics-statistics-header">
            <h1>Your Statistics</h1>
            <p>
              {notification || "Track your progress and performance in behavioral interview simulations"}
            </p>
          </div>

          {/* Overview Cards */}
          <div className="Statistics-stats-overview-grid">
            <div className="Statistics-stat-overview-card Statistics-hover-blue">
              <div className="Statistics-stat-card-content">
                <div className="Statistics-stat-icon Statistics-blue-gradient">
                  <Activity size={28} />
                </div>
                <div className="Statistics-stat-info">
                  <h3>{behavioralData.totalSessions}</h3>
                  <p>Total Sessions</p>
                </div>
              </div>
            </div>

            <div className="Statistics-stat-overview-card Statistics-hover-green">
              <div className="Statistics-stat-card-content">
                <div className="Statistics-stat-icon Statistics-green-gradient">
                  <Target size={28} />
                </div>
                <div className="Statistics-stat-info">
                  <h3>{behavioralData.totalQuestions}</h3>
                  <p>Questions Answered</p>
                </div>
              </div>
            </div>

            <div className="Statistics-stat-overview-card Statistics-hover-yellow">
              <div className="Statistics-stat-card-content">
                <div className="Statistics-stat-icon Statistics-yellow-gradient">
                  <Award size={28} />
                </div>
                <div className="Statistics-stat-info">
                  <h3>{behavioralData.averageScore}%</h3>
                  <p>Average Score</p>
                </div>
              </div>
            </div>

            <div className="Statistics-stat-overview-card Statistics-hover-red">
              <div className="Statistics-stat-card-content">
                <div className={`Statistics-stat-icon ${
                  behavioralData.scoreImprovement.startsWith('-')
                    ? 'Statistics-red-gradient'
                    : 'Statistics-green-alt-gradient'
                }`}>
                  {behavioralData.scoreImprovement.startsWith('-') ? (
                    <TrendingDown size={28} />
                  ) : (
                    <TrendingUp size={28} />
                  )}
                </div>
                <div className="Statistics-stat-info">
                  <h3>{behavioralData.scoreImprovement}</h3>
                  <p>Score Change</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Metrics Row */}
          <div className="Statistics-metrics-row">
            <div className="Statistics-metric-card Statistics-purple">
              <div className="Statistics-metric-card-header">
                <MessageSquare className="text-purple-600" size={24} />
                <h4>Communication Quality</h4>
              </div>
              <div className="Statistics-metric-card-grid">
                <div className="Statistics-metric-item">
                  <p className="Statistics-value Statistics-purple">{behavioralData.avgFillerWords}</p>
                  <p className="Statistics-label">Avg Filler Words</p>
                </div>
                <div className="Statistics-metric-item">
                  <p className="Statistics-value Statistics-purple">{behavioralData.avgActionWords}</p>
                  <p className="Statistics-label">Avg Action Words</p>
                </div>
              </div>
            </div>

            <div className="Statistics-metric-card Statistics-blue">
              <div className="Statistics-metric-card-header">
                <Clock className="text-blue-600" size={24} />
                <h4>Speaking Time</h4>
              </div>
              <div className="Statistics-metric-single">
                <p className="Statistics-value Statistics-blue">{behavioralData.avgSpeakingTime}s</p>
                <p className="Statistics-label">Average per question</p>
              </div>
            </div>

            {behavioralData.topCategory && (
              <div className="Statistics-metric-card Statistics-amber">
                <div className="Statistics-metric-card-header">
                  <Zap className="text-amber-600" size={24} />
                  <h4>Top Category</h4>
                </div>
                <div className="Statistics-metric-single">
                  <p className="Statistics-value Statistics-amber Statistics-category-name">{behavioralData.topCategory.name}</p>
                  <p className="Statistics-label">{behavioralData.topCategory.score}% average score</p>
                </div>
              </div>
            )}
          </div>

          {/* Charts Section */}
          <div className="Statistics-charts-grid">
            {/* Score Trend Chart */}
            <div className="Statistics-chart-card">
              <div className="Statistics-chart-card-header">
                <BarChart3 className="text-blue-600" size={24} />
                <h3>Score Progression</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="session" stroke="#64748b" />
                  <YAxis domain={[0, 100]} stroke="#64748b" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#2850d9" 
                    strokeWidth={3}
                    dot={{ fill: '#2850d9', r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category Performance */}
            <div className="Statistics-chart-card">
              <div className="Statistics-chart-card-header">
                <BarChart3 className="text-green-600" size={24} />
                <h3>Category Performance</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryScoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="category" stroke="#64748b" angle={-15} textAnchor="end" height={80} />
                  <YAxis domain={[0, 100]} stroke="#64748b" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" fill="#2850d9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Radar Chart - Skills Coverage */}
            <div className="Statistics-chart-card">
              <div className="Statistics-chart-card-header">
                <Target className="text-purple-600" size={24} />
                <h3>Skills Coverage</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="category" stroke="#64748b" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#64748b" tick={{ dx: 7, dy: 10 }} />
                  <Radar name="Score" dataKey="score" stroke="#2850d9" fill="#2850d9" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Question Distribution Pie Chart */}
            <div className="Statistics-chart-card">
              <div className="Statistics-chart-card-header">
                <PieChart className="text-amber-600" size={24} />
                <h3>Question Distribution</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={categoryBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Communication Trends */}
          <div className="Statistics-charts-grid">
            {/* Filler Word Trend */}
            <div className="Statistics-chart-card">
              <div className="Statistics-chart-card-header">
                <MessageSquare className="text-purple-600" size={24} />
                <h3>Filler Word Trend</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={fillerTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="session" stroke="#64748b" padding={{ right: 10 }}/>
                  <YAxis stroke="#64748b" padding={{ top: 10 }}  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="fillerWords"
                    stroke="#a855f7"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Action Word Trend */}
            <div className="Statistics-chart-card">
              <div className="Statistics-chart-card-header">
                <Zap className="text-amber-600" size={24} />
                <h3>Action Word Trend</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={actionTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="session" stroke="#64748b" padding={{ right: 10 }} />
                  <YAxis stroke="#64748b"  padding={{ top: 20 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="actionWords"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Overall Top Words Section */}
          <div className="Statistics-charts-grid" style={{ marginTop: '2rem' }}>
            {/* Top Filler Words Overall */}
            <div className="Statistics-chart-card">
              <div className="Statistics-chart-card-header">
                <MessageSquare className="text-purple-600" size={24} />
                <h3>Top 5 Common Filler Words (All Sessions)</h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                {behavioralData.topOverallFillerWords?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {behavioralData.topOverallFillerWords.slice(0, 5).map((item, index) => (
                      <div 
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '0.75rem',
                          backgroundColor: index < 3 ? '#f3e8ff' : '#f9fafb',
                          borderRadius: '0.5rem',
                          border: index < 3 ? '2px solid #a855f7' : '1px solid #e5e7eb'
                        }}
                      >
                        <div style={{
                          minWidth: '2rem',
                          height: '2rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: index < 3 ? '#a855f7' : '#6b7280',
                          color: 'white',
                          borderRadius: '50%',
                          fontWeight: 'bold',
                          fontSize: '0.875rem'
                        }}>
                          {index + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: '600', fontSize: '1rem', color: '#1f2937', margin: 0 }}>
                            {item.word}
                          </p>
                        </div>
                        <div style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: index < 3 ? '#a855f7' : '#6b7280',
                          color: 'white',
                          borderRadius: '1rem',
                          fontWeight: '600',
                          fontSize: '0.875rem'
                        }}>
                          {item.count}x
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                    No filler words recorded yet
                  </p>
                )}
              </div>
            </div>

            {/* Top Action Words Overall */}
            <div className="Statistics-chart-card">
              <div className="Statistics-chart-card-header">
                <Zap className="text-amber-600" size={24} />
                <h3>Top 5 Used Action Words (All Sessions)</h3>
              </div>
              <div style={{ padding: '1.5rem' }}>
                {behavioralData.topOverallActionWords?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {behavioralData.topOverallActionWords.slice(0, 5).map((item, index) => (
                      <div 
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '0.75rem',
                          backgroundColor: index < 3 ? '#fef3c7' : '#f9fafb',
                          borderRadius: '0.5rem',
                          border: index < 3 ? '2px solid #f59e0b' : '1px solid #e5e7eb'
                        }}
                      >
                        <div style={{
                          minWidth: '2rem',
                          height: '2rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: index < 3 ? '#f59e0b' : '#6b7280',
                          color: 'white',
                          borderRadius: '50%',
                          fontWeight: 'bold',
                          fontSize: '0.875rem'
                        }}>
                          {index + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: '600', fontSize: '1rem', color: '#1f2937', margin: 0 }}>
                            {item.word}
                          </p>
                        </div>
                        <div style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: index < 3 ? '#f59e0b' : '#6b7280',
                          color: 'white',
                          borderRadius: '1rem',
                          fontWeight: '600',
                          fontSize: '0.875rem'
                        }}>
                          {item.count}x
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                    No action words recorded yet
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Session History */}
          <div className="Statistics-session-history">
            <h3>Recent Sessions</h3>
            <div className="Statistics-session-table-wrapper">
              <table className="Statistics-session-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Date</th>
                    <th>Questions</th>
                    <th>Avg Score</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {behavioralData.sessionHistory.map((session) => (
                    <Fragment key={session.sessionId}>
                      <tr>
                        <td>
                          <button
                            onClick={() => toggleSession(session.sessionId)}
                            className="Statistics-expand-btn"
                          >
                            {expandedSessions[session.sessionId] ? (
                              <ChevronUp size={18} />
                            ) : (
                              <ChevronDown size={18} />
                            )}
                          </button>
                        </td>
                        <td>{session.date}</td>
                        <td>
                          <span className="Statistics-question-badge">
                            {session.questionCount} questions
                          </span>
                        </td>
                        <td>
                          <span className={`Statistics-score-badge ${
                            parseFloat(session.averageScore) >= 70
                              ? 'Statistics-high'
                              : parseFloat(session.averageScore) >= 60
                              ? 'Statistics-medium'
                              : 'Statistics-low'
                          }`}>
                            {session.averageScore}%
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Link
                              to={`/behavioral/results?userId=${userId}&sessionId=${session.sessionId}&expectedQuestions=${session.questionCount}`}
                              className="Statistics-view-results-btn"
                            >
                              <ExternalLink size={16} stroke="white" />
                              <p style={{ color: "white" }}>View Results</p>
                            </Link>
                            <button
                              className="Statistics-delete-results-btn"
                              onClick={() => handleDelete(session.sessionId)}
                            >
                              <DeleteForeverIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedSessions[session.sessionId] && (
                        <tr className="Statistics-expanded-row">
                          <td colSpan="6">
                            <div className="Statistics-session-details">
                              <div className="Statistics-session-details-grid">
                                <div className="Statistics-session-detail-card">
                                  <p className="Statistics-detail-label">FILLER WORDS</p>
                                  <p className="Statistics-detail-value">{session.fillerWords}</p>
                                </div>
                                <div className="Statistics-session-detail-card">
                                  <p className="Statistics-detail-label">ACTION WORDS</p>
                                  <p className="Statistics-detail-value">{session.actionWords}</p>
                                </div>
                                <div className="Statistics-session-detail-card">
                                  <p className="Statistics-detail-label">SPEAKING TIME</p>
                                  <p className="Statistics-detail-value">{session.speakingTime}s</p>
                                </div>
                                <div className="Statistics-session-detail-card">
                                  <p className="Statistics-detail-label">DATE</p>
                                  <p className="Statistics-detail-value">
                                    {new Date(session.date).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="Statistics-session-details-grid" style={{ marginTop: '12px' }}>
                                <div className="Statistics-session-detail-card">
                                  <p className="Statistics-detail-label">Top Filler Words</p>
                                  <p className="Statistics-detail-value">{session.topFillerWords?.length > 0 ? session.topFillerWords.join(', ') : 'None'}</p>
                                </div>
                                <div className="Statistics-session-detail-card">
                                  <p className="Statistics-detail-label">Top Action Words</p>
                                  <p className="Statistics-detail-value">{session.topActionWords?.length > 0 ? session.topActionWords.join(', ') : 'None'}</p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DefaultAppLayout>
    </Box>
  );
};

export default Statistics;