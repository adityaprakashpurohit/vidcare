import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, 
  Calendar, 
  Video, 
  UserCheck, 
  User,
  Activity, 
  Brain, 
  Heart, 
  Zap, 
  Wind,
  TrendingUp,
  Microscope,
  ArrowRight, 
  ShieldCheck,
  CheckCircle,
  Clock,
  Check,
  X,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Sparkles,
  MessageSquare
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();

  // Initial demo appointments
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
      requestedTime: '10:30 AM',
      time: '10:30 AM', 
      status: 'Confirmed', 
      meetLink: 'https://meet.google.com/abc-defg-hij',
      doctorNotes: 'Please bring prior chest X-ray scans.'
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
      requestedTime: '11:45 AM',
      time: '11:45 AM', 
      status: 'Pending Doctor Approval', 
      meetLink: 'https://meet.google.com/klm-nopq-rst',
      doctorNotes: ''
    },
    { 
      id: 'APT-103', 
      patient: 'Sneha Nair', 
      age: 28, 
      phone: '+91 98765 89012',
      email: 'sneha@example.com',
      problem: 'Persistent Migraines & Sleep Disruption', 
      symptoms: 'Throbbing unilateral headache, light sensitivity',
      date: '2026-09-02',
      requestedTime: '02:15 PM',
      time: '02:15 PM', 
      status: 'Pending Doctor Approval', 
      meetLink: 'https://meet.google.com/uvw-xyz-123',
      doctorNotes: ''
    },
  ];

  const [appointmentsList, setAppointmentsList] = useState(() => {
    try {
      const saved = localStorage.getItem('vidcare_patient_appointments');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Combine with defaults
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

  // State to hold doctor's assigned time and meeting link for each pending appointment
  const [assignedTimes, setAssignedTimes] = useState({});
  const [meetingLinksInput, setMeetingLinksInput] = useState({});
  const [doctorNotesInput, setDoctorNotesInput] = useState({});
  const [linkErrors, setLinkErrors] = useState({});
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'confirmed' | 'declined' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Decline modal & comment state
  const [rejectModalApt, setRejectModalApt] = useState(null);
  const [rejectComment, setRejectComment] = useState('');
  const [rejectError, setRejectError] = useState('');

  // Save changes to localStorage whenever appointmentsList changes
  useEffect(() => {
    try {
      localStorage.setItem('vidcare_patient_appointments', JSON.stringify(appointmentsList));
    } catch (e) {}
  }, [appointmentsList]);

  // Helper to generate quick meeting link
  const generateQuickMeetLink = (aptId) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    const randCode = (len = 3) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const genLink = `https://meet.google.com/${randCode(3)}-${randCode(4)}-${randCode(3)}`;
    setMeetingLinksInput(prev => ({ ...prev, [aptId]: genLink }));
    setLinkErrors(prev => ({ ...prev, [aptId]: '' }));
  };

  // Handle doctor approving the appointment and mentioning confirmed time & meeting link
  const handleApproveAppointment = (aptId) => {
    const chosenTime = assignedTimes[aptId] || appointmentsList.find(a => a.id === aptId)?.requestedTime || '10:00 AM';
    const note = doctorNotesInput[aptId] || '';
    const currentApt = appointmentsList.find(a => a.id === aptId);
    const link = (meetingLinksInput[aptId] !== undefined ? meetingLinksInput[aptId] : (currentApt?.meetLink || '')).trim();

    // Mandatory meeting link check
    if (!link) {
      setLinkErrors(prev => ({ ...prev, [aptId]: 'Meeting link is mandatory! Please enter or generate a video meeting link before accepting.' }));
      return;
    }

    setLinkErrors(prev => ({ ...prev, [aptId]: '' }));

    setAppointmentsList(prev => prev.map(apt => {
      if (apt.id === aptId) {
        return {
          ...apt,
          status: 'Confirmed',
          time: chosenTime,
          confirmedTime: chosenTime,
          meetLink: link,
          doctorNotes: note || apt.doctorNotes || 'Appointment confirmed by doctor.',
          approvedAt: new Date().toLocaleDateString()
        };
      }
      return apt;
    }));

    setSuccessToast(`Appointment ${aptId} approved with meeting link and scheduled for ${chosenTime}!`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  // Open Decline / Rejection Modal
  const handleOpenDeclineModal = (apt) => {
    setRejectModalApt(apt);
    setRejectComment('');
    setRejectError('');
  };

  // Handle doctor confirming decline with rejection comment
  const handleConfirmDecline = () => {
    if (!rejectComment.trim()) {
      setRejectError('Please provide a comment / reason for rejecting the appointment to notify the patient.');
      return;
    }

    const aptId = rejectModalApt.id;
    const finalReason = rejectComment.trim();

    setAppointmentsList(prev => prev.map(apt => {
      if (apt.id === aptId) {
        return {
          ...apt,
          status: 'Declined',
          rejectionReason: finalReason,
          doctorNotes: finalReason,
          declinedAt: new Date().toLocaleDateString()
        };
      }
      return apt;
    }));

    setSuccessToast(`Appointment ${aptId} has been declined with your comment.`);
    setRejectModalApt(null);
    setRejectComment('');
    setRejectError('');
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const pendingList = appointmentsList.filter(a => a.status === 'Pending Doctor Approval' || a.status === 'Pending' || a.status === 'Awaiting Confirmation');
  const confirmedList = appointmentsList.filter(a => a.status === 'Confirmed' || a.status === 'Scheduled' || a.status === 'In Waiting Room');
  const declinedList = appointmentsList.filter(a => a.status === 'Declined' || a.status === 'Cancelled');

  // Filtered by Search & Tab
  const getDisplayedAppointments = () => {
    let list = [];
    if (activeTab === 'pending') list = pendingList;
    else if (activeTab === 'confirmed') list = confirmedList;
    else if (activeTab === 'declined') list = declinedList;
    else list = appointmentsList;

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(a => 
      a.patient?.toLowerCase().includes(q) ||
      a.name?.toLowerCase().includes(q) ||
      a.problem?.toLowerCase().includes(q) ||
      a.id?.toLowerCase().includes(q)
    );
  };

  const displayedAppointments = getDisplayedAppointments();

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '3.5rem' }}>
      
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        background: 'linear-gradient(90deg, #FA520F 0%, #FFA110 35%, #FFB83E 65%, #FFD900 85%, #FFF8E0 100%)',
        padding: '2.5rem 2rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid #E6D5A8',
        marginBottom: '2.5rem',
        boxShadow: '0 4px 18px rgba(16, 185, 129, 0.06)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1F1F1F', color: '#FFFFFF', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.75rem' }}>
            <Stethoscope size={14} /> CLINICAL PORTAL
          </div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--text-primary)', margin: 0, fontWeight: '800' }}>
            Welcome, {user?.name || 'Dr. Sharma'}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem', fontSize: '0.95rem' }}>
            You have <strong style={{ color: '#FA520F' }}>{pendingList.length} pending appointment requests</strong> awaiting your time confirmation & approval.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link 
            to="/doctor/appointments" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '10px 18px',
              background: '#FA520F',
              borderRadius: 'var(--radius-md)',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '0.9rem',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)'
            }}
          >
            <Calendar size={18} /> My Appointments ({confirmedList.length})
          </Link>
          <Link 
            to="/doctor/profile" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '10px 18px',
              background: 'white',
              border: '1px solid #E6D5A8',
              borderRadius: 'var(--radius-md)',
              color: '#FA520F',
              fontWeight: '600',
              fontSize: '0.9rem',
              textDecoration: 'none',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <User size={18} /> Manage Profile
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
          border: '1.5px solid #E6D5A8',
          color: '#1F1F1F',
          padding: '14px 20px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          fontSize: '0.95rem',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
        }}>
          <CheckCircle size={20} color="#FA520F" /> {successToast}
        </div>
      )}

      {/* Overview Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <StatCard title="PENDING APPROVALS" value={pendingList.length} color="#FA520F" bg="#FFF8E0" highlight={pendingList.length > 0} />
        <StatCard title="CONFIRMED CONSULTATIONS" value={confirmedList.length} color="#FA520F" bg="#FFF8E0" />
        <StatCard title="DECLINED REQUESTS" value={declinedList.length} color="#CC3A05" bg="#FFF8E0" />
        <StatCard title="TOTAL TELEHEALTH SESSIONS" value={`${appointmentsList.length} Total`} color="#FA520F" bg="#FAFAFA" />
      </div>

      {/* ======================================================== */}
      {/* SECTION: APPOINTMENTS APPROVAL & TIME SCHEDULING HUB     */}
      {/* ======================================================== */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem', background: 'white' }}>
        
        {/* Header & Filter Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid #FAFAFA'
        }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', margin: 0, fontWeight: '700' }}>
              Patient Consultations & Appointment Requests
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Review patient intake symptoms, approve requests with confirmed time slots, or decline with feedback comments
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8A8A8A' }} />
              <input
                type="text"
                placeholder="Search patient name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '38px', height: '38px', fontSize: '0.85rem' }}
              />
            </div>
          </div>
        </div>

        {/* Tab Filters */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '2rem',
          borderBottom: '1px solid #FAFAFA',
          paddingBottom: '10px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setActiveTab('pending')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              border: activeTab === 'pending' ? '1.5px solid #FFA110' : '1px solid #EDEDED',
              background: activeTab === 'pending' ? '#FFF0C2' : '#ffffff',
              color: activeTab === 'pending' ? '#CC3A05' : '#8A8A8A',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <Clock size={15} /> Pending Approvals ({pendingList.length})
          </button>

          <button
            onClick={() => setActiveTab('confirmed')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              border: activeTab === 'confirmed' ? '1.5px solid #FA520F' : '1px solid #EDEDED',
              background: activeTab === 'confirmed' ? '#FFF8E0' : '#ffffff',
              color: activeTab === 'confirmed' ? '#1F1F1F' : '#8A8A8A',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <CheckCircle size={15} /> Confirmed ({confirmedList.length})
          </button>

          <button
            onClick={() => setActiveTab('declined')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              border: activeTab === 'declined' ? '1.5px solid #CC3A05' : '1px solid #EDEDED',
              background: activeTab === 'declined' ? '#FFF8E0' : '#ffffff',
              color: activeTab === 'declined' ? '#CC3A05' : '#8A8A8A',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <XCircle size={15} /> Declined ({declinedList.length})
          </button>

          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              border: activeTab === 'all' ? '1.5px solid #FA520F' : '1px solid #EDEDED',
              background: activeTab === 'all' ? '#FAFAFA' : '#ffffff',
              color: activeTab === 'all' ? '#FA520F' : '#8A8A8A',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            All Appointments ({appointmentsList.length})
          </button>
        </div>

        {/* List of Appointments */}
        {displayedAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#FAFAFA', borderRadius: '16px', border: '1.5px dashed #EDEDED' }}>
            <Calendar size={44} color="#8A8A8A" style={{ margin: '0 auto 0.75rem auto' }} />
            <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
              No Appointments in this View
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              {activeTab === 'pending' 
                ? 'All pending patient requests have been reviewed and approved.' 
                : activeTab === 'declined'
                ? 'No appointment requests have been declined.'
                : 'No appointments match the selected filter.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {displayedAppointments.map((apt) => {
              const isPending = apt.status === 'Pending Doctor Approval' || apt.status === 'Pending' || apt.status === 'Awaiting Confirmation';
              const isDeclined = apt.status === 'Declined' || apt.status === 'Cancelled';
              const isConfirmed = apt.status === 'Confirmed' || apt.status === 'Scheduled' || apt.status === 'Completed' || apt.status === 'In Waiting Room';
              const patientName = apt.patient || apt.name || 'Patient';
              const currentAssignedTime = assignedTimes[apt.id] || apt.time || apt.requestedTime || '10:30 AM';

              return (
                <div
                  key={apt.id}
                  style={{
                    background: '#ffffff',
                    border: isPending ? '2px solid #E6D5A8' : isDeclined ? '1.5px solid #E6D5A8' : '1.5px solid #EDEDED',
                    borderRadius: '18px',
                    padding: '1.75rem',
                    boxShadow: isPending ? '0 6px 18px rgba(245, 158, 11, 0.1)' : '0 2px 8px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Top Header Row */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: isPending ? '#FFF8E0' : isDeclined ? '#FFF8E0' : '#FFF8E0',
                        color: isPending ? '#FA520F' : isDeclined ? '#CC3A05' : '#FA520F',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '1.1rem'
                      }}>
                        <User size={22} />
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <h4 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0, fontWeight: '700' }}>
                            {patientName}
                          </h4>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            background: isPending ? '#FFF0C2' : isDeclined ? '#FFF8E0' : '#FFF8E0',
                            color: isPending ? '#FA520F' : isDeclined ? '#CC3A05' : '#FA520F',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {isPending ? <Clock size={12} /> : isDeclined ? <XCircle size={12} /> : <CheckCircle size={12} />} {apt.status}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
                          {apt.phone || '+1-555-0144'} • {apt.email || 'patient@vidcare.in'} • ID: <strong>{apt.id}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {isConfirmed && (
                        <a
                          href={apt.meetLink || 'https://meet.google.com/abc-defg-hij'}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '9px 18px',
                            background: '#FA520F',
                            color: '#FFFFFF',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            textDecoration: 'none',
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                          }}
                        >
                          <Video size={16} /> Start Video Call
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Medical Details Summary */}
                  <div style={{
                    background: '#FAFAFA',
                    border: '1px solid #FAFAFA',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    marginBottom: '1.25rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    fontSize: '0.85rem'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Requested Date</span>
                      <strong style={{ color: '#1F1F1F', fontSize: '0.95rem' }}>{apt.date || 'Today'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Patient Preferred Slot</span>
                      <strong style={{ color: '#FA520F', fontSize: '0.95rem' }}>{apt.requestedTime || apt.time || '10:30 AM'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Chief Health Problem</span>
                      <strong style={{ color: '#1F1F1F', fontSize: '0.95rem' }}>{apt.problem || apt.reason || 'General Consultation'}</strong>
                    </div>
                  </div>

                  {/* Reported Symptoms */}
                  {apt.symptoms && (
                    <div style={{ marginBottom: '1.25rem', fontSize: '0.85rem', background: '#FFF0C2', border: '1px solid #FFF0C2', padding: '10px 14px', borderRadius: '10px' }}>
                      <strong style={{ color: '#CC3A05', display: 'block', marginBottom: '2px' }}>Reported Symptoms:</strong>
                      <p style={{ margin: 0, color: '#3D3D3D' }}>{apt.symptoms}</p>
                    </div>
                  )}

                  {/* DOCTOR APPROVAL & TIME MENTION CONTROLS (Only for Pending requests) */}
                  {isPending && (
                    <div style={{
                      background: 'linear-gradient(90deg, #FA520F 0%, #FFA110 35%, #FFB83E 65%, #FFD900 85%, #FFF8E0 100%)',
                      border: '1.5px solid #E6D5A8',
                      borderRadius: '14px',
                      padding: '1.5rem',
                      marginTop: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', color: '#1F1F1F' }}>
                        <Clock size={18} color="#FA520F" />
                        <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>
                          Doctor Approval: Assign Time & Mandatory Video Meeting Link
                        </h5>
                      </div>

                      {/* Mandatory Video Meeting Link Field */}
                      <div style={{ marginBottom: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '6px' }}>
                          <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1F1F1F', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Video size={16} color="#FA520F" /> Video Consultation Meeting Link (Mandatory) *
                          </label>
                          <button
                            type="button"
                            onClick={() => generateQuickMeetLink(apt.id)}
                            style={{
                              background: '#FFF8E0',
                              border: '1px solid #E6D5A8',
                              color: '#1F1F1F',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Sparkles size={12} /> Auto-Generate Google Meet Link
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. https://meet.google.com/abc-defg-hij or telehealth room URL"
                          value={meetingLinksInput[apt.id] !== undefined ? meetingLinksInput[apt.id] : (apt.meetLink || '')}
                          onChange={(e) => {
                            setMeetingLinksInput({ ...meetingLinksInput, [apt.id]: e.target.value });
                            if (linkErrors[apt.id]) {
                              setLinkErrors({ ...linkErrors, [apt.id]: '' });
                            }
                          }}
                          className="input-field"
                          style={{
                            background: 'white',
                            borderColor: linkErrors[apt.id] ? '#CC3A05' : '#FA520F',
                            boxShadow: linkErrors[apt.id] ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none'
                          }}
                        />
                        {linkErrors[apt.id] ? (
                          <div style={{ color: '#CC3A05', fontSize: '0.8rem', fontWeight: '600', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertCircle size={14} /> {linkErrors[apt.id]}
                          </div>
                        ) : (
                          <div style={{ color: '#8A8A8A', fontSize: '0.75rem', marginTop: '4px' }}>
                            Required: This meeting link is transmitted directly to the patient to enter the consultation room.
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                        {/* Time Selector */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#1F1F1F', marginBottom: '0.4rem' }}>
                            Confirmed Consultation Time Slot *
                          </label>
                          <select
                            value={assignedTimes[apt.id] || apt.requestedTime || '10:30 AM'}
                            onChange={(e) => setAssignedTimes({ ...assignedTimes, [apt.id]: e.target.value })}
                            className="input-field"
                            style={{ background: 'white', fontWeight: '600', borderColor: '#FA520F' }}
                          >
                            <option value="09:00 AM">09:00 AM - Morning Slot</option>
                            <option value="09:30 AM">09:30 AM - Morning Slot</option>
                            <option value="10:00 AM">10:00 AM - Morning Slot</option>
                            <option value="10:30 AM">10:30 AM - Morning Slot</option>
                            <option value="11:15 AM">11:15 AM - Morning Slot</option>
                            <option value="11:45 AM">11:45 AM - Morning Slot</option>
                            <option value="02:00 PM">02:00 PM - Afternoon Slot</option>
                            <option value="02:30 PM">02:30 PM - Afternoon Slot</option>
                            <option value="03:15 PM">03:15 PM - Afternoon Slot</option>
                            <option value="04:00 PM">04:00 PM - Afternoon Slot</option>
                            <option value="05:00 PM">05:00 PM - Evening Slot</option>
                            <option value="05:30 PM">05:30 PM - Evening Slot</option>
                          </select>
                        </div>

                        {/* Doctor Notes / Clinical Pre-requisite */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#1F1F1F', marginBottom: '0.4rem' }}>
                            Doctor's Pre-Consultation Instructions (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Keep prior lab tests & blood pressure logs ready"
                            value={doctorNotesInput[apt.id] || ''}
                            onChange={(e) => setDoctorNotesInput({ ...doctorNotesInput, [apt.id]: e.target.value })}
                            className="input-field"
                            style={{ background: 'white' }}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleOpenDeclineModal(apt)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '9px 16px',
                            background: '#FFF8E0',
                            color: '#CC3A05',
                            border: '1px solid #E6D5A8',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          <X size={15} /> Decline Request
                        </button>

                        <button
                          onClick={() => handleApproveAppointment(apt.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '9px 22px',
                            background: '#FA520F',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.9rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                          }}
                        >
                          <Check size={16} /> Approve & Schedule for {currentAssignedTime}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Doctor Rejection Reason Box (When Declined) */}
                  {isDeclined && (
                    <div style={{
                      background: '#FFF8E0',
                      border: '1.5px solid #E6D5A8',
                      borderRadius: '12px',
                      padding: '1.1rem 1.25rem',
                      marginTop: '0.75rem',
                      color: '#CC3A05'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', marginBottom: '4px', fontSize: '0.9rem' }}>
                        <XCircle size={17} color="#CC3A05" /> Doctor's Rejection Reason / Comment:
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#3D3D3D', fontWeight: '500', lineHeight: '1.4' }}>
                        "{apt.rejectionReason || apt.doctorNotes || 'No comment provided.'}"
                      </p>
                      {apt.declinedAt && (
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#CC3A05', marginTop: '6px' }}>
                          Declined on {apt.declinedAt}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Confirmed Doctor Time & Note Display */}
                  {isConfirmed && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ color: '#FA520F', fontWeight: '700' }}>
                          ✓ Scheduled for {apt.confirmedTime || apt.time}
                        </span>
                        {apt.meetLink && (
                          <a 
                            href={apt.meetLink} 
                            target="_blank" 
                            rel="noreferrer" 
                            style={{ color: '#FA520F', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}
                          >
                            <Video size={14} /> Telehealth Room
                          </a>
                        )}
                      </div>
                      {apt.doctorNotes && (
                        <span style={{ color: 'var(--text-muted)' }}>
                          <strong>Doctor Note:</strong> {apt.doctorNotes}
                        </span>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rejection / Decline Modal with Mandatory Comment */}
      {rejectModalApt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '540px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            border: '1px solid #E6D5A8',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#CC3A05', marginBottom: '0.75rem' }}>
              <div style={{ background: '#FFF8E0', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                <AlertCircle size={22} color="#CC3A05" />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#CC3A05' }}>
                Decline Appointment Request
              </h3>
            </div>

            <p style={{ color: '#3D3D3D', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: '1.4' }}>
              Please provide a comment / reason for rejecting <strong>{rejectModalApt.patient || rejectModalApt.name}</strong>'s request (ID: {rejectModalApt.id}). This comment will be communicated directly to the patient.
            </p>

            {/* Suggested Quick Reason Templates */}
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#3D3D3D', marginBottom: '0.5rem' }}>
              Select a Quick Reason Template:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1rem' }}>
              {[
                'Doctor is unavailable at this requested time slot. Please choose another date/time.',
                'Condition requires immediate physical clinic examination or emergency hospital visit.',
                'Please complete required laboratory blood tests/scans before teleconsultation.',
                'Medical problem is outside doctor specialization. Please book with the appropriate specialist.'
              ].map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setRejectComment(tpl);
                    setRejectError('');
                  }}
                  style={{
                    background: rejectComment === tpl ? '#FFF8E0' : '#FAFAFA',
                    border: rejectComment === tpl ? '1.5px solid #CC3A05' : '1px solid #EDEDED',
                    color: rejectComment === tpl ? '#CC3A05' : '#3D3D3D',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textAlign: 'left',
                    lineHeight: '1.3'
                  }}
                >
                  • {tpl}
                </button>
              ))}
            </div>

            {/* Custom Rejection Comment Input */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#1F1F1F', marginBottom: '0.4rem' }}>
                Doctor's Rejection Comment (Required) *
              </label>
              <textarea
                rows={3}
                value={rejectComment}
                onChange={(e) => {
                  setRejectComment(e.target.value);
                  if (rejectError) setRejectError('');
                }}
                placeholder="Enter specific clinical reason or guidance for the patient..."
                className="input-field"
                style={{
                  borderColor: rejectError ? '#CC3A05' : '#EDEDED',
                  boxShadow: rejectError ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                  fontSize: '0.9rem',
                  resize: 'vertical'
                }}
              />
              {rejectError && (
                <span style={{ color: '#CC3A05', fontSize: '0.8rem', fontWeight: '600', marginTop: '4px', display: 'block' }}>
                  {rejectError}
                </span>
              )}
            </div>

            {/* Modal Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setRejectModalApt(null);
                  setRejectComment('');
                  setRejectError('');
                }}
                style={{
                  padding: '9px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #EDEDED',
                  background: '#FAFAFA',
                  color: '#3D3D3D',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDecline}
                style={{
                  padding: '9px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: '#CC3A05',
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)'
                }}
              >
                <X size={16} /> Confirm Rejection & Save Comment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const StatCard = ({ title, value, color, bg, highlight }) => (
  <div className="glass-panel" style={{ padding: '1.5rem', border: highlight ? '1.5px solid #FFA110' : '1px solid var(--border-light)', background: 'white' }}>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.5px' }}>{title}</p>
    <h2 style={{ fontSize: '1.8rem', color: color || '#FA520F', margin: '0.3rem 0 0 0', fontWeight: '800' }}>{value}</h2>
  </div>
);

export default DoctorDashboard;
