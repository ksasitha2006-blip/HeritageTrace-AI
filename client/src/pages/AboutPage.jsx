import { GiIndianPalace } from 'react-icons/gi';
import {
  HiOutlineLightBulb,
  HiOutlineShieldCheck,
  HiOutlineGlobe,
  HiOutlineSparkles,
  HiOutlineAcademicCap,
} from 'react-icons/hi';
import { MdVerifiedUser, MdFingerprint } from 'react-icons/md';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  const pillars = [
    {
      icon: <MdFingerprint className="text-3xl text-saffron-400" />,
      title: 'Immutable Digital Passport',
      description:
        'Every idol, stone carving, and sacred scripture is catalogued with precise 3D dimensions, metallurgical alloy signatures, archival photographs, and unique registration identifiers.',
    },
    {
      icon: <HiOutlineSparkles className="text-3xl text-amber-400" />,
      title: 'Neural Iconographic Vision',
      description:
        'Deep feature extraction networks engineered specifically for Indian iconography, recognizing mudras, prabhamandala flame contours, and toolmarks resilient to weathering and patina change.',
    },
    {
      icon: <MdVerifiedUser className="text-3xl text-emerald-400" />,
      title: 'ASI Multi-Tier Forensic Verification',
      description:
        'Structured analytical pipeline where senior archaeologists and epigraphists verify XRF spectrometry, Talamana Shastra proportions, and inscriptional paleography before issuing legal authenticity dockets.',
    },
    {
      icon: <HiOutlineGlobe className="text-3xl text-blue-400" />,
      title: 'Interpol & Cross-Border Recovery',
      description:
        'Automated generation of Interpol WOA (Works of Art) notices and standardized evidentiary dossiers complying with the 1970 UNESCO Convention for swift diplomatic and legal repatriation.',
    },
  ];

  return (
    <div className="min-h-screen pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="w-16 h-16 rounded-2xl bg-saffron-500/15 border border-saffron-500/30 flex items-center justify-center mx-auto mb-6 text-saffron-400 shadow-xl shadow-saffron-950/50">
          <GiIndianPalace className="text-4xl" />
        </div>
        <div className="inline-flex items-center gap-2 text-saffron-400 font-mono text-xs uppercase tracking-widest mb-2">
          Cultural Heritage Protection Framework
        </div>
        <h1 className="section-heading mb-4">About HeritageTrace AI</h1>
        <p className="text-heritage-200 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed font-light">
          A sovereign digital infrastructure empowering Indian temple trusts, archaeological authorities, and law enforcement to defend our civilizational treasures from illicit trafficking.
        </p>
      </div>

      {/* Mission Statement */}
      <div className="glass-card p-8 md:p-10 rounded-3xl border border-white/10 mb-10">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 rounded-xl bg-saffron-500/20 text-saffron-400 shrink-0">
            <HiOutlineLightBulb className="text-2xl" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-white mb-2">The Imperative Mission</h2>
            <p className="text-heritage-300 text-sm leading-relaxed mb-4">
              Over the past century, countless sacred sculptures and bronzes were systematically looted from ancient Indian temples, illicitly exported through fraudulent documentation, and dispersed into private auctions worldwide.
            </p>
            <p className="text-heritage-300 text-sm leading-relaxed">
              When law enforcement intercepts an ancient sculpture at a seaport or border customs terminal, proving its exact temple of origin within statutory deadlines is notoriously difficult. <strong className="text-white">HeritageTrace AI</strong> bridges this critical gap by providing instant neural visual matching against consecrated temple archives, empowering immediate legal seizure and repatriation.
            </p>
          </div>
        </div>
      </div>

      {/* The 4 Architectural Pillars */}
      <div className="mb-14">
        <h3 className="section-heading text-center text-2xl sm:text-3xl mb-8">
          The Four Architectural Pillars
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar, idx) => (
            <div key={idx} className="glass-card p-6 border border-white/10 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="mb-4">{pillar.icon}</div>
                <h4 className="font-display font-bold text-lg text-white mb-2">{pillar.title}</h4>
                <p className="text-heritage-300 text-xs sm:text-sm leading-relaxed">{pillar.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legal & Regulatory Framework */}
      <div className="glass-card p-8 rounded-3xl border border-white/10 mb-12">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <HiOutlineShieldCheck className="text-2xl" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-white mb-2">
              Statutory & International Compliance
            </h3>
            <p className="text-heritage-300 text-sm leading-relaxed mb-3">
              HeritageTrace AI dockets and digital signatures are engineered in alignment with:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-heritage-300 font-mono">
              <li>The Antiquities and Art Treasures Act, 1972 (Act No. 52 of 1972)</li>
              <li>Ancient Monuments and Archaeological Sites and Remains Act (AMASR Act)</li>
              <li>1970 UNESCO Convention on the Means of Prohibiting Illicit Import, Export and Transfer</li>
              <li>Interpol Stolen Works of Art (WOA) Standard Data Transmission Schema</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="text-center">
        <Link to="/role-selection" className="btn-primary text-base px-8 py-3.5">
          Enter Operational Hub →
        </Link>
      </div>
    </div>
  );
};

export default AboutPage;
