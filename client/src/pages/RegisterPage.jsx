import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlinePhotograph, HiOutlineCheckCircle } from 'react-icons/hi';
import { createArtefact } from '../services/api';

/**
 * RegisterPage — Form to register a new heritage artefact.
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    origin: '',
    period: '',
    category: 'sculpture',
    status: 'safe',
    material: '',
    dimensions: '',
    currentLocation: '',
    imageUrl: '',
  });

  const categories = ['sculpture', 'painting', 'manuscript', 'coin', 'jewellery', 'textile', 'pottery', 'other'];
  const statuses = ['safe', 'missing', 'endangered', 'recovered'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await createArtefact(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/artefacts');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message || 'Failed to register artefact. Make sure the server is running.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
        <div className="glass-card p-12 text-center max-w-md animate-slide-up">
          <HiOutlineCheckCircle className="text-5xl text-emerald-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-heritage-100 mb-2">
            Artefact Registered!
          </h2>
          <p className="text-heritage-400">
            Redirecting to the gallery...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="section-heading mb-2">Register Artefact</h1>
          <p className="text-heritage-400">
            Fill in the details below to create a digital identity for a heritage artefact.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="glass-card p-4 mb-6 border-red-500/30 bg-red-500/5">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-heritage-300 text-sm font-medium mb-2">
              Artefact Name <span className="text-saffron-400">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="e.g., Chola Bronze Nataraja"
              className="input-field"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-heritage-300 text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Provide a detailed description of the artefact..."
              className="input-field resize-none"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Two-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Origin */}
            <div>
              <label htmlFor="origin" className="block text-heritage-300 text-sm font-medium mb-2">
                Place of Origin
              </label>
              <input
                type="text"
                id="origin"
                name="origin"
                placeholder="e.g., Tamil Nadu, India"
                className="input-field"
                value={formData.origin}
                onChange={handleChange}
              />
            </div>

            {/* Period */}
            <div>
              <label htmlFor="period" className="block text-heritage-300 text-sm font-medium mb-2">
                Historical Period
              </label>
              <input
                type="text"
                id="period"
                name="period"
                placeholder="e.g., 11th Century CE"
                className="input-field"
                value={formData.period}
                onChange={handleChange}
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-heritage-300 text-sm font-medium mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="input-field appearance-none cursor-pointer"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-heritage-900 text-heritage-100">
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-heritage-300 text-sm font-medium mb-2">
                Current Status
              </label>
              <select
                id="status"
                name="status"
                className="input-field appearance-none cursor-pointer"
                value={formData.status}
                onChange={handleChange}
              >
                {statuses.map((s) => (
                  <option key={s} value={s} className="bg-heritage-900 text-heritage-100">
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Material */}
            <div>
              <label htmlFor="material" className="block text-heritage-300 text-sm font-medium mb-2">
                Material
              </label>
              <input
                type="text"
                id="material"
                name="material"
                placeholder="e.g., Bronze, Sandstone"
                className="input-field"
                value={formData.material}
                onChange={handleChange}
              />
            </div>

            {/* Dimensions */}
            <div>
              <label htmlFor="dimensions" className="block text-heritage-300 text-sm font-medium mb-2">
                Dimensions
              </label>
              <input
                type="text"
                id="dimensions"
                name="dimensions"
                placeholder="e.g., 30cm x 15cm x 10cm"
                className="input-field"
                value={formData.dimensions}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Current Location */}
          <div>
            <label htmlFor="currentLocation" className="block text-heritage-300 text-sm font-medium mb-2">
              Current Location
            </label>
            <input
              type="text"
              id="currentLocation"
              name="currentLocation"
              placeholder="e.g., National Museum, New Delhi"
              className="input-field"
              value={formData.currentLocation}
              onChange={handleChange}
            />
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="imageUrl" className="block text-heritage-300 text-sm font-medium mb-2">
              Image URL
            </label>
            <div className="relative">
              <HiOutlinePhotograph className="absolute left-3 top-1/2 -translate-y-1/2 text-heritage-500" />
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                required
                placeholder="https://example.com/image.jpg"
                className="input-field pl-10"
                value={formData.imageUrl}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full text-center"
              id="submit-artefact"
            >
              {submitting ? 'Registering...' : 'Register Artefact'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
