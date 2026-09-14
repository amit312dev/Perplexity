import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import {useSelector} from 'react-redux'
import {Navigate} from 'react-router'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [message, setMessage] = useState('')
  const user = useSelector((state) => state.auth.user)
  const loading = useSelector((state) => state.auth.loading)

  const { handleLogin, error } = useAuth()
  const navigate = useNavigate()

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value })
  }

  const handleSubmitForm = async (event) => {
    event.preventDefault()
    setMessage('')
    const data = await handleLogin(formData)

    if (data) {
      navigate('/dashboard')
    }
  }

  if(!loading && user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] px-4 py-10 text-zinc-100">
      <section className="relative w-full max-w-md rounded-3xl border border-[#31b8c6]/20 bg-zinc-950/80 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">
        <div className="mb-9">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#31b8c6]">Perplexity</p>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-zinc-400">Sign in to continue your conversations.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmitForm}>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300" htmlFor="login-email">Email</label>
            <input
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-[#31b8c6] focus:ring-2 focus:ring-[#31b8c6]/20"
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300" htmlFor="login-password">Password</label>
            <input
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-[#31b8c6] focus:ring-2 focus:ring-[#31b8c6]/20"
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button className="w-full rounded-xl bg-[#31b8c6] px-4 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-[#31b8c6]/20 transition hover:bg-[#289eaa] focus:outline-none focus:ring-2 focus:ring-[#31b8c6] focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {(message || error) && <p className={`mt-4 text-center text-sm ${error ? 'text-red-400' : 'text-[#31b8c6]'}`}>{error || message}</p>}
        <p className="mt-8 text-center text-sm text-zinc-500">
          Don&apos;t have an account? <Link className="font-medium text-[#31b8c6] hover:text-[#289eaa]" to="/register">Create one</Link>
        </p>
      </section>
    </main>
  )
}

export default Login