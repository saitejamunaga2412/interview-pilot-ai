import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useToast } from '../../components/ui/Toast';

const AssessmentHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ company: '', type: '', difficulty: '', date: '' });
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await API.get('/assessments/history');
      const data = res.data?.data || res.data || [];
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      addToast('Failed to load assessment history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(attempt => {
    if (filters.company && attempt.assessmentId?.companyTag !== filters.company) return false;
    if (filters.type && attempt.assessmentId?.type !== filters.type) return false;
    if (filters.difficulty && attempt.assessmentId?.difficulty !== filters.difficulty) return false;
    if (filters.date) {
      const attemptDate = new Date(attempt.createdAt).toISOString().split('T')[0];
      if (attemptDate !== filters.date) return false;
    }
    return true;
  });

  if (loading) return <div className="p-8">Loading history...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Assessment History</h1>
        <button 
          onClick={() => navigate('/assessment')}
          className="px-4 py-2 border border-border-color rounded hover:bg-bg-card transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="bg-bg-card p-4 rounded-lg border border-border-color grid grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-text-muted mb-1">Company</label>
          <input type="text" placeholder="Filter by company..." value={filters.company} onChange={e => setFilters({...filters, company: e.target.value})} className="w-full bg-bg-base border border-border-color rounded px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-text-muted mb-1">Type</label>
          <select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})} className="w-full bg-bg-base border border-border-color rounded px-3 py-1.5 text-sm">
            <option value="">All</option>
            <option value="Mixed">Mixed</option>
            <option value="Coding">Coding</option>
            <option value="Aptitude">Aptitude</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-text-muted mb-1">Difficulty</label>
          <select value={filters.difficulty} onChange={e => setFilters({...filters, difficulty: e.target.value})} className="w-full bg-bg-base border border-border-color rounded px-3 py-1.5 text-sm">
            <option value="">All</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-text-muted mb-1">Date</label>
          <input type="date" value={filters.date} onChange={e => setFilters({...filters, date: e.target.value})} className="w-full bg-bg-base border border-border-color rounded px-3 py-1.5 text-sm text-text-primary" />
        </div>
      </div>

      <div className="space-y-4">
        {filteredHistory.map(attempt => (
          <div key={attempt._id} className="bg-bg-card p-4 rounded-lg border border-border-color flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">{attempt.assessmentId?.title || 'Unknown Assessment'}</h3>
              <div className="text-sm text-text-muted flex gap-4 mt-1">
                <span>{new Date(attempt.createdAt).toLocaleDateString()}</span>
                <span>Type: {attempt.assessmentId?.type}</span>
                <span>Status: <span className="text-white capitalize">{attempt.status}</span></span>
              </div>
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
        {filteredHistory.length === 0 && (
          <p className="text-text-muted text-center py-8">No assessments found matching these filters.</p>
        )}
      </div>
    </div>
  );
};

export default AssessmentHistory;
