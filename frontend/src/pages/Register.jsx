import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/auth';
import toast from 'react-hot-toast';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await registerUser({ email, password, role });
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div className="card card-auth">
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <h1 className="heading">Create account</h1>
          <p className="subheading" style={{ marginBottom: 0 }}>
            Start managing your tasks today
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Register as</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-option ${role === 'USER' ? 'active' : ''}`}
                onClick={() => setRole('USER')}
              >
                <span className="role-option-icon">U</span>
                <div>
                  <span className="role-option-title">User</span>
                  <span className="role-option-desc">Create and manage your own tasks</span>
                </div>
              </button>
              <button
                type="button"
                className={`role-option role-option-admin ${role === 'ADMIN' ? 'active' : ''}`}
                onClick={() => setRole('ADMIN')}
              >
                <span className="role-option-icon role-option-icon-admin">A</span>
                <div>
                  <span className="role-option-title">Admin</span>
                  <span className="role-option-desc">Manage all users' tasks</span>
                </div>
              </button>
            </div>
          </div>

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
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary mt-1" disabled={loading}>
            {loading ? <span className="spinner" /> : `Create ${role === 'ADMIN' ? 'Admin' : 'User'} Account`}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-2">
          Already have an account?{' '}
          <Link to="/login" className="link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
