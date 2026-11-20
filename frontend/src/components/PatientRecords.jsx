import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Upload, 
  Calendar, 
  X, 
  Trash2, 
  Eye, 
  Download, 
  CheckCircle2, 
  Activity, 
  Image as ImageIcon,
  Stethoscope,
  Filter,
  FileSpreadsheet
} from 'lucide-react';

const PatientRecords = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load patient records from localStorage or initial state
  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem('vidcare_patient_records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [successToast, setSuccessToast] = useState('');

  // Form state for adding record
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Lab Report');
  const [recordDate, setRecordDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [doctorOrFacility, setDoctorOrFacility] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const categories = [
    'All',
    'Lab Report',
    'Radiology & Imaging',
    'Prescription',
    'Discharge Summary',
    'Vaccination Record'
  ];

  // Save records to localStorage
  useEffect(() => {
    localStorage.setItem('vidcare_patient_records', JSON.stringify(records));
  }, [records]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      if (selected.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(selected));
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleAddRecord = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newRecord = {
      id: `REC-${Date.now().toString().slice(-6)}`,
      title: title.trim(),
      category,
      date: recordDate,
      facility: doctorOrFacility.trim() || 'General Medical Clinic',
      notes: notes.trim(),
      fileName: file ? file.name : `${title.trim().replace(/\s+/g, '_')}_Report.pdf`,
      fileSize: file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : '1.45 MB',
      filePreview: filePreview,
      uploadedAt: new Date().toLocaleDateString()
    };

    setRecords(prev => [newRecord, ...prev]);
    setIsAddModalOpen(false);
    
    // Reset form
    setTitle('');
    setCategory('Lab Report');
    setRecordDate(new Date().toISOString().split('T')[0]);
    setDoctorOrFacility('');
    setNotes('');
    setFile(null);
    setFilePreview(null);

    setSuccessToast('Medical record added successfully!');
    setTimeout(() => setSuccessToast(''), 3500);
  };

  const handleDeleteRecord = (id) => {
    if (window.confirm('Are you sure you want to remove this medical record?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
      if (selectedRecord?.id === id) {
        setSelectedRecord(null);
      }
      setSuccessToast('Record deleted');
      setTimeout(() => setSuccessToast(''), 3000);
    }
  };

  const filteredRecords = activeFilter === 'All'
    ? records
    : records.filter(r => r.category.toLowerCase() === activeFilter.toLowerCase());

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Lab Report':
        return { bg: '#FFF8E0', text: '#FA520F', border: '#E6D5A8' };
      case 'Radiology & Imaging':
        return { bg: '#FFF8E0', text: '#FA520F', border: '#E6D5A8' };
      case 'Prescription':
        return { bg: '#FFF0C2', text: '#CC3A05', border: '#E6D5A8' };
      case 'Discharge Summary':
        return { bg: '#FFFAEB', text: '#FFA110', border: '#E6D5A8' };
      case 'Vaccination Record':
        return { bg: '#FFF8E0', text: '#FA520F', border: '#E6D5A8' };
      default:
        return { bg: '#FAFAFA', text: '#3D3D3D', border: '#EDEDED' };
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Top Header Matching Screenshot */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
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

          {/* Cyan/Blue Rounded Document Icon */}
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            background: 'linear-gradient(90deg, #FA520F 0%, #FFA110 35%, #FFB83E 65%, #FFD900 85%, #FFF8E0 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1F1F1F',
            boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)'
          }}>
            <FileText size={22} />
          </div>

          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              Patient Records
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, marginTop: '2px' }}>
              Your medical documents & history
            </p>
          </div>
        </div>

        {/* + Add Record Button */}
        <div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 22px',
              borderRadius: 'var(--radius-full)',
              background: '#FA520F',
              color: '#1F1F1F',
              border: 'none',
              fontWeight: '600',
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <Plus size={18} /> Add Record
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#FFF8E0',
          border: '1px solid #FA520F',
          color: '#1F1F1F',
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          fontSize: '0.95rem',
          fontWeight: '500'
        }}>
          <CheckCircle2 size={18} color="#FA520F" /> {successToast}
        </div>
      )}

      {/* Main Container */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        border: '1px solid #FAFAFA',
        boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
        padding: records.length === 0 ? '4rem 2rem' : '2rem'
      }}>
        {records.length === 0 ? (
          /* Exact Match to Empty State Screenshot */
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '20px',
              background: '#FAFAFA',
              border: '1.5px solid #EDEDED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              color: '#8A8A8A'
            }}>
              <FileText size={38} strokeWidth={1.5} color="#8A8A8A" />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              No records yet
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
              Upload your lab reports, imaging results, and medical history to keep everything in one place.
            </p>
            
            <div style={{ marginTop: '2rem' }}>
              <button
                onClick={() => setIsAddModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 22px',
                  borderRadius: 'var(--radius-md)',
                  background: '#FA520F',
                  color: '#1F1F1F',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
                }}
              >
                <Upload size={16} /> Upload First Document
              </button>
            </div>
          </div>
        ) : (
          /* Records List View */
          <div>
            {/* Category Filter Bar */}
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '1.75rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid #FAFAFA'
            }}>
              {categories.map((cat) => {
                const isActive = activeFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: isActive ? '1px solid #FA520F' : '1px solid var(--border-light)',
                      background: isActive ? '#FA520F' : '#FAFAFA',
                      color: isActive ? 'white' : 'var(--text-secondary)',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? '700' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Records Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.25rem'
            }}>
              {filteredRecords.map((rec) => {
                const badge = getCategoryColor(rec.category);
                return (
                  <div
                    key={rec.id}
                    style={{
                      border: '1px solid #EDEDED',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      background: '#ffffff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: badge.bg,
                          color: badge.text,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <FileText size={20} />
                        </div>

                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          background: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`
                        }}>
                          {rec.category}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 0.4rem 0' }}>
                        {rec.title}
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0' }}>
                        {rec.facility}
                      </p>

                      {rec.notes && (
                        <p style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-secondary)',
                          background: '#FAFAFA',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          lineHeight: '1.4',
                          marginBottom: '1rem'
                        }}>
                          {rec.notes}
                        </p>
                      )}
                    </div>

                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid #FAFAFA',
                        paddingTop: '0.75rem',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginBottom: '0.75rem'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={13} /> {rec.date}
                        </span>
                        <span>{rec.fileSize}</span>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => setSelectedRecord(rec)}
                          style={{
                            flex: 1,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: '#FAFAFA',
                            color: '#FA520F',
                            border: '1px solid #EDEDED',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={15} /> View
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(rec.id)}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '8px',
                            background: '#FFF8E0',
                            color: '#CC3A05',
                            border: '1px solid #E6D5A8',
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                          title="Delete Record"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add Medical Record */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            position: 'relative'
          }} className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #FAFAFA', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#FAFAFA', color: '#FA520F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Upload size={20} />
                </div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>
                  Upload Medical Record
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A8A' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddRecord}>
              {/* Document Title */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Document Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Complete Blood Count (CBC) or Chest X-Ray Report"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              {/* Record Type & Date Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    Document Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-field"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                    Record Date *
                  </label>
                  <input
                    type="date"
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {/* Facility or Doctor */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Prescribing Doctor or Hospital
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Priya Sharma / City Care Diagnostic Center"
                  value={doctorOrFacility}
                  onChange={(e) => setDoctorOrFacility(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Clinical Notes */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Notes / Clinical Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Hemoglobin slightly low, doctor advised iron supplements."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field"
                  style={{ resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              {/* Upload Dropzone */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  Attach Document (PDF, DICOM, or Image)
                </label>
                <label style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.5rem',
                  background: '#FAFAFA',
                  border: '2px dashed #EDEDED',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.dcm"
                    style={{ display: 'none' }}
                  />
                  <Upload size={28} color="#FA520F" style={{ marginBottom: '6px' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {file ? file.name : 'Click or drop file to upload'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Supports PDF, PNG, JPG, DICOM files up to 25MB
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #EDEDED',
                    background: 'white',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 22px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: '#FA520F',
                    color: '#1F1F1F',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Record Preview */}
      {selectedRecord && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '600px',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }} className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #FAFAFA', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0 }}>
                {selectedRecord.title}
              </h3>
              <button
                onClick={() => setSelectedRecord(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8A8A' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              background: '#FAFAFA',
              padding: '1.25rem',
              borderRadius: '12px',
              marginBottom: '1.25rem',
              fontSize: '0.9rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Category</span>
                <strong>{selectedRecord.category}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Date</span>
                <strong>{selectedRecord.date}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Facility</span>
                <strong>{selectedRecord.facility}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>File</span>
                <strong>{selectedRecord.fileName}</strong>
              </div>
            </div>

            {selectedRecord.notes && (
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Clinical Summary & Notes</span>
                <p style={{ margin: 0, color: 'var(--text-secondary)', background: '#FFF8E0', border: '1px solid #FFF0C2', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem' }}>
                  {selectedRecord.notes}
                </p>
              </div>
            )}

            {selectedRecord.filePreview && (
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <img 
                  src={selectedRecord.filePreview} 
                  alt="Record Preview" 
                  style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '8px', border: '1px solid #EDEDED' }} 
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  alert(`Downloading ${selectedRecord.fileName}...`);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: 'var(--radius-md)',
                  background: '#FA520F',
                  color: '#1F1F1F',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <Download size={16} /> Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRecords;
