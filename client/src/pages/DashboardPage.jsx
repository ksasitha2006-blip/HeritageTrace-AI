import { Link } from 'react-router-dom';
import {
  HiOutlineCollection,
  HiOutlineShieldCheck,
  HiOutlineExclamation,
  HiOutlineRefresh,
  HiOutlineSparkles,
} from 'react-icons/hi';
import {
  MdVerifiedUser,
  MdTimeline,
  MdNotificationsActive,
  MdAccountBalance,
  MdSearch,
  MdAdminPanelSettings,
} from 'react-icons/md';
import { useArtefacts } from '../context/ArtefactContext';

const DashboardPage = () => {
  const { artefacts, verifications, activities, alerts } = useArtefacts();

  const total = artefacts.length;
  const safe = artefacts.filter((a) => a.status === 'safe').length;
  const missing = artefacts.filter((a) => a.status === 'missing').length;
  const recovered = artefacts.filter((a) => a.status === 'recovered').length;
  const pendingVerifs = verifications.filter((v) => v.status === 'pending').length;

  const safePct = total ? Math.round((safe / total) * 100) : 0;
  const missingPct = total ? Math.round((missing / total) * 100) : 0;
  const recoveredPct = total ? Math.round((recovered / total) * 100) : 0;

  // Category counts
  const categoryCounts = artefacts.reduce((acc, curr) => {
    const cat = curr.category || 'sculpture';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-saffron-400 font-mono text-xs uppercase tracking-widest mb-1">
            <HiOutlineSparkles /> National Telemetry & Analytics
          </div>
          <h1 className="section-heading">Heritage Protection Dashboard</h1>
          <p className="text-heritage-300 text-sm mt-1">
            Aggregated intelligence across temple trusts, border checkpoints, and ASI curation centers.
          </p>
        </div>

        <div className="flex gap-3">
          <Link to="/artefacts" className="btn-secondary text-sm">
            View All Artefacts
          </Link>
          <Link to="/role-selection" className="btn-primary text-sm">
            Switch Workspace
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <div className="glass-card p-5 border-l-4 border-l-saffron-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono text-heritage-400">Total Tracked</span>
            <HiOutlineCollection className="text-saffron-400 text-xl" />
          </div>
          <p className="font-display text-3xl font-black text-white">{total}</p>
          <p className="text-[11px] text-heritage-400 mt-1">National Registry items</p>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono text-emerald-400">Safe in Temples</span>
            <HiOutlineShieldCheck className="text-emerald-400 text-xl" />
          </div>
          <p className="font-display text-3xl font-black text-emerald-400">{safe}</p>
          <p className="text-[11px] text-heritage-400 mt-1">{safePct}% of inventory secure</p>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono text-rose-400">Active Missing</span>
            <HiOutlineExclamation className="text-rose-400 text-xl" />
          </div>
          <p className="font-display text-3xl font-black text-rose-400">{missing}</p>
          <p className="text-[11px] text-heritage-400 mt-1">{missingPct}% under active search</p>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono text-amber-400">Recovered</span>
            <HiOutlineRefresh className="text-amber-400 text-xl" />
          </div>
          <p className="font-display text-3xl font-black text-amber-400">{recovered}</p>
          <p className="text-[11px] text-heritage-400 mt-1">{recoveredPct}% successfully returned</p>
        </div>

        <div className="glass-card p-5 border-l-4 border-l-purple-500 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono text-purple-400">ASI Pending</span>
            <MdVerifiedUser className="text-purple-400 text-xl" />
          </div>
          <p className="font-display text-3xl font-black text-purple-400">{pendingVerifs}</p>
          <p className="text-[11px] text-heritage-400 mt-1">
            <Link to="/asi-verification" className="text-purple-300 underline font-semibold">
              Review queue →
            </Link>
          </p>
        </div>
      </div>

      {/* Middle Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Status Distribution Visual */}
        <div className="glass-card p-6 border border-white/10 lg:col-span-1">
          <h3 className="font-display text-lg font-bold text-white mb-4">
            Security Status Distribution
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-emerald-400 font-medium">Safe & Conserved</span>
                <span className="text-white font-mono">{safe} ({safePct}%)</span>
              </div>
              <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${safePct}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-rose-400 font-medium">Reported Missing / Stolen</span>
                <span className="text-white font-mono">{missing} ({missingPct}%)</span>
              </div>
              <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${missingPct}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-amber-400 font-medium">Repatriated / Recovered</span>
                <span className="text-white font-mono">{recovered} ({recoveredPct}%)</span>
              </div>
              <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${recoveredPct}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <h4 className="text-xs font-semibold text-heritage-300 uppercase tracking-wider mb-3">
              Categories in Registry
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryCounts).map(([cat, count]) => (
                <span
                  key={cat}
                  className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono capitalize text-heritage-200"
                >
                  {cat}: <strong className="text-saffron-400">{count}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Live National Activity Ledger */}
        <div className="glass-card p-6 border border-white/10 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <MdTimeline className="text-saffron-400 text-xl" /> National Activity Ledger
            </h3>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live Stream
            </span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {activities.map((act) => (
              <div
                key={act.id}
                className="p-3.5 bg-black/30 rounded-xl border border-white/5 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold mt-0.5 ${
                    act.type === 'seizure'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : act.type === 'verified'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : act.type === 'alert'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-saffron-500/20 text-saffron-400 border border-saffron-500/30'
                  }`}>
                    {act.badge}
                  </span>
                  <p className="text-heritage-100 leading-relaxed font-medium">{act.text}</p>
                </div>
                <span className="text-heritage-400 font-mono text-[10px] whitespace-nowrap shrink-0">
                  {act.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active High-Urgency Alerts Banner */}
      <div className="glass-card p-6 border border-rose-500/30 bg-rose-950/10 rounded-2xl mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <MdNotificationsActive className="text-rose-400 text-xl" /> Active National Theft Alerts
          </h3>
          <Link to="/authority-dashboard" className="text-xs text-rose-300 hover:underline font-semibold">
            Manage Alerts via Authority Portal →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 bg-black/40 rounded-xl border border-rose-500/20 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-rose-400 font-mono uppercase tracking-wider">
                    {alert.urgency} Urgency
                  </span>
                  <span className="text-[10px] text-heritage-400">{alert.date}</span>
                </div>
                <h4 className="text-white font-bold text-sm mb-1">{alert.title}</h4>
                <p className="text-heritage-300 text-xs leading-relaxed mb-2">{alert.description}</p>
              </div>
              <div className="text-[11px] font-mono text-heritage-400 pt-2 border-t border-white/5">
                Target Zone: <span className="text-white">{alert.region}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workspace Quick-Access Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/temple-dashboard"
          className="glass-card p-4 hover:border-amber-500/50 hover:bg-white/[0.06] transition-all flex items-center gap-3"
        >
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
            <MdAccountBalance className="text-2xl" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Temple Portal</p>
            <p className="text-[11px] text-heritage-400">Register & Audit</p>
          </div>
        </Link>

        <Link
          to="/investigator-dashboard"
          className="glass-card p-4 hover:border-blue-500/50 hover:bg-white/[0.06] transition-all flex items-center gap-3"
        >
          <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
            <MdSearch className="text-2xl" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Investigator Search</p>
            <p className="text-[11px] text-heritage-400">AI Visual Recognition</p>
          </div>
        </Link>

        <Link
          to="/asi-verification"
          className="glass-card p-4 hover:border-emerald-500/50 hover:bg-white/[0.06] transition-all flex items-center gap-3"
        >
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
            <MdVerifiedUser className="text-2xl" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">ASI Workbench</p>
            <p className="text-[11px] text-heritage-400">Forensic Authentication</p>
          </div>
        </Link>

        <Link
          to="/authority-dashboard"
          className="glass-card p-4 hover:border-purple-500/50 hover:bg-white/[0.06] transition-all flex items-center gap-3"
        >
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
            <MdAdminPanelSettings className="text-2xl" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Central Authority</p>
            <p className="text-[11px] text-heritage-400">Interpol & Alerts</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
