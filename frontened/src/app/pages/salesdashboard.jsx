import { useEffect, useState } from "react";
import axios from "axios";
import { Card, LoadingSpinner, Badge } from "../components/ui";
import { Users, DollarSign, Clock, TrendingUp, ArrowRight, Activity as ActivityIcon } from "lucide-react";

export const SalesDashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/sales/dashboard`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setStats(res.data.stats);
        setChartData(res.data.chart);
        setRecentActivities(res.data.recentActivities || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!stats) return <p className="p-6 text-center text-gray-500">No data found.</p>;

  // Filter logic for selected report
  const displayedReports = selectedReport 
    ? chartData.filter(item => item.month === selectedReport)
    : chartData;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER */}
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sales Dashboard</h1>
        <p className="text-gray-500 mt-1">Hello, tracking your performance and leads.</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow border-none ring-1 ring-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Leads</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.leads}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-600 font-bold">
            <TrendingUp size={12} className="mr-1" />
            Active monitoring
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow border-none ring-1 ring-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Won Deals</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.deals}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-gray-400">
            Current month performance
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow border-none ring-1 ring-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Follow-ups</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.followups}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-amber-600 font-bold">
             Pending action
          </div>
        </Card>
      </div>

      {/* CHART & ACTIVITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6 border-none ring-1 ring-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">
              {selectedReport ? `Report: ${selectedReport}` : 'Monthly Performance'}
            </h3>
            {selectedReport ? (
              <button 
                onClick={() => setSelectedReport(null)}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center gap-1"
              >
                View All Reports
              </button>
            ) : (
              <button 
                onClick={() => {}} // Could be wired to show all in modal if needed
                className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center gap-1 group"
              >
                View Reports <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {displayedReports.map((item, index) => (
              <div key={index} className="flex flex-col p-4 rounded-xl bg-gray-50 border border-gray-100 group hover:bg-white hover:border-indigo-100 transition-all">
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                     <span className="font-bold text-gray-700 uppercase tracking-wider text-xs">{item.month}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="success" className="font-bold">
                      {item.deals} DEALS
                    </Badge>
                    {!selectedReport && (
                      <button 
                        onClick={() => setSelectedReport(item.month)}
                        className="text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded font-semibold transition-colors"
                      >
                        View Report
                      </button>
                    )}
                  </div>
                </div>
                {selectedReport && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-bold text-gray-800 mb-2">Detailed Monthly Stats</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
                        <span className="text-xs text-gray-500 block mb-1">Total Revenue</span>
                        <span className="text-lg font-bold text-gray-900">${(item.revenue || 0).toLocaleString()}</span>
                      </div>
                      <div className="bg-white p-3 rounded shadow-sm border border-gray-100">
                        <span className="text-xs text-gray-500 block mb-1">Conversion Rate</span>
                        <span className="text-lg font-bold text-indigo-600">{(item.deals * 3.5).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* RECENT ACTIVITIES */}
        <Card className="p-6 border-none ring-1 ring-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent My Activities</h3>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((act) => (
                <div key={act.id || act._id} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-indigo-100 transition-all">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-50 text-indigo-600">
                    <ActivityIcon size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{act.clientName}</h4>
                    <p className="text-xs text-gray-500 truncate max-w-[150px]">{act.notes}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <Badge className="uppercase text-[10px]">{act.type}</Badge>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(act.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-4">No activities logged yet.</p>
            )}
          </div>
        </Card>
      </div>

    </div>
  );
};
