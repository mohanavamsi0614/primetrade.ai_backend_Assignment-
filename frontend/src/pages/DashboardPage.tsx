import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Pencil, Trash2, CheckCircle2, Clock, Circle, LayoutDashboard, Users, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

interface Task {
    id: string
    title: string
    description?: string
    status: 'TODO' | 'IN_PROGRESS' | 'DONE'
    userId: string
    createdAt: string
    user?: { id: string; name: string; email: string }
}

interface Pagination {
    page: number
    total: number
    totalPages: number
}

const STATUS_CONFIG = {
    TODO: { label: 'To Do', badgeClass: 'badge-todo', Icon: Circle },
    IN_PROGRESS: { label: 'In Progress', badgeClass: 'badge-inprogress', Icon: Clock },
    DONE: { label: 'Done', badgeClass: 'badge-done', Icon: CheckCircle2 },
}

function StatusBadge({ status }: { status: Task['status'] }) {
    const { label, badgeClass, Icon } = STATUS_CONFIG[status]
    return (
        <span className={`badge ${badgeClass}`}>
            <Icon size={11} />
            {label}
        </span>
    )
}

export default function DashboardPage() {
    const { user, logout, isAdmin } = useAuth()
    const navigate = useNavigate()

    // Tasks state
    const [tasks, setTasks] = useState<Task[]>([])
    const [pagination, setPagination] = useState<Pagination>({ page: 1, total: 0, totalPages: 1 })
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('')

    // Modal state
    const [showModal, setShowModal] = useState(false)
    const [editTask, setEditTask] = useState<Task | null>(null)
    const [form, setForm] = useState({ title: '', description: '', status: 'TODO' as Task['status'] })
    const [submitting, setSubmitting] = useState(false)

    const fetchTasks = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(pagination.page), limit: '12' })
            if (filterStatus) params.set('status', filterStatus)
            const res = await api.get(`/tasks?${params}`)
            setTasks(res.data.data.tasks)
            setPagination(res.data.data.pagination)
        } catch {
            toast.error('Failed to load tasks')
        } finally {
            setLoading(false)
        }
    }, [pagination.page, filterStatus])

    useEffect(() => { fetchTasks() }, [fetchTasks])

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    function openCreate() {
        setEditTask(null)
        setForm({ title: '', description: '', status: 'TODO' })
        setShowModal(true)
    }

    function openEdit(task: Task) {
        setEditTask(task)
        setForm({ title: task.title, description: task.description || '', status: task.status })
        setShowModal(true)
    }

    async function handleSubmit() {
        if (!form.title.trim()) { toast.error('Title is required'); return }
        setSubmitting(true)
        try {
            if (editTask) {
                await api.put(`/tasks/${editTask.id}`, form)
                toast.success('Task updated!')
            } else {
                await api.post('/tasks', form)
                toast.success('Task created!')
            }
            setShowModal(false)
            fetchTasks()
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            toast.error(error.response?.data?.message || 'Failed to save task')
        } finally {
            setSubmitting(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this task?')) return
        try {
            await api.delete(`/tasks/${id}`)
            toast.success('Task deleted')
            fetchTasks()
        } catch {
            toast.error('Failed to delete task')
        }
    }

    const filtered = tasks.filter(
        (t) =>
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            (t.description || '').toLowerCase().includes(search.toLowerCase())
    )

    const stats = {
        total: pagination.total,
        todo: tasks.filter((t) => t.status === 'TODO').length,
        inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
        done: tasks.filter((t) => t.status === 'DONE').length,
    }

    return (
        <div className="app-shell">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <h2>TaskFlow</h2>
                    <span>Task Manager</span>
                </div>
                <nav className="sidebar-nav">
                    <button className="nav-item active">
                        <LayoutDashboard size={18} />
                        Dashboard
                    </button>
                    {isAdmin && (
                        <button className="nav-item" onClick={() => navigate('/users')}>
                            <Users size={18} />
                            Users
                        </button>
                    )}
                </nav>
                <div className="sidebar-user">
                    <div className="user-info">
                        <div className="user-avatar">{user?.name.charAt(0).toUpperCase()}</div>
                        <div>
                            <div className="user-name">{user?.name}</div>
                            <span className="user-role">{user?.role}</span>
                        </div>
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{ width: '100%' }} onClick={handleLogout}>
                        <LogOut size={14} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>My Tasks</h1>
                        <p>{isAdmin ? 'Admin view – all user tasks' : 'Your personal task board'}</p>
                    </div>
                    <button className="btn btn-primary" style={{ width: 'auto', marginTop: 0 }} onClick={openCreate}>
                        <Plus size={16} /> New Task
                    </button>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Total</div>
                        <div className="stat-value total">{stats.total}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">To Do</div>
                        <div className="stat-value todo">{stats.todo}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">In Progress</div>
                        <div className="stat-value inprogress">{stats.inProgress}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Done</div>
                        <div className="stat-value done">{stats.done}</div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="toolbar">
                    <div className="search-wrapper">
                        <Search size={15} className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search tasks…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="filter-select"
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value); setPagination((p) => ({ ...p, page: 1 })) }}
                    >
                        <option value="">All Status</option>
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                    </select>
                </div>

                {/* Task Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
                        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                    </div>
                ) : (
                    <div className="tasks-grid">
                        {filtered.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">📋</div>
                                <h3>No tasks found</h3>
                                <p>Create your first task to get started.</p>
                            </div>
                        ) : (
                            filtered.map((task) => (
                                <div key={task.id} className={`task-card ${task.status}`}>
                                    <div className="task-header">
                                        <h3 className="task-title">{task.title}</h3>
                                        <div className="task-actions">
                                            <button className="btn btn-ghost btn-sm" title="Edit" onClick={() => openEdit(task)}>
                                                <Pencil size={14} />
                                            </button>
                                            <button className="btn btn-ghost btn-sm" title="Delete" onClick={() => handleDelete(task.id)}
                                                style={{ color: 'var(--danger)' }}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    {task.description && <p className="task-desc">{task.description}</p>}
                                    <div className="task-footer">
                                        <StatusBadge status={task.status} />
                                        <div>
                                            {isAdmin && task.user && (
                                                <span className="task-owner" style={{ marginRight: 8 }}>{task.user.name}</span>
                                            )}
                                            <span className="task-date">
                                                {new Date(task.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 28 }}>
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                className={`btn ${p === pagination.page ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                                style={{ width: 40, marginTop: 0 }}
                                onClick={() => setPagination((prev) => ({ ...prev, page: p }))}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}
            </main>

            {/* Task Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal">
                        <div className="modal-header">
                            <h2 className="modal-title">{editTask ? 'Edit Task' : 'New Task'}</h2>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Title *</label>
                            <input
                                className="form-input"
                                placeholder="Task title"
                                value={form.title}
                                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                autoFocus
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-textarea"
                                placeholder="Optional description…"
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                className="form-select"
                                value={form.status}
                                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Task['status'] }))}
                            >
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                            </select>
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" style={{ width: 'auto', marginTop: 0 }} onClick={handleSubmit} disabled={submitting}>
                                {submitting ? <span className="spinner" /> : null}
                                {editTask ? 'Save Changes' : 'Create Task'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
