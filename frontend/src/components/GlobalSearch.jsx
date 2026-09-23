import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2 } from 'lucide-react';
import { knowledgeService } from '../services/knowledgeService';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const searchTopics = async () => {
      setLoading(true);
      try {
        const response = await knowledgeService.search(query);
        setResults(response.data || []);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(searchTopics, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (topicId) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/learning/${topicId}`);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Search Input Trigger */}
      <div 
        className="hidden sm:flex items-center gap-2 bg-bg-base border border-border px-3 py-1.5 rounded-full w-64 md:w-96 cursor-text focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all"
        onClick={() => setIsOpen(true)}
      >
        <Search size={16} className="text-text-muted" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search resources, topics..." 
          className="bg-transparent border-none outline-none w-full text-sm text-text-primary placeholder:text-text-muted"
        />
        <div className="flex items-center justify-center bg-surface border border-border rounded px-1.5 py-0.5 text-[10px] text-text-muted font-mono">
          ⌘K
        </div>
      </div>

      {/* Dropdown Results */}
      <AnimatePresence>
        {isOpen && query && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto"
          >
            {loading ? (
              <div className="p-4 flex items-center justify-center text-text-muted">
                <Loader2 size={16} className="animate-spin mr-2" /> Searching...
              </div>
            ) : results.length > 0 ? (
              <ul className="py-2">
                {results.map((topic) => (
                  <li 
                    key={topic._id}
                    onClick={() => handleSelect(topic.topicId)}
                    className="px-4 py-3 hover:bg-surface-hover cursor-pointer border-b border-border/50 last:border-0 flex flex-col"
                  >
                    <span className="font-medium text-text-primary text-sm">{topic.title}</span>
                    <span className="text-xs text-text-muted mt-1">{topic.category} {topic.subCategory ? `› ${topic.subCategory}` : ''}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-sm text-text-muted text-center">
                No results found for "{query}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
