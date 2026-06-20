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
            className="bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] text-gray-900 border-none rounded-lg py-2 cursor-pointer font-bold hover:from-[var(--accent-dark)] hover:to-[oklch(40%_0.15_75)] hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--accent)] hover:text-[oklch(22%_0.065_152.934)]">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
