import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api/auth';
import toast from 'react-hot-toast';

const DEMO_ACCOUNTS = {
  user: { email: 'demo@taskmanager.com', password: 'demo123456' },
  admin: { email: 'admin@taskmanager.com', password: 'admin123456' },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginUser({ email, password });
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const account = DEMO_ACCOUNTS[role];
    setEmail(account.email);
    setPassword(account.password);
  };

  return (
    <div className="page-center">
      <div className="card card-auth">
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <h1 className="heading">Welcome back</h1>
          <p className="subheading" style={{ marginBottom: 0 }}>
            Sign in to manage your tasks
          </p>
        </div>

        <div className="quick-login">
          <p className="form-label" style={{ marginBottom: '0.5rem' }}>Quick login as:</p>
          <div className="quick-login-btns">
            <button type="button" className="quick-btn" onClick={() => fillDemo('user')}>
              <span className="quick-btn-icon">U</span>
              <div className="quick-btn-text">
                <span className="quick-btn-role">User</span>
                <span className="quick-btn-email">demo@taskmanager.com</span>
              </div>
            </button>
            <button type="button" className="quick-btn" onClick={() => fillDemo('admin')}>
              <span className="quick-btn-icon quick-btn-icon-admin">A</span>
              <div className="quick-btn-text">
                <span className="quick-btn-role">Admin</span>
                <span className="quick-btn-email">admin@taskmanager.com</span>
              </div>
            </button>
          </div>
        </div>

        <div className="divider"><span>or enter credentials</span></div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary mt-1" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-2">
          Don't have an account?{' '}
          <Link to="/register" className="link">Create one</Link>
        </p>
      </div>
    </div>
  );
}
