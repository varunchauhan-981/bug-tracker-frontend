import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FolderKanban, Plus, Clock, Users } from 'lucide-react';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Create project form state
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchProjects = async () => {
    try {
      const { data } = await API.get('/projects');
      setProjects(data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/projects', { name, description });
      setProjects([data, ...projects]);
      setShowForm(false);
      setName('');
      setDescription('');
      toast.success('Project created successfully');
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-950 text-indigo-400">Loading workspace...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Your Workspace</h1>
            <p className="text-slate-400 mt-1">Manage all your team projects in one place</p>
          </div>
          
          {(user?.role === 'Admin' || user?.role === 'Project Manager') && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              <Plus className="h-5 w-5" />
              <span>New Project</span>
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleCreateProject} className="bg-slate-900 border border-slate-800 p-6 rounded-xl mb-8 animate-fade-in-down">
            <h2 className="text-xl font-semibold text-white mb-4">Create New Project</h2>
            <div className="grid gap-4 md:grid-cols-2 mb-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-400 hover:text-white transition">Cancel</button>
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition">Create Project</button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project._id} to={`/project/${project._id}`} className="block group">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-indigo-500/20 p-3 rounded-lg border border-indigo-500/30 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition">
                    <FolderKanban className="h-6 w-6" />
                  </div>
                  <span className="text-xs text-slate-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{project.name}</h3>
                <p className="text-slate-400 text-sm flex-grow line-clamp-2 mb-4">{project.description}</p>
                <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-auto">
                  <div className="flex items-center text-slate-500 text-sm">
                    <Users className="h-4 w-4 mr-1.5" />
                    <span>{project.members.length} members</span>
                  </div>
                  <span className="text-indigo-400 text-sm font-medium group-hover:underline">View Board &rarr;</span>
                </div>
              </div>
            </Link>
          ))}
          
          {projects.length === 0 && !loading && (
            <div className="col-span-full bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
              <FolderKanban className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No projects yet</h3>
              <p className="text-slate-400">Create a project to start tracking bugs and tasks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;