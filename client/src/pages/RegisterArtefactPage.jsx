import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdCloudUpload,
  MdClose,
  MdCheckCircle,
  MdAutoAwesome,
  MdArrowBack,
} from 'react-icons/md';
import toast from 'react-hot-toast';
import { useArtefacts } from '../context/ArtefactContext';

const RegisterArtefactPage = () => {
  const navigate = useNavigate();
  const { addArtefact } = useArtefacts();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'sculpture',
    period: '',
    material: '',
    dimensions: '',
    templeName: 'Brihadeeswara Temple, Thanjavur',
    origin: 'Thanjavur, Tamil Nadu',
    currentLocation: 'Sanctum Sanctorum (Garbhagriha)',
    description: '',
    image: '',
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [registeredItem, setRegisteredItem] = useState(null);

  useEffect(() => () => {
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const categories = [
    'sculpture',
    'painting',
    'manuscript',
    'coin',
    'jewellery',
    'textile',
    'pottery',
    'other',
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Select a valid image file.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image file must be 10MB or smaller.');
        return;
      }
      if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, image: '' }));
    }
  };

  const removeImage = (e) => {
    e.stopPropagation();
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageFile(null);
    setFormData((prev) => ({ ...prev, image: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Quick fill preset for rapid demonstration
  const handleQuickFill = async () => {
    if (imagePreview?.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    try {
    const response = await fetch('/images/nataraja.jpg');
    if (!response.ok) throw new Error(`Could not load sample image (${response.status}).`);
    const sampleImage = await response.blob();
    setFormData({
      name: 'Chola Somaskanda Bronze',
      category: 'sculpture',
      period: '11th Century Chola Dynasty (Rajendra I)',
      material: 'Panchaloha (Sacred Five-Metal Bronze)',
      dimensions: '74 cm × 62 cm × 28 cm',
      templeName: 'Brihadeeswara Temple, Thanjavur',
      origin: 'Thanjavur District, Tamil Nadu',
      currentLocation: 'Inner Bronzes Vault, Tier 2',
      description: 'Bronze icon depicting Shiva seated with Parvati (Uma) and the child Skanda dancing between them. Features exquisite lost-wax cast detailing, lotus pedestal, and sacred sacred thread (yajnopavita).',
      image: '/images/nataraja.jpg',
    });
    setImageFile(new File([sampleImage], 'nataraja.jpg', { type: sampleImage.type || 'image/jpeg' }));
    setImagePreview('/images/nataraja.jpg');
    } catch (error) {
    toast.error(error.message || 'Could not load sample image.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.period) {
      alert('Please fill in at least the Artefact Name and Historical Era.');
      return;
    }
    if (!imageFile) {
      toast.error('Upload an artefact image before registration.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await addArtefact({
        ...formData,
        image: '',
        imageFile,
      });
      setRegisteredItem(created);
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
        navigate('/temple-dashboard');
      }, 2200);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Artefact registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 relative">
      {/* Toast Overlay */}
      {showToast && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50 p-4">
          <div className="bg-[#140e09] border border-emerald-500/40 p-8 rounded-3xl flex flex-col items-center shadow-2xl text-center max-w-md animate-fade-in">
            <MdCheckCircle className="text-6xl text-emerald-400 mb-4 animate-bounce" />
            <h2 className="text-2xl font-display font-bold text-white mb-2">Registration Successful!</h2>
            <p className="text-heritage-300 text-sm mb-4">
              Registered into the National Antiquities Registry under Passport ID:
            </p>
            <div className="bg-black/60 px-4 py-2 rounded-xl text-saffron-400 font-mono font-bold text-lg border border-white/10 mb-4">
              {registeredItem?.id || 'HT-XXXXX'}
            </div>
            <p className="text-heritage-400 text-xs">Redirecting to Temple Vault dashboard...</p>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <button
            onClick={() => navigate('/temple-dashboard')}
            className="text-xs text-heritage-400 hover:text-white flex items-center gap-1 mb-2"
          >
            <MdArrowBack /> Back to Temple Dashboard
          </button>
          <h1 className="section-heading">Register New Artefact</h1>
          <p className="text-heritage-300 text-sm mt-1">
            Create an immutable digital identity with physical attributes and provenance photos.
          </p>
        </div>

        <button
          type="button"
          onClick={handleQuickFill}
          className="btn-secondary text-xs py-2 px-4 flex items-center gap-2 border-saffron-500/30 text-saffron-300 hover:text-white"
        >
          <MdAutoAwesome className="text-base text-saffron-400" /> Auto-Fill Sample Preset
        </button>
      </div>

      <div className="glass-card p-6 sm:p-10 border border-white/10">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Grid Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-heritage-200 mb-2 uppercase tracking-wider">
                Artefact Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field text-sm"
                placeholder="e.g. Bronze Nataraja, Stone Devi"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-heritage-200 mb-2 uppercase tracking-wider">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field text-sm capitalize"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#18110b] text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-heritage-200 mb-2 uppercase tracking-wider">
                Historical Era / Dynasty *
              </label>
              <input
                type="text"
                name="period"
                value={formData.period}
                onChange={handleChange}
                className="input-field text-sm"
                placeholder="e.g. 11th Century Chola, 5th Century Gupta"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-heritage-200 mb-2 uppercase tracking-wider">
                Primary Material
              </label>
              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleChange}
                className="input-field text-sm"
                placeholder="e.g. Panchaloha, Sandstone, Granite"
              />
            </div>
          </div>

          {/* Grid Row 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-heritage-200 mb-2 uppercase tracking-wider">
                Physical Dimensions
              </label>
              <input
                type="text"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleChange}
                className="input-field text-sm"
                placeholder="e.g. 120cm × 80cm × 35cm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-heritage-200 mb-2 uppercase tracking-wider">
                Temple Sanctuary Name
              </label>
              <input
                type="text"
                name="templeName"
                value={formData.templeName}
                onChange={handleChange}
                className="input-field text-sm"
                placeholder="e.g. Brihadeeswara Temple"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-heritage-200 mb-2 uppercase tracking-wider">
                Region / State
              </label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                className="input-field text-sm"
                placeholder="e.g. Thanjavur, Tamil Nadu"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-heritage-200 mb-2 uppercase tracking-wider">
              Physical Location / Vault
            </label>
            <input
              type="text"
              name="currentLocation"
              value={formData.currentLocation}
              onChange={handleChange}
              className="input-field text-sm"
              placeholder="e.g. Garbhagriha, Underground Vault Tier-1"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-heritage-200 mb-2 uppercase tracking-wider">
              Iconographic Description & Distinctive Toolmarks
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="input-field text-sm leading-relaxed"
              placeholder="Describe posture, mudras, attributes held, inscriptions on base, and any identifiable chisel marks or historical repairs..."
            ></textarea>
          </div>

          {/* Image Upload Box */}
          <div>
            <label className="block text-xs font-semibold text-heritage-200 mb-2 uppercase tracking-wider">
              High-Resolution Photographic Dossier
            </label>
            <input
              type="file"
              accept="image/*"
              hidden
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <div
              className="border-2 border-dashed border-white/20 hover:border-saffron-500/60 rounded-2xl p-8 flex flex-col items-center justify-center bg-black/40 hover:bg-black/60 transition-all cursor-pointer relative overflow-hidden"
              onClick={() => !imagePreview && fileInputRef.current.click()}
            >
              {imagePreview ? (
                <div className="relative w-full max-h-72 flex justify-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-72 object-contain rounded-xl border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full transition-colors shadow-lg"
                    title="Remove Photo"
                  >
                    <MdClose className="text-lg" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <MdCloudUpload className="text-5xl text-saffron-500 mx-auto mb-3" />
                  <p className="text-white font-semibold text-sm">
                    Click to select high-resolution archival photo
                  </p>
                  <p className="text-heritage-400 text-xs mt-1">
                    Supports PNG, JPG, or WebP. Captured photos are hashed for cryptographic provenance.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => navigate('/temple-dashboard')}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary text-sm px-8 disabled:opacity-60">
              {isSubmitting ? 'Saving image and indexing...' : 'Register into Digital Ledger'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterArtefactPage;
