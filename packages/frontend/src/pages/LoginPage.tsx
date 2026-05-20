import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { login, selectAuthError, selectAuthLoading } from '../store/authSlice';
import { UserRole } from '@watcher/shared';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const error = useAppSelector(selectAuthError);
  const isLoading = useAppSelector(selectAuthLoading);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await dispatch(login({ username, password }));

    if (login.fulfilled.match(result)) {
      const role = result.payload.user.role;
      if (role === UserRole.FACEWATCH_ANALYST) {
        navigate('/verification');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 data-testid="login-title">Watcher</h1>
        <p className="login-subtitle">Incident Management Platform</p>

        <form onSubmit={handleSubmit} data-testid="login-form">
          {error && (
            <div className="error-message" data-testid="login-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              disabled={isLoading}
              data-testid="login-username-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              disabled={isLoading}
              data-testid="login-password-input"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            data-testid="login-submit-button"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
