import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertTriangle, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Activity, 
  ExternalLink, 
  Shield, 
  Flame, 
  Brain, 
  HeartHandshake, 
  Building2,
  Ambulance
} from 'lucide-react';

const EmergencySupport = () => {
  const navigate = useNavigate();

  const emergencyNumbers = [
    {
      title: 'General Emergency',
      number: '911',
      tel: 'tel:911',
      badgeBg: '#FFF0C2',
      badgeColor: '#CC3A05',
      icon: <Ambulance size={20} color="#CC3A05" />,
      iconBg: '#FFF0C2'
    },
    {
      title: 'Poison Control',
      number: '1-800-222-1222',
      tel: 'tel:18002221222',
      badgeBg: '#FFF8E0',
      badgeColor: '#FA520F',
      icon: <Flame size={20} color="#FA520F" />,
      iconBg: '#FFF8E0'
    },
    {
      title: 'Suicide & Crisis Lifeline',
      number: '988',
      tel: 'tel:988',
      badgeBg: '#FFFAEB',
      badgeColor: '#FFA110',
      icon: <Brain size={20} color="#FFA110" />,
      iconBg: '#FFFAEB'
    },
    {
      title: 'Non-Emergency Medical',
      number: '211',
      tel: 'tel:211',
      badgeBg: '#FFF8E0',
      badgeColor: '#FA520F',
      icon: <HeartHandshake size={20} color="#FA520F" />,
      iconBg: '#FFF8E0'
    }
  ];

  const warningSymptoms = [
    'Difficulty breathing or shortness of breath',
    'Chest pain or pressure lasting more than a few minutes',
    'Sudden severe pain anywhere in the body',
    'Severe bleeding that won\'t stop',
    'Loss of consciousness or fainting',
    'Sudden confusion or trouble speaking',
    'Severe allergic reaction (swelling, hives)',
    'Thoughts of harming yourself or others'
  ];

  const additionalResources = [
    {
      title: 'CDC Emergency Preparedness',
      url: 'https://www.cdc.gov/emergency-preparedness/'
    },
    {
      title: 'WHO Health Emergencies',
      url: 'https://www.who.int/emergencies'
    },
    {
      title: '988 Suicide & Crisis Lifeline',
      url: 'https://988lifeline.org/'
    }
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '980px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Top Header Matching Screenshot */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        marginBottom: '1.75rem'
      }}>
        <button
          onClick={() => navigate(-1)}
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
          title="Back"
        >
          <ArrowLeft size={24} />
        </button>

        {/* Red Rounded Alert Badge */}
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '14px',
          background: '#CC3A05',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)'
        }}>
          <AlertTriangle size={24} />
        </div>

        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            Emergency Support
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, marginTop: '2px' }}>
            Immediate help & resources
          </p>
        </div>
      </div>

      {/* Warning Notice Banner */}
      <div style={{
        background: '#FFF8E0',
        border: '1.5px solid #E6D5A8',
        borderRadius: '14px',
        padding: '1rem 1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <AlertTriangle size={20} color="#CC3A05" style={{ flexShrink: 0 }} />
        <p style={{
          margin: 0,
          color: '#CC3A05',
          fontSize: '0.95rem',
          fontWeight: '500',
          lineHeight: '1.4'
        }}>
          If you are experiencing a life-threatening emergency, call <strong>911</strong> (or your local emergency number) immediately.
        </p>
      </div>

      {/* 4 Top Quick-Action Action Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {/* Card 1: Call Emergency (Red) */}
        <a
          href="tel:911"
          style={{
            background: '#CC3A05',
            color: '#FFFFFF',
            borderRadius: '18px',
            padding: '1.75rem 1.25rem',
            textAlign: 'center',
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(239, 68, 68, 0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Phone size={28} style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: '0 0 4px 0' }}>Call Emergency</h3>
          <p style={{ fontSize: '0.8rem', opacity: 0.9, margin: 0 }}>Dial 911 immediately</p>
        </a>

        {/* Card 2: Crisis Text Line (Purple) */}
        <a
          href="sms:741741?body=HOME"
          style={{
            background: '#FA520F',
            color: '#FFFFFF',
            borderRadius: '18px',
            padding: '1.75rem 1.25rem',
            textAlign: 'center',
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(168, 85, 247, 0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <MessageSquare size={28} style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: '0 0 4px 0' }}>Crisis Text Line</h3>
          <p style={{ fontSize: '0.8rem', opacity: 0.9, margin: 0 }}>Text HOME to 741741</p>
        </a>

        {/* Card 3: Find Hospital (Blue) */}
        <a
          href="https://www.google.com/maps/search/emergency+room+hospital+near+me"
          target="_blank"
          rel="noreferrer"
          style={{
            background: '#FA520F',
            color: '#FFFFFF',
            borderRadius: '18px',
            padding: '1.75rem 1.25rem',
            textAlign: 'center',
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(2, 132, 199, 0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Building2 size={28} style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: '0 0 4px 0' }}>Find Hospital</h3>
          <p style={{ fontSize: '0.8rem', opacity: 0.9, margin: 0 }}>Locate nearest ER</p>
        </a>

        {/* Card 4: Symptom Checker (Teal) */}
        <div
          onClick={() => navigate('/symptom-checker')}
          style={{
            background: '#FFA110',
            color: '#FFFFFF',
            borderRadius: '18px',
            padding: '1.75rem 1.25rem',
            textAlign: 'center',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(13, 148, 136, 0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Activity size={28} style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', margin: '0 0 4px 0' }}>Symptom Checker</h3>
          <p style={{ fontSize: '0.8rem', opacity: 0.9, margin: 0 }}>Check urgent symptoms</p>
        </div>
      </div>

      {/* Middle Section: 2 Columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Left Card: Emergency Numbers */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          border: '1px solid #FAFAFA',
          padding: '1.75rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <Phone size={20} color="#CC3A05" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              Emergency Numbers
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {emergencyNumbers.map((item, idx) => (
              <a
                key={idx}
                href={item.tel}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: '#FAFAFA',
                  border: '1px solid #FAFAFA',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'background 0.2s, transform 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#FAFAFA';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#FAFAFA';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: item.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {item.icon}
                  </div>
                  <strong style={{ fontSize: '0.95rem', color: '#1F1F1F' }}>{item.title}</strong>
                </div>

                <span style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: item.badgeBg,
                  color: item.badgeColor,
                  fontSize: '0.85rem',
                  fontWeight: '700'
                }}>
                  {item.number}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Right Card: When to Seek Immediate Help */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          border: '1px solid #FAFAFA',
          padding: '1.75rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <AlertTriangle size={20} color="#FA520F" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              When to Seek Immediate Help
            </h3>
          </div>

          <ul style={{
            margin: 0,
            paddingLeft: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            color: '#3D3D3D',
            fontSize: '0.9rem',
            lineHeight: '1.4'
          }}>
            {warningSymptoms.map((symptom, idx) => (
              <li key={idx} style={{ color: '#1F1F1F' }}>
                <span style={{ color: '#3D3D3D' }}>{symptom}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Section: Additional Resources */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        border: '1px solid #FAFAFA',
        padding: '1.75rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
          <Shield size={20} color="#FA520F" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            Additional Resources
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {additionalResources.map((res, idx) => (
            <a
              key={idx}
              href={res.url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '12px',
                background: '#FAFAFA',
                border: '1px solid #FAFAFA',
                textDecoration: 'none',
                color: '#1F1F1F',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'background 0.2s, color 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#FAFAFA';
                e.currentTarget.style.color = '#FA520F';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#FAFAFA';
                e.currentTarget.style.color = '#1F1F1F';
              }}
            >
              <span>{res.title}</span>
              <ExternalLink size={16} color="#8A8A8A" />
            </a>
          ))}
        </div>
      </div>

    </div>
  );
};

export default EmergencySupport;
