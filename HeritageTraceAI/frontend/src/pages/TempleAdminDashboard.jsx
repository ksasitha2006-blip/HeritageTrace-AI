import { Link } from 'react-router-dom';
import { MdAdd, MdMuseum } from 'react-icons/md';

const dummyArtefacts = [
  { id: 1, name: 'Bronze Nataraja', period: 'Chola Dynasty', status: 'Safe', image: 'https://images.unsplash.com/photo-1621528657613-2895697a2cb4?q=80&w=300&h=300&fit=crop' },
  { id: 2, name: 'Vishnu Idol', period: 'Gupta Empire', status: 'Missing', image: 'https://images.unsplash.com/photo-1582236814674-3294317f2dc1?q=80&w=300&h=300&fit=crop' },
];

const TempleAdminDashboard = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="heading-display text-4xl mb-2">Temple Administration</h1>
          <p className="text-heritage-300">Manage and monitor your temple's registered artefacts.</p>
        </div>
        <Link to="/register-artefact">
          <button className="btn-primary flex items-center gap-2">
            <MdAdd className="text-xl" /> Register New Artefact
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card flex items-center gap-4">
          <div className="p-4 bg-saffron-500/20 rounded-full text-saffron-400">
            <MdMuseum className="text-3xl" />
          </div>
          <div>
            <p className="text-heritage-400 text-sm">Total Artefacts</p>
            <p className="text-3xl font-bold text-white">124</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-4">
          <div className="p-4 bg-green-500/20 rounded-full text-green-400">
            <MdMuseum className="text-3xl" />
          </div>
          <div>
            <p className="text-heritage-400 text-sm">Safe & Secure</p>
            <p className="text-3xl font-bold text-white">120</p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-4">
          <div className="p-4 bg-red-500/20 rounded-full text-red-400">
            <MdMuseum className="text-3xl" />
          </div>
          <div>
            <p className="text-heritage-400 text-sm">Reported Missing</p>
            <p className="text-3xl font-bold text-white">4</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-display font-semibold mb-6 border-b border-white/10 pb-4">Recent Artefacts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dummyArtefacts.map((item) => (
          <div key={item.id} className="glass-card p-4 hover:bg-white/10 transition-colors">
            <img src={item.image} alt={item.name} className="w-full h-48 object-cover rounded-xl mb-4" />
            <h3 className="font-semibold text-lg text-white mb-1">{item.name}</h3>
            <p className="text-heritage-400 text-sm mb-3">{item.period}</p>
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${item.status === 'Safe' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TempleAdminDashboard;
