import { useRef, useState } from 'react';
import { MdCloudUpload, MdClose } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const UploadRecoveredArtefactPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({ location: '', date: '', notes: '' });

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const removeImage = (event) => {
    event.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!imageFile) {
      alert('Please upload at least one image of the recovered item for AI analysis.');
      return;
    }

    navigate('/search-results', {
      state: {
        imageFile,
        imagePreview,
        ...formData
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="heading-display text-3xl mb-2">Log Recovered Artefact</h1>
        <p className="text-heritage-300">Submit seized or recovered items for analysis and matching.</p>
      </div>

      <div className="glass-card">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-heritage-200 mb-2">Images of Seized Item (Front, Back, Markings)</label>
            <input
              type="file"
              accept="image/*"
              hidden
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <div
              className="border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center bg-black/20 hover:bg-black/40 transition-colors cursor-pointer relative overflow-hidden"
              onClick={() => !imagePreview && fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="relative w-full h-48">
                  <img src={imagePreview} alt="Uploaded artefact preview" className="w-full h-full object-contain rounded-lg" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors"
                    aria-label="Remove uploaded image"
                  >
                    <MdClose className="text-xl" />
                  </button>
                </div>
              ) : (
                <>
                  <MdCloudUpload className="text-4xl text-saffron-500 mb-2" />
                  <p className="text-heritage-300 font-medium">Upload photos for AI matching</p>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-heritage-200 mb-2">Recovery Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className="input-field" placeholder="e.g. Customs Checkpoint, Airport" />
            </div>
            <div>
              <label className="block text-sm font-medium text-heritage-200 mb-2">Date of Recovery</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-heritage-200 mb-2">Initial Observations / Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows="4" className="input-field" placeholder="Condition, suspected origin, any identifiable marks..."></textarea>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
            <button type="button" onClick={() => navigate('/investigator-dashboard')} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Submit for AI Analysis</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadRecoveredArtefactPage;
