import API from "./api";

export const projectService = {
  getProjects: async (statusFilter = null) => {
    const params = statusFilter && statusFilter !== "All" ? { status: statusFilter } : {};
    const response = await API.get("/projects", { params });
    return response.data;
  },

  getProject: async (id) => {
    const response = await API.get(`/projects/${id}`);
    return response.data;
  },

  createProject: async (projectData) => {
    const response = await API.post("/projects", projectData);
    return response.data;
  },

  updateProject: async (id, projectData) => {
    const response = await API.put(`/projects/${id}`, projectData);
    return response.data;
  },

  deleteProject: async (id) => {
    const response = await API.delete(`/projects/${id}`);
    return response.data;
  }
};

export default projectService;
