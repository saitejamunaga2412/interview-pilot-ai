import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useToast } from '../../components/ui/Toast';

const AssessmentDashboard = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({
    assessmentType: 'Mixed',
    mode: 'Timed',
    difficulty: 'Medium',
    company: '',
    duration: 30,
    numQuestions: 15
  });
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await API.get('/assessments/history');
      const data = res.data?.data || res.data || [];
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      addToast('Failed to load assessment history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = async () => {
    try {
      const res = await API.post('/assessments/start', config);
      const attempt = res.data?.data || res.data;
      addToast('Assessment started!', 'success');
      navigate(`/assessment/test/${attempt._id}`);
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to start assessment', 'error');
    }
  };

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Mock Assessment Platform</h1>
      
      <div className="bg-bg-card p-6 rounded-lg border border-border-color">
        <h2 className="text-xl font-semibold mb-4">Start New Assessment</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm text-text-muted mb-2">Assessment Type</label>
            <select 
              value={config.assessmentType}
              onChange={(e) => setConfig({ ...config, assessmentType: e.target.value })}
              className="w-full p-2 bg-bg-base border border-border-color rounded focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option>Mixed</option>
              <option>Aptitude</option>
              <option>Coding</option>
              <option>Core CS</option>
              <option>Company-specific</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-2">Company (Optional)</label>
            <input 
              type="text"
              placeholder="e.g. Google"
              value={config.company}
              onChange={(e) => setConfig({ ...config, company: e.target.value })}
              className="w-full p-2 bg-bg-base border border-border-color rounded focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-2">Difficulty</label>
            <select 
              value={config.difficulty}
              onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}
              className="w-full p-2 bg-bg-base border border-border-color rounded focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-2">Duration (Minutes)</label>
            <input 
              type="number"
              value={config.duration}
              onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
              className="w-full p-2 bg-bg-base border border-border-color rounded focus:border-primary focus:ring-1 focus:ring-primary"
              min="10" max="180"
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-2">Number of Questions</label>
            <input 
              type="number"
              value={config.numQuestions}
              onChange={(e) => setConfig({ ...config, numQuestions: parseInt(e.target.value) })}
              className="w-full p-2 bg-bg-base border border-border-color rounded focus:border-primary focus:ring-1 focus:ring-primary"
              min="5" max="50"
            />
          </div>
        </div>
        <button 
          onClick={startAssessment}
          className="bg-primary text-white px-6 py-2 rounded font-medium hover:bg-primary/90 transition-colors"
        >
          Start Assessment
        </button>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Assessments</h2>
          <button 
            onClick={() => navigate('/assessment/history')}
            className="text-sm text-primary hover:underline"
          >
            View Full History
          </button>
        </div>
        
        {/* Placeholder for Analytics Charts */}
        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="bg-bg-card p-6 rounded-lg border border-border-color h-48 flex items-center justify-center text-text-muted">
             Score Trend Chart (Recharts)
           </div>
           <div className="bg-bg-card p-6 rounded-lg border border-border-color h-48 flex items-center justify-center text-text-muted">
             Topic Performance Radar (Recharts)
           </div>
        </div>

        {history.length === 0 ? (
          <p className="text-text-muted">No assessments taken yet.</p>
        ) : (
          <div className="space-y-4">
            {history.slice(0, 3).map(attempt => (
              <div key={attempt._id} className="bg-bg-card p-4 rounded-lg border border-border-color flex justify-between items-center hover:border-primary/50 transition-colors">
                <div>
                  <h3 className="font-semibold">{attempt.assessmentId?.title || 'Assessment'}</h3>
                  <p className="text-sm text-text-muted flex gap-4">
                    <span>{new Date(attempt.createdAt).toLocaleDateString()}</span>
                    <span className="capitalize">{attempt.status}</span>
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  {attempt.status === 'Evaluated' && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{attempt.overallScore}</div>
                      <div className="text-xs text-text-muted">Score</div>
                    </div>
                  )}
                  <button 
                    onClick={() => navigate(attempt.status === 'Evaluated' ? `/assessment/result/${attempt._id}` : `/assessment/test/${attempt._id}`)}
                    className="text-primary hover:underline font-medium"
                  >
                    {attempt.status === 'Evaluated' ? 'View Details' : 'Continue'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentDashboard;
