import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Lock, Mail, ArrowRight, User, Briefcase, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function LoginPage() {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('employee');
  const [regDepartment, setRegDepartment] = useState('Engineering');
  
  const [loading, setLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  const { login, register, switchDemoAccount } = useAuth();
  const { showToast } = useToast();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please provide both email and password.', 'error');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      showToast('Signed in successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    if (regPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
        department: regDepartment
      });

      showToast(res.message || 'Account created successfully! Please sign in.', 'success');
      
      // Auto-populate login form with newly registered email
      setEmail(regEmail.trim());
      setPassword('');
      setSuccessNotice(`Account created for ${regEmail.trim()}! Enter your password below to sign in.`);
      
      // Switch back to login tab for user to sign in
      setActiveTab('login');
      
      // Reset registration form
      setRegName('');
      setRegEmail('');
      setRegPassword('');
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    try {
      setLoading(true);
      await switchDemoAccount(demoEmail);
      showToast('Signed in with demo account!', 'success');
    } catch (err) {
      showToast(err.message || 'Demo sign in failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--colors-canvas)',
      padding: '2rem 1.5rem',
      backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255, 176, 132, 0.12) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(184, 164, 237, 0.12) 0%, transparent 40%)'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        background: '#ffffff',
        borderRadius: 'var(--rounded-xl)',
        border: '1px solid var(--colors-hairline)',
        boxShadow: '0 12px 36px rgba(10, 10, 10, 0.05)',
        overflow: 'hidden',
        transition: 'all 0.2s ease'
      }}>
        {/* Brand Header */}
        <div style={{
          background: 'var(--colors-primary)',
          padding: '2.25rem 2rem 2rem',
          color: 'var(--colors-on-primary)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'var(--colors-surface-card)',
            color: 'var(--colors-ink)',
            borderRadius: 'var(--rounded-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            fontWeight: 800,
            fontSize: '1.4rem',
            letterSpacing: '-0.5px'
          }}>
            P
          </div>
          <h1 style={{
            fontSize: '1.45rem',
            fontWeight: 500,
            margin: 0,
            color: 'var(--colors-on-primary)',
            letterSpacing: '-0.5px'
          }}>
            Prachay Securities
          </h1>
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--colors-muted-soft)',
            marginTop: '0.35rem',
            margin: 0
          }}>
            Expense Voucher Management System
          </p>
        </div>

        {/* Form Body */}
        <div style={{ padding: '2rem' }}>
          
          {/* Elegant Clay Pill Tabs: Sign In / Create Account */}
          <div style={{
            display: 'flex',
            background: 'var(--colors-surface-card)',
            padding: '4px',
            borderRadius: 'var(--rounded-full)',
            border: '1px solid var(--colors-hairline)',
            marginBottom: '1.75rem'
          }}>
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setSuccessNotice(''); }}
              data-testid="tab-login"
              style={{
                flex: 1,
                padding: '0.55rem 1rem',
                border: 'none',
                borderRadius: 'var(--rounded-full)',
                background: activeTab === 'login' ? 'var(--colors-primary)' : 'transparent',
                color: activeTab === 'login' ? 'var(--colors-on-primary)' : 'var(--colors-muted)',
                fontWeight: activeTab === 'login' ? 600 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setSuccessNotice(''); }}
              data-testid="tab-register"
              style={{
                flex: 1,
                padding: '0.55rem 1rem',
                border: 'none',
                borderRadius: 'var(--rounded-full)',
                background: activeTab === 'register' ? 'var(--colors-primary)' : 'transparent',
                color: activeTab === 'register' ? 'var(--colors-on-primary)' : 'var(--colors-muted)',
                fontWeight: activeTab === 'register' ? 600 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              Create Account
            </button>
          </div>

          {/* Success notice after registration */}
          {successNotice && activeTab === 'login' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.85rem 1rem',
              background: '#e6f7f2',
              border: '1px solid #a4d4c5',
              borderRadius: 'var(--rounded-md)',
              marginBottom: '1.25rem',
              color: '#0d4b3d',
              fontSize: '0.825rem'
            }}>
              <CheckCircle2 size={18} style={{ color: '#0d4b3d', flexShrink: 0 }} />
              <div>{successNotice}</div>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {activeTab === 'login' && (
            <div>
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="login-email">Work Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--colors-muted-soft)' }} />
                    <input
                      id="login-email"
                      type="email"
                      className="form-input"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="name@prachay.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      data-testid="login-email-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="login-password">Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--colors-muted-soft)' }} />
                    <input
                      id="login-password"
                      type="password"
                      className="form-input"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      data-testid="login-password-input"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', height: '44px', marginTop: '0.5rem' }}
                  disabled={loading}
                  data-testid="login-submit-btn"
                >
                  {loading ? 'Authenticating...' : 'Sign In to Portal'} <ArrowRight size={16} />
                </button>
              </form>

              {/* Toggle to Create Account */}
              <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                <span style={{ fontSize: '0.825rem', color: 'var(--colors-muted)' }}>
                  Don't have an account?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => { setActiveTab('register'); setSuccessNotice(''); }}
                  data-testid="switch-to-register-btn"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    color: 'var(--colors-ink)',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  Create an account
                </button>
              </div>

              {/* Quick Demo Logins Section */}
              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--colors-hairline)', paddingTop: '1.25rem' }}>
                <p style={{
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  color: 'var(--colors-muted)',
                  textTransform: 'uppercase',
                  marginBottom: '0.85rem',
                  letterSpacing: '0.08em',
                  textAlign: 'center'
                }}>
                  One-Click Evaluator Demo Accounts
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('rahul@prachay.com')}
                    className="btn btn-secondary"
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      minHeight: '48px',
                      border: '1px solid var(--colors-hairline)'
                    }}
                    data-testid="demo-login-rahul"
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--colors-brand-peach)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--colors-ink)' }}>Rahul (Employee)</div>
                      <div style={{ fontSize: '0.675rem', color: 'var(--colors-muted)' }}>Engineering</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin('priya@prachay.com')}
                    className="btn btn-secondary"
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      minHeight: '48px',
                      border: '1px solid var(--colors-hairline)'
                    }}
                    data-testid="demo-login-priya"
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--colors-brand-pink)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--colors-ink)' }}>Priya (Employee)</div>
                      <div style={{ fontSize: '0.675rem', color: 'var(--colors-muted)' }}>Marketing</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin('director@prachay.com')}
                    className="btn btn-secondary"
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      minHeight: '48px',
                      border: '1px solid var(--colors-hairline)'
                    }}
                    data-testid="demo-login-director"
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--colors-brand-lavender)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--colors-ink)' }}>Amit (Director)</div>
                      <div style={{ fontSize: '0.675rem', color: 'var(--colors-muted)' }}>Approver / Admin</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoLogin('accounts@prachay.com')}
                    className="btn btn-secondary"
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                      minHeight: '48px',
                      border: '1px solid var(--colors-hairline)'
                    }}
                    data-testid="demo-login-accounts"
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--colors-brand-mint)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--colors-ink)' }}>Sneha (Accounts)</div>
                      <div style={{ fontSize: '0.675rem', color: 'var(--colors-muted)' }}>Monitoring & Print</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CREATE AN ACCOUNT */}
          {activeTab === 'register' && (
            <div>
              <form onSubmit={handleRegisterSubmit}>
                {/* Full Name */}
                <div className="form-group">
                  <label className="form-label" htmlFor="register-name">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--colors-muted-soft)' }} />
                    <input
                      id="register-name"
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="e.g. Rishabh Patil"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                      data-testid="register-name-input"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="form-group">
                  <label className="form-label" htmlFor="register-email">Work Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--colors-muted-soft)' }} />
                    <input
                      id="register-email"
                      type="email"
                      className="form-input"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="you@domain.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      data-testid="register-email-input"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="form-group">
                  <label className="form-label" htmlFor="register-password">Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--colors-muted-soft)' }} />
                    <input
                      id="register-password"
                      type="password"
                      className="form-input"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="Minimum 6 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      minLength={6}
                      data-testid="register-password-input"
                    />
                  </div>
                </div>

                {/* Department & Role Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="register-department">Department</label>
                    <div style={{ position: 'relative' }}>
                      <Briefcase size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--colors-muted-soft)' }} />
                      <select
                        id="register-department"
                        className="form-select"
                        style={{ paddingLeft: '2.5rem' }}
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        data-testid="register-department-select"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Finance">Finance</option>
                        <option value="Operations">Operations</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Sales">Sales</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="register-role">Portal Role</label>
                    <div style={{ position: 'relative' }}>
                      <ShieldCheck size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--colors-muted-soft)' }} />
                      <select
                        id="register-role"
                        className="form-select"
                        style={{ paddingLeft: '2.5rem' }}
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value)}
                        data-testid="register-role-select"
                      >
                        <option value="employee">Employee</option>
                        <option value="director">Director (Approver)</option>
                        <option value="accounts">Accounts Team</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', height: '44px', marginTop: '0.75rem' }}
                  disabled={loading}
                  data-testid="register-submit-btn"
                >
                  {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={16} />
                </button>
              </form>

              {/* Toggle to Sign In */}
              <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                <span style={{ fontSize: '0.825rem', color: 'var(--colors-muted)' }}>
                  Already have an account?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setSuccessNotice(''); }}
                  data-testid="switch-to-login-btn"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    color: 'var(--colors-ink)',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  Sign in here
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
