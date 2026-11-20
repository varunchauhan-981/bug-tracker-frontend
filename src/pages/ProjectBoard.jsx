import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  MessageSquare,
  ArrowLeft,
  Trash2,
  Send,
  X,
  UserPlus,
  CheckCircle2
} from 'lucide-react';

const ProjectBoard = () => {
  const { projectId } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Create Ticket Modal
  const [showForm, setShowForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    assignedTo: ''
  });

  // Jira-style Ticket Detail Modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isUpdatingTicket, setIsUpdatingTicket] = useState(false);

  // Add Member to Project Modal
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberToAdd, setMemberToAdd] = useState('');

  const fetchBoardData = async () => {
    try {
      const [projRes, tickRes, usersRes] = await Promise.all([
        API.get(`/projects/${projectId}`),
        API.get(`/tickets/project/${projectId}`),
        API.get('/auth/users')
      ]);
      setProject(projRes.data);
      setTickets(tickRes.data);
      setTeam(usersRes.data);

      // Sync open ticket modal if active
      if (selectedTicket) {
        const refreshed = tickRes.data.find((t) => t._id === selectedTicket._id);
        if (refreshed) setSelectedTicket(refreshed);
      }
    } catch (error) {
      toast.error('Failed to load board data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardData();
  }, [projectId]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;

    try {
      await API.put(`/tickets/${draggableId}`, { status: newStatus });
      toast.success(`Moved to ${newStatus}`);
      fetchBoardData();
    } catch (error) {
      toast.error('Failed to update ticket status');
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.title.trim() || !newTicket.description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    try {
      const { data } = await API.post('/tickets', {
        ...newTicket,
        title: newTicket.title.trim(),
        description: newTicket.description.trim(),
        project: projectId
      });
      setTickets([data, ...tickets]);
      setShowForm(false);
      setNewTicket({ title: '', description: '', priority: 'Medium', assignedTo: '' });
      toast.success('Issue created');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating issue');
    }
  };

  const handleUpdateTicketDetails = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setIsUpdatingTicket(true);
    try {
      await API.put(`/tickets/${selectedTicket._id}`, {
        title: selectedTicket.title,
        description: selectedTicket.description,
        priority: selectedTicket.priority,
        status: selectedTicket.status,
        assignedTo: selectedTicket.assignedTo?._id || selectedTicket.assignedTo || null
      });
      toast.success('Issue updated');
      fetchBoardData();
    } catch (error) {
      toast.error('Failed to update issue');
    } finally {
      setIsUpdatingTicket(false);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      await API.delete(`/tickets/${ticketId}`);
      setTickets((prev) => prev.filter((t) => t._id !== ticketId));
      setSelectedTicket(null);
      toast.success('Issue deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete issue');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedTicket) return;

    try {
      await API.post(`/tickets/${selectedTicket._id}/comments`, {
        text: commentText.trim()
      });
      setCommentText('');
      toast.success('Comment added');
      fetchBoardData();
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleAddProjectMember = async (e) => {
    e.preventDefault();
    if (!memberToAdd) return;

    try {
      await API.post(`/projects/${projectId}/members`, { userId: memberToAdd });
      toast.success('Member added to project');
      setMemberToAdd('');
      setShowMemberModal(false);
      fetchBoardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    }
  };

  const columns = {
    'To Do': [],
    'In Progress': [],
    'Done': []
  };

  tickets.forEach((ticket) => {
    const matchesSearch = ticket.title.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || ticket.priority === priorityFilter;

    if (matchesSearch && matchesPriority && columns[ticket.status]) {
      columns[ticket.status].push(ticket);
    }
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'High':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Medium':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-indigo-400">
        Loading Kanban Board...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Board Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center space-x-4 text-slate-400 mb-2 text-sm">
            <Link to="/" className="hover:text-white flex items-center transition">
              <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
            </Link>
            <span>/</span>
            <span>Projects</span>
            <span>/</span>
            <span className="text-slate-200">{project?.name}</span>
          </div>

          <div className="flex flex-wrap justify-between items-end gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{project?.name}</h1>
              <p className="text-slate-400 text-sm mt-1">{project?.description}</p>
            </div>

            <div className="flex items-center space-x-3">
              {(user?.role === 'Admin' || user?.role === 'Project Manager') && (
                <button
                  onClick={() => setShowMemberModal(true)}
                  className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3.5 py-2 rounded-lg font-medium transition text-sm"
                >
                  <UserPlus className="h-4 w-4 text-indigo-400" />
                  <span>Add Member</span>
                </button>
              )}
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Create Issue</span>
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-4 mt-5">
            <div className="relative">
              <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search issues..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:outline-none w-64"
              />
            </div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">Create New Issue</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Summary / Title</label>
                <input
                  required
                  type="text"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Description</label>
                <textarea
                  required
                  rows="3"
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Assignee</label>
                  <select
                    value={newTicket.assignedTo}
                    onChange={(e) => setNewTicket({ ...newTicket, assignedTo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-sm focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {team.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} ({member.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-sm rounded-xl font-medium"
                >
                  Create Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Jira-style Issue Detail & Comments Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded border ${getPriorityColor(selectedTicket.priority)}`}>
                  {selectedTicket.priority}
                </span>
                <span className="text-xs text-slate-400">Status: {selectedTicket.status}</span>
              </div>
              <div className="flex items-center space-x-2">
                {(user?.role === 'Admin' || user?.role === 'Project Manager') && (
                  <button
                    onClick={() => handleDeleteTicket(selectedTicket._id)}
                    title="Delete Issue"
                    className="text-rose-400 hover:bg-rose-500/10 p-1.5 rounded-lg transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              <form onSubmit={handleUpdateTicketDetails} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Summary</label>
                  <input
                    type="text"
                    required
                    value={selectedTicket.title}
                    onChange={(e) => setSelectedTicket({ ...selectedTicket, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-sm font-medium focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Description</label>
                  <textarea
                    rows="3"
                    required
                    value={selectedTicket.description}
                    onChange={(e) => setSelectedTicket({ ...selectedTicket, description: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Status</label>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => setSelectedTicket({ ...selectedTicket, status: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Priority</label>
                    <select
                      value={selectedTicket.priority}
                      onChange={(e) => setSelectedTicket({ ...selectedTicket, priority: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Assignee</label>
                    <select
                      value={selectedTicket.assignedTo?._id || selectedTicket.assignedTo || ''}
                      onChange={(e) => setSelectedTicket({ ...selectedTicket, assignedTo: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
                    >
                      <option value="">Unassigned</option>
                      {team.map((member) => (
                        <option key={member._id} value={member._id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdatingTicket}
                    className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-medium px-4 py-2 rounded-xl transition"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{isUpdatingTicket ? 'Saving...' : 'Save Issue Changes'}</span>
                  </button>
                </div>
              </form>

              {/* Comments Thread */}
              <div className="border-t border-slate-800 pt-5">
                <h4 className="text-sm font-semibold text-white mb-3">
                  Activity & Comments ({selectedTicket.comments?.length || 0})
                </h4>

                <div className="space-y-3 max-h-44 overflow-y-auto mb-4 pr-1">
                  {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                    selectedTicket.comments.map((c, idx) => (
                      <div key={c._id || idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-semibold text-indigo-400">
                            {c.user?.name || c.authorName || 'Team Member'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300">{c.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">No comments yet. Start the discussion below.</p>
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex space-x-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center space-x-1 transition"
                  >
                    <Send className="h-4 w-4" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member to Project Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Add Member to Project</h3>
              <button onClick={() => setShowMemberModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddProjectMember} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Select Workspace User</label>
                <select
                  required
                  value={memberToAdd}
                  onChange={(e) => setMemberToAdd(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                >
                  <option value="">Choose a user...</option>
                  {team.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.email} - {member.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium"
                >
                  Add to Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kanban Columns */}
      <div className="flex-1 overflow-x-auto p-6 max-w-[1600px] mx-auto w-full">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex space-x-6 items-start h-full">
            {Object.keys(columns).map((columnId) => (
              <div
                key={columnId}
                className="w-80 shrink-0 bg-slate-900/50 rounded-xl p-3 border border-slate-800 flex flex-col h-[calc(100vh-220px)]"
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="font-semibold text-slate-300 flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        columnId === 'To Do'
                          ? 'bg-slate-400'
                          : columnId === 'In Progress'
                          ? 'bg-indigo-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    {columnId}
                  </h3>
                  <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">
                    {columns[columnId].length}
                  </span>
                </div>

                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 overflow-y-auto min-h-[150px] transition-colors rounded-lg ${
                        snapshot.isDraggingOver ? 'bg-slate-800/50' : ''
                      }`}
                    >
                      {columns[columnId].map((ticket, index) => (
                        <Draggable key={ticket._id} draggableId={ticket._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setSelectedTicket(ticket)}
                              className={`bg-slate-800 p-4 rounded-lg mb-3 border cursor-pointer ${
                                snapshot.isDragging
                                  ? 'border-indigo-500 shadow-xl shadow-indigo-500/20 z-50'
                                  : 'border-slate-700 hover:border-indigo-500/60'
                              } transition`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityColor(
                                    ticket.priority
                                  )}`}
                                >
                                  {ticket.priority}
                                </span>
                              </div>
                              <h4 className="text-white text-sm font-medium leading-tight mb-2">
                                {ticket.title}
                              </h4>
                              <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center text-slate-400 text-xs">
                                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                                  {ticket.comments?.length || 0}
                                </div>
                                {ticket.assignedTo && (
                                  <div
                                    title={ticket.assignedTo.name}
                                    className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white border border-indigo-500"
                                  >
                                    {ticket.assignedTo.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default ProjectBoard;