const DEMO_ARTEFACTS = [
  {
    id: '1',
    digitalId: 'HT-49281',
    name: 'Bronze Nataraja',
    period: '11th Century Chola Dynasty',
    category: 'sculpture',
    material: 'Panchaloha (Five-Metal Sacred Bronze)',
    dimensions: '122 cm × 94 cm × 32 cm',
    status: 'missing',
    origin: 'Brihadeeswara Temple, Thanjavur, Tamil Nadu',
    currentLocation: 'Stolen in 2022 — Flagged at Chennai Port customs',
    imageUrl: '/images/nataraja.jpg',
    description: 'Depicts Lord Shiva as the cosmic dancer Nataraja, framed within a flaming halo (prabhamandala), holding the damaru and agni, crushing Apasmara purusha underfoot. Stolen in June 2022.',
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-03-12T14:10:00.000Z',
  },
  {
    id: '2',
    digitalId: 'HT-38104',
    name: 'Standing Vishnu Idol',
    period: '5th Century Gupta Empire',
    category: 'sculpture',
    material: 'Black Chlorite Sandstone',
    dimensions: '88 cm × 42 cm × 20 cm',
    status: 'safe',
    origin: 'Vidisha Region, Madhya Pradesh',
    currentLocation: 'ASI Protected Vault, Gwalior',
    imageUrl: '/images/vishnu.jpg',
    description: 'Four-armed standing Vishnu holding the conch (Shankha), discus (Chakra), mace (Gada), and lotus (Padma). Employs classical Gupta aesthetic with transparent drapery and refined serenity.',
    createdAt: '2024-01-20T09:00:00.000Z',
    updatedAt: '2024-02-21T11:05:00.000Z',
  },
  {
    id: '3',
    digitalId: 'HT-52119',
    name: 'Shiva Parvati (Uma-Maheshvara)',
    period: '10th Century Chandela Dynasty',
    category: 'sculpture',
    material: 'Buff Sandstone',
    dimensions: '95 cm × 60 cm × 25 cm',
    status: 'recovered',
    origin: 'Khajuraho, Madhya Pradesh',
    currentLocation: 'National Museum, New Delhi (Recovered via Interpol)',
    imageUrl: '/images/shiva_parvati.jpg',
    description: 'Exquisitely carved stele of Uma-Maheshvara seated in lalitasana on Mount Kailasha with Nandi bull below. Seized in London auction and repatriated by ASI in 2023.',
    createdAt: '2024-02-01T07:30:00.000Z',
    updatedAt: '2024-04-10T16:40:00.000Z',
  },
  {
    id: '4',
    digitalId: 'HT-19042',
    name: 'Sarnath Preaching Buddha',
    period: '5th Century CE Gupta Period',
    category: 'sculpture',
    material: 'Chunar Sandstone',
    dimensions: '157 cm × 86 cm × 30 cm',
    status: 'safe',
    origin: 'Sarnath, Varanasi, Uttar Pradesh',
    currentLocation: 'Sarnath Archaeological Museum, ASI',
    imageUrl: '/images/buddha_sarnath.jpg',
    description: 'Masterpiece of Gupta Buddhist art. Depicts the Buddha turning the Wheel of Dharma (Dharmachakra Pravartana Mudra) with the deer park attendants below and an ornate halo with gandharvas.',
    createdAt: '2024-02-20T12:15:00.000Z',
    updatedAt: '2024-03-14T08:45:00.000Z',
  },
  {
    id: '5',
    digitalId: 'HT-60477',
    name: 'Konark Sun Chariot Wheel',
    period: '13th Century Eastern Ganga Dynasty',
    category: 'sculpture',
    material: 'Khondalite Stone',
    dimensions: '180 cm × 180 cm × 45 cm',
    status: 'endangered',
    origin: 'Konark, Puri District, Odisha',
    currentLocation: 'Konark Sun Temple Perimeter, Odisha',
    imageUrl: '/images/konark_wheel.jpg',
    description: 'Colossal stone wheel acting as an astronomical sundial. Features 8 broad spokes and 8 slender spokes carved with celestial nymphs, auspicious beasts, and intricate scrollwork. Under high conservation monitoring.',
    createdAt: '2024-03-08T14:00:00.000Z',
    updatedAt: '2024-05-05T09:55:00.000Z',
  },
  {
    id: 'HT-39266',
    digitalId: 'HT-39266',
    name: 'Shiva Parvati (Uma-Maheshvara)',
    category: 'sculpture',
    status: 'safe',
    imageUrl: '/images/shiva_parvati.jpg',
    description: 'Stone relief depicting Shiva seated with Parvati in the Uma-Maheshvara form.',
    createdAt: '2026-10-07T00:00:00.000Z',
    updatedAt: '2026-10-07T00:00:00.000Z',
  },
  {
    id: 'HT-11767',
    digitalId: 'HT-11767',
    name: 'Murugan Idol',
    category: 'sculpture',
    status: 'safe',
    origin: 'Tamil Nadu',
    period: 'Chola-period devotional sculpture',
    material: 'Bronze',
    imageUrl: '/images/murugan_idol.jpg',
    description: 'Bronze image of Murugan (Skanda) standing with the Vel spear and a peacock mount.',
    createdAt: '2026-10-07T00:00:00.000Z',
    updatedAt: '2026-10-08T00:00:00.000Z',
  },
  {
    id: 'HT-37049',
    digitalId: 'HT-37049',
    name: 'Ganesh Idol',
    category: 'sculpture',
    status: 'safe',
    origin: 'Tamil Nadu',
    period: 'Chola-period devotional sculpture',
    material: 'Bronze',
    imageUrl: '/images/ganesh_idol.jpg',
    description: 'Bronze image of Ganesha seated with the characteristic elephant head, curved trunk, and four arms.',
    createdAt: '2026-10-07T00:00:00.000Z',
    updatedAt: '2026-10-08T00:00:00.000Z',
  },
];

const getDemoArtefacts = () =>
  DEMO_ARTEFACTS.map((artefact) => ({
    ...artefact,
    id: artefact.digitalId || artefact.id,
    _id: artefact.digitalId || artefact.id,
  }));

const filterDemoArtefacts = (artefacts, { status, category, search, limit, sort } = {}) => {
  let filtered = [...artefacts];

  if (status) {
    filtered = filtered.filter((item) => item.status === status);
  }

  if (category) {
    filtered = filtered.filter((item) => item.category === category);
  }

  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter((item) =>
      [item.name, item.description, item.origin].some((value) =>
        String(value || '').toLowerCase().includes(term)
      )
    );
  }

  if (sort) {
    const direction = sort.startsWith('-') ? -1 : 1;
    const field = sort.replace(/^-/, '');

    filtered.sort((a, b) => {
      const left = a[field] ?? '';
      const right = b[field] ?? '';
      if (typeof left === 'string' && typeof right === 'string') {
        return left.localeCompare(right) * direction;
      }
      return ((left > right) ? 1 : (left < right ? -1 : 0)) * direction;
    });
  }

  if (limit) {
    const parsedLimit = Number.parseInt(limit, 10);
    if (!Number.isNaN(parsedLimit)) {
      filtered = filtered.slice(0, parsedLimit);
    }
  }

  return filtered;
};

const getDemoDashboardStats = () => {
  const artefacts = getDemoArtefacts();

  return {
    total: artefacts.length,
    safe: artefacts.filter((item) => item.status === 'safe').length,
    missing: artefacts.filter((item) => item.status === 'missing').length,
    endangered: artefacts.filter((item) => item.status === 'endangered').length,
    recovered: artefacts.filter((item) => item.status === 'recovered').length,
  };
};

module.exports = {
  DEMO_ARTEFACTS,
  getDemoArtefacts,
  filterDemoArtefacts,
  getDemoDashboardStats,
};
