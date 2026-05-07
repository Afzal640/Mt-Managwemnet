import { useState, useEffect } from 'react';
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input, Select, Badge, LoadingSpinner } from '../components/ui';
import { Modal } from '../components/Modal';
import { Search, Plus, Eye, Edit2, Trash2 } from 'lucide-react';

const statusColors = {
  new: 'default',
  discussing: 'info',
  proposal: 'warning',
  negotiation: 'purple',
  'closed-won': 'success',
  'closed-lost': 'danger'
};

const serviceOptions = [
  { value: 'all', label: 'All Services' },
  { value: 'Website Development', label: 'Website Development' },
  { value: 'Graphic Design', label: 'Graphic Design' },
  { value: 'Video Editing', label: 'Video Editing' }
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'new', label: 'New' },
  { value: 'discussing', label: 'Discussing' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed-won', label: 'Closed Won' },
  { value: 'closed-lost', label: 'Closed Lost' }
];

export const Leads = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 🔥 State
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterService, setFilterService] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);


  const [assignModal, setAssignModal] = useState(false);
const [selectedLead, setSelectedLead] = useState(null);
const [assignData, setAssignData] = useState({
  assignedTo: "",
  service: "",
  deadline: ""
});


  const [productionUsers, setProductionUsers] = useState([]);
  const [formData, setFormData] = useState({
    clientName: '',
    contactPerson: '',
    email: '',
    phone: '',
    service: 'Website Development',
    budget: '',
    deadline: '',
    status: 'new',
    source: 'Website',
    notes: ''
  });

  // 🔥 Fetch Leads
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get(`/leads`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLeads(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  useEffect(() => {
    const fetchProductionUsers = async () => {
      if (user?.role !== 'admin') return;
      const token = localStorage.getItem("token");
      try {
        const res = await API.get(`/auth/production-users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProductionUsers(res.data);
      } catch (err) {
        console.error("Error fetching production users:", err);
      }
    };
    fetchProductionUsers();
  }, [user]);

  // Filter Logic
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesService =
      filterService === 'all' || lead.service === filterService;

    const matchesStatus =
      filterStatus === 'all' || lead.status === filterStatus;

    return matchesSearch && matchesService && matchesStatus;
  });

  if (loading) return <LoadingSpinner size="lg" />;

  const handleAddLead = () => {
    setEditingLead(null);
    setFormData({
      clientName: '', contactPerson: '', email: '', phone: '',
      service: 'Website Development', budget: '', deadline: '',
      status: 'new', source: 'Website', notes: ''
    });
    setShowAddModal(true);
  };

  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setFormData({
      clientName: lead.clientName || lead.client_name || '',
      contactPerson: lead.contactPerson || lead.contact_person || '',
      email: lead.email || '',
      phone: lead.phone || '',
      service: lead.service || 'Website Development',
      budget: lead.budget || '',
      deadline: lead.deadline || '',
      status: lead.status || 'new',
      source: lead.source || 'Website',
      notes: lead.notes || ''
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      let res;

      if (editingLead) {
        res = await API.put(
          `/leads/${editingLead.id || editingLead._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLeads(leads.map(l => (l.id || l._id) === (editingLead.id || editingLead._id) ? res.data : l));
      } else {
        res = await API.post(
          `/leads`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLeads([res.data, ...leads]);
      }

      setShowAddModal(false);
      setFormData({
        clientName: '', contactPerson: '', email: '', phone: '',
        service: 'Website Development', budget: '', deadline: '',
        status: 'new', source: 'Website', notes: ''
      });
    } catch (error) {
      console.error("Error saving lead:", error);
      alert("Failed to save lead. Please check your data.");
    }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      const token = localStorage.getItem("token");
      await API.delete(`/leads/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(leads.filter(l => (l.id || l._id) !== id));
    } catch (error) {
      console.error("Error deleting lead:", error);
      alert("Failed to delete lead.");
    }
  };



const handleAssignToProduction = (lead) => {
  setSelectedLead(lead);
  setAssignData({
    assignedTo: "",
    service: lead.service,
    deadline: lead.deadline || ""
  });
  setAssignModal(true);
};

const convertLeadToProject = async () => {
  try {
    const token = localStorage.getItem("token");

    await API.post(
      `/projects/from-lead`,
      {
        leadId: selectedLead.id || selectedLead._id,
        assignedTo: assignData.assignedTo,
        service: assignData.service,
        deadline: assignData.deadline,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    alert("✅ Project created & assigned!");

    setAssignModal(false);

  } catch (err) {
    console.error(err);
    alert("❌ Failed to assign project");
  }
};











  return (

    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track your primary sales opportunities.</p>
        </div>
        <Button onClick={handleAddLead} className="shadow-md w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* FILTERS */}
      <Card className="p-6 border-none ring-1 ring-gray-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Quick search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
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

      {/* TABLE */}
      <Card className="overflow-hidden border-none ring-1 ring-gray-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Client / Lead</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Service</th>
                {user?.role === 'admin' && (
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Added By</th>
                )}
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredLeads.map((lead) => (
                <tr key={lead.id || lead._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{lead.clientName}</div>
                    <div className="text-xs text-gray-500">{lead.source}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-700">{lead.contactPerson}</div>
                    <div className="text-xs text-gray-400">{lead.email}</div>
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-600">{lead.service}</td>
                  {user?.role === 'admin' && (
                    <td className="p-4">
                      {lead.createdBy ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold uppercase flex-shrink-0"
                            title={lead.createdBy.email}
                          >
                            {(lead.createdBy.name || 'U')[0]}
                          </div>
                          <span className="text-sm font-medium text-gray-700">{lead.createdBy.name || '—'}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  )}
                  <td className="p-4 text-center">
                    <Badge variant={statusColors[lead.status] || 'default'}>
                      {lead.status.replace('-', ' ')}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => navigate(`/leads/${lead.id || lead._id}`)} className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-indigo-600 transition-colors shadow-sm border border-transparent hover:border-gray-100">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleEditLead(lead)} className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-indigo-600 transition-colors shadow-sm border border-transparent hover:border-gray-100">
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteLead(lead.id || lead._id)}
                        className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-rose-600 transition-colors shadow-sm border border-transparent hover:border-gray-100"
                      >
                        <Trash2 size={16} />
                      </button>






                      {user?.role === "admin" && (
                        <button
                          onClick={() => handleAssignToProduction(lead)}
                          className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-green-600 transition-colors shadow-sm border border-transparent hover:border-gray-100"
                          title="Assign to Production"
                        >
                          🚀
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredLeads.length === 0 && (
          <div className="p-12 text-center text-gray-500">No matching leads found.</div>
        )}
      </Card>

      {/* ASSIGN TO PRODUCTION MODAL */}
      <Modal
        isOpen={assignModal}
        onClose={() => setAssignModal(false)}
        title="Assign to Production"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Convert lead <b>{selectedLead?.clientName}</b> into a project
          </p>

          <Select
            label="Assign To"
            value={assignData.assignedTo}
            onChange={(e) =>
              setAssignData({ ...assignData, assignedTo: e.target.value })
            }
            options={[
              { value: "", label: "Select Team Member" },
              ...productionUsers.map(u => ({
                value: u.id || u._id,
                label: u.name
              }))
            ]}
          />

          <Input
            label="Deadline"
            type="date"
            value={assignData.deadline}
            onChange={(e) =>
              setAssignData({ ...assignData, deadline: e.target.value })
            }
          />

          <div className="flex justify-end gap-3">
            <Button onClick={() => setAssignModal(false)}>Cancel</Button>
            <Button
              className="bg-green-600 text-white"
              onClick={convertLeadToProject}
            >
              Assign Project
            </Button>
          </div>
        </div>
      </Modal>













      {/* MODAL */}
     <Modal
  isOpen={showAddModal}
  onClose={() => setShowAddModal(false)}
  title={editingLead ? "Edit Lead Details" : "Create New Lead"}
>
  <form onSubmit={handleSubmit} className="p-4 space-y-4">

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="Client Name"
        value={formData.clientName}
        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
      />

      <Input
        label="Contact Person"
        value={formData.contactPerson}
        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
      />

      <Input
        label="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />

      <Input
        label="Phone"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Select
        label="Service"
        value={formData.service}
        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
        options={serviceOptions}
      />

      <Input
        label="Budget"
        value={formData.budget}
        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
      />

      <Input
        label="Deadline"
        type="date"
        value={formData.deadline}
        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
      />

      <Select
        label="Status"
        value={formData.status}
        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        options={statusOptions.filter(o => o.value !== 'all')}
      />
    </div>

    <Input
      label="Source"
      value={formData.source}
      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
    />

    <div>
      <label className="text-sm font-medium text-gray-700">Notes</label>
      <textarea
        className="w-full mt-1 border rounded-lg p-2 min-h-[100px]"
        value={formData.notes}
        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
      />
    </div>

    <div className="flex justify-end gap-3">
      <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
        Cancel
      </Button>

      <Button type="submit">
        {editingLead ? "Save Changes" : "Add Lead"}
      </Button>
    </div>

  </form>
</Modal>

    </div>
  );
};
