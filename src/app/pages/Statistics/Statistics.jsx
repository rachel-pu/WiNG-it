import { useState } from 'react';
import './Statistics.css';
import DefaultAppLayout from '../../DefaultAppLayout.jsx';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { Calendar, Clock, TrendingUp, Award, Target, Activity } from 'lucide-react';

const Statistics = () => {
  const [selectedTool, setSelectedTool] = useState('all');

  // Placeholder data for Behavioral Interview
  const behavioralData = {
    totalSessions: 24,
    averageScore: 78,
    totalTime: '12h 30m',
    improvement: '+15%',
    monthlyProgress: [
      { month: 'Jan', score: 65, sessions: 3 },
      { month: 'Feb', score: 70, sessions: 5 },
      { month: 'Mar', score: 75, sessions: 6 },
      { month: 'Apr', score: 78, sessions: 10 }
    ],
    topicScores: [
      { topic: 'Leadership', score: 85 },
      { topic: 'Teamwork', score: 80 },
      { topic: 'Problem Solving', score: 75 },
      { topic: 'Communication', score: 72 },
      { topic: 'Adaptability', score: 70 }
    ],
    sessionHistory: [
      { id: 1, date: '2025-04-15', score: 82, duration: '35min', topic: 'Leadership' },
      { id: 2, date: '2025-04-12', score: 78, duration: '30min', topic: 'Teamwork' },
      { id: 3, date: '2025-04-08', score: 75, duration: '32min', topic: 'Problem Solving' },
      { id: 4, date: '2025-04-05', score: 80, duration: '28min', topic: 'Communication' },
      { id: 5, date: '2025-04-01', score: 76, duration: '33min', topic: 'Adaptability' }
    ]
  };

  // Placeholder data for Technical Interview
  const technicalData = {
    totalSessions: 18,
    averageScore: 72,
    totalTime: '9h 15m',
    improvement: '+20%',
    monthlyProgress: [
      { month: 'Jan', score: 60, sessions: 2 },
      { month: 'Feb', score: 65, sessions: 4 },
      { month: 'Mar', score: 70, sessions: 5 },
      { month: 'Apr', score: 72, sessions: 7 }
    ],
    difficultyBreakdown: [
      { name: 'Easy', value: 6 },
      { name: 'Medium', value: 8 },
      { name: 'Hard', value: 4 }
    ],
    sessionHistory: [
      { id: 1, date: '2025-04-14', score: 85, duration: '45min', difficulty: 'Medium' },
      { id: 2, date: '2025-04-10', score: 70, duration: '60min', difficulty: 'Hard' },
      { id: 3, date: '2025-04-07', score: 75, duration: '40min', difficulty: 'Medium' },
      { id: 4, date: '2025-04-03', score: 65, duration: '50min', difficulty: 'Hard' }
    ]
  };

  // Placeholder data for Resume Builder
  const resumeData = {
    totalVersions: 5,
    lastUpdated: '2025-04-10',
    viewCount: 142,
    downloadCount: 23,
    versionHistory: [
      { id: 1, version: 'v5.0', date: '2025-04-10', changes: 'Updated work experience' },
      { id: 2, version: 'v4.0', date: '2025-03-22', changes: 'Added new skills section' },
      { id: 3, version: 'v3.0', date: '2025-03-15', changes: 'Reformatted layout' },
      { id: 4, version: 'v2.0', date: '2025-02-28', changes: 'Updated education section' }
    ],
    monthlyActivity: [
      { month: 'Jan', views: 25, downloads: 3 },
      { month: 'Feb', views: 32, downloads: 6 },
      { month: 'Mar', views: 45, downloads: 8 },
      { month: 'Apr', views: 40, downloads: 6 }
    ]
  };

  const COLORS = ['#2850d9', '#60a5fa', '#a5b4fc', '#c7d2fe'];

  const renderOverviewCards = () => {
    const data = selectedTool === 'behavioral' ? behavioralData :
                 selectedTool === 'technical' ? technicalData : null;

    if (!data || selectedTool === 'resume') return null;

    return (
      <div className="stats-overview-cards">
        <div className="stat-card">
          <div className="stat-icon">
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <h3>{data.totalSessions}</h3>
            <p>Total Sessions</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Award size={24} />
          </div>
          <div className="stat-info">
            <h3>{data.averageScore}%</h3>
            <p>Average Score</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>{data.totalTime}</h3>
            <p>Total Time</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>{data.improvement}</h3>
            <p>Improvement</p>
          </div>
        </div>
      </div>
    );
  };

  const renderBehavioralStats = () => (
    <div className="tool-section">
      <div className="section-header">
        <h2>Behavioral Interview Statistics</h2>
        <p>Track your progress and performance in behavioral interview simulations</p>
      </div>

      {renderOverviewCards()}

      <div className="charts-grid">
        {/* Monthly Progress Chart */}
        <div className="chart-container">
          <h3>Monthly Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={behavioralData.monthlyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#2850d9" strokeWidth={2} name="Score" />
              <Line type="monotone" dataKey="sessions" stroke="#60a5fa" strokeWidth={2} name="Sessions" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Topic Scores Radar Chart */}
        <div className="chart-container">
          <h3>Performance by Topic</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={behavioralData.topicScores}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="topic" stroke="#64748b" />
              <PolarRadiusAxis stroke="#64748b" />
              <Radar name="Score" dataKey="score" stroke="#2850d9" fill="#2850d9" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Session History */}
      <div className="history-section">
        <h3>Recent Sessions</h3>
        <div className="history-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Topic</th>
                <th>Score</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {behavioralData.sessionHistory.map(session => (
                <tr key={session.id}>
                  <td>{session.date}</td>
                  <td>{session.topic}</td>
                  <td>
                    <span className={`score-badge ${session.score >= 80 ? 'high' : session.score >= 70 ? 'medium' : 'low'}`}>
                      {session.score}%
                    </span>
                  </td>
                  <td>{session.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTechnicalStats = () => (
    <div className="tool-section">
      <div className="section-header">
        <h2>Technical Interview Statistics</h2>
        <p>Monitor your technical interview performance and coding skills</p>
      </div>

      {renderOverviewCards()}

      <div className="charts-grid">
        {/* Monthly Progress Chart */}
        <div className="chart-container">
          <h3>Score Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={technicalData.monthlyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#2850d9" name="Average Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Difficulty Breakdown Pie Chart */}
        <div className="chart-container">
          <h3>Problem Difficulty Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={technicalData.difficultyBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {technicalData.difficultyBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Session History */}
      <div className="history-section">
        <h3>Recent Sessions</h3>
        <div className="history-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Difficulty</th>
                <th>Score</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {technicalData.sessionHistory.map(session => (
                <tr key={session.id}>
                  <td>{session.date}</td>
                  <td>
                    <span className={`difficulty-badge ${session.difficulty.toLowerCase()}`}>
                      {session.difficulty}
                    </span>
                  </td>
                  <td>
                    <span className={`score-badge ${session.score >= 80 ? 'high' : session.score >= 70 ? 'medium' : 'low'}`}>
                      {session.score}%
                    </span>
                  </td>
                  <td>{session.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderResumeStats = () => (
    <div className="tool-section">
      <div className="section-header">
        <h2>Resume Builder Statistics</h2>
        <p>Track your resume activity and engagement metrics</p>
      </div>

      <div className="stats-overview-cards">
        <div className="stat-card">
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-info">
            <h3>{resumeData.totalVersions}</h3>
            <p>Total Versions</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <h3>{resumeData.lastUpdated}</h3>
            <p>Last Updated</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <h3>{resumeData.viewCount}</h3>
            <p>Total Views</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>{resumeData.downloadCount}</h3>
            <p>Downloads</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        {/* Monthly Activity Chart */}
        <div className="chart-container full-width">
          <h3>Monthly Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resumeData.monthlyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" fill="#2850d9" name="Views" />
              <Bar dataKey="downloads" fill="#60a5fa" name="Downloads" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Version History */}
      <div className="history-section">
        <h3>Version History</h3>
        <div className="history-table">
          <table>
            <thead>
              <tr>
                <th>Version</th>
                <th>Date</th>
                <th>Changes</th>
              </tr>
            </thead>
            <tbody>
              {resumeData.versionHistory.map(version => (
                <tr key={version.id}>
                  <td><span className="version-badge">{version.version}</span></td>
                  <td>{version.date}</td>
                  <td>{version.changes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <DefaultAppLayout>
      <div className="statistics-page">
        <div className="statistics-header">
          <h1>Your Statistics</h1>
          <p>Track your progress and performance across all tools</p>
        </div>

        <div className="tool-selector">
          <button
            className={`tool-btn ${selectedTool === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedTool('all')}
          >
            All Tools
          </button>
          <button
            className={`tool-btn ${selectedTool === 'behavioral' ? 'active' : ''}`}
            onClick={() => setSelectedTool('behavioral')}
          >
            Behavioral Interview
          </button>
          <button
            className={`tool-btn ${selectedTool === 'technical' ? 'active' : ''}`}
            onClick={() => setSelectedTool('technical')}
          >
            Technical Interview
          </button>
          <button
            className={`tool-btn ${selectedTool === 'resume' ? 'active' : ''}`}
            onClick={() => setSelectedTool('resume')}
          >
            Resume Builder
          </button>
        </div>

        <div className="statistics-content">
          {(selectedTool === 'all' || selectedTool === 'behavioral') && renderBehavioralStats()}
          {(selectedTool === 'all' || selectedTool === 'technical') && renderTechnicalStats()}
          {(selectedTool === 'all' || selectedTool === 'resume') && renderResumeStats()}
        </div>
      </div>
    </DefaultAppLayout>
  );
};

export default Statistics;
