import React, { useState, useEffect } from 'react';
import { Menu, Filter, Grid, List, Plus, Settings, User, X, Trash2, Edit3, Calendar, Tag } from 'lucide-react';
import './App.css'; 

// --- Types ---
interface Task {
  id: string;
  name: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low' | '';
  category: string;
  status: 'Open' | 'In progress' | 'Done' | '';
  description: string;
}

const TaskManager: React.FC = () => {
  // --- State ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isGridView, setIsGridView] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Form State ---
  const [formData, setFormData] = useState<Omit<Task, 'id'>>({
    name: '', dueDate: '', priority: '', category: '', status: '', description: ''
  });

  // --- Effects ---
  useEffect(() => {
    const saved = localStorage.getItem('react-tasks');
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('react-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // --- Handlers ---
  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData(task);
    } else {
      setEditingTask(null);
      setFormData({ name: '', dueDate: '', priority: '', category: '', status: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...formData, id: t.id } : t));
    } else {
      const newTask: Task = { ...formData, id: `task-${Date.now()}` };
      setTasks([...tasks, newTask]);
    }
    setIsModalOpen(false);
  };

  const deleteTask = (id: string) => {
    if (window.confirm("Delete this task?")) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar Panel */}
      <aside className={`sidebar-panel ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Menu</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="icon-btn">
            <X size={24} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item"><List size={20} /> My Tasks</button>
          <button className="nav-item"><Settings size={20} /> Settings</button>
          <hr className="divider" />
          <div className="nav-label">Analytics</div>
          <div className="analytics-placeholder">Analytics View coming soon</div>
        </nav>
      </aside>

      {/* Header */}
      <header className="main-header">
        <div className="header-left">
          <button onClick={() => setIsSidebarOpen(true)} className="menu-toggle">
            <Menu size={18} />
          </button>
        </div>

        <div className="header-search">
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={() => setIsGridView(!isGridView)} className="view-toggle">
            {isGridView ? <List size={18} /> : <Grid size={18} />}
          </button>
        </div>

        <div className="header-right">
          <button className="btn-signin">
            <User size={16} /> <span>Sign In</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="content-area">
        <button onClick={() => handleOpenModal()} className="btn-add-task">
          <Plus size={24} />
          <span>Add New Task</span>
        </button>

        <div className={isGridView ? "task-grid" : "task-list"}>
          {filteredTasks.length > 0 ? (
            filteredTasks.map(task => (
              <div key={task.id} className="task-card">
                <div className="task-card-header">
                  <h3>{task.name}</h3>
                  <span className={`priority-tag ${task.priority?.toLowerCase() || 'low'}`}>
                    {task.priority || 'Low'}
                  </span>
                </div>
                
                <p className="task-desc">{task.description || "No description provided."}</p>

                <div className="task-meta">
                  <span className="meta-item"><Calendar size={12}/> {task.dueDate || 'No date'}</span>
                  <span className="meta-item"><Tag size={12}/> {task.category || 'General'}</span>
                </div>

                <div className="task-actions">
                  <button onClick={() => handleOpenModal(task)} className="btn-edit"><Edit3 size={18} /></button>
                  <button onClick={() => deleteTask(task.id)} className="btn-delete"><Trash2 size={18} /></button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No tasks found</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button onClick={() => setIsModalOpen(false)} className="modal-close">
              <X size={24} />
            </button>
            
            <h2 className="modal-title">{editingTask ? 'Edit Task' : 'Create New Task'}</h2>

            <form onSubmit={handleSubmit} className="task-form">
              <div className="form-group">
                <label>Task Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <button type="submit" className="btn-submit">
                {editingTask ? 'Save Changes' : 'Add Task'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;