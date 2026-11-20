import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Activity, 
  Brain, 
  Calendar, 
  Heart, 
  FileText, 
  Trash2, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const HealthHistory = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const isDoctor = role === 'doctor';
  const [activeTab, setActiveTab] = useState('detections'); // 'detections' | 'mental_health' | 'appointments' | 'bmi'

  useEffect(() => {
    if (isDoctor && activeTab === 'appointments') {
      setActiveTab('detections');
    }
  }, [isDoctor, activeTab]);

  // 1. Medical Detections History
  const [detections, setDetections] = useState(() => {
    try {
      const saved = localStorage.getItem('vidcare_medical_detections');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // 2. Mental Health History
  const [mentalHealth, setMentalHealth] = useState(() => {
    try {
      const saved = localStorage.getItem('vidcare_mental_health_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Benchmark sample records if user hasn't taken tests yet
    return [
      { id: 'MH-1', date: 'Aug 28, 2026', score: 4, severity: 'None-minimal', recommendation: 'Your score suggests minimal depression. Continue maintaining a healthy lifestyle.', answersCount: 9 },
      { id: 'MH-2', date: 'Aug 14, 2026', score: 7, severity: 'Mild', recommendation: 'Mild symptoms noted. Recommended regular exercise and mindfulness.', answersCount: 9 },
      { id: 'MH-3', date: 'Jul 29, 2026', score: 3, severity: 'None-minimal', recommendation: 'Optimal wellbeing index.', answersCount: 9 }
    ];
  });

  // 3. Appointments History
  const [appointments, setAppointments] = useState(() => {
    try {
      const saved = localStorage.getItem('vidcare_patient_appointments');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'APT-101',
        doctor: 'Dr. Priya Sharma (Cardiologist)',
        name: user?.name || 'Rahul Sharma',
        date: '2026-09-02',
        time: '10:30 AM',
        problem: 'Chest Discomfort & Fatigue',
        symptoms: 'Bilateral chest tightness for 4 days, mild evening fever',
        meetLink: 'https://meet.google.com/abc-defg-hij',
        status: 'Scheduled'
      }
    ];
  });

  // 4. BMI Records History
  const [bmiRecords, setBmiRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('vidcare_bmi_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'BMI-1', date: 'Aug 30, 2026', height: 175, weight: 70, bmi: 22.9, category: 'Normal weight', plan: 'Maintain your current lifestyle with a balanced diet.' }
    ];
  });

  const deleteItem = (type, id) => {
    if (type === 'detections') {
      const updated = detections.filter(d => d.id !== id);
      setDetections(updated);
      localStorage.setItem('vidcare_medical_detections', JSON.stringify(updated));
    } else if (type === 'mental_health') {
      const updated = mentalHealth.filter(m => m.id !== id);
      setMentalHealth(updated);
      localStorage.setItem('vidcare_mental_health_history', JSON.stringify(updated));
    } else if (type === 'appointments') {
      const updated = appointments.filter(a => a.id !== id);
      setAppointments(updated);
      localStorage.setItem('vidcare_patient_appointments', JSON.stringify(updated));
    } else if (type === 'bmi') {
      const updated = bmiRecords.filter(b => b.id !== id);
      setBmiRecords(updated);
      localStorage.setItem('vidcare_bmi_history', JSON.stringify(updated));
    }
  };

  const tabs = [
    { id: 'detections', label: 'Medical Detections', count: detections.length, icon: <Activity size={18} /> },
    { id: 'mental_health', label: 'Mental Health', count: mentalHealth.length, icon: <Brain size={18} /> },
    ...(!isDoctor ? [{ id: 'appointments', label: 'Appointments', count: appointments.length, icon: <Calendar size={18} /> }] : []),
    { id: 'bmi', label: 'BMI Records', count: bmiRecords.length, icon: <Heart size={18} /> }
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Top Header Matching Screenshot */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        marginBottom: '2rem'
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

        {/* Teal/Cyan Rounded Icon */}
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '14px',
          background: 'linear-gradient(90deg, #FA520F 0%, #FFA110 35%, #FFB83E 65%, #FFD900 85%, #FFF8E0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#1F1F1F',
          boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)'
        }}>
          <FileText size={22} />
        </div>

        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            Health History
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, marginTop: '2px' }}>
            Your complete medical timeline
          </p>
        </div>
      </div>

      {/* Tabs Filter Bar Matching Screenshot */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        marginBottom: '2rem'
      }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-full)',
                border: isActive ? 'none' : '1px solid #EDEDED',
                background: isActive 
                  ? 'linear-gradient(90deg, #FA520F 0%, #FFA110 100%)' 
                  : '#ffffff',
                color: isActive ? 'white' : 'var(--text-secondary)',
                fontWeight: isActive ? '700' : '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: isActive ? '0 4px 14px rgba(2, 132, 199, 0.3)' : '0 2px 6px rgba(0,0,0,0.02)',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span style={{
                background: isActive ? 'rgba(255,255,255,0.25)' : '#FAFAFA',
                color: isActive ? 'white' : '#8A8A8A',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.75rem',
                fontWeight: '700'
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Content Container */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        border: '1px solid #FAFAFA',
        boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
        padding: '2.5rem'
      }}>
        {/* Tab 1: Medical Detections */}
        {activeTab === 'detections' && (
          <div>
            {detections.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                <p style={{ color: '#8A8A8A', fontSize: '1.05rem', fontWeight: '500', margin: '0 0 1.5rem 0' }}>
                  No detection records yet
                </p>
                <button
                  onClick={() => navigate('/tool/chest-xray')}
                  className="btn-primary"
                  style={{ padding: '9px 20px', fontSize: '0.9rem' }}
                >
                  Launch Diagnostic Tools
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {detections.map((item) => (
                  <div 
                    key={item.id}
                    style={{
                      border: '1px solid #EDEDED',
                      borderRadius: '14px',
                      padding: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{item.toolName || item.toolId}</strong>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          background: item.riskLevel === 'Low' ? '#FFF8E0' : '#FFF0C2',
                          color: item.riskLevel === 'Low' ? '#FA520F' : '#CC3A05'
                        }}>
                          {item.riskLevel} Risk
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Finding: {item.finding} • Confidence: {(item.confidence * 100).toFixed(1)}%
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.date || 'Today'}</span>
                      <button
                        onClick={() => deleteItem('detections', item.id)}
                        style={{ background: 'none', border: 'none', color: '#CC3A05', cursor: 'pointer' }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Mental Health */}
        {activeTab === 'mental_health' && (
          <div>
            {mentalHealth.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                <p style={{ color: '#8A8A8A', fontSize: '1.05rem', fontWeight: '500', margin: '0 0 1.5rem 0' }}>
                  No mental health records yet
                </p>
                <button
                  onClick={() => navigate('/mental-health')}
                  className="btn-emerald"
                  style={{ padding: '9px 20px', fontSize: '0.9rem' }}
                >
                  Take Mental Health Assessment
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {mentalHealth.map((item) => (
                  <div 
                    key={item.id}
                    style={{
                      border: '1px solid #EDEDED',
                      borderRadius: '14px',
                      padding: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>PHQ-9 Depression Screening</strong>
                        <span style={{
                          padding: '2px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          background: item.severity === 'None-minimal' ? '#FFF8E0' : '#FFF0C2',
                          color: item.severity === 'None-minimal' ? '#FA520F' : '#CC3A05'
                        }}>
                          Severity: {item.severity} (Score {item.score}/27)
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '600px' }}>
                        {item.recommendation}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.date}</span>
                      <button
                        onClick={() => deleteItem('mental_health', item.id)}
                        style={{ background: 'none', border: 'none', color: '#CC3A05', cursor: 'pointer' }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Appointments */}
        {activeTab === 'appointments' && (
          <div>
            {appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                <p style={{ color: '#8A8A8A', fontSize: '1.05rem', fontWeight: '500', margin: '0 0 1.5rem 0' }}>
                  No appointment records yet
                </p>
                <button
                  onClick={() => navigate('/consultation')}
                  className="btn-primary"
                  style={{ padding: '9px 20px', fontSize: '0.9rem' }}
                >
                  Book Virtual Consultation
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {appointments.map((item) => {
                  const isDeclined = item.status === 'Declined' || item.status === 'Rejected';
                  const isPending = item.status === 'Pending Doctor Approval' || item.status === 'Pending';
                  const isConfirmed = item.status === 'Confirmed' || item.status === 'Scheduled' || item.status === 'Approved';

                  return (
                    <div 
                      key={item.id}
                      style={{
                        border: isDeclined ? '1.5px solid #E6D5A8' : isPending ? '1.5px solid #E6D5A8' : '1px solid #EDEDED',
                        borderRadius: '14px',
                        padding: '1.25rem',
                        background: '#ffffff'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        marginBottom: (isDeclined && (item.rejectionReason || item.doctorNotes)) ? '0.75rem' : 0
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                            <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{item.doctor}</strong>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              background: '#FAFAFA',
                              color: '#FA520F'
                            }}>
                              {item.id}
                            </span>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              background: isDeclined ? '#1C1C1E' : isPending ? '#FFF0C2' : '#FFF8E0',
                              color: isDeclined ? '#FFFFFF' : isPending ? '#CC3A05' : '#FA520F'
                            }}>
                              {item.status || 'Scheduled'}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            <strong>Reason:</strong> {item.problem || item.reason} • <strong>Time:</strong> {item.date} at {item.confirmedTime || item.time}
                          </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {isConfirmed && item.meetLink && (
                            <a
                              href={item.meetLink}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 14px',
                                background: '#FA520F',
                                color: '#1F1F1F',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                textDecoration: 'none'
                              }}
                            >
                              <ExternalLink size={14} /> Join Meet
                            </a>
                          )}
                          <button
                            onClick={() => deleteItem('appointments', item.id)}
                            style={{ background: 'none', border: 'none', color: '#CC3A05', cursor: 'pointer' }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Doctor Rejection Note / Comment */}
                      {isDeclined && (item.rejectionReason || item.doctorNotes) && (
                        <div style={{
                          background: '#FFF8E0',
                          border: '1px solid #E6D5A8',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '0.82rem',
                          color: '#CC3A05'
                        }}>
                          <strong>Doctor's Rejection Reason:</strong> "{item.rejectionReason || item.doctorNotes}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: BMI Records */}
        {activeTab === 'bmi' && (
          <div>
            {bmiRecords.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                <p style={{ color: '#8A8A8A', fontSize: '1.05rem', fontWeight: '500', margin: '0 0 1.5rem 0' }}>
                  No BMI records yet
                </p>
                <button
                  onClick={() => navigate('/bmi')}
                  className="btn-emerald"
                  style={{ padding: '9px 20px', fontSize: '0.9rem' }}
                >
                  Calculate BMI & Diet Plan
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {bmiRecords.map((item) => (
                  <div 
                    key={item.id}
                    style={{
                      border: '1px solid #EDEDED',
                      borderRadius: '14px',
                      padding: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>BMI: {item.bmi}</strong>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          background: '#FFF8E0',
                          color: '#FA520F'
                        }}>
                          {item.category}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Height: {item.height} cm • Weight: {item.weight} kg
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.date}</span>
                      <button
                        onClick={() => deleteItem('bmi', item.id)}
                        style={{ background: 'none', border: 'none', color: '#CC3A05', cursor: 'pointer' }}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthHistory;
