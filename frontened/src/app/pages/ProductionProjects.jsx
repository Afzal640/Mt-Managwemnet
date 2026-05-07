import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';
import { Card, Badge, Select } from '../components/ui';
import { Search, Eye } from 'lucide-react';

const statusColors = {
  'not-started': 'default',
  'in-progress': 'info',
  'review': 'warning',
  'completed': 'success'
};

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'not-started', label: 'Not Started' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'completed', label: 'Completed' }
];

const serviceOptions = [
  { value: 'all', label: 'All Services' },
  { value: 'Website Development', label: 'Website Development' },
  { value: 'Graphic Design', label: 'Graphic Design' },
  { value: 'Video Editing', label: 'Video Editing' }
];

export const ProductionProjects = () => {
  const navigate = useNavigate();
  const [projectsData, setProjectsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem("token");
    API.get("/projects", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setProjectsData(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error(err));
  }, []);

  const filteredProjects = Array.isArray(projectsData) ? projectsData.filter((project) => {
    const matchesSearch = 
      (project.clientName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (project.assignedTo?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    const matchesService = filterService === 'all' || project.service === filterService;
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;

    return matchesSearch && matchesService && matchesStatus;
  }) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl text-gray-900 mb-2">Projects</h1>
          <p className="text-sm text-gray-500">Manage and track all production projects</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <Select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            options={serviceOptions}
          />
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={statusOptions}
          />
        </div>
      </Card>

      {/* Projects Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                   Client / Project
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <tr key={project.id || project._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm text-gray-900 font-bold">{project.clientName}</p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-400 uppercase tracking-widest">PROJ-{(project.id || project._id)?.substring(0, 5)}</span>
                        {project.priority === 'high' && (
                          <Badge variant="danger" className="ml-2">High Priority</Badge>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{project.service}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{project.assignedTo?.name || "Unassigned"}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-900">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={statusColors[project.status]}>
                      {project.status.replace('-', ' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/production/projects/${project.id || project._id}`)}
                      className="text-gray-400 hover:text-indigo-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProjects.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500">No projects found matching your filters</p>
          </div>
        )}
      </Card>

      {/* Project Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4 border-none ring-1 ring-gray-100 bg-white">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Not Started</p>
          <p className="text-2xl font-bold text-gray-900">
            {(Array.isArray(projectsData) ? projectsData : []).filter(p => p.status === 'not-started').length}
          </p>
        </Card>
        <Card className="p-4 border-none ring-1 ring-gray-100 bg-white">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">In Progress</p>
          <p className="text-2xl font-bold text-gray-900">
            {(Array.isArray(projectsData) ? projectsData : []).filter(p => p.status === 'in-progress').length}
          </p>
        </Card>
        <Card className="p-4 border-none ring-1 ring-gray-100 bg-white">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">In Review</p>
          <p className="text-2xl font-bold text-gray-900">
            {(Array.isArray(projectsData) ? projectsData : []).filter(p => p.status === 'review').length}
          </p>
        </Card>
        <Card className="p-4 border-none ring-1 ring-gray-100 bg-white">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Completed</p>
          <p className="text-2xl font-bold text-gray-900">
            {(Array.isArray(projectsData) ? projectsData : []).filter(p => p.status === 'completed').length}
          </p>
        </Card>
      </div>
    </div>
  );
};
