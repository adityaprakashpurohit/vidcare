import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Calendar, 
  Video, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  Copy, 
  ExternalLink, 
  User, 
  Stethoscope, 
  Plus, 
  Trash2, 
  RotateCcw,
  CalendarPlus,
  FileText,
  ChevronRight
} from 'lucide-react';

const PatientAppointments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const defaultPatientAppointments = [
    {
      id: 'APT-101',
      doctor: 'Dr. Rajesh Kumar (Cardiologist)',
      doctorName: 'Dr. Rajesh Kumar',
      specialization: 'Cardiologist',
      name: user?.name || 'Rahul Sharma',
      date: '2026-09-02',
      time: '10:30 AM',
      requestedTime: '10:30 AM',
      confirmedTime: '10:30 AM',
      problem: 'Chest Discomfort & Fatigue',
      symptoms: 'Bilateral chest tightness for 4 days, mild evening fever',
      status: 'Confirmed',
      meetLink: 'https://meet.google.com/abc-defg-hij',
      doctorNotes: 'Patient asked to keep prior ECG and chest radiograph ready.'
    },
    {
      id: 'APT-102',
      doctor: 'Dr. Amit Sharma (Pulmonologist)',
      doctorName: 'Dr. Amit Sharma',
      specialization: 'Pulmonologist',
      name: user?.name || 'Rahul Sharma',
      date: '2026-09-02',
      time: '11:45 AM',
      requestedTime: '11:45 AM',
      confirmedTime: '',
      problem: 'Persistent Dry Cough & Shortness of Breath',
      symptoms: 'Dry cough worsening at night for 1 week',
      status: 'Pending Doctor Approval',
      meetLink: 'https://meet.google.com/klm-nopq-rst',
      doctorNotes: ''
    },
    {
      id: 'APT-103',
      doctor: 'Dr. Ananya Iyer (Dermatologist)',
      doctorName: 'Dr. Ananya Iyer',
      specialization: 'Dermatologist',
      name: user?.name || 'Rahul Sharma',
      date: '2026-08-28',
      time: '03:00 PM',
      requestedTime: '03:00 PM',
      confirmedTime: '',
      problem: 'Skin Rash & Allergic Reaction',
      symptoms: 'Erythematous itchy patch on forearm',
      status: 'Declined',
      meetLink: '',
      doctorNotes: 'Doctor is unavailable during this time slot. Please reschedule with another available dermatologist.'
    }
  ];

  const [appointments, setAppointments] = useState(() => {
    try {
      const saved = localStorage.getItem('vidcare_patient_appointments');
      if (saved) {
        const parsed = JSON.parse(saved);
        const combined = [...parsed];
        defaultPatientAppointments.forEach(def => {
          if (!combined.some(c => c.id === def.id)) {
            combined.push(def);
          }
        });
        return combined;
      }
    } catch (e) {}
    return defaultPatientAppointments;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'approved' | 'pending' | 'declined'
  const [copiedId, setCopiedId] = useState(null);
  const [actionAlert, setActionAlert] = useState('');

  // Persist appointments in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vidcare_patient_appointments', JSON.stringify(appointments));
    } catch (e) {}
  }, [appointments]);

  const copyMeetLink = (aptId, link) => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopiedId(aptId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCancelRequest = (aptId) => {
    if (window.confirm('Are you sure you want to cancel this appointment request?')) {
      const updated = appointments.filter(a => a.id !== aptId);
      setAppointments(updated);
      setActionAlert(`Appointment request ${aptId} has been cancelled.`);
      setTimeout(() => setActionAlert(''), 3500);
    }
  };

  // Filter appointments
  const filteredAppointments = appointments.filter(apt => {
    const isApproved = apt.status === 'Confirmed' || apt.status === 'Scheduled' || apt.status === 'Approved';
    const isPending = apt.status === 'Pending Doctor Approval' || apt.status === 'Pending' || apt.status === 'Awaiting Confirmation';
    const isDeclined = apt.status === 'Declined' || apt.status === 'Rejected' || apt.status === 'Cancelled';

    let matchesFilter = true;
    if (statusFilter === 'approved') matchesFilter = isApproved;
    else if (statusFilter === 'pending') matchesFilter = isPending;
    else if (statusFilter === 'declined') matchesFilter = isDeclined;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = q === '' ||
      apt.doctor?.toLowerCase().includes(q) ||
      apt.doctorName?.toLowerCase().includes(q) ||
      apt.specialization?.toLowerCase().includes(q) ||
      apt.problem?.toLowerCase().includes(q) ||
      apt.id?.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const approvedCount = appointments.filter(a => a.status === 'Confirmed' || a.status === 'Scheduled' || a.status === 'Approved').length;
  const pendingCount = appointments.filter(a => a.status === 'Pending Doctor Approval' || a.status === 'Pending' || a.status === 'Awaiting Confirmation').length;
  const declinedCount = appointments.filter(a => a.status === 'Declined' || a.status === 'Rejected' || a.status === 'Cancelled').length;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3.5rem' }}>
      
      {/* Top Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button
            onClick={() => navigate('/')}
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
            title="Back to Home"
          >
            <ArrowLeft size={24} />
          </button>

          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(90deg, #FA520F 0%, #FFA110 35%, #FFB83E 65%, #FFD900 85%, #FFF8E0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1F1F1F',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
          }}>
            <Calendar size={24} />
          </div>

          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              My Appointments
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '2px 0 0 0' }}>
              Track all your approved, pending, and rejected doctor consultations & join telehealth rooms
            </p>
          </div>
        </div>

        <Link
          to="/consultation"
          className="btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 22px',
            fontSize: '0.9rem',
            fontWeight: '700',
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)'
          }}
        >
          <CalendarPlus size={18} /> Book New Appointment
        </Link>
      </div>

      {/* Action Notification Alert */}
      {actionAlert && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#FAFAFA',
          border: '1.5px solid #FA520F',
          color: '#FA520F',
          padding: '14px 20px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          fontSize: '0.95rem',
          fontWeight: '600'
        }}>
          <CheckCircle2 size={20} color="#FA520F" /> {actionAlert}
        </div>
      )}

      {/* Overview Stat Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.25rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'white' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>ALL BOOKINGS</span>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#1F1F1F', margin: '4px 0 0 0' }}>{appointments.length}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'white' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#FA520F', letterSpacing: '0.5px' }}>APPROVED & CONFIRMED</span>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#FA520F', margin: '4px 0 0 0' }}>{approvedCount}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'white' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#FA520F', letterSpacing: '0.5px' }}>PENDING DOCTOR APPROVAL</span>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#FA520F', margin: '4px 0 0 0' }}>{pendingCount}</h2>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'white' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#CC3A05', letterSpacing: '0.5px' }}>DECLINED / CANCELLED</span>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#CC3A05', margin: '4px 0 0 0' }}>{declinedCount}</h2>
        </div>
      </div>

      {/* Main Glass Panel */}
      <div className="glass-panel" style={{ padding: '2rem', background: 'white' }}>
        
        {/* Controls Bar: Search & Status Filters */}
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
          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setStatusFilter('all')}
              style={{
                padding: '7px 16px',
                borderRadius: 'var(--radius-full)',
                border: statusFilter === 'all' ? '1.5px solid #FA520F' : '1px solid #EDEDED',
                background: statusFilter === 'all' ? '#FAFAFA' : '#ffffff',
                color: statusFilter === 'all' ? '#FA520F' : '#8A8A8A',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              All Appointments ({appointments.length})
            </button>

            <button
              onClick={() => setStatusFilter('approved')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 16px',
                borderRadius: 'var(--radius-full)',
                border: statusFilter === 'approved' ? '1.5px solid #FA520F' : '1px solid #EDEDED',
                background: statusFilter === 'approved' ? '#FFF8E0' : '#ffffff',
                color: statusFilter === 'approved' ? '#1F1F1F' : '#8A8A8A',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <CheckCircle2 size={14} /> Approved & Confirmed ({approvedCount})
            </button>

            <button
              onClick={() => setStatusFilter('pending')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 16px',
                borderRadius: 'var(--radius-full)',
                border: statusFilter === 'pending' ? '1.5px solid #FFA110' : '1px solid #EDEDED',
                background: statusFilter === 'pending' ? '#FFF0C2' : '#ffffff',
                color: statusFilter === 'pending' ? '#CC3A05' : '#8A8A8A',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <Clock size={14} /> Pending Approval ({pendingCount})
            </button>

            <button
              onClick={() => setStatusFilter('declined')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 16px',
                borderRadius: 'var(--radius-full)',
                border: statusFilter === 'declined' ? '1.5px solid #CC3A05' : '1px solid #EDEDED',
                background: statusFilter === 'declined' ? '#FFF8E0' : '#ffffff',
                color: statusFilter === 'declined' ? '#CC3A05' : '#8A8A8A',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <XCircle size={14} /> Declined / Rejected ({declinedCount})
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8A8A8A' }} />
            <input
              type="text"
              placeholder="Search doctor, specialty, problem..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '38px', height: '40px', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* List of Appointments */}
        {filteredAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#FAFAFA', borderRadius: '18px', border: '1.5px dashed #EDEDED' }}>
            <Calendar size={48} color="#8A8A8A" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
              No Appointments Found
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
              {searchQuery ? `No appointments match your search "${searchQuery}".` : 'You have no appointments currently in this category.'}
            </p>
            <Link
              to="/consultation"
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 20px', fontSize: '0.85rem', textDecoration: 'none' }}
            >
              <CalendarPlus size={16} /> Book an Appointment
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredAppointments.map((apt) => {
              const isApproved = apt.status === 'Confirmed' || apt.status === 'Scheduled' || apt.status === 'Approved';
              const isPending = apt.status === 'Pending Doctor Approval' || apt.status === 'Pending' || apt.status === 'Awaiting Confirmation';
              const isDeclined = apt.status === 'Declined' || apt.status === 'Rejected' || apt.status === 'Cancelled';

              return (
                <div
                  key={apt.id}
                  style={{
                    background: '#ffffff',
                    border: isApproved 
                      ? '1.5px solid #E6D5A8' 
                      : isPending 
                      ? '1.5px solid #E6D5A8' 
                      : '1.5px solid #E6D5A8',
                    borderRadius: '18px',
                    padding: '1.75rem',
                    boxShadow: isApproved ? '0 4px 16px rgba(16, 185, 129, 0.08)' : '0 2px 10px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Top Row: Doctor Info & Direct Action */}
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
                        background: isApproved ? '#FFF8E0' : isPending ? '#FFF8E0' : '#FFF8E0',
                        color: isApproved ? '#FA520F' : isPending ? '#FA520F' : '#CC3A05',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '1.25rem'
                      }}>
                        <Stethoscope size={26} />
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0, fontWeight: '700' }}>
                            {apt.doctor || apt.doctorName || 'Specialist Consultation'}
                          </h3>
                          
                          {/* Status Badges */}
                          {isApproved && (
                            <span style={{
                              padding: '3px 12px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              background: '#FFF8E0',
                              color: '#FA520F',
                              border: '1px solid #E6D5A8',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <CheckCircle2 size={13} /> Approved & Confirmed
                            </span>
                          )}

                          {isPending && (
                            <span style={{
                              padding: '3px 12px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              background: '#FFF0C2',
                              color: '#FA520F',
                              border: '1px solid #E6D5A8',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <Clock size={13} /> Pending Doctor Approval
                            </span>
                          )}

                          {isDeclined && (
                            <span style={{
                              padding: '3px 12px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              background: '#FFF8E0',
                              color: '#CC3A05',
                              border: '1px solid #E6D5A8',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <XCircle size={13} /> Declined / Rejected
                            </span>
                          )}

                          <span style={{ color: '#8A8A8A', fontSize: '0.8rem', fontWeight: '600' }}>
                            Appt ID: <strong>{apt.id}</strong>
                          </span>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                          Specialist: <strong>{apt.specialization || 'General Healthcare'}</strong> • Patient: <strong>{apt.name || user?.name}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {isApproved && (
                        <>
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
                            <Video size={17} /> Join Video Consultation
                          </a>
                        </>
                      )}

                      {isPending && (
                        <button
                          onClick={() => handleCancelRequest(apt.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '8px 14px',
                            borderRadius: 'var(--radius-md)',
                            background: '#FFF8E0',
                            color: '#CC3A05',
                            border: '1px solid #E6D5A8',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={14} /> Cancel Request
                        </button>
                      )}

                      {isDeclined && (
                        <Link
                          to="/consultation"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '9px 18px',
                            background: '#FA520F',
                            color: '#1F1F1F',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            textDecoration: 'none'
                          }}
                        >
                          <CalendarPlus size={16} /> Book with Another Doctor
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Consultation Schedule Info */}
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
                      <strong style={{ color: '#1F1F1F', fontSize: '0.95rem' }}>{apt.date || 'Scheduled Date'}</strong>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                        {isApproved ? 'Doctor Assigned Time Slot' : 'Preferred Time Slot'}
                      </span>
                      <strong style={{ color: isApproved ? '#FA520F' : '#FA520F', fontSize: '0.95rem' }}>
                        {apt.confirmedTime || apt.time || apt.requestedTime || '10:30 AM'}
                      </strong>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Chief Health Concern</span>
                      <strong style={{ color: '#1F1F1F', fontSize: '0.95rem' }}>{apt.problem || 'General Checkup'}</strong>
                    </div>
                  </div>

                  {/* Reported Symptoms */}
                  {apt.symptoms && (
                    <div style={{ marginBottom: '0.85rem', fontSize: '0.85rem', background: '#FFF0C2', border: '1px solid #FFF0C2', padding: '10px 14px', borderRadius: '10px' }}>
                      <strong style={{ color: '#CC3A05', display: 'block', marginBottom: '2px' }}>Your Reported Symptoms:</strong>
                      <p style={{ margin: 0, color: '#3D3D3D' }}>{apt.symptoms}</p>
                    </div>
                  )}

                  {/* Doctor Rejection Comment or Confirmed Note */}
                  {(apt.rejectionReason || apt.doctorNotes) && (
                    <div style={{
                      marginTop: '0.85rem',
                      padding: '14px 18px',
                      borderRadius: '12px',
                      background: isDeclined ? '#FFF8E0' : '#FFF8E0',
                      border: isDeclined ? '1.5px solid #E6D5A8' : '1px solid #E6D5A8',
                      fontSize: '0.88rem',
                      color: isDeclined ? '#CC3A05' : '#1F1F1F'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', marginBottom: '3px' }}>
                        {isDeclined ? <XCircle size={16} color="#CC3A05" /> : <CheckCircle2 size={16} color="#FA520F" />}
                        {isDeclined ? "Doctor's Reason / Comment for Rejection:" : "Doctor's Instructions / Note:"}
                      </div>
                      <p style={{ margin: 0, color: isDeclined ? '#3D3D3D' : '#1F1F1F', fontSize: '0.9rem', lineHeight: '1.4' }}>
                        "{apt.rejectionReason || apt.doctorNotes}"
                      </p>
                      {isDeclined && apt.declinedAt && (
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#CC3A05', marginTop: '4px' }}>
                          Declined on {apt.declinedAt}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Pending Notice */}
                  {isPending && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: '#CC3A05', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} /> <em>Awaiting doctor confirmation. You will receive the final confirmed time slot once the doctor reviews your symptoms.</em>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};

export default PatientAppointments;
