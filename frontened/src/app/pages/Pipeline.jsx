import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card } from '../components/ui';
import { DollarSign, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

const ItemType = 'LEAD_CARD';

const columns = [
  { id: 'new', title: 'New', color: 'bg-gray-100' },
  { id: 'discussing', title: 'Discussing', color: 'bg-blue-100' },
  { id: 'proposal', title: 'Proposal', color: 'bg-yellow-100' },
  { id: 'negotiation', title: 'Negotiation', color: 'bg-purple-100' },
  { id: 'closed-won', title: 'Closed Won', color: 'bg-green-100' }
];

export const Pipeline = () => {
  const [leads, setLeads] = useState([]);
  const navigate = useNavigate();

  // ✅ FETCH LEADS FROM BACKEND
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await API.get(`/leads`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setLeads(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.log(error);
      }
    };

    fetchLeads();
  }, []);

  // ✅ UPDATE STATUS (DRAG & DROP)
  const moveCard = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");

      await API.put(
        `/leads/${id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // UI update
      setLeads((prev) =>
        prev.map((lead) =>
          (lead.id || lead._id) === id ? { ...lead, status: newStatus } : lead
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  // ================= LEAD CARD =================
  const LeadCard = ({ lead }) => {
    const [{ isDragging }, drag] = useDrag({
      type: ItemType,
      item: { id: lead.id || lead._id, status: lead.status },
      collect: (monitor) => ({
        isDragging: monitor.isDragging()
      })
    });

    return (
      <div
        ref={drag}
        onClick={() => navigate(`/leads/${lead.id || lead._id}`)}
        className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
        <h4 className="text-sm text-gray-900 mb-2">{lead.clientName}</h4>
        <p className="text-xs text-gray-500 mb-3">{lead.service}</p>

        <div className="space-y-2">
          <div className="flex items-center text-xs text-gray-600">
            <DollarSign className="w-3 h-3 mr-1" />
            {lead.budget}
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <Calendar className="w-3 h-3 mr-1" />
            {lead.deadline}
          </div>
          <div className="flex items-center text-xs text-gray-600">
            <User className="w-3 h-3 mr-1" />
            {lead.assignedTo?.name}
          </div>
        </div>
      </div>
    );
  };

  // ================= COLUMN =================
  const Column = ({ column }) => {
    const [{ isOver }, drop] = useDrop({
      accept: ItemType,
      drop: (item) => {
        if (item.status !== column.id) {
          moveCard(item.id, column.id);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver()
      })
    });

    const columnLeads = (Array.isArray(leads) ? leads : []).filter(
      (lead) => lead.status === column.id
    );

    return (
      <div
        ref={drop}
        className={`flex-1 min-w-[280px] ${
          isOver ? 'ring-2 ring-indigo-400 rounded-lg' : ''
        }`}
      >
        <div className={`${column.color} rounded-t-lg px-4 py-3`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm text-gray-900">{column.title}</h3>
            <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
              {columnLeads.length}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 p-3 space-y-3 min-h-[600px] rounded-b-lg">
          {columnLeads.map((lead) => (
            <LeadCard key={lead.id || lead._id} lead={lead} />
          ))}

          {columnLeads.length === 0 && (
            <div className="text-center py-8">
              <p className="text-xs text-gray-400">No leads</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ================= UI =================
  const totalValue = leads.reduce((sum, lead) => {
    const value = parseInt((lead.budget || "0").replace(/[$,]/g, ''));
    return sum + value;
  }, 0);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl text-gray-900 mb-2">Sales Pipeline</h1>
            <p className="text-sm text-gray-500">
              Drag and drop leads between stages
            </p>
          </div>

          <Card className="px-6 py-3 w-full md:w-auto">
            <p className="text-xs text-gray-500 mb-1">Total Pipeline Value</p>
            <p className="text-2xl text-indigo-600">
              ${totalValue.toLocaleString()}
            </p>
          </Card>
        </div>

        {/* Columns */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <Column key={column.id} column={column} />
          ))}
        </div>

        {/* Info */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800">
            💡 Drag and drop leads to change pipeline stage
          </p>
        </Card>

      </div>
    </DndProvider>
  );
};