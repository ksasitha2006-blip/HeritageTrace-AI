import { useEffect, useMemo, useState } from 'react';
import {
  MdTimeline,
  MdNotificationsActive,
  MdPublic,
  MdDownload,
  MdWarning,
  MdClose,
  MdCheckCircle,
  MdPersonAdd,
  MdSearch,
  MdBlock,
  MdPeople,
} from 'react-icons/md';
import { HiOutlineSparkles, HiOutlinePrinter, HiOutlineShieldCheck } from 'react-icons/hi';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import toast from 'react-hot-toast';
import { useArtefacts } from '../context/ArtefactContext';

const ADMIN_ROLES = [
  { value: 'temple-admin', label: 'Temple Trust' },
  { value: 'authority-admin', label: 'Central Authority' },
  { value: 'investigator', label: 'Investigator' },
  { value: 'asi-expert', label: 'ASI Expert' },
];
const ACTIVITY_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'temple-admin', label: 'Temple Trust' },
  { value: 'authority-admin', label: 'Central Authority' },
  { value: 'investigator', label: 'Investigator' },
  { value: 'asi-expert', label: 'ASI' },
];
const STATUS_COLORS = ['#34d399', '#fb7185', '#60a5fa', '#fbbf24'];
const INITIAL_ADMIN_USERS = [
  { id: 'USR-1', name: 'Lakshmi Narayan', email: 'lakshmi@brihadeeswara.org', role: 'temple-admin', status: 'Active' },
  { id: 'USR-2', name: 'Arjun Mehta', email: 'arjun.mehta@ncb.gov.in', role: 'authority-admin', status: 'Active' },
  { id: 'USR-3', name: 'Ramesh Kumar', email: 'ramesh.kumar@dri.gov.in', role: 'investigator', status: 'Active' },
  { id: 'USR-4', name: 'Dr. Kavita Sharma', email: 'kavita.sharma@asi.gov.in', role: 'asi-expert', status: 'Active' },
];

const readAdminUsers = () => {
  try {
    const saved = localStorage.getItem('ht_admin_users');
    if (saved) return JSON.parse(saved);
  } catch (error) {
    console.error('Unable to load system users:', error);
  }
  return INITIAL_ADMIN_USERS;
};

const getActivityActor = (activity) => {
  if (activity.actor) return activity.actor;
  if (activity.badge === 'Temple Trust' || activity.badge === 'Temple Registry') return 'temple-admin';
  if (activity.badge === 'Central Authority') return 'authority-admin';
  if (activity.badge === 'ASI Circle' || activity.badge?.startsWith('ASI')) return 'asi-expert';
  if (activity.type === 'seizure' || activity.badge === 'DRI / Customs') return 'investigator';
  return 'authority-admin';
};

const getRoleLabel = (role) => ADMIN_ROLES.find((item) => item.value === role)?.label || role;

const AuthorityAdminDashboard = () => {
  const { artefacts, activities, alerts, issueAlert, addActivity } = useArtefacts();

  const [interpolModal, setInterpolModal] = useState(false);
  const [alertModal, setAlertModal] = useState(false);
  const [addUserModal, setAddUserModal] = useState(false);
  const [adminConfirm, setAdminConfirm] = useState(null);
  const [activityFilter, setActivityFilter] = useState('all');
  const [activitySearch, setActivitySearch] = useState('');
  const [users, setUsers] = useState(readAdminUsers);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'investigator' });
  const [selectedArtefactForInterpol, setSelectedArtefactForInterpol] = useState(
    artefacts.find((a) => a.status === 'missing') || artefacts[0]
  );

  const [newAlertForm, setNewAlertForm] = useState({
    title: '',
    urgency: 'critical',
    region: 'South Maritime Circle (Seaports)',
    description: '',
  });

  const total = artefacts.length;
  const missing = artefacts.filter((a) => a.status === 'missing').length;
  const recovered = artefacts.filter((a) => a.status === 'recovered').length;
  const successRate = total > 0 ? Math.round((recovered / (missing + recovered || 1)) * 100) : 94;
  const filteredActivities = useMemo(() => activities.filter((activity) => {
    const actor = getActivityActor(activity);
    const matchesRole = activityFilter === 'all' || actor === activityFilter;
    const query = activitySearch.trim().toLowerCase();
    const matchesSearch = !query || `${activity.text} ${activity.badge} ${getRoleLabel(actor)}`.toLowerCase().includes(query);
    return matchesRole && matchesSearch;
  }), [activities, activityFilter, activitySearch]);
  const statusChartData = [
    { name: 'Safe', value: artefacts.filter((item) => item.status === 'safe').length },
    { name: 'Missing', value: missing },
    { name: 'Recovered', value: recovered },
    { name: 'Endangered', value: artefacts.filter((item) => item.status === 'endangered').length },
  ].filter((item) => item.value > 0);
  const reportChartData = useMemo(() => {
    const monthBins = Array.from({ length: 6 }, (_, index) => {
      const month = new Date();
      month.setDate(1);
      month.setMonth(month.getMonth() - (5 - index));
      return {
        key: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`,
        month: month.toLocaleDateString('en', { month: 'short' }),
        reports: 0,
      };
    });
    const reports = artefacts.flatMap((item) =>
      (item.statusHistory || [])
        .filter((entry) => entry.status === 'reported_stolen')
        .map((entry) => entry.date)
    );
    reports.forEach((date) => {
      const month = String(date).slice(0, 7);
      const bin = monthBins.find((item) => item.key === month);
      if (bin) bin.reports += 1;
    });
    return monthBins;
  }, [artefacts]);

  useEffect(() => {
    if (!selectedArtefactForInterpol && artefacts.length > 0) {
      setSelectedArtefactForInterpol(artefacts.find((item) => item.status === 'missing') || artefacts[0]);
    }
  }, [artefacts, selectedArtefactForInterpol]);

  useEffect(() => {
    try {
      localStorage.setItem('ht_admin_users', JSON.stringify(users));
    } catch (error) {
      console.error('Unable to save system users:', error);
      toast.error('User changes could not be saved in this browser');
    }
  }, [users]);

  useEffect(() => {
    if (!interpolModal && !alertModal && !addUserModal && !adminConfirm) return undefined;
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape') return;
      setInterpolModal(false);
      setAlertModal(false);
      setAddUserModal(false);
      setAdminConfirm(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [interpolModal, alertModal, addUserModal, adminConfirm]);

  const handleIssueAlert = (e) => {
    e.preventDefault();
    if (!newAlertForm.title || !newAlertForm.description) {
      alert('Please fill out alert title and description.');
      return;
    }

    issueAlert(newAlertForm);
    setAlertModal(false);
    setNewAlertForm({
      title: '',
      urgency: 'critical',
      region: 'South Maritime Circle (Seaports)',
      description: '',
    });
  };

  const handleExportLedger = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(artefacts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `HeritageTrace_National_Ledger_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleAddUser = (event) => {
    event.preventDefault();
    const normalizedEmail = newUser.email.trim().toLowerCase();
    if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      toast.error('A user with this email address already exists');
      return;
    }
    const user = {
      id: `USR-${Date.now()}`,
      name: newUser.name.trim(),
      email: normalizedEmail,
      role: newUser.role,
      status: 'Active',
    };
    setUsers((current) => [user, ...current]);
    addActivity({
      text: `System Admin added ${user.name} (${user.email}) as ${getRoleLabel(user.role)}.`,
      type: 'general',
      badge: 'User Added',
      actor: 'authority-admin',
      action: 'user_added',
    });
    setNewUser({ name: '', email: '', role: 'investigator' });
    setAddUserModal(false);
    toast.success('User added');
  };

  const confirmUserAction = () => {
    if (!adminConfirm) return;
    const { user, type, role } = adminConfirm;
    if (type === 'role') {
      setUsers((current) => current.map((item) =>
        item.id === user.id ? { ...item, role } : item
      ));
      addActivity({
        text: `System Admin changed ${user.name}'s role to ${getRoleLabel(role)}.`,
        type: 'general',
        badge: 'Role Changed',
        actor: 'authority-admin',
        action: 'user_role_changed',
      });
      toast.success('User role updated');
    } else {
      setUsers((current) => current.map((item) =>
        item.id === user.id ? { ...item, status: 'Deactivated' } : item
      ));
      addActivity({
        text: `System Admin deactivated ${user.name} (${user.email}).`,
        type: 'alert',
        badge: 'User Deactivated',
        actor: 'authority-admin',
        action: 'user_deactivated',
      });
      toast.success('User deactivated');
    }
    setAdminConfirm(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-purple-400 font-mono text-xs uppercase tracking-widest mb-1">
            <HiOutlineSparkles /> Ministry of Culture & National Central Bureau (Interpol New Delhi)
          </div>
          <h1 className="section-heading">System Admin Console</h1>
          <p className="text-heritage-300 text-sm mt-1">
            Manage access, review inter-agency activity, and monitor the national demo registry.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportLedger}
            className="btn-secondary text-xs flex items-center gap-2"
          >
            <MdDownload className="text-base text-saffron-400" /> Export National Ledger (JSON)
          </button>
          <button
            onClick={() => setAlertModal(true)}
            className="btn-primary text-xs flex items-center gap-2"
          >
            <MdNotificationsActive className="text-base" /> Broadcast National Alert
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="glass-card border border-white/10">
          <p className="text-heritage-400 text-xs font-mono uppercase mb-1">Total Catalogued</p>
          <p className="font-display text-4xl font-black text-white mb-2">{total}</p>
          <p className="text-xs text-emerald-300 font-medium">Local demo registry</p>
        </div>

        <div className="glass-card border border-rose-500/30">
          <p className="text-rose-400 text-xs font-mono uppercase mb-1">Active Stolen Alerts</p>
          <p className="font-display text-4xl font-black text-rose-400 mb-2">{missing}</p>
          <p className="text-xs text-rose-400 font-medium">Border checkpoints on lookout</p>
        </div>

        <div className="glass-card border border-saffron-500/30">
          <p className="text-saffron-400 text-xs font-mono uppercase mb-1">Repatriated / Recovered</p>
          <p className="font-display text-4xl font-black text-saffron-400 mb-2">{recovered}</p>
          <p className="text-xs text-saffron-400 font-medium">International seizures verified</p>
        </div>

        <div className="glass-card border border-blue-500/30">
          <p className="text-blue-400 text-xs font-mono uppercase mb-1">Recovery Resolution Rate</p>
          <p className="font-display text-4xl font-black text-blue-400 mb-2">{successRate}%</p>
          <p className="text-xs text-heritage-400 font-medium">Interpol Works of Art sync active</p>
        </div>
      </div>

      {/* Analytics */}
      <section aria-labelledby="admin-analytics-heading" className="mb-10">
        <div className="mb-4">
          <h2 id="admin-analytics-heading" className="text-xl font-display font-bold text-white">Registry Analytics</h2>
          <p className="text-sm text-heritage-300 mt-1">Live summaries from the local demonstration registry.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card min-h-[330px]">
            <h3 className="font-display font-semibold text-white mb-4">Artefacts by status</h3>
            {statusChartData.length ? (
              <ResponsiveContainer width="100%" height={255}>
                <PieChart>
                  <Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={82} label>
                    {statusChartData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[['Safe', 'Missing', 'Recovered', 'Endangered'].indexOf(entry.name)]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#140e09', border: '1px solid #59412b', borderRadius: 12, color: '#fff' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-heritage-300 py-16 text-center">No artefact status data available.</p>}
          </div>
          <div className="glass-card min-h-[330px]">
            <h3 className="font-display font-semibold text-white mb-4">Theft reports per month</h3>
            <ResponsiveContainer width="100%" height={255}>
              <BarChart data={reportChartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
                <XAxis dataKey="month" stroke="#c7b8a7" tickLine={false} />
                <YAxis allowDecimals={false} stroke="#c7b8a7" tickLine={false} />
                <Tooltip contentStyle={{ background: '#140e09', border: '1px solid #59412b', borderRadius: 12, color: '#fff' }} />
                <Bar dataKey="reports" name="Reports" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Main Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* National Activity Feed */}
        <div className="lg:col-span-2 glass-card p-6 border border-white/10 rounded-2xl">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <MdTimeline className="text-saffron-400 text-xl" /> National Inter-Agency Audit Ledger
            </h2>
            <span className="text-xs font-mono text-emerald-300">Live Demo Activity</span>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex flex-wrap gap-2" aria-label="Filter activity by role">
              {ACTIVITY_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  aria-pressed={activityFilter === filter.value}
                  onClick={() => setActivityFilter(filter.value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    activityFilter === filter.value
                      ? 'border-saffron-400 bg-saffron-500/20 text-saffron-100'
                      : 'border-white/15 bg-white/5 text-heritage-200 hover:border-saffron-400/60'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <label className="relative block">
              <MdSearch aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-heritage-400" />
              <input
                type="search"
                value={activitySearch}
                onChange={(event) => setActivitySearch(event.target.value)}
                placeholder="Search activity"
                aria-label="Search activity feed"
                className="input-field pl-10 py-2.5 text-sm"
              />
            </label>
          </div>

          <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
            {filteredActivities.map((act) => (
              <div
                key={act.id}
                className="p-3.5 bg-black/40 rounded-xl border border-white/5 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold mt-0.5 ${
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
                  <p className="text-heritage-100 font-medium leading-relaxed">{act.text}</p>
                </div>
                <span className="text-xs text-heritage-300 font-mono shrink-0">{act.time}</span>
              </div>
            ))}
            {filteredActivities.length === 0 && (
              <p className="rounded-xl border border-white/10 bg-black/30 p-6 text-center text-sm text-heritage-300">
                No activity matches these filters.
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="glass-card p-6 border border-white/10 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
              <MdPublic className="text-purple-400 text-xl" /> Command Operations
            </h2>

            <div className="space-y-3">
              <button
                onClick={() => setInterpolModal(true)}
                className="w-full btn-secondary text-xs py-3 justify-start text-left flex items-center gap-2.5 hover:border-saffron-500/50"
              >
                <span className="w-2 h-2 rounded-full bg-saffron-400"></span>
                Generate Interpol Red/Yellow Notice
              </button>

              <button
                onClick={() => setAlertModal(true)}
                className="w-full btn-secondary text-xs py-3 justify-start text-left flex items-center gap-2.5 hover:border-rose-500/50 text-rose-300"
              >
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                Broadcast Nationwide Border Alert
              </button>

              <button
                onClick={handleExportLedger}
                className="w-full btn-secondary text-xs py-3 justify-start text-left flex items-center gap-2.5"
              >
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                Download Sovereign Antiquities Ledger
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-xs text-heritage-400 font-mono">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <p className="text-white font-semibold">NCB Interpol Node</p>
              <span className="rounded-full border border-amber-300/40 bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-100">
                Simulated (demo)
              </span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Demo-only representation of cross-border repatriation workflows. No external agency is connected.
            </p>
          </div>
        </div>
      </div>

      {/* User Management */}
      <section aria-labelledby="user-management-heading" className="glass-card mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 id="user-management-heading" className="text-xl font-display font-bold text-white flex items-center gap-2">
              <MdPeople className="text-saffron-400" /> User Management
            </h2>
            <p className="text-sm text-heritage-300 mt-1">Manage demo workspace accounts and access roles.</p>
          </div>
          <button type="button" className="btn-primary text-xs py-2.5" onClick={() => setAddUserModal(true)}>
            <MdPersonAdd aria-hidden="true" /> Add user
          </button>
        </div>
        <div className="table-scroll rounded-xl border border-white/10">
          <table className="min-w-[760px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-heritage-200">
              <tr>
                <th scope="col" className="px-4 py-3">Name</th>
                <th scope="col" className="px-4 py-3">Email</th>
                <th scope="col" className="px-4 py-3">Role</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => (
                <tr key={user.id} className="text-heritage-100">
                  <td className="px-4 py-3 font-semibold">{user.name}</td>
                  <td className="px-4 py-3 text-heritage-200">{user.email}</td>
                  <td className="px-4 py-3">
                    <label className="sr-only" htmlFor={`role-${user.id}`}>Role for {user.name}</label>
                    <select
                      id={`role-${user.id}`}
                      value={user.role}
                      disabled={user.status !== 'Active'}
                      onChange={(event) => setAdminConfirm({ type: 'role', user, role: event.target.value })}
                      className="rounded-lg border border-white/15 bg-[#140e09] px-2.5 py-2 text-sm text-white disabled:opacity-50"
                    >
                      {ADMIN_ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      user.status === 'Active'
                        ? 'border border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
                        : 'border border-white/15 bg-white/5 text-heritage-300'
                    }`}>
                      <MdCheckCircle aria-hidden="true" /> {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={user.status !== 'Active'}
                      onClick={() => setAdminConfirm({ type: 'deactivate', user })}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/30 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <MdBlock aria-hidden="true" /> Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {addUserModal && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-user-title"
            className="bg-[#140e09] border border-white/20 rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl animate-fade-in"
          >
            <button
              type="button"
              onClick={() => setAddUserModal(false)}
              aria-label="Close add user dialog"
              className="absolute top-4 right-4 text-heritage-300 hover:text-white p-2 rounded-full bg-white/10"
            >
              <MdClose aria-hidden="true" className="text-xl" />
            </button>
            <h2 id="add-user-title" className="font-display font-bold text-xl text-white mb-5">Add workspace user</h2>
            <form className="space-y-4" onSubmit={handleAddUser}>
              <div>
                <label htmlFor="new-user-name" className="block text-sm font-medium text-heritage-100 mb-1.5">Name</label>
                <input
                  id="new-user-name"
                  value={newUser.name}
                  onChange={(event) => setNewUser((user) => ({ ...user, name: event.target.value }))}
                  className="input-field text-sm"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label htmlFor="new-user-email" className="block text-sm font-medium text-heritage-100 mb-1.5">Email</label>
                <input
                  id="new-user-email"
                  type="email"
                  value={newUser.email}
                  onChange={(event) => setNewUser((user) => ({ ...user, email: event.target.value }))}
                  className="input-field text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="new-user-role" className="block text-sm font-medium text-heritage-100 mb-1.5">Role</label>
                <select
                  id="new-user-role"
                  value={newUser.role}
                  onChange={(event) => setNewUser((user) => ({ ...user, role: event.target.value }))}
                  className="input-field text-sm"
                >
                  {ADMIN_ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" className="btn-secondary text-xs py-2.5" onClick={() => setAddUserModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary text-xs py-2.5"><MdPersonAdd aria-hidden="true" /> Add user</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {adminConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-confirm-title"
            className="bg-[#140e09] border border-white/20 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-fade-in"
          >
            <h2 id="admin-confirm-title" className="font-display font-bold text-xl text-white mb-3">
              {adminConfirm.type === 'role' ? 'Confirm role change' : 'Deactivate user?'}
            </h2>
            <p className="text-sm text-heritage-200 mb-6">
              {adminConfirm.type === 'role'
                ? `Change ${adminConfirm.user.name}'s role to ${getRoleLabel(adminConfirm.role)}?`
                : `${adminConfirm.user.name} will no longer have an active workspace account.`}
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" className="btn-secondary text-xs py-2.5" onClick={() => setAdminConfirm(null)}>Cancel</button>
              <button type="button" className="btn-danger text-xs py-2.5" onClick={confirmUserAction}>
                {adminConfirm.type === 'role' ? 'Confirm change' : 'Deactivate user'}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Interpol Notice Generator Modal */}
      {interpolModal && (
        <div role="dialog" aria-modal="true" aria-labelledby="interpol-modal-title" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#120a06] border-2 border-rose-500/60 rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl max-h-[92vh] overflow-y-auto animate-fade-in">
            <button
              onClick={() => setInterpolModal(false)}
              className="absolute top-5 right-5 text-heritage-400 hover:text-white p-2 rounded-full bg-white/10"
            >
              <MdClose className="text-2xl" />
            </button>

            <div className="border border-rose-500/30 p-6 rounded-2xl bg-black/40">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div>
                  <span className="bg-rose-600 text-white font-mono font-bold text-[10px] px-2.5 py-0.5 rounded uppercase">
                    INTERPOL NOTICE • WORKS OF ART
                  </span>
                  <h3 id="interpol-modal-title" className="font-display font-black text-2xl text-white mt-1">
                    INTERNATIONAL LOOKOUT NOTICE
                  </h3>
                </div>
                <div className="text-right font-mono text-xs text-heritage-400">
                  <p>Ref: <strong className="text-white">INT-WOA-2026-904</strong></p>
                  <p>Country: <strong className="text-saffron-400">INDIA (NCB New Delhi)</strong></p>
                </div>
              </div>

              {/* Selector */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-heritage-300 mb-1">
                  Select Stolen Artefact Dossier:
                </label>
                <select
                  value={selectedArtefactForInterpol?.id}
                  onChange={(e) => {
                    const found = artefacts.find((a) => a.id === e.target.value);
                    if (found) setSelectedArtefactForInterpol(found);
                  }}
                  className="input-field text-xs"
                >
                  {artefacts.map((art) => (
                    <option key={art.id} value={art.id} className="bg-[#18110b]">
                      {art.id} • {art.name} ({art.status.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {selectedArtefactForInterpol && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-black/60 p-4 rounded-xl border border-white/10 mb-6">
                  <div className="sm:col-span-1 rounded-xl overflow-hidden aspect-square">
                    <img
                      src={selectedArtefactForInterpol.image}
                      alt={`Notice artefact: ${selectedArtefactForInterpol.name}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5 text-xs text-heritage-300">
                    <p><strong className="text-white">Name:</strong> {selectedArtefactForInterpol.name}</p>
                    <p><strong className="text-white">Era:</strong> {selectedArtefactForInterpol.period}</p>
                    <p><strong className="text-white">Material:</strong> {selectedArtefactForInterpol.material}</p>
                    <p><strong className="text-white">Dimensions:</strong> {selectedArtefactForInterpol.dimensions}</p>
                    <p><strong className="text-white">Origin Sanctuary:</strong> {selectedArtefactForInterpol.origin}</p>
                    <p className="text-rose-400 font-mono"><strong>Legal Action:</strong> Immediate seizure upon border detection.</p>
                  </div>
                </div>
              )}

              <p className="text-[11px] text-heritage-400 leading-relaxed mb-6 font-mono">
                Transmitted automatically to all 196 Interpol member countries, World Customs Organization (WCO), and Art Loss Register (ALR).
              </p>

              <div className="flex justify-between gap-3">
                <button
                  onClick={() => setInterpolModal(false)}
                  className="btn-secondary text-xs flex-1 py-2.5"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="btn-primary text-xs flex-1 py-2.5 flex items-center justify-center gap-2"
                >
                  <HiOutlinePrinter className="text-base" /> Print Official Interpol Notice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Alert Modal */}
      {alertModal && (
        <div role="dialog" aria-modal="true" aria-labelledby="broadcast-alert-title" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#140e09] border border-rose-500/50 rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl animate-fade-in">
            <button
              onClick={() => setAlertModal(false)}
              className="absolute top-5 right-5 text-heritage-400 hover:text-white p-2 rounded-full bg-white/10"
            >
              <MdClose className="text-2xl" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-2xl">
                <MdNotificationsActive />
              </div>
              <div>
                <h3 id="broadcast-alert-title" className="font-display font-bold text-xl text-white">Broadcast National Alert</h3>
                <p className="text-xs text-heritage-400">Instantly notify all border and customs posts</p>
              </div>
            </div>

            <form onSubmit={handleIssueAlert} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-heritage-200 mb-1.5 uppercase">
                  Alert Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Outbound Chola Bronze Attempt at Seaport"
                  value={newAlertForm.title}
                  onChange={(e) => setNewAlertForm({ ...newAlertForm, title: e.target.value })}
                  required
                  className="input-field text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-heritage-200 mb-1.5 uppercase">
                    Urgency
                  </label>
                  <select
                    value={newAlertForm.urgency}
                    onChange={(e) => setNewAlertForm({ ...newAlertForm, urgency: e.target.value })}
                    className="input-field text-xs uppercase"
                  >
                    <option value="critical" className="bg-[#18110b]">Critical (Red)</option>
                    <option value="high" className="bg-[#18110b]">High (Orange)</option>
                    <option value="medium" className="bg-[#18110b]">Medium (Yellow)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-heritage-200 mb-1.5 uppercase">
                    Target Region
                  </label>
                  <input
                    type="text"
                    value={newAlertForm.region}
                    onChange={(e) => setNewAlertForm({ ...newAlertForm, region: e.target.value })}
                    className="input-field text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-heritage-200 mb-1.5 uppercase">
                  Alert Instructions & Relic Details *
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe suspect container IDs, flight sectors, or physical attributes..."
                  value={newAlertForm.description}
                  onChange={(e) => setNewAlertForm({ ...newAlertForm, description: e.target.value })}
                  required
                  className="input-field text-xs leading-relaxed"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setAlertModal(false)}
                  className="btn-secondary text-xs py-2.5 px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-danger text-xs py-2.5 px-6 flex items-center gap-1.5"
                >
                  <MdWarning /> Broadcast Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityAdminDashboard;
