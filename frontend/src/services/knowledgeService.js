import API from './api';

export const knowledgeService = {
  // Global search across topics
  search: async (query) => {
    const response = await API.get(`/knowledge/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Get full structured topic data
  getTopic: async (topicId) => {
    const response = await API.get(`/knowledge/topic/${topicId}`);
    return response.data;
  },

  // Update learning progress
  updateProgress: async (topicId, progressData) => {
    const response = await API.post(`/knowledge/topic/${topicId}/progress`, progressData);
    return response.data;
  },

  // Get AI memory context for the user
  getAIContext: async () => {
    const response = await API.get('/knowledge/ai/context');
    return response.data;
  }
};
