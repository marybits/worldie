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
      loginWithToken(token).then(() => {
        window.location.href = '/dashboard';
      });
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, loginWithToken]);

  return <p>Signing you in...</p>;
}

export default OAuthSuccess;