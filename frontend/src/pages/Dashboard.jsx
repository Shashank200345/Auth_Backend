import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasks, createTask, updateTask, deleteTask, getAllTasks } from '../api/tasks';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'DONE'];
const STATUS_LABELS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('my-tasks');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'ADMIN';

  useEffect(() => {
    fetchTasks();
    if (isAdmin && activeTab === 'all-tasks') {
      fetchAllTasks();
    }
  }, [filter, activeTab]);

  const fetchTasks = async () => {
    try {
      const params = {};
      if (filter) params.status = filter;
      const { data } = await getTasks(params);
      setTasks(data.data.tasks);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTasks = async () => {
    try {
      const params = {};
      if (filter) params.status = filter;
      const { data } = await getAllTasks(params);
      setAllTasks(data.data.tasks);
    } catch {
      toast.error('Failed to load all tasks');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      await createTask({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      toast.success('Task created!');
      setTitle('');
      setDescription('');
      fetchTasks();
      if (isAdmin && activeTab === 'all-tasks') fetchAllTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateTask(id, { status });
      toast.success(`Moved to ${STATUS_LABELS[status]}`);
      fetchTasks();
      if (isAdmin && activeTab === 'all-tasks') fetchAllTasks();
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    try {
      await deleteTask(id);
      toast.success('Task deleted');
      fetchTasks();
      if (isAdmin && activeTab === 'all-tasks') fetchAllTasks();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out');
    navigate('/login');
  };

  const displayTasks = activeTab === 'all-tasks' ? allTasks : tasks;

  const taskCounts = {
    total: displayTasks.length,
    todo: displayTasks.filter((t) => t.status === 'TODO').length,
    inProgress: displayTasks.filter((t) => t.status === 'IN_PROGRESS').length,
    done: displayTasks.filter((t) => t.status === 'DONE').length,
  };

  return (
    <div className="container">
      <div className="header">
        <div className="header-left">
          <h1>Task Dashboard</h1>
          <p>{taskCounts.total} tasks &middot; {taskCounts.done} completed</p>
        </div>
        <div className="header-right">
          <div className="user-badge">
            {user.email}
            <span className={`role-tag ${isAdmin ? 'role-admin' : ''}`}>{user.role}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm">Logout</button>
        </div>
      </div>

      {isAdmin && (
        <div className="tab-bar animate-fade-in">
          <button
            className={`tab-btn ${activeTab === 'my-tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-tasks')}
          >
            My Tasks
          </button>
          <button
            className={`tab-btn ${activeTab === 'all-tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('all-tasks')}
          >
            All Users' Tasks
            <span className="admin-badge">Admin</span>
          </button>
        </div>
      )}

      <form onSubmit={handleCreate} className="task-form">
        <input
          type="text"
          className="form-input"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          className="form-input"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn-success btn-sm"
          disabled={creating || !title.trim()}
          style={{ whiteSpace: 'nowrap' }}
        >
          {creating ? <span className="spinner" /> : '+ Add Task'}
        </button>
      </form>

      <div className="filter-bar">
        <span className="text-sm text-muted" style={{ marginRight: '0.25rem' }}>Filter:</span>
        <button
          className={`filter-btn ${filter === '' ? 'active' : ''}`}
          onClick={() => setFilter('')}
        >
          All ({taskCounts.total})
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            className={`filter-btn ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-screen">
          <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
          <p>Loading tasks...</p>
        </div>
      ) : displayTasks.length === 0 ? (
        <div className="empty-state">
          <div className="icon">&#9744;</div>
          <p>
            {filter
              ? `No ${STATUS_LABELS[filter].toLowerCase()} tasks`
              : activeTab === 'all-tasks'
                ? 'No tasks from any user yet.'
                : 'No tasks yet. Create your first one above!'}
          </p>
        </div>
      ) : (
        <div className="task-list">
          {displayTasks.map((task, index) => (
            <div
              key={task.id}
              className="task-card"
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              <div className="task-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span className="task-title">{task.title}</span>
                  {activeTab === 'all-tasks' && task.user && (
                    <span className="owner-badge">{task.user.email}</span>
                  )}
                </div>
                <span className={`status-badge status-${task.status}`}>
                  {STATUS_LABELS[task.status]}
                </span>
              </div>

              {task.description && <p className="task-desc">{task.description}</p>}

              <div className="task-footer">
                <span className="text-sm text-muted">
                  {new Date(task.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>

                <div className="task-actions">
                  {(activeTab === 'my-tasks' || isAdmin) && (
                    <select
                      className="select"
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  )}
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
