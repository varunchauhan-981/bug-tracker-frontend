import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Bug,
  ArrowLeft,
  User,
  Mail,
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  FolderKanban,
  ListChecks,
  LogOut,
  Calendar
} from 'lucide-react';

const NAME_REGEX = /^[a-zA-Z\s]{2,50}$/;

const UserProfile = () => {
  const { user, setUser, logout } = useAuth();

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // User workspace summary state
  const [projectsCount, setProjectsCount] = useState(0);
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  useEffect(() => {
    const fetchUserWorkspaceSummary = async () => {
      try {
        const { data: projects } = await API.get('/projects');
        setProjectsCount(projects.length);

        const ticketRequests = projects.map((proj) =>
          API.get(`/tickets/project/${proj._id}`)
        );
        const ticketResponses = await Promise.all(ticketRequests);

        const allTickets = ticketResponses.flatMap((res, index) =>
          res.data.map((ticket) => ({
            ...ticket,
            projectName: projects[index]?.name || 'Project'
          }))
        );

        const myTickets = allTickets.filter(
          (t) =>
            (t.assignedTo?._id || t.assignedTo) === user?._id
        );
        setAssignedTickets(myTickets);
      } catch (error) {
        // Keep dashboard functional even if summary fetch fails
      } finally {
        setLoadingStats(false);
      }
    };

    if (user?._id) {
      fetchUserWorkspaceSummary();
    }
  }, [user?._id]);

  const handleNameChange = (e) => {
    const value = e.target.value;
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setName(value);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!NAME_REGEX.test(trimmedName)) {
      toast.error('Name must contain only letters (minimum 2 characters)');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const { data } = await API.put('/auth/profile', { name: trimmedName });
      if (setUser) {
        setUser((prev) => ({ ...prev, ...data }));
      }
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        localStorage.setItem('user', JSON.stringify({ ...parsed, ...data }));
      }
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await API.put('/auth/password', {
        currentPassword,
        newPassword
      });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    return fullName
      .split(' ')
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Bug className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                BugTrack<span className="text-indigo-500">Pro</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3.5 py-1.5 rounded-lg text-sm font-medium transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Workspace</span>
            </Link>
            <button
              onClick={logout}
              className="flex items-center space-x-1.5 bg-rose-600/90 hover:bg-rose-600 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium transition"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto w-full px-6 py-8 space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">User Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your personal account details, security settings, and assigned workload
          </p>
        </div>

        {/* Profile Overview Banner */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-indigo-500/25 shrink-0">
              {getInitials(user?.name)}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                <span className="text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-md">
                  {user?.role}
                </span>
              </div>
              <p className="text-sm text-slate-400 flex items-center mt-1">
                <Mail className="h-4 w-4 mr-1.5 text-slate-500" />
                {user?.email}
              </p>
              <p className="text-xs text-slate-500 flex items-center mt-1">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                Active Workspace Member
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-5 py-3">
              <div className="flex items-center text-indigo-400 text-xs font-medium mb-1">
                <FolderKanban className="h-4 w-4 mr-1.5" />
                <span>Projects</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {loadingStats ? '...' : projectsCount}
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-5 py-3">
              <div className="flex items-center text-emerald-400 text-xs font-medium mb-1">
                <ListChecks className="h-4 w-4 mr-1.5" />
                <span>Assigned Issues</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {loadingStats ? '...' : assignedTickets.length}
              </p>
            </div>
          </div>
        </div>

        {/* Account Information & Password Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-1">Personal Information</h3>
            <p className="text-xs text-slate-400 mb-5">
              Update your display name across projects and issue comments
            </p>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={handleNameChange}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-indigo-500 focus:outline-none"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Email Address (Read-only)
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Workspace Role
                </label>
                <div className="relative">
                  <Shield className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    disabled
                    value={user?.role || ''}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isUpdatingProfile ? 'Saving Changes...' : 'Update Profile'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Security / Change Password Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-1">Security & Password</h3>
            <p className="text-xs text-slate-400 mb-5">
              Ensure your account stays secure with a strong password
            </p>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords((prev) => !prev)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-indigo-400"
                  >
                    {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition"
                >
                  {isUpdatingPassword ? 'Updating Password...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Assigned Issues Table */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-1">My Assigned Issues</h3>
          <p className="text-xs text-slate-400 mb-4">
            Tickets currently assigned to you across accessible projects
          </p>

          {loadingStats ? (
            <p className="text-sm text-slate-400 py-4">Loading assigned issues...</p>
          ) : assignedTickets.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No issues are currently assigned to you.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs uppercase text-slate-400">
                    <th className="py-3 px-4">Issue</th>
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-sm">
                  {assignedTickets.map((ticket) => (
                    <tr key={ticket._id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-medium text-white">{ticket.title}</td>
                      <td className="py-3 px-4 text-slate-400">{ticket.projectName}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{ticket.status}</td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/project/${ticket.project}`}
                          className="text-indigo-400 hover:text-indigo-300 text-xs font-medium"
                        >
                          Open Board &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserProfile;