import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Bug, Plus, Search, MessageSquare, ArrowLeft, MoreHorizontal } from 'lucide-react';

const ProjectBoard = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters and Search
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  
  // New Ticket Form State
  const [showForm, setShowForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: '', description: '', priority: 'Medium', assignedTo: ''
  });

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
    } catch (error) {
      toast.error('Failed to load board data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardData();
  }, [projectId]);

  // Handle Kanban Drag and Drop
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Find the ticket being dragged
    const ticketToMove = tickets.find((t) => t._id === draggableId);
    
    // Optimistic UI Update: Instantly move the ticket on screen
    const updatedTickets = tickets.map((t) => 
      t._id === draggableId ? { ...t, status: destination.droppableId } : t
    );
    setTickets(updatedTickets);

    // Background API Call to save the status change
    try {
      await API.put(`/tickets/${draggableId}`, {
        status: destination.droppableId
      });
      toast.success(`Moved to ${destination.droppableId}`);
    } catch (error) {
      toast.error('Failed to update status');
      // Revert UI if API fails
      setTickets(tickets); 
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/tickets', {
        ...newTicket,
        project: projectId
      });
      setTickets([data, ...tickets]);
      setShowForm(false);
      setNewTicket({ title: '', description: '', priority: 'Medium', assignedTo: '' });
      toast.success('Ticket created');
    } catch (error) {
      toast.error('Error creating ticket');
    }
  };

  // Group tickets by Kanban columns based on filters
  const columns = {
    'To Do': [],
    'In Progress': [],
    'Done': []
  };

  tickets.forEach(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || ticket.priority === priorityFilter;
    
    if (matchesSearch && matchesPriority && columns[ticket.status]) {
      columns[ticket.status].push(ticket);
    }
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Medium': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-950 text-indigo-400">Loading Kanban Board...</div>;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Board Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center space-x-4 text-slate-400 mb-2 text-sm">
            <Link to="/" className="hover:text-white flex items-center transition"><ArrowLeft className="h-4 w-4 mr-1"/> Dashboard</Link>
            <span>/</span>
            <span>Projects</span>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-white">{project?.name}</h1>
              <p className="text-slate-400 text-sm mt-1">{project?.description}</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>New Bug / Ticket</span>
              </button>
            </div>
          </div>
          
          {/* Filters Bar */}
          <div className="flex items-center space-x-4 mt-6">
            <div className="relative">
              <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search tickets..."
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

      {/* New Ticket Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-5 border-b border-slate-800">
              <h2 className="text-lg font-semibold text-white">Create New Ticket</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Title / Issue</label>
                <input required type="text" value={newTicket.title} onChange={(e) => setNewTicket({...newTicket, title: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Description</label>
                <textarea required rows="3" value={newTicket.description} onChange={(e) => setNewTicket({...newTicket, description: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Priority</label>
                  <select value={newTicket.priority} onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Assign To</label>
                  <select value={newTicket.assignedTo} onChange={(e) => setNewTicket({...newTicket, assignedTo: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
                    <option value="">Unassigned</option>
                    {team.map(member => (
                      <option key={member._id} value={member._id}>{member.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm rounded-lg font-medium">Create Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto p-6 max-w-[1600px] mx-auto w-full">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex space-x-6 items-start h-full">
            {Object.keys(columns).map((columnId) => (
              <div key={columnId} className="w-80 shrink-0 bg-slate-900/50 rounded-xl p-3 border border-slate-800 flex flex-col h-[calc(100vh-220px)]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="font-semibold text-slate-300 flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      columnId === 'To Do' ? 'bg-slate-400' : columnId === 'In Progress' ? 'bg-indigo-500' : 'bg-emerald-500'
                    }`} />
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
                              className={`bg-slate-800 p-4 rounded-lg mb-3 border ${
                                snapshot.isDragging ? 'border-indigo-500 shadow-xl shadow-indigo-500/20 z-50' : 'border-slate-700 hover:border-slate-600'
                              } group`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityColor(ticket.priority)}`}>
                                  {ticket.priority}
                                </span>
                                <MoreHorizontal className="h-4 w-4 text-slate-600 group-hover:text-slate-400 cursor-pointer" />
                              </div>
                              <h4 className="text-white text-sm font-medium leading-tight mb-2">
                                {ticket.title}
                              </h4>
                              <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center text-slate-500 text-xs">
                                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                                  {ticket.comments?.length || 0}
                                </div>
                                {ticket.assignedTo && (
                                  <div title={ticket.assignedTo.name} className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white border border-indigo-500">
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