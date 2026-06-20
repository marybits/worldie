import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(username, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="bg-transparent rounded-2xl border border-gray-800 p-10 w-80">
        <h1 className="text-2xl mb-6 font-extrabold tracking-tight">Create your Worldie account ⚽</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 outline-none focus:border-[var(--accent)] placeholder:text-gray-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 outline-none focus:border-[var(--accent)] placeholder:text-gray-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 outline-none focus:border-[var(--accent)] placeholder:text-gray-500"
          />
          {error && <p className="text-red-500 text-sm m-0">{error}</p>}
          <button
            type="submit"
            className="bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] text-gray-900 border-none rounded-lg py-2 cursor-pointer font-bold hover:from-[var(--accent-dark)] hover:to-[oklch(32%_0.11_229.7)] hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Register
          </button>
        </form>
        <div className="flex items-center gap-2 my-4">
          <div className="flex-1 h-px bg-gray-800"></div>
          <span className="text-gray-500 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-800"></div>
        </div>

        <a
          href="http://localhost:8080/api/auth/google"
          className="flex items-center justify-center gap-2 border border-gray-700 rounded-lg py-2 hover:bg-gray-800 transition-colors text-gray-200 no-underline"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </a>

        <p className="mt-4 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--accent)] hover:text-[var(--accent-dark)]">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
