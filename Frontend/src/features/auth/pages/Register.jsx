import { useState } from 'react'
import { Link } from 'react-router'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  })
  const [message, setMessage] = useState('')

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value })
  }

  const handleSubmitForm = (event) => {
    event.preventDefault()
    setMessage(`Account ready for ${formData.username}`)
  }

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] px-4 py-10 text-zinc-100">
      <section className="relative w-full max-w-md rounded-3xl border border-[#31b8c6]/20 bg-zinc-950/80 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">
        <div className="mb-9">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#31b8c6]">Perplexity</p>
          <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-zinc-400">Start exploring smarter conversations.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmitForm}>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300" htmlFor="register-username">Username</label>
            <input className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-[#31b8c6] focus:ring-2 focus:ring-[#31b8c6]/20" id="register-username" name="username" type="text" placeholder="Your username" value={formData.username} onChange={handleChange} required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300" htmlFor="register-email">Email</label>
            <input className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-[#31b8c6] focus:ring-2 focus:ring-[#31b8c6]/20" id="register-email" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300" htmlFor="register-password">Password</label>
            <input className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-[#31b8c6] focus:ring-2 focus:ring-[#31b8c6]/20" id="register-password" name="password" type="password" placeholder="Create a password" value={formData.password} onChange={handleChange} required />
          </div>

          <button className="w-full rounded-xl bg-[#31b8c6] px-4 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-[#31b8c6]/20 transition hover:bg-[#289eaa] focus:outline-none focus:ring-2 focus:ring-[#31b8c6] focus:ring-offset-2 focus:ring-offset-zinc-950" type="submit">
            Create account
          </button>
        </form>

        {message && <p className="mt-4 text-center text-sm text-[#31b8c6]">{message}</p>}
        <p className="mt-8 text-center text-sm text-zinc-500">
          Already have an account? <Link className="font-medium text-[#31b8c6] hover:text-[#289eaa]" to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  )
}

export default Register