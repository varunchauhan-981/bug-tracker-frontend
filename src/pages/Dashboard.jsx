import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Bug,
  Plus,
  FolderKanban,
  Users,
  UserPlus,
  Settings,
  LogOut,
  ArrowRight,
  Clock,
  ShieldCheck,
  X
} from 'lucide-react';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals and form states
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Create project form state
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Invite member form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Developer');
  const [inviting, setInviting] = useState(false);

  const fetchWorkspaceData = async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        API.get('/projects'),
        API.get('/auth/users')
      ]);
      setProjects(projRes.data);
      setTeam(usersRes.data);
    } catch (error) {
      toast.error('Failed to load workspace data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, []);

  const toggleMemberSelection = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim() || !projectDesc.trim()) {
      toast.error('Project name and description are required');
      return;
    }

    try {
      const { data } = await API.post('/projects', {
        name: projectName.trim(),
        description: projectDesc.trim(),
        members: selectedMembers
      });
      setProjects([data, ...projects]);
      setProjectName('');
      setProjectDesc('');
      setSelectedMembers([]);
      setShowProjectForm(false);
      toast.success('Project created successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    const trimmedEmail = inviteEmail.trim();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setInviting(true);
    try {
      const { data } = await API.post('/auth/invite', {
        email: trimmedEmail,
        role: inviteRole
      });
      toast.success(data.message || `Invitation sent to ${trimmedEmail}`);
      setInviteEmail('');
      setInviteRole('Developer');
      setShowInviteModal(false);
      fetchWorkspaceData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Bug className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              BugTrack<span className="text-indigo-500">Pro</span>
            </span>
          </Link>

          <div className="flex items-center space-x-3">
            {(user?.role === 'Admin' || user?.role === 'Project Manager') && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium transition"
              >
                <UserPlus className="h-4 w-4 text-indigo-400" />
                <span>Invite Member</span>
              </button>
            )}

            {/* Direct Link to Dedicated User Dashboard */}
            <Link
              to="/profile"
              title="Open User Dashboard"
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-3 py-1.5 rounded-lg text-sm transition"
            >
              <span className="font-medium text-slate-200">{user?.name}</span>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md">
                {user?.role}
              </span>
              <Settings className="h-4 w-4 text-slate-400 ml-1" />
            </Link>

            <button
              onClick={logout}
              className="flex items-center space-x-1.5 bg-rose-600/90 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Container */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Your Workspace</h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage projects, assign team members, and track sprint issues
            </p>
          </div>

          {(user?.role === 'Admin' || user?.role === 'Project Manager') && (
            <button
              onClick={() => setShowProjectForm((prev) => !prev)}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-lg shadow-indigo-500/20 transition self-start"
            >
              <Plus className="h-4 w-4" />
              <span>New Project</span>
            </button>
          )}
        </div>

        {/* Workspace Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-center space-x-4">
            <div className="bg-indigo-500/15 p-3 rounded-xl text-indigo-400">
              <FolderKanban className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Accessible Projects</p>
              <p className="text-2xl font-bold text-white mt-0.5">{projects.length}</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-center space-x-4">
            <div className="bg-emerald-500/15 p-3 rounded-xl text-emerald-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Workspace Members</p>
              <p className="text-2xl font-bold text-white mt-0.5">{team.length}</p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-center space-x-4">
            <div className="bg-violet-500/15 p-3 rounded-xl text-violet-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Access Level</p>
              <p className="text-lg font-semibold text-white mt-0.5">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Inline Create Project Panel */}
        {showProjectForm && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Create New Project</h2>
              <button
                onClick={() => setShowProjectForm(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Project Name</label>
                  <input
                    type="text"
                    required
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g., Core Platform API"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Description</label>
                  <input
                    type="text"
                    required
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    placeholder="Brief scope of this project"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Assign Team Members (Admin automatically has access to all projects)
                </label>
                <div className="flex flex-wrap gap-2">
                  {team
                    .filter((m) => m._id !== user?._id)
                    .map((member) => {
                      const isSelected = selectedMembers.includes(member._id);
                      return (
                        <button
                          key={member._id}
                          type="button"
                          onClick={() => toggleMemberSelection(member._id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                            isSelected
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                              : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          {member.name} ({member.role})
                        </button>
                      );
                    })}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProjectForm(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-medium transition"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading workspace...</div>
        ) : projects.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
            <FolderKanban className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white">No projects available</h3>
            <p className="text-slate-400 text-sm mt-1">
              {user?.role === 'Developer'
                ? 'You have not been assigned to any projects yet.'
                : 'Create a project to start tracking issues and sprints.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div
                key={proj._id}
                className="bg-slate-900/70 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 flex flex-col justify-between transition group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-indigo-500/15 p-2.5 rounded-xl text-indigo-400">
                      <FolderKanban className="h-5 w-5" />
                    </div>
                    <span className="text-xs text-slate-500 flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {new Date(proj.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition">
                    {proj.name}
                  </h3>
                  <p className="text-slate-400 text-sm mt-2 line-clamp-2">{proj.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center">
                    <Users className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                    {proj.members?.length || 1} members
                  </span>
                  <Link
                    to={`/project/${proj._id}`}
                    className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                  >
                    <span>View Board</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Invite Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Invite a colleague by email to collaborate on your workspace projects.
            </p>
            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Assign Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Developer">Developer</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
                >
                  {inviting ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;