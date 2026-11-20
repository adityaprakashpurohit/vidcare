import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Calendar, 
  Video, 
  User, 
  Clock, 
  CheckCircle2, 
  Search, 
  Filter, 
  Copy, 
  ExternalLink, 
  Phone, 
  Mail, 
  AlertCircle, 
  FileText, 
  Stethoscope, 
  Check, 
  X, 
  RotateCcw,
  Edit3
} from 'lucide-react';

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const defaultAppointments = [
    { 
      id: 'APT-101', 
      patient: 'Pooja Verma', 
      age: 34, 
      phone: '+91 98450 12345',
      email: 'pooja@example.com',
      problem: 'Chest Discomfort & Fatigue', 
      symptoms: 'Bilateral chest tightness for 4 days, mild evening fever',
      date: '2026-09-02',
      time: '10:30 AM', 
      confirmedTime: '10:30 AM',
      status: 'Confirmed', 
      meetLink: 'https://meet.google.com/abc-defg-hij',
      doctorNotes: 'Patient asked to keep prior ECG and chest radiograph ready.'
    },
    { 
      id: 'APT-102', 
      patient: 'Manish Gupta', 
      age: 52, 
      phone: '+91 98210 54321',
      email: 'manish@example.com',
      problem: 'Elevated Liver Enzymes & Jaundice', 
      symptoms: 'Abdominal heaviness and fatigue after fatty meals for 2 weeks',
      date: '2026-09-02',
      time: '11:45 AM', 
      confirmedTime: '11:45 AM',
      status: 'Confirmed', 
      meetLink: 'https://meet.google.com/klm-nopq-rst',
      doctorNotes: 'Review hepatic panel and ultrasound scan.'
    },
    { 
      id: 'APT-103', 
      patient: 'Sneha Nair', 
      age: 28, 
      phone: '+91 98765 89012',
      email: 'sneha@example.com',
      problem: 'Persistent Migraines & Sleep Disruption', 
      symptoms: 'Throbbing unilateral headache, light sensitivity',
      date: '2026-09-03',
      time: '02:15 PM', 
      confirmedTime: '02:15 PM',
      status: 'Confirmed', 
      meetLink: 'https://meet.google.com/uvw-xyz-123',
      doctorNotes: 'Review headache diary and sleep schedule.'
    }
  ];

  const [appointments, setAppointments] = useState(() => {
    try {
      const saved = localStorage.getItem('vidcare_patient_appointments');
      if (saved) {
        const parsed = JSON.parse(saved);
        const combined = [...parsed];
        defaultAppointments.forEach(def => {
          if (!combined.some(c => c.id === def.id)) {
            combined.push(def);
          }
        });
        return combined;
      }
    } catch (e) {}
    return defaultAppointments;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'today' | 'upcoming' | 'completed'
  const [copiedId, setCopiedId] = useState(null);
  const [successToast, setSuccessToast] = useState('');
  
  // Note editing state
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteText, setNoteText] = useState('');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vidcare_patient_appointments', JSON.stringify(appointments));
    } catch (e) {}
  }, [appointments]);

  const copyMeetLink = (aptId, link) => {
    navigator.clipboard.writeText(link);
    setCopiedId(aptId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleMarkCompleted = (aptId) => {
    setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, status: 'Completed' } : a));
    setSuccessToast(`Appointment ${aptId} marked as Completed.`);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  const handleSaveNote = (aptId) => {
    setAppointments(prev => prev.map(a => a.id === aptId ? { ...a, doctorNotes: noteText } : a));
    setEditingNoteId(null);
    setSuccessToast(`Clinical note updated for ${aptId}!`);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // Only consider confirmed or completed appointments
  const confirmedAppointments = appointments.filter(a => 
    a.status === 'Confirmed' || a.status === 'Scheduled' || a.status === 'Completed' || a.status === 'In Waiting Room'
  );

  const todayStr = '2026-09-02'; // Matching app date

  const filteredAppointments = confirmedAppointments.filter(apt => {
    const isToday = apt.date === todayStr || apt.date === 'Today' || apt.date === new Date().toISOString().split('T')[0];
    const isUpcoming = apt.date > todayStr || apt.date === 'Tomorrow';
    const isCompleted = apt.status === 'Completed';

    let matchesFilter = true;
    if (filterStatus === 'today') matchesFilter = isToday && !isCompleted;
    else if (filterStatus === 'upcoming') matchesFilter = isUpcoming;
    else if (filterStatus === 'completed') matchesFilter = isCompleted;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = q === '' ||
      apt.patient?.toLowerCase().includes(q) ||
      apt.name?.toLowerCase().includes(q) ||
      apt.problem?.toLowerCase().includes(q) ||
      apt.phone?.toLowerCase().includes(q) ||
      apt.email?.toLowerCase().includes(q) ||
      apt.id?.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const todayCount = confirmedAppointments.filter(a => a.date === todayStr || a.date === 'Today').length;
  const completedCount = confirmedAppointments.filter(a => a.status === 'Completed').length;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '3.5rem' }}>
      
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
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

          {/* Rounded Calendar Badge */}
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(90deg, #FA520F 0%, #FFA110 35%, #FFB83E 65%, #FFD900 85%, #FFF8E0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1F1F1F',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
          }}>
            <Calendar size={24} />
          </div>

          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              My Confirmed Appointments
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '2px 0 0 0' }}>
              Access, manage, and launch your scheduled patient video consultations
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link
            to="/doctor"
            className="btn-emerald"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '9px 18px', textDecoration: 'none' }}
          >
            <Stethoscope size={16} /> Doctor Portal
          </Link>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successToast && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#FFF8E0',
          border: '1.5px solid #FA520F',
          color: '#1F1F1F',
          padding: '14px 20px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          fontSize: '0.95rem',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
        }}>
          <CheckCircle2 size={20} color="#FA520F" /> {successToast}
        </div>
      )}

      {/* Overview Stat Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.25rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'white' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>ALL CONFIRMED SESSIONS</span>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#FA520F', margin: '4px 0 0 0' }}>{confirmedAppointments.length}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'white' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>TODAY'S SCHEDULED</span>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#FA520F', margin: '4px 0 0 0' }}>{todayCount}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'white' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>COMPLETED CONSULTATIONS</span>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#FA520F', margin: '4px 0 0 0' }}>{completedCount}</h2>
        </div>
      </div>

      {/* Main Container */}
      <div className="glass-panel" style={{ padding: '2rem', background: 'white' }}>
        
        {/* Controls Bar: Search & Filter Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid #FAFAFA'
        }}>
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilterStatus('all')}
              style={{
                padding: '7px 16px',
                borderRadius: 'var(--radius-full)',
                border: filterStatus === 'all' ? '1.5px solid #FA520F' : '1px solid #EDEDED',
                background: filterStatus === 'all' ? '#FFF8E0' : '#ffffff',
                color: filterStatus === 'all' ? '#1F1F1F' : '#8A8A8A',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              All Confirmed ({confirmedAppointments.length})
            </button>

            <button
              onClick={() => setFilterStatus('today')}
              style={{
                padding: '7px 16px',
                borderRadius: 'var(--radius-full)',
                border: filterStatus === 'today' ? '1.5px solid #FA520F' : '1px solid #EDEDED',
                background: filterStatus === 'today' ? '#FAFAFA' : '#ffffff',
                color: filterStatus === 'today' ? '#FA520F' : '#8A8A8A',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              📅 Today's Consultations ({todayCount})
            </button>

            <button
              onClick={() => setFilterStatus('upcoming')}
              style={{
                padding: '7px 16px',
                borderRadius: 'var(--radius-full)',
                border: filterStatus === 'upcoming' ? '1.5px solid #FA520F' : '1px solid #EDEDED',
                background: filterStatus === 'upcoming' ? '#FAFAFA' : '#ffffff',
                color: filterStatus === 'upcoming' ? '#FA520F' : '#8A8A8A',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              ⏳ Upcoming
            </button>

            <button
              onClick={() => setFilterStatus('completed')}
              style={{
                padding: '7px 16px',
                borderRadius: 'var(--radius-full)',
                border: filterStatus === 'completed' ? '1.5px solid #FA520F' : '1px solid #EDEDED',
                background: filterStatus === 'completed' ? '#FFF8E0' : '#ffffff',
                color: filterStatus === 'completed' ? '#1F1F1F' : '#8A8A8A',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              ✓ Completed ({completedCount})
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8A8A8A' }} />
            <input
              type="text"
              placeholder="Search patient name, problem, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '38px', height: '40px', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Appointments Cards List */}
        {filteredAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#FAFAFA', borderRadius: '18px', border: '1.5px dashed #EDEDED' }}>
            <Calendar size={48} color="#8A8A8A" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
              No Confirmed Appointments Found
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
              {searchQuery ? `No appointments match your search "${searchQuery}".` : 'You currently have no confirmed appointments matching this filter.'}
            </p>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="btn-outline" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredAppointments.map((apt) => {
              const isCompleted = apt.status === 'Completed';
              const patientName = apt.patient || apt.name || 'Patient';
              const isEditing = editingNoteId === apt.id;

              return (
                <div
                  key={apt.id}
                  style={{
                    background: '#ffffff',
                    border: isCompleted ? '1.5px solid #EDEDED' : '1.5px solid #E6D5A8',
                    borderRadius: '18px',
                    padding: '1.75rem',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Top Row: Patient Info & Google Meet Link */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    marginBottom: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '16px',
                        background: isCompleted ? '#FAFAFA' : '#FFF8E0',
                        color: isCompleted ? '#8A8A8A' : '#FA520F',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '1.25rem'
                      }}>
                        <User size={24} />
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0, fontWeight: '700' }}>
                            {patientName}
                          </h3>
                          
                          <span style={{
                            padding: '3px 12px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            background: isCompleted ? '#FAFAFA' : '#FFF8E0',
                            color: isCompleted ? '#3D3D3D' : '#FA520F',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <CheckCircle2 size={12} /> {apt.status}
                          </span>

                          <span style={{ color: '#8A8A8A', fontSize: '0.8rem', fontWeight: '600' }}>
                            ID: <strong>{apt.id}</strong>
                          </span>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                          {apt.phone || '+1-555-0144'} • {apt.email || 'patient@vidcare.in'}
                        </p>
                      </div>
                    </div>

                    {/* Quick Call Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => copyMeetLink(apt.id, apt.meetLink || 'https://meet.google.com/abc-defg-hij')}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '9px 14px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid #EDEDED',
                          background: 'white',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          color: '#3D3D3D',
                          cursor: 'pointer'
                        }}
                      >
                        <Copy size={15} /> {copiedId === apt.id ? 'Copied!' : 'Copy Link'}
                      </button>

                      <a
                        href={apt.meetLink || 'https://meet.google.com/abc-defg-hij'}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '9px 20px',
                          background: '#FA520F',
                          color: '#1F1F1F',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.9rem',
                          fontWeight: '700',
                          textDecoration: 'none',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <Video size={17} /> Start Video Consultation
                      </a>
                    </div>
                  </div>

                  {/* Consultation Time & Details Grid */}
                  <div style={{
                    background: '#FAFAFA',
                    border: '1px solid #FAFAFA',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    fontSize: '0.85rem',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Appointment Date</span>
                      <strong style={{ color: '#1F1F1F', fontSize: '0.95rem' }}>{apt.date || 'Today'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Confirmed Time Slot</span>
                      <strong style={{ color: '#FA520F', fontSize: '0.95rem' }}>{apt.confirmedTime || apt.time}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Chief Health Problem</span>
                      <strong style={{ color: '#1F1F1F', fontSize: '0.95rem' }}>{apt.problem || apt.reason || 'General Consultation'}</strong>
                    </div>
                  </div>

                  {/* Reported Symptoms */}
                  {apt.symptoms && (
                    <div style={{ marginBottom: '1rem', fontSize: '0.85rem', background: '#FFF0C2', border: '1px solid #E6D5A8', padding: '10px 14px', borderRadius: '10px' }}>
                      <strong style={{ color: '#CC3A05', display: 'block', marginBottom: '2px' }}>Reported Symptoms:</strong>
                      <p style={{ margin: 0, color: '#3D3D3D' }}>{apt.symptoms}</p>
                    </div>
                  )}

                  {/* Doctor Clinical Notes & Session Completion */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    borderTop: '1px solid #FAFAFA',
                    paddingTop: '1rem',
                    fontSize: '0.85rem'
                  }}>
                    <div style={{ flex: 1, minWidth: '280px' }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add clinical instructions or prescription notes..."
                            className="input-field"
                            style={{ height: '36px', fontSize: '0.85rem' }}
                          />
                          <button
                            onClick={() => handleSaveNote(apt.id)}
                            style={{ padding: '6px 14px', background: '#FA520F', color: '#1F1F1F', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingNoteId(null)}
                            style={{ padding: '6px 10px', background: '#FAFAFA', border: '1px solid #EDEDED', borderRadius: '6px', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            <strong>Doctor's Notes:</strong> {apt.doctorNotes || 'No notes added yet.'}
                          </span>
                          <button
                            onClick={() => {
                              setEditingNoteId(apt.id);
                              setNoteText(apt.doctorNotes || '');
                            }}
                            style={{ background: 'none', border: 'none', color: '#FA520F', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '600' }}
                          >
                            <Edit3 size={13} /> Edit Note
                          </button>
                        </div>
                      )}
                    </div>

                    {!isCompleted && (
                      <button
                        onClick={() => handleMarkCompleted(apt.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-sm)',
                          background: '#FAFAFA',
                          border: '1px solid #EDEDED',
                          color: '#3D3D3D',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        <Check size={14} /> Mark as Completed
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};

export default DoctorAppointments;
