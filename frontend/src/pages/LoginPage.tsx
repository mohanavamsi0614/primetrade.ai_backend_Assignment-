import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await api.post('/auth/login', { email, password })
            const { token, user } = res.data.data
            login(token, user)
            toast.success(`Welcome back, ${user.name}!`)
            navigate('/dashboard')
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            toast.error(error.response?.data?.message || 'Login failed')
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

                <h2 className="auth-title">Welcome back</h2>
                <p className="auth-subtitle">Sign in to your account to continue</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? <span className="spinner" /> : null}
                        {loading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>

                <p className="auth-link">
                    Don't have an account? <Link to="/register">Create one</Link>
                </p>
            </div>
        </div>
    )
}
