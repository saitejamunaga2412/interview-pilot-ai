import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { knowledgeService } from '../../services/knowledgeService';
import { LoadingState, ErrorState } from '../../components/ui/States';
import { ChevronRight, Bookmark, BookmarkCheck } from 'lucide-react';
import API from '../../services/api';

import TopicTheory from '../../components/learning/TopicTheory';
import TopicPractice from '../../components/learning/TopicPractice';
import TopicNotes from '../../components/learning/TopicNotes';
import GlobalAITutor from '../../components/GlobalAITutor';

export default function TopicPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Theory');
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchTopic = async () => {
      setLoading(true);
      try {
        const res = await knowledgeService.getTopic(topicId);
        setData(res.data);
        
        // Check bookmark status
        const bkRes = await API.get(`/user-actions/bookmarks/check?entityId=${topicId}&entityType=KnowledgeTopic`);
        setIsBookmarked(bkRes.data?.bookmarked);

      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTopic();
  }, [topicId]);

  const toggleBookmark = async () => {
    try {
      const res = await API.post('/user-actions/bookmarks/toggle', {
        entityId: topicId,
        entityType: 'KnowledgeTopic',
        title: data?.topic?.title || 'Topic',
        url: `/learning/${topicId}`
      });
      setIsBookmarked(res.data?.bookmarked);
    } catch (err) {
      console.error("Failed to toggle bookmark", err);
    }
  };

  if (loading) return <LoadingState text="Loading Knowledge Engine..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  if (!data || !data.topic) return <ErrorState message="Topic not found" />;

  const { topic, progress } = data;
  const { lesson, cheatSheet, practiceQuestions } = topic;

  const tabs = [
    'Theory', 
    'Practice', 
    'Notes'
  ];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10 pb-32">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-text-muted font-medium">
            <span>{topic.category}</span>
            <ChevronRight size={14} />
            {topic.subCategory && (
              <>
                <span>{topic.subCategory}</span>
                <ChevronRight size={14} />
              </>
            )}
            <span className="text-primary-600 dark:text-primary-400">{topic.title}</span>
          </div>
          
          <button 
            onClick={toggleBookmark}
            className="p-2 rounded-full hover:bg-surface-hover transition-colors"
          >
            {isBookmarked ? (
              <BookmarkCheck className="text-primary-600" fill="currentColor" />
            ) : (
              <Bookmark className="text-text-muted" />
            )}
          </button>
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight">{topic.title}</h1>
        <p className="text-xl text-text-secondary max-w-3xl">{topic.description}</p>
        
        <div className="flex items-center gap-4 pt-4 border-t border-border">
          <span className="px-3 py-1 bg-surface-hover rounded-full text-sm font-medium border border-border">
            Difficulty: {topic.difficulty}
          </span>
          <span className="px-3 py-1 bg-surface-hover rounded-full text-sm font-medium border border-border">
            {topic.estimatedTimeMinutes} Mins
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border flex overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === tab 
                ? 'border-primary-600 text-primary-600' 
                : 'border-transparent text-text-muted hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === 'Theory' && <TopicTheory lesson={lesson} cheatSheet={cheatSheet} />}
        {activeTab === 'Practice' && <TopicPractice questions={practiceQuestions} />}
        {activeTab === 'Notes' && <TopicNotes topicId={topicId} />}
      </div>
      
      {/* Ensures AI Tutor is on the page */}
      <GlobalAITutor />
    </div>
  );
}
