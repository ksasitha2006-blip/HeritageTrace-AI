/**
 * Loader — A simple animated spinner for loading states.
 */
const Loader = () => {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-heritage-700/30"></div>
        <div className="w-12 h-12 rounded-full border-4 border-t-saffron-400 animate-spin absolute top-0 left-0"></div>
      </div>
    </div>
  );
};

export default Loader;
