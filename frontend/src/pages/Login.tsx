import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(username, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-[var(--border-earth)] bg-[var(--surface)] p-8 shadow-sm"
      >
        <h1 className="mb-6 text-xl font-semibold text-[var(--ink)]">Roadmap</h1>

        <label className="mb-1 block text-sm font-medium text-[var(--ink-muted)]">
          Username
        </label>
        <input
          className="mb-4 w-full rounded-md border border-[var(--border-earth)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)]"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />

        <label className="mb-1 block text-sm font-medium text-[var(--ink-muted)]">
          Password
        </label>
        <input
          type="password"
          className="mb-6 w-full rounded-md border border-[var(--border-earth)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {error && <p className="mb-4 text-sm text-[var(--danger)]">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
