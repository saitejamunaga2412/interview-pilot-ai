import API from './api';

export const codingService = {
  getPatterns: async () => {
    const res = await API.get('/coding/patterns');
    return res.data;
  },

  getPatternDetails: async (patternId) => {
    const res = await API.get(`/coding/patterns/${patternId}`);
    return res.data;
  },

  getProblems: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/coding/problems?${query}` : '/coding/problems';
    const res = await API.get(url);
    return res.data;
  },

  getProblemDetails: async (problemId) => {
    const res = await API.get(`/coding/problems/${problemId}`);
    return res.data;
  },

  executeCode: async (problemId, code, language) => {
    const res = await API.post('/coding/execute', { problemId, code, language });
    return res.data;
  }
};
