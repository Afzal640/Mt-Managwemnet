import { useEffect, useState } from "react";
import { Card, Button, Badge } from "../components/ui";
import { Modal } from "../components/Modal";
import { Plus, Phone, Mail, Calendar, MessageSquare, CheckCircle } from "lucide-react";
import API from "../api/api";
import DarkToggle from "../components/DarkToggle";

const activityTypes = [
  { value: "call", label: "Call", icon: Phone },
  { value: "email", label: "Email", icon: Mail },
  { value: "meeting", label: "Meeting", icon: Calendar },
  { value: "message", label: "Message", icon: MessageSquare }
];

const Activity = () => {
  const [activities, setActivities] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    clientName: "",
    company: "",
    notes: "",
    type: "call",
    status: "pending",   // ✅ NEW
    outcome: ""          // ✅ NEW
  });

  const fetchActivities = async () => {
    try {
      const res = await API.get("/activities");
      setActivities(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/activities", form);

      setForm({
        clientName: "",
        company: "",
        notes: "",
        type: "call",
        status: "pending",
        outcome: ""
      });

      setShowModal(false);
      fetchActivities();

    } catch (err) {
      console.log(err);
      alert("Failed ❌");
    }
  };

  const getTypeConfig = (type) =>
    activityTypes.find((a) => a.value === type);

  return (
  <div className="space-y-6">

    {/* HEADER */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Sales Activity
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Track your CRM interactions
        </p>
      </div>

      <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-lg w-full md:w-auto" onClick={() => setShowModal(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Add Activity
      </Button>
    </div>

    {/* TIMELINE STYLE LIST */}
    <div className="relative">

      {/* LINE */}
      <div className="absolute left-3 top-0 bottom-0 w-[2px] bg-gray-200"></div>

      <div className="space-y-6">
        {activities.map((a) => {
          const type = getTypeConfig(a.type);
          const Icon = type?.icon || MessageSquare;

          return (
            <div key={a.id || a._id} className="relative flex gap-4">

              {/* DOT */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-2
                ${a.status === "done" ? "bg-green-500" : "bg-yellow-400"}
              `}>
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>

              {/* CARD */}
              <div className="flex-1">
                <div className="backdrop-blur-md bg-white/70 border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-xl transition-all duration-300">

                  {/* TOP */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {a.clientName}
                      </h3>
                      <p className="text-xs text-gray-500">{a.company}</p>
                    </div>

                    <div className="flex gap-2">
                      <Badge className="bg-indigo-100 text-indigo-700">
                        {type?.label}
                      </Badge>

                      <Badge className={
                        a.status === "done"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }>
                        {a.status}
                      </Badge>
                    </div>
                  </div>

                  {/* TYPE ICON + DATE */}
                  <div className="flex items-center gap-3 mt-4">
                    <div className="p-3 bg-indigo-50 rounded-xl">
                      <Icon className="w-5 h-5 text-indigo-600" />
                    </div>

                    <p className="text-xs text-gray-500">
                      {new Date(a.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* NOTES */}
                  <p className="text-sm text-gray-700 mt-4 leading-relaxed">
                    {a.notes}
                  </p>

                  {/* OUTCOME */}
                  {a.outcome && (
                    <div className="mt-3 inline-block px-3 py-1 text-xs rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700">
                      ✨ {a.outcome}
                    </div>
                  )}

                  {/* FOOTER */}
                  <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-100">

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow">
                        {a.createdBy?.name?.charAt(0) || "U"}
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-700">
                          {a.createdBy?.name || "System"}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Activity owner
                        </p>
                      </div>
                    </div>

                  </div>

                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>

    {/* MODAL SAME */}
    <Modal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      title="Add Activity"
    >
      <form onSubmit={handleSubmit} className="space-y-3">

        <select
          className="w-full border p-2 rounded"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          {activityTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <input
          className="w-full border p-2 rounded"
          placeholder="Client Name"
          value={form.clientName}
          onChange={(e) =>
            setForm({ ...form, clientName: e.target.value })
          }
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Company"
          value={form.company}
          onChange={(e) =>
            setForm({ ...form, company: e.target.value })
          }
        />

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Notes"
          value={form.notes}
          onChange={(e) =>
            setForm({ ...form, notes: e.target.value })
          }
        />

        <select
          className="w-full border p-2 rounded"
          value={form.status}
          onChange={(e) =>
            setForm({ ...form, status: e.target.value })
          }
        >
          <option value="pending">Pending</option>
          <option value="done">Done</option>
        </select>

        <input
          className="w-full border p-2 rounded"
          placeholder="Outcome"
          value={form.outcome}
          onChange={(e) =>
            setForm({ ...form, outcome: e.target.value })
          }
        />

        <div className="flex justify-end gap-2">
          <Button type="button" onClick={() => setShowModal(false)}>
            Cancel
          </Button>

          <Button className="bg-indigo-600 hover:bg-indigo-700" type="submit">
            Save
          </Button>
        </div>

      </form>
    </Modal>

  </div>
  );
};

export default Activity;