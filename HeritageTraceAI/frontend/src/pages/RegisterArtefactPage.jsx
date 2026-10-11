import { MdCloudUpload } from 'react-icons/md';

const RegisterArtefactPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="heading-display text-3xl mb-2">Register New Artefact</h1>
        <p className="text-heritage-300">Add a new artefact to the temple's registry with detailed metadata.</p>
      </div>

      <div className="glass-card">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-heritage-200 mb-2">Artefact Name</label>
              <input type="text" className="input-field" placeholder="e.g. Bronze Nataraja" />
            </div>
            <div>
              <label className="block text-sm font-medium text-heritage-200 mb-2">Historical Period</label>
              <input type="text" className="input-field" placeholder="e.g. 11th Century Chola" />
            </div>
            <div>
              <label className="block text-sm font-medium text-heritage-200 mb-2">Material</label>
              <input type="text" className="input-field" placeholder="e.g. Bronze, Sandstone" />
            </div>
            <div>
              <label className="block text-sm font-medium text-heritage-200 mb-2">Dimensions</label>
              <input type="text" className="input-field" placeholder="e.g. 120cm x 80cm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-heritage-200 mb-2">Detailed Description</label>
            <textarea rows="4" className="input-field" placeholder="Describe the artefact's unique features, markings, and condition..."></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-heritage-200 mb-2">Upload Images</label>
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center bg-black/20 hover:bg-black/40 transition-colors cursor-pointer">
              <MdCloudUpload className="text-4xl text-saffron-500 mb-2" />
              <p className="text-heritage-300 font-medium">Click to upload or drag and drop</p>
              <p className="text-heritage-400 text-sm mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
            <button className="btn-secondary">Cancel</button>
            <button className="btn-primary">Register Artefact</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterArtefactPage;
