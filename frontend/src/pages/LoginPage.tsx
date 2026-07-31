import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sun, Moon, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiClient } from '../services/Api';
import type { AuthResponse } from '../context/AuthContext';
import { Input, FormField } from '../components/Forms';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { Alert } from '../components/Alert';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
      login(response.data);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      if (e.response && e.response.data && e.response.data.message) {
        setError(e.response.data.message);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-theme-toggle">
        <IconButton 
          icon={theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />} 
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title="Toggle theme"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
        />
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-primary-soft)', padding: '16px', borderRadius: '50%', marginBottom: '1.25rem' }}>
             <Briefcase size={32} color="var(--color-primary)" />
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to Knoweb Sales Management System</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          <FormField label="Email address" id="email">
            <div style={{ position: 'relative' }}>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            </div>
          </FormField>

          <FormField label="Password" id="password">
            <div style={{ position: 'relative' }}>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
              />
              <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <div style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)' }}>
                <IconButton 
                  icon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                  disabled={loading}
                  variant="ghost"
                  type="button"
                />
              </div>
            </div>
          </FormField>

          <Button 
            type="submit" 
            variant="primary" 
            isLoading={loading}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            Sign in
          </Button>
        </form>
        
        <div className="auth-footer">
          <Lock size={12} /> Secure access for authorized staff only.
        </div>
      </div>
    </div>
  );
};
