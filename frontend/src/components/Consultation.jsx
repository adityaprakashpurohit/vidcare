import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Video, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  AlertCircle, 
  FileText, 
  CheckCircle2, 
  Stethoscope, 
  Sparkles,
  ArrowRight,
  Copy,
  ExternalLink,
  Briefcase,
  Search,
  Filter,
  Check
} from 'lucide-react';

const Consultation = () => {
  const { user, getStoredUsers } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  
  // Specialization Filter state
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const [selectedDoctorObj, setSelectedDoctorObj] = useState(null);

  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('10:30 AM');
  const [problem, setProblem] = useState('');
  const [symptoms, setSymptoms] = useState('');

  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [copied, setCopied] = useState(false);

  // Specialization categories
  const specializationsList = [
    'All',
    'Cardiologist',
    'Pulmonologist',
    'General Physician',
    'Neurologist',
    'Dermatologist',
    'Oncologist',
    'Hepatologist',
    'Psychiatrist'
  ];

  // Base list of verified specialist doctors
  const defaultDoctors = [
    { 
      id: 'DOC-1',
      name: 'Dr. Priya Sharma', 
      specialization: 'Cardiologist', 
      experience: '15', 
      qualifications: 'MD, DM Cardiology - AIIMS New Delhi',
      img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200' 
    },
    { 
      id: 'DOC-2',
      name: 'Dr. Amit Sharma', 
      specialization: 'Pulmonologist', 
      experience: '12', 
      qualifications: 'MD, FCCP Pulmonary Medicine - VMMC Safdarjung',
      img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200' 
    },
    { 
      id: 'DOC-3',
      name: 'Dr. Vikram Patel', 
      specialization: 'General Physician', 
      experience: '11', 
      qualifications: 'MBBS, MD Internal Medicine - Maulana Azad Medical College',
      img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200' 
    },
    { 
      id: 'DOC-4',
      name: 'Dr. Arjun Mehta', 
      specialization: 'Neurologist', 
      experience: '18', 
      qualifications: 'MD Neurology, DM Neuroscience - NIMHANS Bengaluru',
      img: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=200' 
    },
    { 
      id: 'DOC-5',
      name: 'Dr. Ananya Iyer', 
      specialization: 'Dermatologist', 
      experience: '10', 
      qualifications: 'MD Dermatology, DVD - CMC Vellore',
      img: 'https://images.unsplash.com/photo-1594824813590-78a0a5522aa4?auto=format&fit=crop&q=80&w=200' 
    },
    { 
      id: 'DOC-6',
      name: 'Dr. Ramesh Gupta', 
      specialization: 'Oncologist', 
      experience: '20', 
      qualifications: 'MD, DM Medical Oncology - Tata Memorial Hospital Mumbai',
      img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=200' 
    },
    { 
      id: 'DOC-7',
      name: 'Dr. Sanjay Verma', 
      specialization: 'Hepatologist', 
      experience: '16', 
      qualifications: 'MD, DM Gastroenterology & Hepatology - ILBS New Delhi',
      img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200' 
    },
    { 
      id: 'DOC-8',
      name: 'Dr. Neha Deshmukh', 
      specialization: 'Psychiatrist', 
      experience: '14', 
      qualifications: 'MD Psychiatry, Cognitive Behavioral Therapy Specialist - CIP Ranchi',
      img: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&q=80&w=200' 
    },
    { 
      id: 'DOC-9',
      name: 'Dr. Vivek Joshi', 
      specialization: 'Cardiologist', 
      experience: '14', 
      qualifications: 'MD Interventional Cardiology - PGIMER Chandigarh',
      img: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200' 
    },
    { 
      id: 'DOC-10',
      name: 'Dr. Sunita Rao', 
      specialization: 'General Physician', 
      experience: '9', 
      qualifications: 'MBBS, MD Family Medicine - KMC Manipal',
      img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200' 
    }
  ];

  const [allDoctors, setAllDoctors] = useState(defaultDoctors);

  // Load dynamically approved doctors from backend or storage
  useEffect(() => {
    const fetchRegisteredDoctors = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/users');
        const data = await res.json();
        if (data.success && data.users) {
          const approvedDocs = data.users.filter(u => u.role === 'doctor' && (u.status === 'approved' || !u.status));
          mergeDoctors(approvedDocs);
        } else {
          loadFromLocal();
        }
      } catch (e) {
        loadFromLocal();
      }
    };

    const loadFromLocal = () => {
      if (getStoredUsers) {
        const users = getStoredUsers();
        const approvedDocs = users.filter(u => u.role === 'doctor' && u.status === 'approved');
        mergeDoctors(approvedDocs);
      }
    };

    const mergeDoctors = (approvedDocs) => {
      if (!approvedDocs || approvedDocs.length === 0) return;
      const formatted = approvedDocs.map((d, i) => ({
        id: d.id || `REG-DOC-${i}`,
        name: d.name.startsWith('Dr.') ? d.name : `Dr. ${d.name}`,
        specialization: d.specialization || 'General Physician',
        experience: d.experience || '10',
        qualifications: d.qualifications || 'Certified Medical Practitioner',
        img: defaultDoctors[i % defaultDoctors.length].img
      }));

      // Combine with default list avoiding duplicates
      const unique = [...defaultDoctors];
      formatted.forEach(f => {
        if (!unique.some(u => u.name.toLowerCase() === f.name.toLowerCase())) {
          unique.unshift(f);
        }
      });
      setAllDoctors(unique);
    };

    fetchRegisteredDoctors();
  }, []);

  // Filter doctors according to selected specialization
  const filteredDoctors = selectedSpecialization === 'All'
    ? allDoctors
    : allDoctors.filter(d => d.specialization.toLowerCase() === selectedSpecialization.toLowerCase());

  // Auto-select first doctor of filtered list if none is selected
  useEffect(() => {
    if (filteredDoctors.length > 0) {
      if (!selectedDoctorObj || !filteredDoctors.some(d => d.id === selectedDoctorObj.id)) {
        setSelectedDoctorObj(filteredDoctors[0]);
      }
    } else {
      setSelectedDoctorObj(null);
    }
  }, [selectedSpecialization, allDoctors]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedDoctorObj) {
      alert('Please select a doctor for your consultation.');
      return;
    }

    setLoading(true);
    const doctorLabel = `${selectedDoctorObj.name} (${selectedDoctorObj.specialization})`;
    
    const appointmentPayload = {
      name,
      number: phone,
      email,
      problem,
      symptoms,
      date,
      time,
      doctor: doctorLabel,
      doctorId: selectedDoctorObj.id,
      patient_id: user?.id || 'GUEST'
    };

    try {
      const response = await axios.post('http://localhost:5000/api/book-consultation', appointmentPayload);
      
      const aptData = {
        id: response.data.appointment_id || `APT-${Math.floor(10000 + Math.random() * 90000)}`,
        meetLink: response.data.meet_link || 'https://meet.google.com/abc-defg-hij',
        name,
        number: phone,
        email,
        problem,
        symptoms,
        date,
        requestedTime: time,
        time: time,
        doctor: doctorLabel,
        doctorId: selectedDoctorObj.id,
        status: 'Pending Doctor Approval'
      };

      setAppointmentDetails(aptData);
      setBookingSuccess(true);
      
      // Save appointment to localStorage so DoctorDashboard can review and approve it
      try {
        const existingApts = JSON.parse(localStorage.getItem('vidcare_patient_appointments') || '[]');
        existingApts.unshift(aptData);
        localStorage.setItem('vidcare_patient_appointments', JSON.stringify(existingApts));
      } catch (e) {}

    } catch (err) {
      console.warn('Backend offline, using client-side booking generator:', err);
      const aptData = {
        id: `APT-${Math.floor(10000 + Math.random() * 90000)}`,
        meetLink: 'https://meet.google.com/vidcare-telehealth-session',
        name,
        number: phone,
        email,
        problem,
        symptoms,
        date,
        requestedTime: time,
        time: time,
        doctor: doctorLabel,
        doctorId: selectedDoctorObj.id,
        status: 'Pending Doctor Approval'
      };
      setAppointmentDetails(aptData);
      setBookingSuccess(true);

      try {
        const existingApts = JSON.parse(localStorage.getItem('vidcare_patient_appointments') || '[]');
        existingApts.unshift(aptData);
        localStorage.setItem('vidcare_patient_appointments', JSON.stringify(existingApts));
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  const copyMeetLink = () => {
    if (appointmentDetails?.meetLink) {
      navigator.clipboard.writeText(appointmentDetails.meetLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (bookingSuccess && appointmentDetails) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '780px', margin: '0 auto', paddingBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '3rem 2.5rem', textAlign: 'center', background: 'white' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: '#FFF8E0',
            border: '2px solid #FA520F',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            color: '#FA520F'
          }}>
            <CheckCircle2 size={42} />
          </div>

          <span style={{
            display: 'inline-block',
            background: '#FAFAFA',
            color: '#FA520F',
            padding: '4px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            fontWeight: '700',
            marginBottom: '0.75rem'
          }}>
            APPOINTMENT CONFIRMED
          </span>

          <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Consultation Booked Successfully!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 2rem auto' }}>
            Your virtual consultation has been scheduled. A confirmation and meeting invitation have been generated for you and your assigned doctor.
          </p>

          {/* Meeting Link Banner */}
          <div style={{
            background: 'linear-gradient(90deg, #FA520F 0%, #FFA110 35%, #FFB83E 65%, #FFD900 85%, #FFF8E0 100%)',
            border: '1.5px solid #EDEDED',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem',
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#1F1F1F', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Video size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>Google Meet Telehealth Room</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Encrypted HD Video Consultation</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={copyMeetLink}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #EDEDED',
                    background: '#FFFFFF',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  <Copy size={15} /> {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <a
                  href={appointmentDetails.meetLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: '#FA520F',
                    color: 'white',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    textDecoration: 'none'
                  }}
                >
                  <ExternalLink size={15} /> Join Call
                </a>
              </div>
            </div>

            <div style={{
              background: '#FFFFFF',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #EDEDED',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              color: '#FA520F',
              wordBreak: 'break-all'
            }}>
              {appointmentDetails.meetLink}
            </div>
          </div>

          {/* Appointment Summary Card */}
          <div style={{
            background: '#FAFAFA',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            textAlign: 'left',
            marginBottom: '2rem'
          }}>
            <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid #EDEDED', paddingBottom: '0.5rem' }}>
              Booking Summary Details
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Appointment ID</span>
                <strong>{appointmentDetails.id}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Assigned Specialist</span>
                <strong style={{ color: '#FA520F' }}>{appointmentDetails.doctor}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Patient Name</span>
                <strong>{appointmentDetails.name}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Contact Info</span>
                <strong>{appointmentDetails.number}</strong> <span style={{ color: '#8A8A8A' }}>({appointmentDetails.email})</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Scheduled Date & Time</span>
                <strong style={{ color: '#CC3A05' }}>{appointmentDetails.date} at {appointmentDetails.time}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Chief Health Problem</span>
                <strong style={{ color: '#1F1F1F' }}>{appointmentDetails.problem}</strong>
              </div>
            </div>

            {appointmentDetails.symptoms && (
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #EDEDED' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '2px' }}>Reported Symptoms</span>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{appointmentDetails.symptoms}</p>
              </div>
            )}
          </div>

          <button 
            onClick={() => {
              setBookingSuccess(false);
              setProblem('');
              setSymptoms('');
            }} 
            className="btn-outline"
            style={{ padding: '10px 24px', cursor: 'pointer' }}
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'white',
          padding: '6px 16px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-light)',
          marginBottom: '1rem',
          boxShadow: 'var(--shadow-card)'
        }}>
          <Stethoscope size={16} color="var(--accent-blue)" />
          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Direct Specialist Telehealth
          </span>
        </div>
        <h1 style={{ fontSize: '2.4rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Find & Book a <span className="text-gradient-blue">Specialist Doctor</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          Filter by clinical specialization to discover doctors, review their expertise, and schedule your appointment.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem', background: 'white' }}>
        <form onSubmit={handleBook}>

          {/* Specialization Filter Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                  <Briefcase size={18} color="var(--accent-blue)" /> Step 1: Select Medical Specialization *
                </label>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Filter clinical doctors by medical department
                </p>
              </div>

              {/* Specialization Dropdown Selector */}
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  className="input-field"
                  style={{
                    padding: '8px 36px 8px 14px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    border: '1.5px solid var(--accent-blue)',
                    background: '#FAFAFA',
                    color: 'var(--accent-blue)',
                    cursor: 'pointer',
                    appearance: 'none'
                  }}
                >
                  {specializationsList.map(spec => (
                    <option key={spec} value={spec}>
                      {spec === 'All' ? '🏥 All Specializations' : spec}
                    </option>
                  ))}
                </select>
                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--accent-blue)' }}>
                  ▼
                </div>
              </div>
            </div>

            {/* Quick Specialization Pill Tags */}
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '1.5rem'
            }}>
              {specializationsList.map((spec) => {
                const isActive = selectedSpecialization === spec;
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => setSelectedSpecialization(spec)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: isActive ? '1px solid var(--accent-blue)' : '1px solid var(--border-light)',
                      background: isActive ? 'var(--accent-blue)' : '#FAFAFA',
                      color: isActive ? 'white' : 'var(--text-secondary)',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? '700' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isActive ? '0 2px 6px rgba(59, 130, 246, 0.3)' : 'none'
                    }}
                  >
                    {spec}
                  </button>
                );
              })}
            </div>

            {/* Step 2: Filtered Doctors Grid */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                  Available Doctors ({filteredDoctors.length} {selectedSpecialization === 'All' ? 'Total' : `in ${selectedSpecialization}`})
                </span>
                {selectedDoctorObj && (
                  <span style={{ fontSize: '0.8rem', color: '#FA520F', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Check size={14} /> Selected: {selectedDoctorObj.name}
                  </span>
                )}
              </div>

              {filteredDoctors.length === 0 ? (
                <div style={{
                  padding: '2.5rem 1.5rem',
                  background: '#FAFAFA',
                  border: '1px dashed var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center'
                }}>
                  <Stethoscope size={36} color="#8A8A8A" style={{ margin: '0 auto 0.75rem auto' }} />
                  <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>
                    No doctors found for "{selectedSpecialization}"
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
                    Try selecting another specialization or view all doctors.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedSpecialization('All')}
                    className="btn-outline"
                    style={{ padding: '6px 16px', fontSize: '0.85rem' }}
                  >
                    View All Doctors
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '1rem'
                }}>
                  {filteredDoctors.map((doc) => {
                    const isSelected = selectedDoctorObj?.id === doc.id;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDoctorObj(doc)}
                        style={{
                          border: isSelected ? '2px solid var(--accent-blue)' : '1px solid var(--border-light)',
                          background: isSelected ? '#FAFAFA' : '#FFFFFF',
                          borderRadius: 'var(--radius-lg)',
                          padding: '1.25rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          position: 'relative',
                          boxShadow: isSelected ? '0 4px 14px rgba(46, 91, 255, 0.15)' : 'var(--shadow-sm)'
                        }}
                      >
                        {isSelected && (
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: 'var(--accent-blue)',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 4px rgba(46, 91, 255, 0.3)'
                          }}>
                            <Check size={14} />
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.75rem' }}>
                          <img 
                            src={doc.img} 
                            alt={doc.name} 
                            style={{ 
                              width: '54px', 
                              height: '54px', 
                              borderRadius: '50%', 
                              objectFit: 'cover', 
                              border: isSelected ? '2px solid var(--accent-blue)' : '2px solid #EDEDED',
                              flexShrink: 0
                            }} 
                          />
                          <div style={{ overflow: 'hidden' }}>
                            <h4 style={{ fontSize: '1rem', margin: '0 0 2px 0', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {doc.name}
                            </h4>
                            <span style={{
                              display: 'inline-block',
                              background: isSelected ? 'rgba(46, 91, 255, 0.12)' : '#FAFAFA',
                              color: isSelected ? '#FA520F' : '#3D3D3D',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              {doc.specialization}
                            </span>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '0.5rem' }}>
                          {doc.qualifications}
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderTop: '1px solid #EDEDED',
                          paddingTop: '0.5rem',
                          marginTop: '0.5rem',
                          fontSize: '0.75rem'
                        }}>
                          <span style={{ color: '#FA520F', fontWeight: '700' }}>
                            ⭐ {doc.experience} Years Experience
                          </span>
                          <span style={{ color: isSelected ? 'var(--accent-blue)' : 'var(--text-muted)', fontWeight: '600' }}>
                            {isSelected ? '✓ Selected' : 'Click to Select'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Date and Time Selection */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
            background: '#FAFAFA',
            padding: '1.5rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Preferred Consultation Date *
              </label>
              <div style={{ position: 'relative' }}>
                <Calendar size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field" 
                  style={{ paddingLeft: '44px', background: 'white' }} 
                  required 
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Preferred Time Slot *
              </label>
              <div style={{ position: 'relative' }}>
                <Clock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                <select 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="input-field" 
                  style={{ paddingLeft: '44px', background: 'white', appearance: 'none', cursor: 'pointer' }}
                  required
                >
                  <option value="09:00 AM">09:00 AM - Morning Slot</option>
                  <option value="10:30 AM">10:30 AM - Morning Slot</option>
                  <option value="11:45 AM">11:45 AM - Morning Slot</option>
                  <option value="02:15 PM">02:15 PM - Afternoon Slot</option>
                  <option value="03:30 PM">03:30 PM - Afternoon Slot</option>
                  <option value="05:00 PM">05:00 PM - Evening Slot</option>
                </select>
                <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#8A8A8A' }}>
                  ▼
                </div>
              </div>
            </div>
          </div>

          {/* Patient Details: Name, Number, Email */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              Patient Contact Information
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.25rem'
            }}>
              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Patient Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '44px' }}
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Phone / Mobile Number *
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '44px' }}
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    placeholder="e.g. patient@vidcare.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '44px' }}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Medical Problem and Symptoms */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              Health Concern & Symptoms Description
            </h3>

            {/* Health Problem */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Primary Health Problem / Concern *
              </label>
              <div style={{ position: 'relative' }}>
                <AlertCircle size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="e.g. Severe chest congestion, recurring headaches, or skin rash"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '44px' }}
                  required
                />
              </div>
            </div>

            {/* Detailed Symptoms */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Detailed Symptoms & Duration *
              </label>
              <div style={{ position: 'relative' }}>
                <FileText size={18} style={{ position: 'absolute', left: '14px', top: '16px', color: 'var(--text-muted)' }} />
                <textarea
                  rows={4}
                  placeholder="Describe your symptoms in detail (e.g. Started 3 days ago, fever reaching 101°F, dry cough, dizziness, currently taking paracetamol...)"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '44px', resize: 'vertical', fontFamily: 'inherit' }}
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Action Button */}
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ 
              width: '100%', 
              padding: '16px', 
              fontSize: '1.05rem', 
              fontWeight: '700',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '10px',
              cursor: 'pointer'
            }} 
            disabled={loading || !selectedDoctorObj}
          >
            {loading ? (
              <span>Scheduling Consultation...</span>
            ) : (
              <>
                <Video size={20} />
                <span>
                  {selectedDoctorObj 
                    ? `Book Consultation with ${selectedDoctorObj.name}` 
                    : 'Select a Doctor to Book Consultation'}
                </span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Consultation;
