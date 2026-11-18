import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Bug, Lock, Mail, User, Shield } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Developer');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Handle user registration form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(name, email, password, role);
      toast.success('Account created successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
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
          <h1 className="text-2xl font-bold text-white">Create an Account</h1>
          <p className="text-slate-400 text-sm mt-1">Join your team workspace on BugTrackPro</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="h-5 w-5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Varun Chauhan"
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="h-5 w-5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="varun@example.com"
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password (min 6 chars)</label>
            <div className="relative">
              <Lock className="h-5 w-5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
            <div className="relative">
              <Shield className="h-5 w-5 text-slate-500 absolute left-3 top-2.5" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Developer">Developer</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition"
          >
            {submitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;