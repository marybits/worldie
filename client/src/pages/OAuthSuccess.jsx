import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Remove the token from the URL immediately so it doesn't sit in browser history.
      // replaceState(state, title, url) replaces the current history entry without a reload.
      window.history.replaceState({}, document.title, '/oauth-success');

      loginWithToken(token).then(() => {
        // Use navigate() instead of window.location.href — no full page reload needed
        navigate('/dashboard', { replace: true });
      });
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, loginWithToken]);

  return <p>Signing you in...</p>;
}

export default OAuthSuccess;