import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Bug, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 mb-3">
            <Bug className="h-8 w-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to manage your projects and tickets</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="h-5 w-5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="h-5 w-5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:underline font-medium">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;