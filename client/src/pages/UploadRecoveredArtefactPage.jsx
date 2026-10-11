import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdCloudUpload,
  MdClose,
  MdAutoAwesome,
  MdArrowBack,
  MdSecurity,
} from 'react-icons/md';
import toast from 'react-hot-toast';
import { useArtefacts } from '../context/ArtefactContext';

export default function UploadRecoveredArtefactPage() {
  const navigate = useNavigate();
  const { findMatches } = useArtefacts();
  const fileInputRef = useRef(null);

  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    location: 'Chennai Seaport Customs Terminal 3',
    agency: 'Directorate of Revenue Intelligence (DRI) & Customs',
    officer: 'Inspector Ramesh Kumar (ID: DRI-CH-882)',
    date: new Date().toISOString().split('T')[0],
    notes: 'Intercepted in wooden crate declared as "Modern Brass Handicrafts" bound for overseas transit. Visual inspection indicates genuine Chola antique bronze.',
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be under 10MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are accepted');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Quick Preset for rapid demo
  const handleLoadSample = () => {
    setImagePreview('/images/nataraja.jpg');
    setFormData({
      location: 'Chennai Seaport Customs Terminal 3, Outbound Bay 14',
      agency: 'Directorate of Revenue Intelligence (DRI) & Customs',
      officer: 'Inspector Ramesh Kumar (ID: DRI-CH-882)',
      date: new Date().toISOString().split('T')[0],
      notes: 'Confiscated during routine export container X-ray scan. Suspected stolen temple idol disguised as handicraft. High similarity with Tamil Nadu Idol Wing bulletin #492/2022.',
    });
    toast.success('Sample seizure case loaded');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imagePreview) {
      toast.error('Please upload or load a sample image of the recovered artefact for AI analysis.');
      return;
    }

    navigate('/search-results', {
      state: {
        imagePreview,
        ...formData,
      },
    });
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <button
            onClick={() => navigate('/investigator-dashboard')}
            className="text-xs text-heritage-400 hover:text-white flex items-center gap-1 mb-2"
          >
            <MdArrowBack /> Back to Investigator Portal
          </button>
          <h1 className="section-heading">Log Confiscated Contraband</h1>
          <p className="text-heritage-300 text-sm mt-1">
            Provide seizure details and photograph to run neural AI visual feature matching.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSample}
          className="btn-secondary text-xs py-2 px-4 flex items-center gap-2 border-saffron-500/30 text-saffron-300 hover:text-white"
        >
          <MdAutoAwesome className="text-base text-saffron-400" /> Load Sample Seizure Case
        </button>
      </div>

      <div className="glass-card p-6 sm:p-10 border border-white/10 rounded-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Box */}
          <div>
            <label className="block text-xs font-semibold text-heritage-200 mb-2 uppercase tracking-wider">
              Confiscated Artefact Photograph *
            </label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />

            <div
              onClick={() => !imagePreview && fileInputRef.current?.click()}
              onKeyDown={(event) => {
                if (!imagePreview && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={imagePreview ? -1 : 0}
              aria-label={imagePreview ? 'Uploaded seizure photograph preview' : 'Choose seizure photograph'}
              className="border-2 border-dashed border-white/20 hover:border-saffron-500/60 rounded-2xl p-6 sm:p-8 text-center cursor-pointer relative bg-black/40 hover:bg-black/60 transition-all flex flex-col items-center justify-center min-h-[220px]"
            >
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Recovered Artefact Preview"
                    className="max-h-64 rounded-xl mx-auto object-cover border border-white/15 shadow-xl"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagePreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute -top-3 -right-3 bg-rose-600 hover:bg-rose-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg"
                  >
                    <MdClose />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4">
                  <MdCloudUpload className="text-5xl text-saffron-500 mb-3" />
                  <p className="text-sm font-semibold text-white">
                    Click to select seizure photograph or drop file here
                  </p>
                  <p className="text-xs text-heritage-400 mt-1">
                    Accepts clear frontal, side, or base detail images (max 10MB).
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-heritage-200 mb-1.5 uppercase tracking-wider">
                Recovery / Seizure Location *
              </label>
              <input
                type="text"
                name="location"
                placeholder="e.g. Chennai Seaport, IGI Airport Cargo"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-heritage-200 mb-1.5 uppercase tracking-wider">
                Date of Seizure *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="input-field text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-heritage-200 mb-1.5 uppercase tracking-wider">
                Enforcement Agency
              </label>
              <input
                type="text"
                name="agency"
                value={formData.agency}
                onChange={handleInputChange}
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-heritage-200 mb-1.5 uppercase tracking-wider">
                Seizing Officer / Lead Investigator
              </label>
              <input
                type="text"
                name="officer"
                value={formData.officer}
                onChange={handleInputChange}
                className="input-field text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-heritage-200 mb-1.5 uppercase tracking-wider">
              Initial Observations & Packaging Notes
            </label>
            <textarea
              name="notes"
              rows="3"
              placeholder="Declared shipping description, physical condition, missing limbs, or patina signs..."
              value={formData.notes}
              onChange={handleInputChange}
              className="input-field text-sm leading-relaxed"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => navigate('/investigator-dashboard')}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary text-sm px-8"
            >
              <MdSecurity className="text-lg" /> Run AI Neural Match
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}