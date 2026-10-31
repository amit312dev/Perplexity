
import { useState } from "react";
import { Link } from "react-router";
import { register } from "../service/auth.api";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  const handleSubmitForm = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const username = formData.username.trim();
    const email = formData.email.trim();
    const password = formData.password;

    // Frontend validation
    if (!username || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await register({
        username,
        email,
        password,
      });

      setMessage(
        response?.message ||
          "Registration successful. Please check your email for verification."
      );

      setFormData({
        username: "",
        email: "",
        password: "",
      });
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Registration failed. Please try again.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[100dvh] w-full items-center justify-center bg-[#09090b] px-4 py-8 text-zinc-100 sm:py-10">
      <section className="relative w-full max-w-md rounded-3xl border border-[#31b8c6]/20 bg-zinc-950/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">
        <div className="mb-9">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-[#31b8c6]">
            Perplexity
          </p>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Start exploring smarter conversations.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmitForm}>
          <div>
            <label
              className="mb-2 block text-sm font-medium text-zinc-300"
              htmlFor="register-username"
            >
              Username
            </label>

            <input
              className="min-h-12 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-base outline-none transition placeholder:text-zinc-600 focus:border-[#31b8c6] focus:ring-2 focus:ring-[#31b8c6]/20 sm:text-sm"
              id="register-username"
              name="username"
              type="text"
              placeholder="Your username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-zinc-300"
              htmlFor="register-email"
            >
              Email
            </label>

            <input
              className="min-h-12 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-base outline-none transition placeholder:text-zinc-600 focus:border-[#31b8c6] focus:ring-2 focus:ring-[#31b8c6]/20 sm:text-sm"
              id="register-email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-medium text-zinc-300"
              htmlFor="register-password"
            >
              Password
            </label>

            <input
              className="min-h-12 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-base outline-none transition placeholder:text-zinc-600 focus:border-[#31b8c6] focus:ring-2 focus:ring-[#31b8c6]/20 sm:text-sm"
              id="register-password"
              name="password"
              type="password"
              placeholder="Create a password (minimum 6 characters)"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={6}
              required
            />

            <p className="mt-2 text-xs text-zinc-500">
              Password must contain at least 6 characters.
            </p>
          </div>

          <button
            className="min-h-12 w-full rounded-xl bg-[#31b8c6] px-4 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-[#31b8c6]/20 transition hover:bg-[#289eaa] disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-[#31b8c6]">
            {message}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-4 text-center text-sm text-red-400"
          >
            {error}
          </p>
        )}

        <p className="mt-8 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link
            className="font-medium text-[#31b8c6] hover:text-[#289eaa]"
            to="/login"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
};

export default Register;
