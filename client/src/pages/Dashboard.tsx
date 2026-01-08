import { useApplications } from "@/hooks/use-applications";
import { useInterviews } from "@/hooks/use-interviews";
import { StatusBadge } from "@/components/StatusBadge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  MoreHorizontal
} from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: applications, isLoading: isLoadingApps } = useApplications();
  const { data: interviews, isLoading: isLoadingInterviews } = useInterviews();

  if (isLoadingApps || isLoadingInterviews) {
    return <div className="h-full flex items-center justify-center text-slate-400">Loading dashboard...</div>;
  }

  const apps = applications || [];
  
  // Metrics
  const totalApps = apps.length;
  const activeApps = apps.filter(a => ['Applied', 'Interview'].includes(a.status)).length;
  const offers = apps.filter(a => a.status === 'Offer').length;
  const interviewsScheduled = interviews?.filter(i => !i.completed)?.length || 0;

  // Chart Data
  const statusCounts = apps.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const COLORS = {
    Saved: '#94a3b8',
    Applied: '#3b82f6',
    Interview: '#a855f7',
    Offer: '#10b981',
    Rejected: '#ef4444'
  };

  const recentApps = [...apps]
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Here's an overview of your job search progress.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Applications" 
          value={totalApps} 
          icon={Briefcase} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Active Processes" 
          value={activeApps} 
          icon={TrendingUp} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="Upcoming Interviews" 
          value={interviewsScheduled} 
          icon={Clock} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Offers Received" 
          value={offers} 
          icon={CheckCircle} 
          color="bg-emerald-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-6">Application Status</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pieData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#94a3b8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Applications</h2>
          <div className="space-y-4">
            {recentApps.length === 0 ? (
              <p className="text-sm text-slate-500">No applications yet.</p>
            ) : (
              recentApps.map(app => (
                <div key={app.id} className="flex items-center gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm">
                    {app.company.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{app.title}</p>
                    <p className="text-xs text-slate-500 truncate">{app.company}</p>
                  </div>
                  <StatusBadge status={app.status} className="scale-90 origin-right" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4 transition-transform hover:-translate-y-1">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white shadow-lg shadow-black/5`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
