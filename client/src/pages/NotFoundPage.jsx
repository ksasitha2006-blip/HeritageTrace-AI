import { Link } from 'react-router-dom';
import { MdArrowBack, MdSearchOff } from 'react-icons/md';

export default function NotFoundPage() {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-24 text-center">
      <MdSearchOff aria-hidden="true" className="mx-auto text-6xl text-saffron-400 mb-5" />
      <p className="text-sm font-mono text-saffron-300 uppercase tracking-widest mb-2">Error 404</p>
      <h1 className="section-heading mb-4">Page not found</h1>
      <p className="text-heritage-300 mb-8">
        This page may have moved, or the address may be incorrect.
      </p>
      <Link to="/" className="btn-primary">
        <MdArrowBack aria-hidden="true" /> Return to HeritageTrace
      </Link>
    </section>
  );
}
