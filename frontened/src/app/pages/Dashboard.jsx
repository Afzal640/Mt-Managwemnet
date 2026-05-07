import { useState, useEffect } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DarkToggle from "../components/DarkToggle";
import {
  Card,
  Badge,
  Button,
  Input,
  Select,
  LoadingSpinner,
} from "../components/ui";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  CheckCircle2,
  Clock,
  Trophy,
  Plus,
  ArrowRight,
  UserPlus,
  Target,
  X as CloseIcon,
  Activity as ActivityIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#8b5cf6"];

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ─── STATE ────────────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("sales");

  const [dashboardStats, setDashboardStats] = useState(null);
  const [chartData, setChartData] = useState({
    leadsByService: [],
    monthlyDeals: [],
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [salesUsers, setSalesUsers] = useState([]);
  const [allTargets, setAllTargets] = useState([]);
  const [productionUsers, setProductionUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  // Separate modal states — one for Target assignment, one for Project creation
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const [targetForm, setTargetForm] = useState({
    userId: "",
    type: "leads",
    period: "daily",
    target: "",
  });

  const [projectForm, setProjectForm] = useState({
    clientName: "",
    service: "",
    assignedTo: "",
    deadline: "",
  });

  // ─── CREATE USER (ADMIN) ──────────────────────────────────────────────────
  const createUser = async () => {
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await API.post(
        `/admin/create-user`,
        { name, email, password, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("User created successfully ✅");
      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error(error);
      alert("Error creating user ❌");
    }
  };

  // ─── ASSIGN TARGET ────────────────────────────────────────────────────────
  const assignTarget = async () => {
    if (!targetForm.userId || !targetForm.target) {
      alert("Please select a user and enter a target value");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await API.post(
        `/targets/assign`,
        targetForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Target assigned successfully! 🎯");
      setIsTargetModalOpen(false);
      const res = await API.get(`/targets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllTargets(res.data);
    } catch (error) {
      console.error(error);
      alert("Error assigning target ❌");
    }
  };

  // ─── CREATE PROJECT ───────────────────────────────────────────────────────
  const createProject = async () => {
    try {
      const token = localStorage.getItem("token");
      await API.post(`/projects`, projectForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Project created ✅");
      setIsProjectModalOpen(false);
      setProjectForm({ clientName: "", service: "", assignedTo: "", deadline: "" });
    } catch (err) {
      console.error(err);
      alert("Error creating project ❌");
    }
  };

  // ─── FETCH DASHBOARD DATA ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token || !user) return;

      setLoading(true);
      try {
        const isAdmin = user?.role === "admin";
        const isSales = user?.role === "sales";
        
        if (!isAdmin && !isSales) return; // Production users will be redirected, don't fetch stats

        const endpoint = isAdmin
          ? `/admin/dashboard-stats`
          : `/sales/dashboard`;

        const statsRes = await API.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let normalizedStats = statsRes.data;

        if (!isAdmin && normalizedStats.stats) {
          normalizedStats = {
            leads:     { value: normalizedStats.stats.leads     || 0, change: 0, trend: "up" },
            deals:     { value: normalizedStats.stats.deals     || 0, change: 0, trend: "up" },
            followups: { value: normalizedStats.stats.followups || 0, change: 0, trend: "up" },
            revenue:   { value: normalizedStats.stats.revenue   || 0, change: 0, trend: "up" },
            recentActivities: normalizedStats.recentActivities || [],
          };
        }

        setDashboardStats(normalizedStats);

        let chartPromise = Promise.resolve({ data: { leadsByService: [], monthlyDeals: [] } });
        let usersPromise = Promise.resolve({ data: [] });

        if (isAdmin) {
          chartPromise = API
            .get(`/admin/chart-data`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .catch(() => ({ data: { leadsByService: [], monthlyDeals: [] } }));

          usersPromise = API
            .get(`/admin/users`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .catch(() => ({ data: [] }));

          API
            .get(`/auth/sales-users`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setSalesUsers(res.data))
            .catch(() => {});

          API
            .get(`/targets`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => setAllTargets(res.data))
            .catch(() => {});
        }

        const [chartRes, usersRes] = await Promise.all([chartPromise, usersPromise]);
        setChartData(chartRes.data);
        setTeamMembers(usersRes.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setDashboardStats({
          leads:     { value: 0, change: 0, trend: "up" },
          deals:     { value: 0, change: 0, trend: "up" },
          followups: { value: 0, change: 0, trend: "up" },
          revenue:   { value: 0, change: 0, trend: "up" },
          recentActivities: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // ─── REDIRECT ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.role === "production") {
      navigate("/production", { replace: true });
    } else if (user?.role === "sales") {
      navigate("/salesdashboard", { replace: true });
    }
  }, [user, navigate]);

  // ─── FETCH PRODUCTION USERS ───────────────────────────────────────────────
  useEffect(() => {
    const fetchProductionUsers = async () => {
      if (user?.role !== "admin") return;
      try {
        const token = localStorage.getItem("token");
        const res = await API.get(
          `/auth/production-users`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProductionUsers(res.data);
      } catch (error) {
        console.error("Error fetching production users:", error);
      }
    };
    fetchProductionUsers();
  }, [user]);

  // ─── GUARDS ───────────────────────────────────────────────────────────────
  if (loading) return <LoadingSpinner size="lg" />;
  if (!dashboardStats)
    return <p className="p-6 text-center text-gray-500">No data available.</p>;

  // ─── DERIVED VALUES ───────────────────────────────────────────────────────
  // topPerformer comes from the backend stats or falls back to an empty object
  const topPerformer = dashboardStats?.topPerformer || {};

  // All 4 stat cards — now with bgColor, color, change & trend included
  const stats = [
    {
      name: "Total Leads",
      value: dashboardStats.leads?.value ?? 0,
      change: dashboardStats.leads?.change ?? 0,
      trend: dashboardStats.leads?.trend ?? "up",
      icon: Users,
      bgColor: "bg-indigo-50",
      color: "text-indigo-600",
    },
    {
      name: "Active Deals",
      value: dashboardStats.deals?.value ?? 0,
      change: dashboardStats.deals?.change ?? 0,
      trend: dashboardStats.deals?.trend ?? "up",
      icon: DollarSign,
      bgColor: "bg-green-50",
      color: "text-green-600",
    },
    {
      name: "Follow-ups",
      value: dashboardStats.followups?.value ?? 0,
      change: dashboardStats.followups?.change ?? 0,
      trend: dashboardStats.followups?.trend ?? "up",
      icon: Clock,
      bgColor: "bg-amber-50",
      color: "text-amber-600",
    },
    {
      name: "Revenue",
      value: `$${(dashboardStats.revenue?.value ?? 0).toLocaleString()}`,
      change: dashboardStats.revenue?.change ?? 0,
      trend: dashboardStats.revenue?.trend ?? "up",
      icon: TrendingUp,
      bgColor: "bg-purple-50",
      color: "text-purple-600",
    },
  ];

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Top action bar ─────────────────────────────────────────────────── */}
      {user?.role === "admin" && (
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsProjectModalOpen(true)}
            className="bg-green-600 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Create Project
          </Button>
        </div>
      )}

      {/* ── Project Modal ──────────────────────────────────────────────────── */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="p-6 w-[420px] bg-white animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Assign Project</h2>
              <button
                onClick={() => setIsProjectModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label="Client Name"
                placeholder="e.g. Acme Corp"
                value={projectForm.clientName}
                onChange={(e) => setProjectForm({ ...projectForm, clientName: e.target.value })}
              />
              <Select
                label="Service"
                value={projectForm.service}
                onChange={(e) => setProjectForm({ ...projectForm, service: e.target.value })}
                options={[
                  { value: "", label: "Select Service" },
                  { value: "Website Development", label: "Website Development" },
                  { value: "Graphic Design", label: "Graphic Design" },
                ]}
              />
              <Select
                label="Assign To"
                value={projectForm.assignedTo}
                onChange={(e) => setProjectForm({ ...projectForm, assignedTo: e.target.value })}
                options={[
                  { value: "", label: "Select Production User" },
                  ...productionUsers.map((u) => ({ value: u.id || u._id, label: u.name })),
                ]}
              />
              <Input
                label="Deadline"
                type="date"
                value={projectForm.deadline}
                onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
              />
              <div className="flex gap-2 pt-2">
                <Button onClick={() => setIsProjectModalOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={createProject} className="flex-1 bg-indigo-600 text-white">
                  Assign
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Overview
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Welcome back,{" "}
            <span className="text-indigo-600 font-semibold">{user?.name}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DarkToggle />
          <div className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300">
            {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* ── Stats Cards (4 cards) ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl backdrop-blur-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex justify-between items-center mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color}`}>
                <stat.icon size={22} />
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  stat.trend === "up"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {stat.change}%
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.name}</p>
          </div>
        ))}
      </div>

      {/* ── Charts Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Monthly Growth — spans 2 cols */}
        <Card className="lg:col-span-2 p-6 border-none ring-1 ring-gray-100 bg-white">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Monthly Growth</h3>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.monthlyDeals}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="deals"
                  stroke="#10b981"
                  strokeWidth={3}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Leads Distribution Pie — 1 col */}
        <Card className="p-6 border-none ring-1 ring-gray-100 bg-white">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Leads Distribution</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.leadsByService}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {chartData.leadsByService.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {chartData.leadsByService.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600 font-medium">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

      </div>

      {/* ── Recent Lead Notifications (Admin Only) ──────────────────────────── */}
      {user?.role === "admin" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Lead Notifications</h3>
            </div>
            <span className="text-xs text-gray-400">Latest {(dashboardStats?.recentActivities || []).length} entries</span>
          </div>

          {(dashboardStats?.recentActivities || []).length === 0 ? (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">No lead activity yet.</div>
          ) : (
            <ul className="divide-y divide-gray-50 dark:divide-gray-700">
              {(dashboardStats?.recentActivities || []).map((act, i) => {
                const adderName = act.createdBy?.name || "Unknown";
                const initials = adderName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                const timeAgo = (() => {
                  const diff = (Date.now() - new Date(act.createdAt)) / 1000;
                  if (diff < 60) return `${Math.round(diff)}s ago`;
                  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
                  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
                  return `${Math.round(diff / 86400)}d ago`;
                })();

                return (
                  <li key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {initials}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        <span className="font-bold text-indigo-600">{adderName}</span>
                        {" "}added a new lead:
                        {" "}<span className="font-semibold text-gray-900 dark:text-white">{act.clientName || "—"}</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                        {act.notes || ""}
                      </p>
                    </div>

                    {/* Time */}
                    <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">{timeAgo}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* ── Team Performance + Top Performer ───────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* Team Targets */}
        <Card className="p-6 border-none ring-1 ring-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-900">
              Team Performance &amp; Targets
            </h3>
            {user?.role === "admin" && (
              <Button
                size="sm"
                onClick={() => setIsTargetModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                <Plus className="w-4 h-4 mr-1" />
                Set Target
              </Button>
            )}
          </div>

          <div className="space-y-6">
            {allTargets.slice(0, 6).map((t, i) => {
              const percentage = t.target > 0
                ? Math.round((t.current / t.target) * 100)
                : 0;
              return (
                <div key={i} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm font-bold text-gray-900">
                        {t.userId?.name || "User"}
                      </div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider">
                        {t.period} {t.type}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-800">
                        {t.current} / {t.target}
                      </div>
                      <div
                        className={`text-[10px] font-bold ${
                          percentage >= 100 ? "text-green-600" : "text-indigo-600"
                        }`}
                      >
                        {percentage}% REACHED
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-50 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        percentage >= 100 ? "bg-green-500" : "bg-indigo-600"
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {allTargets.length === 0 && (
              <p className="text-center text-gray-400 py-10">No active targets found.</p>
            )}
          </div>
        </Card>

        {/* Right column: Top Performer + Provision User */}
        <div className="space-y-8">

          {/* Top Performer Card */}
          <Card className="p-6 border-none ring-1 ring-gray-100 shadow-sm bg-gradient-to-br from-indigo-600 to-violet-700 text-white overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Top Performer
                </span>
                <Trophy className="text-amber-300" size={24} />
              </div>

              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full border-4 border-white/20 p-1">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      topPerformer.name || "User"
                    )}&background=random`}
                    className="w-full h-full rounded-full object-cover"
                    alt="Avatar"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {topPerformer.name || "No Data Yet"}
                  </h3>
                  <p className="text-indigo-100 text-sm">Senior Executive</p>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6 text-center">
                <div>
                  <p className="text-indigo-200 text-[10px] uppercase font-bold">Leads</p>
                  <p className="text-lg font-bold">{topPerformer.leads || 0}</p>
                </div>
                <div>
                  <p className="text-indigo-200 text-[10px] uppercase font-bold">Deals</p>
                  <p className="text-lg font-bold">{topPerformer.deals || 0}</p>
                </div>
                <div>
                  <p className="text-indigo-200 text-[10px] uppercase font-bold">Revenue</p>
                  <p className="text-lg font-bold">
                    ${(topPerformer.revenue || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          </Card>

          {/* Provision New User (admin only) */}
          {user?.role === "admin" && (
            <Card className="p-6 border-none ring-1 ring-gray-100 bg-white shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <UserPlus size={20} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Provision New User</h3>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Full Name"  value={name}     onChange={(e) => setName(e.target.value)}     />
                  <Input label="Email"      value={email}    onChange={(e) => setEmail(e.target.value)}    />
                </div>
                <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <Select
                  label="Role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  options={[
                    { value: "sales",      label: "Sales Team"      },
                    { value: "production", label: "Production Team" },
                  ]}
                />
                <Button
                  onClick={createUser}
                  className="w-full bg-gray-900 py-3 rounded-xl font-bold text-sm text-white"
                >
                  Create Account
                </Button>
              </div>
            </Card>
          )}

        </div>
      </div>

      {/* ── Target Assignment Modal ─────────────────────────────────────────── */}
      {isTargetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-white animate-in zoom-in-95 duration-200">

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Assign Sales Target</h3>
              <button
                onClick={() => setIsTargetModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <Select
                label="Sales User"
                value={targetForm.userId}
                onChange={(e) => setTargetForm({ ...targetForm, userId: e.target.value })}
                options={[
                  { value: "", label: "Choose User" },
                  ...salesUsers.map((u) => ({ value: u.id || u._id, label: u.name })),
                ]}
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Metric"
                  value={targetForm.type}
                  onChange={(e) => setTargetForm({ ...targetForm, type: e.target.value })}
                  options={[
                    { value: "leads",    label: "Leads"    },
                    { value: "calls",    label: "Calls"    },
                    { value: "meetings", label: "Meetings" },
                    { value: "deals",    label: "Deals"    },
                    { value: "revenue",  label: "Revenue"  },
                  ]}
                />
                <Select
                  label="Duration"
                  value={targetForm.period}
                  onChange={(e) => setTargetForm({ ...targetForm, period: e.target.value })}
                  options={[
                    { value: "daily",   label: "Daily"   },
                    { value: "weekly",  label: "Weekly"  },
                    { value: "monthly", label: "Monthly" },
                  ]}
                />
              </div>

              <Input
                label="Quantity / Value"
                type="number"
                value={targetForm.target}
                onChange={(e) => setTargetForm({ ...targetForm, target: e.target.value })}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setIsTargetModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={assignTarget}
                  className="flex-1 bg-indigo-600 text-white font-bold"
                >
                  Save Target
                </Button>
              </div>
            </div>

          </Card>
        </div>
      )}

    </div>
  );
};