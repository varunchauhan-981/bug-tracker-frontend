import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bug, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Clear session and redirect user to login screen
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold tracking-tight">
            <Bug className="h-7 w-7 text-indigo-400" />
            <span>BugTrack<span className="text-indigo-400">Pro</span></span>
          </Link>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <UserIcon className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  {user.role}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;