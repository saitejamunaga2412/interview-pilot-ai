import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import API from '../../services/api';

export default function TopicNotes({ topicId }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await API.get(`/user-actions/notes?entityId=${topicId}&entityType=KnowledgeTopic`);
        if (res.data?.data) {
          setContent(res.data.data.content);
          setLastSaved(new Date(res.data.data.lastEdited));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [topicId]);

  const saveNote = async () => {
    setSaving(true);
    try {
      await API.post('/user-actions/notes', {
        entityId: topicId,
        entityType: 'KnowledgeTopic',
        content
      });
      setLastSaved(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!loading && content !== undefined) {
      const timer = setTimeout(saveNote, 3000);
      return () => clearTimeout(timer);
    }
  }, [content, loading]);

  if (loading) return <div className="animate-pulse h-64 bg-surface rounded-xl"></div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-surface border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col h-[600px]">
      <div className="bg-bg-base border-b border-border p-4 flex justify-between items-center">
        <h2 className="font-semibold text-text-primary">Personal Notes</h2>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          {saving ? (
            <><Loader2 size={14} className="animate-spin" /> Saving...</>
          ) : lastSaved ? (
            <><Save size={14} /> Saved {lastSaved.toLocaleTimeString()}</>
          ) : (
            'Not saved yet'
          )}
        </div>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your notes here using Markdown..."
        className="flex-1 p-6 bg-transparent border-none outline-none resize-none text-text-primary leading-relaxed"
      />
    </div>
  );
}
