import React, { useState, useEffect } from "react";
import {
  FolderGit2, Plus, Search, Filter, ExternalLink, Code2,
  CheckCircle2, Circle, Clock, Trash2, Edit3, X,
  Calendar, Layers, CheckSquare, Sparkles, AlertCircle
} from "lucide-react";
import { Container } from "../../components/layout";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { EmptyState, LoadingState } from "../../components/ui/States";
import { Modal } from "../../components/ui/Modal";
import { useToast } from "../../components/ui/Toast";
import projectService from "../../services/projectService";

const STATUS_OPTIONS = ["All", "In Progress", "Completed", "Planning", "Archived"];

export default function ProjectsPage() {
  const { addToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [summary, setSummary] = useState({ total: 0, completed: 0, inProgress: 0 });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    techStack: [],
    status: "In Progress",
    repoUrl: "",
    liveUrl: "",
    milestones: [],
    tasks: []
  });
  const [techInput, setTechInput] = useState("");
  const [milestoneInput, setMilestoneInput] = useState("");
  const [taskInput, setTaskInput] = useState("");

  // Delete Confirm Modal
  const [projectToDelete, setProjectToDelete] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectService.getProjects(filterStatus);
      if (res && res.success) {
        setProjects(res.projects || []);
        if (res.summary) setSummary(res.summary);
      }
    } catch (err) {
      addToast({
        type: "error",
        title: "Failed to load projects",
        message: err.response?.data?.message || err.message || "An unexpected error occurred."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filterStatus]);

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setActiveProjectId(null);
    setFormData({
      title: "",
      description: "",
      techStack: [],
      status: "In Progress",
      repoUrl: "",
      liveUrl: "",
      milestones: [],
      tasks: []
    });
    setTechInput("");
    setMilestoneInput("");
    setTaskInput("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (proj) => {
    setIsEditing(true);
    setActiveProjectId(proj.id);
    setFormData({
      title: proj.title || "",
      description: proj.description || "",
      techStack: proj.techStack || [],
      status: proj.status || "In Progress",
      repoUrl: proj.repoUrl || "",
      liveUrl: proj.liveUrl || "",
      milestones: proj.milestones || [],
      tasks: proj.tasks || []
    });
    setTechInput("");
    setMilestoneInput("");
    setTaskInput("");
    setIsModalOpen(true);
  };

  const handleAddTech = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      e.preventDefault();
      const val = techInput.trim();
      if (val && !formData.techStack.includes(val)) {
        setFormData((prev) => ({ ...prev, techStack: [...prev.techStack, val] }));
        setTechInput("");
      }
    }
  };

  const handleRemoveTech = (item) => {
    setFormData((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((t) => t !== item)
    }));
  };

  const handleAddMilestone = () => {
    const val = milestoneInput.trim();
    if (val) {
      setFormData((prev) => ({
        ...prev,
        milestones: [...prev.milestones, { id: Date.now().toString(), title: val, completed: false }]
      }));
      setMilestoneInput("");
    }
  };

  const handleToggleMilestone = (mId) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) => (m.id === mId ? { ...m, completed: !m.completed } : m))
    }));
  };

  const handleRemoveMilestone = (mId) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((m) => m.id !== mId)
    }));
  };

  const handleAddTask = () => {
    const val = taskInput.trim();
    if (val) {
      setFormData((prev) => ({
        ...prev,
        tasks: [...prev.tasks, { id: Date.now().toString(), title: val, completed: false }]
      }));
      setTaskInput("");
    }
  };

  const handleToggleTask = (tId) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === tId ? { ...t, completed: !t.completed } : t))
    }));
  };

  const handleRemoveTask = (tId) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== tId)
    }));
  };

  // Quick inline toggle for project cards
  const handleInlineToggleItem = async (project, type, itemId) => {
    try {
      const updatedMilestones = type === "milestone"
        ? project.milestones.map((m) => (m.id === itemId ? { ...m, completed: !m.completed } : m))
        : project.milestones;

      const updatedTasks = type === "task"
        ? project.tasks.map((t) => (t.id === itemId ? { ...t, completed: !t.completed } : t))
        : project.tasks;

      const res = await projectService.updateProject(project.id, {
        milestones: updatedMilestones,
        tasks: updatedTasks
      });

      if (res && res.success) {
        setProjects((prev) => prev.map((p) => (p.id === project.id ? res.project : p)));
      }
    } catch (err) {
      addToast({
        type: "error",
        title: "Update Failed",
        message: err.message || "Failed to update item state."
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      addToast({ type: "warning", title: "Required Field", message: "Project title is required." });
      return;
    }

    try {
      setSubmitting(true);
      if (isEditing) {
        const res = await projectService.updateProject(activeProjectId, formData);
        if (res && res.success) {
          addToast({ type: "success", title: "Project Updated", message: "Your project has been updated successfully." });
          setIsModalOpen(false);
          fetchProjects();
        }
      } else {
        const res = await projectService.createProject(formData);
        if (res && res.success) {
          addToast({ type: "success", title: "Project Created", message: "Your new project has been saved." });
          setIsModalOpen(false);
          fetchProjects();
        }
      }
    } catch (err) {
      addToast({
        type: "error",
        title: isEditing ? "Update Failed" : "Creation Failed",
        message: err.response?.data?.message || err.message || "Could not save project."
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    try {
      await projectService.deleteProject(projectToDelete.id);
      addToast({ type: "success", title: "Project Deleted", message: "Project was removed successfully." });
      setProjectToDelete(null);
      fetchProjects();
    } catch (err) {
      addToast({
        type: "error",
        title: "Delete Failed",
        message: err.response?.data?.message || err.message || "Failed to delete project."
      });
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.techStack && p.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesSearch;
  });

  return (
    <Container className="py-8 space-y-8 max-w-7xl animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent/20 to-primary/20 border border-accent/30 flex items-center justify-center text-accent">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                Preparation Projects
              </h1>
              <p className="text-sm text-text-muted mt-0.5">
                Track full-stack milestones, portfolio implementations, and technical showcase artifacts.
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          className="bg-accent hover:bg-accent/90 text-white font-medium shadow-lg shadow-accent/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </Button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-surface/50 border border-border/60 backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Total Projects</p>
            <p className="text-2xl font-bold text-text-primary mt-1">{summary.total}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-surface border border-border/80 flex items-center justify-center text-text-secondary">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface/50 border border-border/60 backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">In Progress</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{summary.inProgress}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface/50 border border-border/60 backdrop-blur-md flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{summary.completed}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-surface/80 rounded-xl border border-border/60 overflow-x-auto no-scrollbar">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterStatus === status
                  ? "bg-accent text-white shadow-sm"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-hover"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by title or tech..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface/60 border border-border/60 rounded-xl pl-9 pr-4 py-1.5 text-xs text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingState text="Fetching your projects..." />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="border border-border/60 rounded-2xl bg-surface/30 p-8">
          <EmptyState
            icon={FolderGit2}
            title={projects.length === 0 ? "No Projects Added Yet" : "No Projects Match Your Filter"}
            description={
              projects.length === 0
                ? "Start building your portfolio. Add full-stack applications, distributed systems, or ML projects with milestones and tasks."
                : "Try changing your status filter or clearing your search term."
            }
            action={
              projects.length === 0 ? (
                <Button onClick={handleOpenCreateModal} className="mt-4 bg-accent text-white">
                  <Plus className="w-4 h-4 mr-2" /> Add Your First Project
                </Button>
              ) : null
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group bg-surface/60 hover:bg-surface/90 border border-border/70 hover:border-accent/40 rounded-2xl p-5 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-accent/5 backdrop-blur-sm"
            >
              <div>
                {/* Top header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <Badge
                    variant={
                      project.status === "Completed"
                        ? "success"
                        : project.status === "Planning"
                        ? "default"
                        : "accent"
                    }
                    className="text-[11px] font-medium uppercase tracking-wider"
                  >
                    {project.status}
                  </Badge>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEditModal(project)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
                      title="Edit project"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setProjectToDelete(project)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-semibold text-text-primary tracking-tight group-hover:text-accent transition-colors">
                  {project.title}
                </h3>
                {project.description && (
                  <p className="text-xs text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                )}

                {/* Tech Stack Pills */}
                {project.techStack && project.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {project.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-hover/80 text-text-secondary border border-border/50"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Progress Bar */}
                <div className="mt-5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted font-medium">Progress</span>
                    <span className="font-semibold text-text-primary">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-hover rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        project.progress === 100
                          ? "bg-emerald-400"
                          : "bg-gradient-to-r from-accent to-purple-500"
                      }`}
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Milestones / Tasks Checklist Preview */}
                {((project.milestones && project.milestones.length > 0) ||
                  (project.tasks && project.tasks.length > 0)) && (
                  <div className="mt-4 pt-3 border-t border-border/40 space-y-2">
                    <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                      Tasks & Milestones
                    </p>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar pr-1">
                      {project.milestones?.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => handleInlineToggleItem(project, "milestone", m.id)}
                          className="flex items-center gap-2 text-xs cursor-pointer group/item hover:text-text-primary transition-colors"
                        >
                          {m.completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-text-muted/60 shrink-0 group-hover/item:text-text-muted" />
                          )}
                          <span className={`truncate text-xs ${m.completed ? "line-through text-text-muted" : "text-text-secondary"}`}>
                            {m.title}
                          </span>
                        </div>
                      ))}
                      {project.tasks?.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => handleInlineToggleItem(project, "task", t.id)}
                          className="flex items-center gap-2 text-xs cursor-pointer group/item hover:text-text-primary transition-colors"
                        >
                          {t.completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-text-muted/60 shrink-0 group-hover/item:text-text-muted" />
                          )}
                          <span className={`truncate text-xs ${t.completed ? "line-through text-text-muted" : "text-text-secondary"}`}>
                            {t.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Card Footer: Links */}
              <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Code</span>
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Demo</span>
                    </a>
                  )}
                </div>

                <button
                  onClick={() => handleOpenEditModal(project)}
                  className="text-[11px] font-medium text-text-muted hover:text-accent transition-colors"
                >
                  Manage Details &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Project Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Edit Project Details" : "Create Preparation Project"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Project Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Task Scheduler with Kafka"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-surface border border-border/80 rounded-xl px-3.5 py-2 text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Architectural overview, key challenges solved, and placement highlight points..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-surface border border-border/80 rounded-xl px-3.5 py-2 text-sm text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:border-accent resize-none"
            />
          </div>

          {/* Status & Tech Stack */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-surface border border-border/80 rounded-xl px-3.5 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Tech Stack</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. React, Redis"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleAddTech}
                  className="w-full bg-surface border border-border/80 rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                />
                <Button type="button" size="sm" variant="secondary" onClick={handleAddTech}>
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Tech stack tags */}
          {formData.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {formData.techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-surface border border-border text-text-secondary"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(tech)}
                    className="text-text-muted hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">GitHub Repository URL</label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={formData.repoUrl}
                onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
                className="w-full bg-surface border border-border/80 rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Live Demo URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.liveUrl}
                onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                className="w-full bg-surface border border-border/80 rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Milestones Section */}
          <div className="pt-2 border-t border-border/60">
            <label className="block text-xs font-semibold text-text-primary mb-1 uppercase tracking-wider">
              Project Milestones
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g. Design DB schema & auth endpoints"
                value={milestoneInput}
                onChange={(e) => setMilestoneInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddMilestone();
                  }
                }}
                className="w-full bg-surface border border-border/80 rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
              />
              <Button type="button" size="sm" variant="secondary" onClick={handleAddMilestone}>
                Add Milestone
              </Button>
            </div>

            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {formData.milestones.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-surface/80 border border-border/50 text-xs"
                >
                  <div
                    onClick={() => handleToggleMilestone(m.id)}
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    {m.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-text-muted" />
                    )}
                    <span className={m.completed ? "line-through text-text-muted" : "text-text-primary"}>
                      {m.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(m.id)}
                    className="text-text-muted hover:text-rose-400 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks Checklist Section */}
          <div className="pt-2 border-t border-border/60">
            <label className="block text-xs font-semibold text-text-primary mb-1 uppercase tracking-wider">
              Task Checklist
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g. Add unit test suite with 90% coverage"
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTask();
                  }
                }}
                className="w-full bg-surface border border-border/80 rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
              />
              <Button type="button" size="sm" variant="secondary" onClick={handleAddTask}>
                Add Task
              </Button>
            </div>

            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {formData.tasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-surface/80 border border-border/50 text-xs"
                >
                  <div
                    onClick={() => handleToggleTask(t.id)}
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    {t.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-text-muted" />
                    )}
                    <span className={t.completed ? "line-through text-text-muted" : "text-text-primary"}>
                      {t.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(t.id)}
                    className="text-text-muted hover:text-rose-400 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-accent text-white">
              {submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Project"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <Modal
          isOpen={!!projectToDelete}
          onClose={() => setProjectToDelete(null)}
          title="Delete Project"
        >
          <div className="space-y-4">
            <p className="text-sm text-text-secondary leading-relaxed">
              Are you sure you want to delete <strong className="text-text-primary">{projectToDelete.title}</strong>? This action will permanently remove the project, milestones, and task tracking.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setProjectToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                className="bg-rose-500 hover:bg-rose-600 text-white"
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Container>
  );
}
