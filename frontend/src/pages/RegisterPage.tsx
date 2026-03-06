import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)

    const set = (field: string, value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }))

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setErrors({})
        setLoading(true)
        try {
            const res = await api.post('/auth/register', form)
            const { token, user } = res.data.data
            login(token, user)
            toast.success('Account created successfully!')
            navigate('/dashboard')
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string; errors?: { field: string; message: string }[] } } }
            const data = error.response?.data
            if (data?.errors) {
                const fieldErrors: Record<string, string> = {}
                data.errors.forEach((e) => { fieldErrors[e.field] = e.message })
                setErrors(fieldErrors)
            } else {
                toast.error(data?.message || 'Registration failed')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>TaskFlow</h1>
                    <p>Secure Task Management Platform</p>
                </div>

                <h2 className="auth-title">Create account</h2>
                <p className="auth-subtitle">Get started with TaskFlow today</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            className="form-input"
                            placeholder="Alice Smith"
                            value={form.name}
                            onChange={(e) => set('name', e.target.value)}
                            required
                        />
                        {errors.name && <p className="form-error">{errors.name}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-email">Email Address</label>
                        <input
                            id="reg-email"
                            type="email"
                            className="form-input"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) => set('email', e.target.value)}
                            required
                        />
                        {errors.email && <p className="form-error">{errors.email}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-password">Password</label>
                        <input
                            id="reg-password"
                            type="password"
                            className="form-input"
                            placeholder="Min 8 chars, 1 uppercase, 1 number"
                            value={form.password}
                            onChange={(e) => set('password', e.target.value)}
                            required
                        />
                        {errors.password && <p className="form-error">{errors.password}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="role">Account Type</label>
                        <select
                            id="role"
                            className="form-select"
                            value={form.role}
                            onChange={(e) => set('role', e.target.value)}
                        >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? <span className="spinner" /> : null}
                        {loading ? 'Creating account…' : 'Create Account'}
                    </button>
                </form>

                <p className="auth-link">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    )
}
