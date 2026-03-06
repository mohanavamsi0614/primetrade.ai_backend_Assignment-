import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, LogOut, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

interface UserRow {
    id: string
    name: string
    email: string
    role: 'USER' | 'ADMIN'
    createdAt: string
    _count: { tasks: number }
}

export default function UsersPage() {
    const { user, logout, isAdmin } = useAuth()
    const navigate = useNavigate()
    const [users, setUsers] = useState<UserRow[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isAdmin) { navigate('/dashboard'); return }
        api.get('/users')
            .then((res) => setUsers(res.data.data.users))
            .catch(() => toast.error('Failed to load users'))
            .finally(() => setLoading(false))
    }, [isAdmin, navigate])

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this user and all their tasks?')) return
        try {
            await api.delete(`/users/${id}`)
            setUsers((prev) => prev.filter((u) => u.id !== id))
            toast.success('User deleted')
        } catch {
            toast.error('Failed to delete user')
        }
    }

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <h2>TaskFlow</h2>
                    <span>Task Manager</span>
                </div>
                <nav className="sidebar-nav">
                    <button className="nav-item" onClick={() => navigate('/dashboard')}>
                        <LayoutDashboard size={18} /> Dashboard
                    </button>
                    <button className="nav-item active">
                        <Users size={18} /> Users
                    </button>
                </nav>
                <div className="sidebar-user">
                    <div className="user-info">
                        <div className="user-avatar">{user?.name.charAt(0).toUpperCase()}</div>
                        <div>
                            <div className="user-name">{user?.name}</div>
                            <span className="user-role">{user?.role}</span>
                        </div>
                    </div>
                    <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}
                        onClick={() => { logout(); navigate('/login') }}>
                        <LogOut size={14} /> Sign Out
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h1>User Management</h1>
                        <p>Admin panel – manage all registered users</p>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                    </div>
                ) : (
                    <div className="table-wrap" style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Tasks</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id}>
                                        <td style={{ fontWeight: 600 }}>{u.name}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                                        <td>
                                            <span className={`badge ${u.role === 'ADMIN' ? 'badge-inprogress' : 'badge-todo'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td>{u._count.tasks}</td>
                                        <td style={{ color: 'var(--text-muted)' }}>
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td>
                                            {u.id !== user?.id && (
                                                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}
                                                    onClick={() => handleDelete(u.id)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    )
}
