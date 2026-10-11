import { MdTimeline, MdPieChart, MdNotificationsActive } from 'react-icons/md';

const AuthorityAdminDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-10">
        <h1 className="heading-display text-4xl mb-2">Central Authority Dashboard</h1>
        <p className="text-heritage-300">National overview of artefact security, recoveries, and system activity.</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="glass-card">
          <p className="text-heritage-400 text-sm mb-1">Total Registered</p>
          <p className="text-3xl font-bold text-white mb-2">45,281</p>
          <p className="text-xs text-green-400">+12% this year</p>
        </div>
        <div className="glass-card">
          <p className="text-heritage-400 text-sm mb-1">Active Alerts (Missing)</p>
          <p className="text-3xl font-bold text-red-400 mb-2">1,204</p>
          <p className="text-xs text-red-400">+3 reported this week</p>
        </div>
        <div className="glass-card">
          <p className="text-heritage-400 text-sm mb-1">Recovered (YTD)</p>
          <p className="text-3xl font-bold text-saffron-400 mb-2">87</p>
          <p className="text-xs text-saffron-400">4 verified today</p>
        </div>
        <div className="glass-card">
          <p className="text-heritage-400 text-sm mb-1">AI Match Success Rate</p>
          <p className="text-3xl font-bold text-blue-400 mb-2">94.2%</p>
          <p className="text-xs text-heritage-400">Based on last 100 cases</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Feed */}
        <div className="lg:col-span-2 glass-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2"><MdTimeline /> Recent National Activity</h2>
            <button className="text-sm text-saffron-500 hover:text-saffron-400">View All</button>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-black/20 rounded-lg border-l-2 border-green-500">
              <p className="text-white text-sm">ASI Expert <span className="font-semibold text-saffron-400">Dr. Sharma</span> verified a match for Bronze Nataraja (HT-49281).</p>
              <p className="text-xs text-heritage-400 mt-1">10 mins ago</p>
            </div>
            <div className="p-4 bg-black/20 rounded-lg border-l-2 border-red-500">
              <p className="text-white text-sm">Meenakshi Temple reported <span className="font-semibold text-saffron-400">Gold Pendants</span> missing.</p>
              <p className="text-xs text-heritage-400 mt-1">2 hours ago</p>
            </div>
            <div className="p-4 bg-black/20 rounded-lg border-l-2 border-blue-500">
              <p className="text-white text-sm">Investigator uploaded seized items from Mumbai Port.</p>
              <p className="text-xs text-heritage-400 mt-1">5 hours ago</p>
            </div>
          </div>
        </div>

        {/* Alerts / Reports */}
        <div className="glass-card">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><MdNotificationsActive /> Quick Actions</h2>
          <div className="space-y-4 flex flex-col">
            <button className="btn-secondary justify-start text-left">Generate Interpol Report</button>
            <button className="btn-secondary justify-start text-left">Manage User Access</button>
            <button className="btn-secondary justify-start text-left">View Analytics Dashboard</button>
            <button className="btn-primary mt-4">Issue National Alert</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorityAdminDashboard;
