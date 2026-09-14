import { Link } from 'react-router'

const Home = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-4 text-zinc-100">
      <section className="w-full max-w-2xl rounded-3xl border border-[#31b8c6]/20 bg-zinc-950/80 p-10 text-center shadow-2xl shadow-black/40 backdrop-blur-xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#31b8c6]">Perplexity</p>
        <h1 className="text-4xl font-semibold tracking-tight">Welcome home</h1>
        <p className="mx-auto mt-4 max-w-md text-zinc-400">You are now signed in and ready to start exploring.</p>
        <Link className="mt-8 inline-block rounded-xl bg-[#31b8c6] px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-[#289eaa]" to="/login">
          Back to login
        </Link>
      </section>
    </main>
  )
}

export default Home
