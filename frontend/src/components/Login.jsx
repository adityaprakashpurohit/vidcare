import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  User, 
  Stethoscope, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone,
  Briefcase,
  GraduationCap,
  DollarSign,
  Clock,
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Check
} from 'lucide-react';

const Login = () => {
  const { login, register, loading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [role, setRole] = useState('patient'); // 'patient' | 'doctor' | 'admin'
  
  // Basic Auth Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('patient@vidcare.in');
  const [password, setPassword] = useState('patient123');
  
  // Doctor Profile Registration Fields
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('Cardiologist');
  const [experience, setExperience] = useState('');
  const [fee, setFee] = useState('');
  const [qualifications, setQualifications] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  const specializations = [
    'Cardiologist',
    'Pulmonologist',
    'General Physician',
    'Neurologist',
    'Radiologist',
    'Dermatologist',
    'Oncologist',
    'Hepatologist',
    'Psychiatrist'
  ];

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
    setSuccessMsg('');
    setIsPendingApproval(false);
    setApplicationSubmitted(false);
    if (mode === 'login') {
      if (newRole === 'patient') {
        setEmail('patient@vidcare.in');
        setPassword('patient123');
      } else if (newRole === 'doctor') {
        setEmail('doctor@vidcare.in');
        setPassword('doctor123');
      } else if (newRole === 'admin') {
        setEmail('admin@vidcare.in');
        setPassword('admin123');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsPendingApproval(false);

    if (mode === 'login') {
      const res = await login(email, password, role);
      if (res.success) {
        setSuccessMsg(res.message || 'Login successful!');
        setTimeout(() => {
          navigate(role === 'admin' ? '/admin' : role === 'doctor' ? '/doctor' : '/');
        }, 600);
      } else {
        if (res.isPending) {
          setIsPendingApproval(true);
        }
        setError(res.message);
      }
    } else {
      if (!name) {
        setError('Please enter your full name');
        return;
      }

      if (role === 'doctor') {
        if (!specialization || !experience || !fee) {
          setError('Please fill out all required doctor professional details');
          return;
        }
      }

      const profileData = role === 'doctor' ? {
        phone: phone || '+1-555-0102',
        specialization,
        experience,
        fee,
        qualifications: qualifications || 'MD, Clinical Medicine'
      } : {};

      const res = await register(name, email, password, role, profileData);
      
      if (res.success) {
        if (role === 'doctor' || res.isPending) {
          setApplicationSubmitted(true);
          setSuccessMsg('Doctor registration submitted! Awaiting administrator approval.');
        } else {
          setSuccessMsg('Account created successfully! Redirecting...');
          setTimeout(() => {
            navigate(role === 'admin' ? '/admin' : '/');
          }, 600);
        }
      } else {
        setError(res.message);
      }
    }
  };

  const roleMeta = {
    patient: {
      title: 'Patient Portal',
      desc: 'Access clinical health assistant, symptom analysis, BMI plans, and book virtual consultations.',
      icon: <User size={22} />,
      color: '#FA520F',
      bgLight: '#FFF8E0'
    },
    doctor: {
      title: 'Doctor Portal',
      desc: 'Apply for registration, manage clinical consultations, and utilize advanced diagnostic tools.',
      icon: <Stethoscope size={22} />,
      color: '#FA520F',
      bgLight: '#FFF8E0'
    },
    admin: {
      title: 'Admin Console',
      desc: 'Review and approve doctor registrations, manage user records, and monitor clinical diagnostic engines.',
      icon: <ShieldCheck size={22} />,
      color: '#FA520F',
      bgLight: '#FFF8E0'
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }} className="animate-fade-in">
      <div style={{
        width: '100%',
        maxWidth: (mode === 'register' && role === 'doctor') ? '680px' : '520px',
        background: 'white',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08), 0 0 1px 1px rgba(0,0,0,0.04)',
        border: '1px solid var(--border-light)',
        overflow: 'hidden',
        transition: 'max-width 0.3s ease'
      }}>
        {/* Top Header */}
        <div style={{
          background: 'linear-gradient(90deg, #FA520F 0%, #FFA110 35%, #FFB83E 65%, #FFD900 85%, #FFF8E0 100%)',
          padding: '2.5rem 2rem 1.5rem 2rem',
          borderBottom: '1px solid #E6D5A8',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'white',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-light)',
            marginBottom: '1rem',
            boxShadow: 'var(--shadow-card)'
          }}>
            <Activity size={18} color="var(--accent-blue)" />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px' }}>
              VIDCARE <span style={{ color: '#FA520F' }}>PORTAL</span>
            </span>
          </div>

          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {applicationSubmitted 
              ? 'Application Under Review' 
              : mode === 'login' 
                ? 'Welcome Back' 
                : role === 'doctor' 
                  ? 'Doctor Registration Application' 
                  : 'Create an Account'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
            {applicationSubmitted
              ? 'Your application has been received and is waiting for administrator approval.'
              : roleMeta[role].desc}
          </p>
        </div>

        {/* Application Submitted State */}
        {applicationSubmitted ? (
          <div style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: '#FFF8E0',
              border: '2px solid #FA520F',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              color: '#FA520F'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Doctor Application Submitted!
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem', maxWidth: '460px', margin: '0 auto 2rem auto' }}>
              Thank you, <strong>Dr. {name}</strong>. Your professional credentials and registration details have been submitted. 
              An administrator will review and approve your account shortly. You will be able to log in once your profile is verified.
            </p>

            <button
              onClick={() => {
                setApplicationSubmitted(false);
                setMode('login');
                setError('');
                setSuccessMsg('');
              }}
              className="btn-primary"
              style={{ padding: '12px 28px', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Lock size={16} /> Return to Login
            </button>
          </div>
        ) : (
          <>
            {/* Role Selector Tabs */}
            <div style={{ padding: '1.5rem 2rem 0 2rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '0.75rem' }}>
                Select Role:
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                background: '#FFF8E0',
                padding: '4px',
                borderRadius: 'var(--radius-md)'
              }}>
                {['patient', 'doctor', 'admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleChange(r)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      fontWeight: role === r ? '700' : '500',
                      color: role === r ? roleMeta[r].color : 'var(--text-secondary)',
                      background: role === r ? 'white' : 'transparent',
                      boxShadow: role === r ? '0 2px 4px rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.2s ease',
                      textTransform: 'capitalize'
                    }}
                  >
                    {roleMeta[r].icon}
                    <span>{r}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem 2rem 2rem 2rem' }}>
              {isPendingApproval && (
                <div style={{
                  background: '#FFF8E0',
                  border: '1.5px solid #E6D5A8',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  color: '#CC3A05'
                }}>
                  <Clock size={22} style={{ flexShrink: 0, marginTop: '2px', color: '#FA520F' }} />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '2px' }}>
                      Account Pending Admin Approval
                    </div>
                    <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                      Your doctor application is currently under review by the administrator. Please wait for approval confirmation before signing in.
                    </div>
                  </div>
                </div>
              )}

              {error && !isPendingApproval && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#FFF8E0',
                  border: '1px solid #E6D5A8',
                  color: 'var(--accent-danger)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem'
                }}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && !isPendingApproval && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#FFF8E0',
                  border: '1px solid #E6D5A8',
                  color: 'var(--accent-emerald)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem'
                }}>
                  <CheckCircle2 size={18} />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Standard Account Fields */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: (mode === 'register' && role === 'doctor') ? 'repeat(auto-fit, minmax(260px, 1fr))' : '1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                {mode === 'register' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Full Name *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        placeholder={role === 'doctor' ? 'Dr. Priya Sharma' : 'Rahul Sharma'}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field"
                        style={{ paddingLeft: '42px' }}
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Email Address *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      placeholder="name@vidcare.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '42px' }}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '42px' }}
                      required
                    />
                  </div>
                </div>

                {/* Additional Fields for Doctor Registration */}
                {mode === 'register' && role === 'doctor' && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                        Phone Number
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                          type="text"
                          placeholder="+1-555-0102"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="input-field"
                          style={{ paddingLeft: '42px' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                        Specialization *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <Briefcase size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                        <select
                          value={specialization}
                          onChange={(e) => setSpecialization(e.target.value)}
                          className="input-field"
                          style={{ paddingLeft: '42px', appearance: 'none', cursor: 'pointer' }}
                          required
                        >
                          {specializations.map(spec => (
                            <option key={spec} value={spec}>{spec}</option>
                          ))}
                        </select>
                        <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#8A8A8A' }}>
                          ▼
                        </div>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                        Years of Experience *
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 12"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                        Consultation Fee (USD) *
                      </label>
                      <div style={{ position: 'relative' }}>
                        <DollarSign size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                          type="number"
                          placeholder="120"
                          value={fee}
                          onChange={(e) => setFee(e.target.value)}
                          className="input-field"
                          style={{ paddingLeft: '42px' }}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Qualifications for Doctor */}
              {mode === 'register' && role === 'doctor' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Medical Qualifications & Fellowship Details
                  </label>
                  <div style={{ position: 'relative' }}>
                    <GraduationCap size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
                    <textarea
                      rows={2}
                      placeholder="e.g. MD, DM Cardiology - Harvard Fellowship"
                      value={qualifications}
                      onChange={(e) => setQualifications(e.target.value)}
                      className="input-field"
                      style={{ paddingLeft: '42px', resize: 'vertical', fontFamily: 'inherit' }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: roleMeta[role].color,
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: `0 4px 12px ${roleMeta[role].color}40`,
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>
                      {mode === 'login' 
                        ? `Sign In as ${role.toUpperCase()}` 
                        : role === 'doctor' 
                          ? 'Submit Doctor Application for Approval' 
                          : `Register as ${role.toUpperCase()}`}
                    </span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Quick Demo Hint */}
              <div style={{
                marginTop: '1.25rem',
                padding: '10px 12px',
                background: '#FFF8E0',
                border: '1px dashed var(--border-light)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>Portal Access: <strong>{role}@vidcare.in</strong> / <strong>{role}123</strong></span>
                <button
                  type="button"
                  onClick={() => handleRoleChange(role)}
                  style={{ background: 'none', color: roleMeta[role].color, fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer', border: 'none' }}
                >
                  Auto-fill
                </button>
              </div>

              {/* Mode Switcher */}
              <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {mode === 'login' ? (
                  <span>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('register'); setError(''); setIsPendingApproval(false); }}
                      style={{ background: 'none', color: 'var(--accent-blue)', fontWeight: '600', cursor: 'pointer', border: 'none' }}
                    >
                      {role === 'doctor' ? 'Apply for Doctor Registration' : 'Create one now'}
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setError(''); setIsPendingApproval(false); }}
                      style={{ background: 'none', color: 'var(--accent-blue)', fontWeight: '600', cursor: 'pointer', border: 'none' }}
                    >
                      Sign in here
                    </button>
                  </span>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
