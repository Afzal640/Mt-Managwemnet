import { useEffect, useState } from "react";
import API from "../api/api";
import { Card, Badge, LoadingSpinner } from "../components/ui";
import { Trophy, TrendingUp, Users, DollarSign } from "lucide-react";

export const Team = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);


  //admin sy data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("TOKEN:", localStorage.getItem("token"));
        const res = await API.get(`/admin/team-report`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch team data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!data) return <p className="p-6">Failed to load team data.</p>;

  // Filter members from API data
const salesMembers = (Array.isArray(data?.teamMembers) ? data.teamMembers : []).filter(
  m => m.role === "sales" || m.role === "admin"
) || [];

const productionMembers = (Array.isArray(data?.teamMembers) ? data.teamMembers : []).filter(
  m => m.role === "production"
) || [];

  const statusColors = {
    online: 'bg-green-500',
    busy: 'bg-yellow-500',
    offline: 'bg-gray-400'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Team</h1>
        <p className="text-sm text-gray-500">View team performance and member statistics</p>
      </div>

      {/* Team Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Team Leads</p>
              <p className="text-3xl font-bold text-gray-900">{data.totalLeads}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Deals Closed</p>
              <p className="text-3xl font-bold text-gray-900">{data.totalDeals}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">${(data.totalRevenue / 1000).toFixed(0)}K</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Team Members</p>
              <p className="text-3xl font-bold text-gray-900">{data.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Sales Team List */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Sales Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {salesMembers.map((member) => (
            <Card key={member.id || member._id} className="p-6 transition-all hover:shadow-md">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center">
                  <div className="relative">
                    <img
                      src={`https://ui-avatars.com/api/?name=${member.name}&background=random`}
                      alt={member.name}
                      className="w-16 h-16 rounded-full"
                    />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-gray-900 font-bold mb-1">{member.name}</h3>
                    <p className="text-sm text-gray-500 uppercase tracking-wider">{member.role}</p>
                  </div>
                </div>
                <Badge variant="success">Active</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-xs font-medium text-gray-900 truncate">{member.email}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="text-xs font-medium text-gray-900">{new Date(member.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Production Team */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Production Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {productionMembers.map((member) => (
            <Card key={member.id || member._id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <img
                    src={`https://ui-avatars.com/api/?name=${member.name}&background=random`}
                    alt={member.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="ml-3">
                    <h3 className="text-sm font-bold text-gray-900 mb-0.5">{member.name}</h3>
                    <p className="text-xs text-gray-500 uppercase">{member.role}</p>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded">
                 {member.email}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};