import React, { useState } from 'react';
import { Code } from 'lucide-react';
import { Link } from 'react-router-dom';


export default function TopicPractice({ questions = [] }) {
  const [activeTab, setActiveTab] = useState('Easy');
  
  const filtered = questions.filter(q => q.difficulty === activeTab);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex space-x-1 border-b border-border mb-6">
        {['Easy', 'Medium', 'Hard'].map(diff => (
          <button
            key={diff}
            onClick={() => setActiveTab(diff)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === diff ? 'text-primary-600 border-b-2 border-primary-600' : 'text-text-muted hover:text-text-primary'}`}
          >
            {diff}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-text-muted bg-surface border border-border rounded-xl border-dashed">
            No {activeTab.toLowerCase()} practice questions available yet.
          </div>
        ) : (
          filtered.map(q => (
            <div key={q._id} className="p-5 bg-surface border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold group-hover:text-primary-600 transition-colors">
                    {q.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    {q.tags?.map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 bg-bg-base border border-border rounded-md text-text-secondary">{tag}</span>
                    ))}
                  </div>
                </div>
                <Link 
                  to={`/arena/${q._id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Code size={16} /> Solve
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
