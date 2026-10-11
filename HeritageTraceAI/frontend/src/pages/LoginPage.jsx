import { Link } from 'react-router-dom';
import { GiIndianPalace } from 'react-icons/gi';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0f0a05]">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-saffron-600/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-heritage-600/20 rounded-full blur-[100px]"></div>

      <div className="glass-card w-full max-w-md relative z-10 p-10">
        <div className="flex flex-col items-center mb-8">
          <GiIndianPalace className="text-6xl text-saffron-500 mb-4" />
          <h1 className="heading-display text-4xl mb-2">HeritageTrace AI</h1>
          <p className="text-heritage-300 text-center">Digital Protection for India's Timeless Legacy</p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-heritage-200 mb-2">Email Address</label>
            <input type="email" placeholder="admin@temple.org" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-heritage-200 mb-2">Password</label>
            <input type="password" placeholder="••••••••" className="input-field" />
          </div>
          
          <Link to="/role-selection" className="block w-full">
            <button className="btn-primary w-full text-lg mt-2">Sign In</button>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
