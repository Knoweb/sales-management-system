import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  BriefcaseBusiness,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiClient } from '../services/Api';
import { Input, FormField } from '../components/Forms';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { Alert } from '../components/Alert';

const features = [
  'Structured opportunity management',
  'Clear approval and routing workflows',
  'Secure role-based access',
];

const inputStyle = {
  width: '100%',
  height: '46px',
  paddingLeft: '2.7rem',
  borderRadius: '9px',
};

const loginStyles = `
  .login-page,
  .login-page *,
  .login-page *::before,
  .login-page *::after {
    box-sizing: border-box;
  }

  .login-page {
    width: 100%;
    min-height: 100dvh;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-x: hidden;
    background:
      radial-gradient(circle at 0 0, rgba(59,130,246,.12), transparent 35%),
      radial-gradient(circle at 100% 100%, rgba(99,102,241,.08), transparent 30%),
      var(--color-background, #f4f7fb);
  }

  .login-layout {
    width: min(1120px, 100%);
    height: min(680px, calc(100dvh - 40px));
    min-height: 590px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(440px, .88fr);
    overflow: hidden;
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: 16px;
    background: var(--color-surface, #ffffff);
    box-shadow: 0 24px 65px rgba(15,23,42,.09);
  }

  .login-brand-panel {
    min-width: 0;
    padding: 40px 46px 34px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
    color: #ffffff;
    background:
      radial-gradient(circle at 5% 5%, rgba(147,197,253,.17), transparent 28%),
      linear-gradient(145deg, #172554, #1e3a8a 58%, #1d4ed8 130%);
  }

  .login-brand-panel::after {
    content: "";
    width: 300px;
    height: 300px;
    position: absolute;
    right: -170px;
    bottom: -170px;
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 50%;
    box-shadow:
      0 0 0 50px rgba(255,255,255,.025),
      0 0 0 100px rgba(255,255,255,.018);
  }

  .login-brand-top,
  .login-brand-content,
  .login-brand-footer {
    position: relative;
    z-index: 1;
  }

  .login-brand-top {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .login-brand-icon {
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border: 1px solid rgba(255,255,255,.22);
    border-radius: 10px;
    background: rgba(255,255,255,.1);
  }

  .login-brand-name,
  .login-brand-description {
    display: block;
  }

  .login-brand-name {
    margin-bottom: 2px;
    font-size: 17px;
    font-weight: 700;
  }

  .login-brand-description {
    color: rgba(255,255,255,.66);
    font-size: 12px;
  }

  .login-brand-content {
    max-width: 430px;
    margin: auto 0;
    padding: 34px 0;
  }

  .login-eyebrow {
    display: block;
    margin-bottom: 17px;
    color: rgba(219,234,254,.78);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .14em;
    text-transform: uppercase;
  }

  .login-brand-content h1 {
    max-width: 390px;
    margin: 0;
    color: #ffffff;
    font-size: clamp(32px, 3.1vw, 42px);
    line-height: 1.12;
    letter-spacing: -.035em;
  }

  .login-brand-content > p {
    max-width: 420px;
    margin: 19px 0 0;
    color: rgba(255,255,255,.72);
    font-size: 14px;
    line-height: 1.72;
  }

  .login-feature-list {
    margin-top: 28px;
    display: grid;
    gap: 12px;
  }

  .login-feature {
    display: flex;
    align-items: center;
    gap: 10px;
    color: rgba(255,255,255,.86);
    font-size: 13px;
  }

  .login-feature-icon {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 6px;
    background: rgba(255,255,255,.12);
  }

  .login-brand-footer {
    margin: 0;
    color: rgba(255,255,255,.62);
    font-size: 11px;
  }

  .login-form-panel {
    min-width: 0;
    padding: 44px 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow-y: auto;
    background: var(--color-surface, #ffffff);
  }

  .login-theme-toggle {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 5;
    padding: 2px;
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: 9px;
    background: var(--color-surface, #ffffff);
    box-shadow: 0 3px 10px rgba(15,23,42,.05);
  }

  .login-form-container {
    width: min(100%, 420px);
    transform: translateY(10px);
  }

  .login-mobile-brand {
    display: none;
  }

  .login-form-header {
    margin-bottom: 27px;
  }

  .login-form-header h2 {
    margin: 0;
    color: var(--color-text-primary, #0f172a);
    font-size: 27px;
    line-height: 1.25;
    letter-spacing: -.03em;
  }

  .login-form-header p {
    margin: 8px 0 0;
    color: var(--color-text-muted, #64748b);
    font-size: 13.5px;
  }

  .login-form {
    display: grid;
    gap: 17px;
  }

  .login-input-wrapper {
    position: relative;
  }

  .login-input-icon {
    position: absolute;
    top: 50%;
    left: 14px;
    z-index: 2;
    color: var(--color-text-muted, #64748b);
    pointer-events: none;
    transform: translateY(-50%);
  }

  .login-password-toggle {
    position: absolute;
    top: 50%;
    right: 7px;
    z-index: 3;
    transform: translateY(-50%);
  }

  .login-submit button {
    height: 48px !important;
    border-radius: 9px !important;
    background: #2563eb !important;
  }

  .login-security-note {
    margin-top: 23px;
    padding-top: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    border-top: 1px solid var(--color-border, #e2e8f0);
    color: var(--color-text-muted, #64748b);
    font-size: 11.5px;
    text-align: center;
  }

  @media (max-width: 900px) {
    .login-page {
      padding: 18px;
    }

    .login-layout {
      width: min(500px, 100%);
      height: auto;
      min-height: min(650px, calc(100dvh - 36px));
      display: block;
    }

    .login-brand-panel {
      display: none;
    }

    .login-form-panel {
      min-height: min(650px, calc(100dvh - 36px));
      padding: 70px 44px 42px;
      overflow: visible;
    }

    .login-mobile-brand {
      display: block;
      margin-bottom: 13px;
      color: var(--color-primary, #2563eb);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
  }

  @media (max-width: 520px) {
    .login-page {
      padding: 0;
      align-items: stretch;
      background: var(--color-surface, #ffffff);
    }

    .login-layout,
    .login-form-panel {
      min-height: 100dvh;
    }

    .login-layout {
      width: 100%;
      border: 0;
      border-radius: 0;
      box-shadow: none;
    }

    .login-form-panel {
      padding: 78px 24px 36px;
    }

    .login-theme-toggle {
      top: 18px;
      right: 18px;
    }

    .login-form-header h2 {
      font-size: 25px;
    }
  }

  @media (max-height: 680px) and (min-width: 901px) {
    .login-page {
      padding: 14px;
    }

    .login-layout {
      height: calc(100dvh - 28px);
      min-height: 540px;
    }

    .login-brand-panel {
      padding: 30px 38px 26px;
    }

    .login-brand-content {
      padding: 22px 0;
    }

    .login-brand-content h1 {
      font-size: 32px;
    }

    .login-feature-list {
      margin-top: 20px;
      gap: 9px;
    }

    .login-form-panel {
      padding-block: 34px 30px;
    }

    .login-form-header {
      margin-bottom: 20px;
    }

    .login-form {
      gap: 13px;
    }
  }
`;

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', {
        email: email.trim(),
        password,
      });

      login(response.data);
      navigate(from, { replace: true });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{loginStyles}</style>

      <main className="login-page">
        <section className="login-layout">
          <aside className="login-brand-panel">
            <div className="login-brand-top">
              <div className="login-brand-icon">
                <BriefcaseBusiness size={22} />
              </div>

              <div>
                <span className="login-brand-name">Knoweb</span>
                <span className="login-brand-description">
                  Sales Management System
                </span>
              </div>
            </div>

            <div className="login-brand-content">
              <span className="login-eyebrow">
                Internal sales workspace
              </span>

              <h1>Manage your sales workflow with clarity.</h1>

              <p>
                Access opportunities, approvals, client details and sales
                activities from one secure workspace.
              </p>

              <div className="login-feature-list">
                {features.map((feature) => (
                  <div className="login-feature" key={feature}>
                    <span className="login-feature-icon">
                      <Check size={14} />
                    </span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="login-brand-footer">
              Internal system for authorized Knoweb staff.
            </p>
          </aside>

          <div className="login-form-panel">
            <div className="login-theme-toggle">
              <IconButton
                type="button"
                icon={theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                onClick={toggleTheme}
                aria-label={`Switch to ${nextTheme} mode`}
                title={`Switch to ${nextTheme} mode`}
                variant="ghost"
              />
            </div>

            <div className="login-form-container">
              <div className="login-form-header">
                <span className="login-mobile-brand">Knoweb Sales</span>
                <h2>Sign in to your account</h2>
                <p>Enter your work email and password to continue.</p>
              </div>

              <form className="login-form" onSubmit={handleSubmit}>
                {error && <Alert variant="error">{error}</Alert>}

                <FormField label="Email address" id="email">
                  <div className="login-input-wrapper">
                    <Mail
                      size={17}
                      className="login-input-icon"
                      aria-hidden="true"
                    />

                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      disabled={loading}
                      style={{
                        ...inputStyle,
                        paddingRight: '1rem',
                      }}
                    />
                  </div>
                </FormField>

                <FormField label="Password" id="password">
                  <div className="login-input-wrapper">
                    <Lock
                      size={17}
                      className="login-input-icon"
                      aria-hidden="true"
                    />

                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="current-password"
                      disabled={loading}
                      style={{
                        ...inputStyle,
                        paddingRight: '3rem',
                      }}
                    />

                    <div className="login-password-toggle">
                      <IconButton
                        type="button"
                        icon={
                          showPassword
                            ? <EyeOff size={16} />
                            : <Eye size={16} />
                        }
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={`${showPassword ? 'Hide' : 'Show'} password`}
                        title={`${showPassword ? 'Hide' : 'Show'} password`}
                        disabled={loading}
                        variant="ghost"
                      />
                    </div>
                  </div>
                </FormField>

                <div className="login-submit">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={loading}
                    style={{
                      width: '100%',
                      border: 0,
                      boxShadow: 'none',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    Sign in
                  </Button>
                </div>
              </form>

              <div className="login-security-note">
                <ShieldCheck size={15} />
                <span>Protected access for authorized staff only</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};