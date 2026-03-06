import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
    id: string
    name: string
    email: string
    role: 'USER' | 'ADMIN'
    createdAt: string
}

interface AuthContextType {
    user: User | null
    token: string | null
    login: (token: string, user: User) => void
    logout: () => void
    isAuthenticated: boolean
    isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')
        if (storedToken && storedUser) {
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
        }
        setLoading(false)
    }, [])

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('token', newToken)
        localStorage.setItem('user', JSON.stringify(newUser))
        setToken(newToken)
        setUser(newUser)
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
    }

    if (loading) {
        return (
            <div className="loading-page">
                <div className="spinner" />
            </div>
        )
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                isAuthenticated: !!token,
                isAdmin: user?.role === 'ADMIN',
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
