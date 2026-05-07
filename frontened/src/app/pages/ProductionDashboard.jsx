import { Card, Badge, Button } from '../components/ui';
import { Briefcase, CheckCircle2, Clock, AlertCircle, TrendingUp, Eye } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API from "../api/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const ProductionDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get(`/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Projects fetch error:", err.response?.data || err);
      }
    };
    fetchProjects();
  }, []);

  const statusCounts = {
    'not-started': projects.filter(p => p.status === 'not-started').length,
    'in-progress': projects.filter(p => p.status === 'in-progress').length,
    'review': projects.filter(p => p.status === 'review').length,
    'completed': (Array.isArray(projects) ? projects : []).filter(p => p.status === 'completed').length
  };

  const statusColors = {
    'not-started': 'default',
    'in-progress': 'info',
    'review': 'warning',
    'completed': 'success'
  };

  const activeProjectsCount = statusCounts['not-started'] + statusCounts['in-progress'] + statusCounts['review'];

  const stats = [
    {
      name: 'Active Projects',
      value: activeProjectsCount,
      icon: Briefcase,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      name: 'In Review',
      value: statusCounts['review'],
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      name: 'Completed',
      value: statusCounts['completed'],
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Pending Start',
      value: statusCounts['not-started'],
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  const projectsByService = [
    { name: 'Website Dev', value: projects.filter(p => p.service === 'Website Development').length },
    { name: 'Graphic Design', value: projects.filter(p => p.service === 'Graphic Design').length },
    { name: 'Video Editing', value: (Array.isArray(projects) ? projects : []).filter(p => p.service === 'Video Editing').length }
  ];

  const completionData = projects.map(p => ({
    name: p.clientName?.split(' ')[0] || "Unknown",
    progress: p.progress || 0
  }));

  const avgProgress =
    projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
      : 0;

  const [showAllProjects, setShowAllProjects] = useState(false);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Production Dashboard</h1>
          <p className="text-sm text-gray-500">Overview of all ongoing projects and deliverables</p>
        </div>
        <Button onClick={() => navigate('/production/projects')} variant="outline" size="sm" className="w-full md:w-auto">
          View Projects Page
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-6 border-none ring-1 ring-gray-100 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Projects by Service */}
        <Card className="p-6 border-none ring-1 ring-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Projects by Service</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={projectsByService}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={90}
                dataKey="value"
              >
                {projectsByService.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#6366f1" />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Project Progress */}
        <Card className="p-6 border-none ring-1 ring-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Project Progress Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={completionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <Tooltip cursor={{ fill: '#f9fafb' }} />
              <Bar dataKey="progress" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card className="p-6 border-none ring-1 ring-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            {showAllProjects ? 'All Projects' : 'Recent Projects'}
          </h3>
          <button 
            onClick={() => setShowAllProjects(!showAllProjects)}
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            {showAllProjects ? 'Show Less' : 'View All'}
          </button>
        </div>

        <div className={`space-y-4 ${showAllProjects ? 'max-h-[600px] overflow-y-auto pr-2 custom-scrollbar' : ''}`}>
          {(showAllProjects ? projects : projects.slice(0, 5)).map((project) => (
            <div 
              key={project.id || project._id} 
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-white hover:ring-1 hover:ring-gray-100 transition-all group gap-4"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center mb-2 gap-2">
                  <h4 className="text-sm font-bold text-gray-900">{project.clientName}</h4>
                  <Badge variant={statusColors[project.status]}>
                    {project.status.replace('-', ' ')}
                  </Badge>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-gray-500 border border-gray-100">
                    {project.service}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-gray-500">
                  <span className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2" />
                    Assigned: {project.assignedTo?.name || "Unassigned"}
                  </span>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1.5" />
                    Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}
                  </span>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <span className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-2" />
                    By: {project.createdBy?.name || "System"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6">
                <div className="flex-1 sm:flex-none text-right" style={{ minWidth: '100px' }}>
                  <p className="text-xs font-bold text-gray-900 mb-1.5">{project.progress || 0}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate(`/production/projects/${project.id || project._id}`)}
                  className="p-2 bg-white rounded-lg text-gray-400 hover:text-indigo-600 shadow-sm border border-gray-100 sm:opacity-0 group-hover:opacity-100 transition-all"
                  title="View Project Details"
                >
                  <Eye size={16} />
                </button>
              </div>

            </div>
          ))}
          {projects.length === 0 && (
            <div className="py-10 text-center text-gray-400 italic">No projects found.</div>
          )}
        </div>
      </Card>
      {/* Team Performance */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <div className="flex items-start">

          <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mr-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1">
            <h3 className="text-lg text-gray-900 mb-2">Team Performance</h3>

            <p className="text-sm text-gray-700 mb-3">
              Great work! The team is maintaining an average progress of {avgProgress}% across all projects.
              {statusCounts['in-progress']} projects are actively in progress and {statusCounts['review']} are awaiting review.
            </p>

            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center text-green-600">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                <span>{statusCounts['completed']} completed this month</span>
              </div>

              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{projects.length} total projects</span>
            </div>

          </div>
        </div>
      </Card>

    </div>
  );
};