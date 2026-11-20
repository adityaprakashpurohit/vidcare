import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, User, Check, Edit3, Save } from 'lucide-react';

const DoctorProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load initial profile from localStorage or defaults
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('vidcare_doctor_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      fullName: user?.name || 'Dr. Priya Sharma',
      email: user?.email || 'dr.priya@vidcare.in',
      phone: '+91 98201 12345',
      specialization: 'Cardiologist',
      experience: '15',
      fee: '120',
      qualifications: 'MD, DM Cardiology - AIIMS New Delhi',
      availableForAppointments: true
    };
  });

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    localStorage.setItem('vidcare_doctor_profile', JSON.stringify(profile));
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

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

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button
            onClick={() => navigate('/doctor')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '50%',
              color: 'var(--text-primary)',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#FAFAFA'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            title="Back to Doctor Dashboard"
          >
            <ArrowLeft size={24} />
          </button>

          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #FA520F 0%, #FFA110 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(46, 91, 255, 0.3)'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              border: '2px solid #FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={16} />
            </div>
          </div>

          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              Doctor Profile
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, marginTop: '2px' }}>
              Manage your information
            </p>
          </div>
        </div>

        <div>
          {isEditing ? (
            <button
              onClick={handleSave}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #FA520F 0%, #FFA110 100%)',
                color: 'white',
                border: 'none',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              <Save size={18} /> Save Profile
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #FA520F 0%, #FFA110 100%)',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(46, 91, 255, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              <Edit3 size={18} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Success Banner */}
      {savedSuccess && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#FFF8E0',
          border: '1px solid #FA520F',
          color: '#1F1F1F',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          fontSize: '0.95rem',
          fontWeight: '500'
        }}>
          <Check size={20} color="#FA520F" /> Profile changes updated and saved successfully!
        </div>
      )}

      {/* Main Profile Card Form */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #EDEDED',
        boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
        padding: '2.5rem'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: 'var(--text-primary)',
          marginBottom: '2rem'
        }}>
          Professional Information
        </h2>

        <form onSubmit={handleSave}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            {/* Full Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Full Name *
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Dr. Priya Sharma"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: isEditing ? '1.5px solid var(--accent-blue)' : '1px solid #EDEDED',
                  background: isEditing ? '#FFFFFF' : '#FAFAFA',
                  color: isEditing ? 'var(--text-primary)' : '#8A8A8A',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>

            {/* Email Address */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Email Address *
              </label>
              <input
                type="email"
                disabled={!isEditing}
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="dr.priya@vidcare.in"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: isEditing ? '1.5px solid var(--accent-blue)' : '1px solid #EDEDED',
                  background: isEditing ? '#FFFFFF' : '#FAFAFA',
                  color: isEditing ? 'var(--text-primary)' : '#8A8A8A',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Phone Number
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1-555-0102"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: isEditing ? '1.5px solid var(--accent-blue)' : '1px solid #EDEDED',
                  background: isEditing ? '#FFFFFF' : '#FAFAFA',
                  color: isEditing ? 'var(--text-primary)' : '#8A8A8A',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>

            {/* Specialization */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Specialization *
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  disabled={!isEditing}
                  value={profile.specialization}
                  onChange={(e) => handleChange('specialization', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: isEditing ? '1.5px solid var(--accent-blue)' : '1px solid #EDEDED',
                    background: isEditing ? '#FFFFFF' : '#FAFAFA',
                    color: isEditing ? 'var(--text-primary)' : '#8A8A8A',
                    fontSize: '0.95rem',
                    outline: 'none',
                    appearance: 'none',
                    cursor: isEditing ? 'pointer' : 'default'
                  }}
                >
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                <div style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: '#8A8A8A'
                }}>
                  ▼
                </div>
              </div>
            </div>

            {/* Years of Experience */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Years of Experience
              </label>
              <input
                type="number"
                disabled={!isEditing}
                value={profile.experience}
                onChange={(e) => handleChange('experience', e.target.value)}
                placeholder="15"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: isEditing ? '1.5px solid var(--accent-blue)' : '1px solid #EDEDED',
                  background: isEditing ? '#FFFFFF' : '#FAFAFA',
                  color: isEditing ? 'var(--text-primary)' : '#8A8A8A',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>

            {/* Consultation Fee */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Consultation Fee (USD) *
              </label>
              <input
                type="number"
                disabled={!isEditing}
                value={profile.fee}
                onChange={(e) => handleChange('fee', e.target.value)}
                placeholder="120"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: isEditing ? '1.5px solid var(--accent-blue)' : '1px solid #EDEDED',
                  background: isEditing ? '#FFFFFF' : '#FAFAFA',
                  color: isEditing ? 'var(--text-primary)' : '#8A8A8A',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>
          </div>

          {/* Qualifications */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Qualifications
            </label>
            <textarea
              rows={3}
              disabled={!isEditing}
              value={profile.qualifications}
              onChange={(e) => handleChange('qualifications', e.target.value)}
              placeholder="MD, DM Cardiology"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '10px',
                border: isEditing ? '1.5px solid var(--accent-blue)' : '1px solid #EDEDED',
                background: isEditing ? '#FFFFFF' : '#FAFAFA',
                color: isEditing ? 'var(--text-primary)' : '#8A8A8A',
                fontSize: '0.95rem',
                outline: 'none',
                resize: isEditing ? 'vertical' : 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          {/* Available for Appointments Toggle Box */}
          <div style={{
            background: '#FAFAFA',
            border: '1px solid #EDEDED',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Available for Appointments
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Accept new appointment requests
              </div>
            </div>

            {/* Toggle Switch */}
            <label style={{
              position: 'relative',
              display: 'inline-block',
              width: '52px',
              height: '28px',
              cursor: isEditing ? 'pointer' : 'default'
            }}>
              <input
                type="checkbox"
                disabled={!isEditing}
                checked={profile.availableForAppointments}
                onChange={(e) => handleChange('availableForAppointments', e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: profile.availableForAppointments ? '#FA520F' : '#E5E5E5',
                borderRadius: '34px',
                transition: '0.3s'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '22px',
                  width: '22px',
                  left: profile.availableForAppointments ? '26px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: '0.3s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </span>
            </label>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorProfile;
