import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '../components/ui';
import { useEffect, useState } from 'react';
import API from "../api/api";
import { ArrowLeft, Mail, Phone, Calendar, DollarSign, User, FileText, Upload, MessageSquare, Clock } from 'lucide-react';
import { Modal } from '../components/Modal';




const statusColors = {
  new: 'default',
  discussing: 'info',
  proposal: 'warning',
  negotiation: 'purple',
  'closed-won': 'success',
  'closed-lost': 'danger'
};

const activityTimeline = [
  {
    id: 1,
    type: 'note',
    text: 'Initial contact made. Client interested in e-commerce features.',
    user: 'Sarah Sales',
    date: '2026-04-08 10:30 AM'
  },
  {
    id: 2,
    type: 'call',
    text: 'Phone call - 25 minutes. Discussed project scope and timeline.',
    user: 'Sarah Sales',
    date: '2026-04-07 2:15 PM'
  },
  {
    id: 3,
    type: 'email',
    text: 'Sent introductory email with company portfolio.',
    user: 'Sarah Sales',
    date: '2026-04-06 11:00 AM'
  },
  {
    id: 4,
    type: 'note',
    text: 'Lead created from website contact form.',
    user: 'System',
    date: '2026-04-01 9:45 AM'
  }
];

const files = [
  { id: 1, name: 'Project_Proposal.pdf', size: '2.4 MB', uploadedBy: 'Sarah Sales', date: '2026-04-07' },
  { id: 2, name: 'Requirements_Doc.docx', size: '1.1 MB', uploadedBy: 'Sarah Sales', date: '2026-04-05' }
];

export const LeadDetails = () => {
const [file, setFile] = useState(null);
const [files, setFiles] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteUpdating, setNoteUpdating] = useState(false);


  useEffect(() => {
  const fetchFiles = async () => {
    const res = await API.get(
      `/files/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    setFiles(res.data);
  };

  fetchFiles();
}, [id]);


const handleUpload = async () => {
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  const res = await API.post(
    `/files/upload/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
  );

  setFiles([...files, res.data]);
};


const handleDelete = async (fileId) => {
  await API.delete(
    `/files/${fileId}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
  );

  setFiles(prev => prev.filter(f => (f.id || f._id) !== fileId));
};








  useEffect(() => {
    const fetchLead = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await API.get(
          `/leads/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setLead(res.data);
        setSelectedStatus(res.data.status);
      } catch (err) {
        console.error("Error fetching lead:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  // ✅ Update Status Handler
  const updateStatus = async () => {
    if (!selectedStatus) return;
    try {
      setStatusUpdating(true);
      const token = localStorage.getItem("token");
      const res = await API.put(
        `/leads/${id}`,
        { status: selectedStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setLead(res.data); // ✅ update UI with fresh data from backend
      alert("Status updated successfully ✅");
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status ❌");
    } finally {
      setStatusUpdating(false);
    }
  };
  
  const handleSaveNote = async () => {
    try {
      setNoteUpdating(true);
      const token = localStorage.getItem("token");
      const res = await API.put(
        `/leads/${id}`,
        { notes: noteText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setLead(res.data);
      setIsNoteModalOpen(false);
      alert("Note updated successfully ✅");
    } catch (err) {
      console.error("Error updating note:", err);
      alert("Failed to update note ❌");
    } finally {
      setNoteUpdating(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!lead) return <p>Lead not found</p>;







































  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/leads')}
            className="mr-4 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl text-gray-900 mb-1">{lead.clientName}</h1>
            <p className="text-sm text-gray-500">Lead Details</p>
          </div>
        </div>
        <Badge variant={statusColors[lead.status]} className="w-fit">
          {lead.status.replace('-', ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <Card className="p-6">
            <h3 className="text-lg text-gray-900 mb-4">Client Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center text-gray-600 mb-3">
                  <User className="w-4 h-4 mr-2" />
                  <span className="text-sm">Contact Person</span>
                </div>
                <p className="text-gray-900 ml-6">{lead.contactPerson}</p>
              </div>
              <div>
                <div className="flex items-center text-gray-600 mb-3">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="text-sm">Email</span>
                </div>
                <p className="text-gray-900 ml-6">{lead.email}</p>
              </div>
              <div>
                <div className="flex items-center text-gray-600 mb-3">
                  <Phone className="w-4 h-4 mr-2" />
                  <span className="text-sm">Phone</span>
                </div>
                <p className="text-gray-900 ml-6">{lead.phone}</p>
              </div>
              <div>
                <div className="flex items-center text-gray-600 mb-3">
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="text-sm">Service</span>
                </div>
                <p className="text-gray-900 ml-6">{lead.service}</p>
              </div>
              <div>
                <div className="flex items-center text-gray-600 mb-3">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <span className="text-sm">Budget</span>
                </div>
                <p className="text-gray-900 ml-6">{lead.budget}</p>
              </div>
              <div>
                <div className="flex items-center text-gray-600 mb-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm">Deadline</span>
                </div>
                <p className="text-gray-900 ml-6">{lead.deadline}</p>
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-gray-900">Notes</h3>
              <Button size="sm" variant="outline" onClick={() => {
                setNoteText(lead.notes || "");
                setIsNoteModalOpen(true);
              }}>
                <MessageSquare className="w-4 h-4 mr-2" />
                {lead.notes ? "Edit Note" : "Add Note"}
              </Button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.notes || "No notes added yet."}</p>
            </div>
          </Card>





        {/* Files */}
<Card className="p-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg text-gray-900">Files</h3>

    <label className="cursor-pointer">
      <input
        type="file"
        className="hidden"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <Button size="sm" variant="outline" as="span">
        <Upload className="w-4 h-4 mr-2" />
        Choose File
      </Button>
    </label>

    <Button size="sm" onClick={handleUpload}>
      Upload
    </Button>
  </div>

  {/* FILE LIST */}
  <div className="space-y-3">
    {files.map((f) => (
      <div
        key={f.id || f._id}
        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
      >
        {/* LEFT SIDE */}
        <div className="flex items-center">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>

          <div>
            <p className="text-sm text-gray-900">{f.name}</p>
            <p className="text-xs text-gray-500">
              {f.size} • {f.uploadedBy}
            </p>
          </div>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">

          {/* VIEW */}
          <a
            href={f.url}
            target="_blank"
            className="text-indigo-600 text-xs font-bold hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
          >
            View
          </a>

          {/* DOWNLOAD */}
          <a
            href={f.url}
            download
            className="text-green-600 text-xs font-bold hover:bg-green-50 px-2 py-1 rounded transition-colors"
          >
            Download
          </a>

          {/* DELETE */}
          <button
            onClick={() => handleDelete(f.id || f._id)}
            className="text-red-600 text-xs font-bold hover:bg-red-50 px-2 py-1 rounded transition-colors"
          >
            Delete
          </button>

        </div>
      </div>
    ))}
  </div>
</Card>




          {/* Activity Timeline */}
          <Card className="p-6">
            <h3 className="text-lg text-gray-900 mb-4">Activity Timeline</h3>
            <div className="space-y-4">
              {activityTimeline.map((activity, index) => (
                <div key={activity.id} className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'call' ? 'bg-green-100' :
                      activity.type === 'email' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      {activity.type === 'call' ? (
                        <Phone className="w-4 h-4 text-green-600" />
                      ) : activity.type === 'email' ? (
                        <Mail className="w-4 h-4 text-blue-600" />
                      ) : (
                        <MessageSquare className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    {index < activityTimeline.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <p className="text-sm text-gray-900 mb-1">{activity.text}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span>{activity.user}</span>
                      <span className="mx-2">•</span>
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{activity.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button className="w-full" variant="outline">
                <Phone className="w-4 h-4 mr-2" />
                Log Call
              </Button>
              <Button className="w-full" variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Send Email
              </Button>
              <Button className="w-full" variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
              <Button className="w-full" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Create Proposal
              </Button>
            </div>
          </Card>

          {/* Lead Details */}
          <Card className="p-6">
            <h3 className="text-lg text-gray-900 mb-4">Lead Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Source</p>
                <p className="text-sm text-gray-900">{lead.source}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Assigned To</p>
                <p className="text-sm text-gray-900">{lead.assignedTo?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Created Date</p>
                <p className="text-sm text-gray-900">{lead.createdAt}</p>
              </div>
            </div>
          </Card>

          {/* Change Status */}
          <Card className="p-6">
            <h3 className="text-lg text-gray-900 mb-4">Change Status</h3>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="new">New</option>
              <option value="discussing">Discussing</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed-won">Closed Won</option>
              <option value="closed-lost">Closed Lost</option>
            </select>
            <Button
              className="w-full"
              onClick={updateStatus}
              disabled={statusUpdating}
            >
              {statusUpdating ? "Updating..." : "Update Status"}
            </Button>
          </Card>


     </div>
      </div>

      {/* Note Modal */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title={lead.notes ? "Edit Note" : "Add Note"}
      >
        <div className="space-y-4 p-4">
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none min-h-[200px]"
            placeholder="Type your note here..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNote} disabled={noteUpdating}>
              {noteUpdating ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}