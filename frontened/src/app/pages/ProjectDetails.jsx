import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/api';
import { Card, Button, Badge, LoadingSpinner } from '../components/ui';
import { ArrowLeft, Upload, FileText, CheckCircle2, MessageSquare, Clock } from 'lucide-react';






const uploadFile = async () => {
  try {
    const token = localStorage.getItem("token");

    await API.post(
      `/projects/${id}/files`,
      { fileUrl: "https://dummyfile.com/file.pdf" },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    alert("File uploaded ✅");
  } catch (err) {
    console.error(err);
    alert("Upload failed ❌");
  }
};



const statusColors = {
  'not-started': 'default',
  'in-progress': 'info',
  'review': 'warning',
  'completed': 'success'
};

const projectTasks = [
  { id: 1, name: 'Initial Design Mockups', progress: 100, status: 'completed' },
  { id: 2, name: 'Client Feedback Round 1', progress: 100, status: 'completed' },
  { id: 3, name: 'Design Revisions', progress: 75, status: 'in-progress' },
  { id: 4, name: 'Final Deliverables', progress: 30, status: 'in-progress' },
  { id: 5, name: 'Client Approval', progress: 0, status: 'pending' }
];

const projectFiles = [
  { id: 1, name: 'Brand_Guidelines.pdf', size: '3.2 MB', uploadedBy: 'Alex Designer', date: '2026-04-07' },
  { id: 2, name: 'Logo_Variations.ai', size: '5.8 MB', uploadedBy: 'Alex Designer', date: '2026-04-06' },
  { id: 3, name: 'Marketing_Assets.zip', size: '12.4 MB', uploadedBy: 'Alex Designer', date: '2026-04-05' },
  { id: 4, name: 'Client_Brief.docx', size: '892 KB', uploadedBy: 'Sarah Sales', date: '2026-04-02' }
];

const projectRevisions = [
  {
    id: 1,
    round: 'Revision 2',
    date: '2026-04-07',
    feedback: 'Please adjust the color scheme to match brand guidelines. Logo needs to be more minimalist.',
    status: 'in-progress',
    submittedBy: 'Client'
  },
  {
    id: 2,
    round: 'Revision 1',
    date: '2026-04-05',
    feedback: 'Initial mockups look great! Minor adjustments needed on typography.',
    status: 'completed',
    submittedBy: 'Client'
  }
];

export const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [localStatus, setLocalStatus] = useState('');
  const [localProgress, setLocalProgress] = useState(0);
  const [updating, setUpdating] = useState(false);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get(`/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProject(res.data);
      setLocalStatus(res.data.status);
      setLocalProgress(res.data.progress);
    } catch (err) {
      console.error("Failed to fetch project details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    const fetchAllProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get(`/projects`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAllProjects(res.data);
      } catch (err) {
        console.error("Failed to fetch all projects", err);
      }
    };
    fetchAllProjects();
  }, [id]);

  const handleSaveUpdate = async () => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("token");
      await API.patch(
        `/projects/${id}/status`,
        { status: localStatus, progress: localProgress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProject(); // Refresh data
      alert("Project updated successfully! ✅");
    } catch (err) {
      console.error("Failed to update project", err);
      alert("Error updating project ❌");
    } finally {
      setUpdating(false);
    }
  };

  const uploadFile = async () => {
    const fileUrl = prompt("Enter file URL:");
    if (!fileUrl) return;

    try {
      const token = localStorage.getItem("token");
      await API.post(
        `/projects/${id}/files`,
        { url: fileUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProject(); // Refresh data
      alert("File uploaded successfully! ✅");
    } catch (err) {
      console.error("Failed to upload file", err);
      alert("Error uploading file ❌");
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Project not found</p>
        <Button onClick={() => navigate('/production/projects')} className="mt-4">
          Back to Projects
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'tasks', label: 'Tasks', icon: CheckCircle2 },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'revisions', label: 'Revisions', icon: MessageSquare }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/production/projects')}
            className="mr-4 text-gray-400 hover:text-gray-600 transition-colors bg-white p-2 rounded-full shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{project.clientName}</h1>
            <p className="text-sm font-medium text-gray-400">{project.service} Project</p>
          </div>
        </div>
        <Badge variant={statusColors[project.status]} className="w-fit">
          {project.status.replace('-', ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview */}
          <Card className="p-6 border-none ring-1 ring-gray-100 bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Project Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Service Type</p>
                <p className="text-sm font-bold text-gray-900">{project.service}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Assigned To</p>
                <p className="text-sm font-bold text-gray-900">{project.assignedTo?.name || "Unassigned"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Start Date</p>
                <p className="text-sm font-bold text-gray-900">{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : "Not set"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Deadline</p>
                <p className="text-sm font-bold text-red-600">{project.deadline ? new Date(project.deadline).toLocaleDateString() : "No deadline"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Priority</p>
                <Badge variant={project.priority === 'high' ? 'danger' : project.priority === 'medium' ? 'warning' : 'default'}>
                  {project.priority || "Medium"}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Overall Progress</p>
                <div className="flex items-center">
                  <div className="w-full bg-gray-100 rounded-full h-2 mr-3">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{project.progress}%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Card className="overflow-hidden border-none ring-1 ring-gray-100 bg-white shadow-sm">
            {/* Tab Headers */}
            <div className="border-b border-gray-100 bg-gray-50/50 overflow-x-auto custom-scrollbar">
              <div className="flex min-w-max">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center px-6 py-4 text-sm font-bold transition-all
                      ${activeTab === tab.id
                        ? 'border-b-2 border-indigo-600 text-indigo-600 bg-white shadow-inner'
                        : 'text-gray-400 hover:text-gray-600'
                      }
                    `}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Tasks Tab */}
              {activeTab === 'tasks' && (
                <div className="space-y-4">
                  {projectTasks.map((task) => (
                    <div key={task.id} className="p-4 bg-gray-50 rounded-2xl group hover:bg-white hover:ring-1 hover:ring-gray-100 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <CheckCircle2 
                            className={`w-5 h-5 mr-3 ${
                              task.status === 'completed' ? 'text-emerald-500' : 'text-gray-300'
                            }`} 
                          />
                          <span className="text-sm font-bold text-gray-900">{task.name}</span>
                        </div>
                        <Badge variant={
                          task.status === 'completed' ? 'success' :
                          task.status === 'in-progress' ? 'info' :
                          'default'
                        }>
                          {task.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="ml-8">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mr-3 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                task.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-600'
                               }`}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-gray-500">{task.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Files Tab */}
              {activeTab === 'files' && (
                <div className="space-y-3">
                  <div className="mb-4">
                    <Button onClick={uploadFile} size="sm" className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Delivering
                    </Button>
                  </div>
                  {project.files?.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-white hover:ring-1 hover:ring-gray-100 transition-all"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mr-4 text-indigo-600 shadow-sm">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{file.url}</p>
                          <p className="text-[10px] uppercase font-bold text-gray-400 mt-0.5">
                             Uploaded by {file.uploadedBy} • {new Date(file.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost" className="text-indigo-600 font-bold hover:bg-indigo-50 p-2 rounded-lg">
                          View
                        </Button>
                      </a>
                    </div>
                  ))}
                  {(!project.files || project.files.length === 0) && (
                    <p className="text-center py-10 text-gray-400">No source files uploaded yet.</p>
                  )}
                </div>
              )}

              {/* Revisions Tab */}
              {activeTab === 'revisions' && (
                <div className="space-y-5">
                  {projectRevisions.map((revision) => (
                    <div key={revision.id} className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 mb-1">{revision.round}</h4>
                          <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{revision.date}</span>
                            <span className="mx-2">•</span>
                            <span>{revision.submittedBy}</span>
                          </div>
                        </div>
                        <Badge variant={revision.status === 'completed' ? 'success' : 'warning'}>
                          {revision.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-gray-600 bg-gray-50 p-4 rounded-xl leading-relaxed italic">
                        "{revision.feedback}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="p-6 border-none ring-1 ring-gray-100 bg-white shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Execution Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Asset Files</span>
                <span className="text-sm font-bold text-gray-900">{project.files?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Total Revisions</span>
                <span className="text-sm font-bold text-gray-900">{project.revisions || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Task Completion</span>
                <span className="text-sm font-bold text-gray-900">
                  {projectTasks.filter(t => t.status === 'completed').length} / {projectTasks.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Time Left</span>
                <span className="text-sm font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                    {project.deadline ? Math.max(0, Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24))) : 0} Days
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 border-none ring-1 ring-gray-100 bg-white shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Standard Operations</h3>
            <div className="space-y-3">
              <Button onClick={uploadFile} className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-sm" variant="default">
                <Upload className="w-4 h-4 mr-2" />
                Upload Milestone
              </Button>
              <Button className="w-full bg-white text-gray-600 border border-gray-200 font-bold py-2.5 rounded-xl text-sm" variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Client
              </Button>
            </div>
          </Card>

          <Card className="p-6 border-none ring-1 ring-gray-100 bg-white shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Phase Control</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Status</label>
                <select 
                  value={localStatus}
                  onChange={(e) => setLocalStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-100 bg-gray-50 rounded-xl text-sm font-bold text-gray-700 outline-none ring-2 ring-transparent focus:ring-indigo-500 transition-all"
                >
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Update Progress (%)</label>
                <input 
                  type="number"
                  min="0"
                  max="100"
                  value={localProgress}
                  onChange={(e) => setLocalProgress(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold"
                />
              </div>

              <Button 
                onClick={handleSaveUpdate} 
                disabled={updating}
                className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-sm mt-2"
              >
                {updating ? 'Saving...' : 'Save Updates'}
              </Button>
            </div>
          </Card>
          {/* Quick Switch / Recent Projects */}
          <Card className="p-6 border-none ring-1 ring-gray-100 bg-white shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Switch</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {allProjects.map((p) => (
                <button
                  key={p.id || p._id}
                  onClick={() => navigate(`/production/projects/${p.id || p._id}`)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all flex items-center justify-between group
                    ${(p.id || p._id) === id 
                      ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 shadow-sm' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                    }
                  `}
                >
                  <span className="truncate">{p.clientName}</span>
                  {(p.id || p._id) === id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.6)]" />}
                </button>
              ))}
              {allProjects.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-4">No other projects found.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
