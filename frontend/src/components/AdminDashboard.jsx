import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  Stethoscope, 
  Server, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  ArrowUpRight,
  Check,
  X,
  UserCheck,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  RotateCcw,
  UserX,
  Mail,
  Phone,
  Briefcase,
  Award,
  DollarSign,
  Calendar,
  Layers,
  ChevronRight,
  User,
  SlidersHorizontal
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, approveDoctor, getStoredUsers } = useAuth();
  
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  
  // Dashboard Tabs: 'applied_doctors' | 'all_users' | 'ai_engines'
  const [activeTab, setActiveTab] = useState('applied_doctors');

  // Search and Role/Status Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all'); // 'all' | 'doctor' | 'patient' | 'admin'
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'

  // Initial seed list of doctors with rich profile details
  const initialDoctorSeed = [
    { 
      id: 'DOC-101', 
      name: 'Dr. Priya Sharma', 
      email: 'doctor@vidcare.in', 
      role: 'doctor', 
      status: 'approved', 
      specialization: 'Cardiologist', 
      phone: '+91 98201 12345', 
      experience: '15', 
      fee: '120', 
      qualifications: 'MD, DM Cardiology - AIIMS New Delhi',
      appliedAt: '2026-08-15'
    },
    { 
      id: 'DOC-102', 
      name: 'Dr. Amit Sharma', 
      email: 'amit.sharma@pulmonarycare.org', 
      role: 'doctor', 
      status: 'pending', 
      specialization: 'Pulmonologist', 
      phone: '+91 98111 23456', 
      experience: '12', 
      fee: '110', 
      qualifications: 'MD, FCCP Pulmonary Medicine - VMMC Safdarjung',
      appliedAt: '2026-08-30'
    },
    { 
      id: 'DOC-103', 
      name: 'Dr. Ananya Iyer', 
      email: 'ananya.iyer@dermaclinic.in', 
      role: 'doctor', 
      status: 'rejected', 
      specialization: 'Dermatologist', 
      phone: '+91 98450 34567', 
      experience: '10', 
      fee: '95', 
      qualifications: 'MD Dermatology, DVD - CMC Vellore',
      appliedAt: '2026-08-25'
    },
    { 
      id: 'DOC-104', 
      name: 'Dr. Arjun Mehta', 
      email: 'arjun.mehta@neurohealth.in', 
      role: 'doctor', 
      status: 'pending', 
      specialization: 'Neurologist', 
      phone: '+91 98765 67890', 
      experience: '18', 
      fee: '150', 
      qualifications: 'MD Neurology, DM Neuroscience - NIMHANS Bengaluru',
      appliedAt: '2026-09-01'
    }
  ];

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/users');
      const data = await res.json();
      if (data.success && data.users && data.users.length > 0) {
        mergeWithLocalUsers(data.users);
      } else {
        fallbackToLocalStorage();
      }
    } catch (e) {
      fallbackToLocalStorage();
    } finally {
      setLoadingUsers(false);
    }
  };

  const mergeWithLocalUsers = (fetchedUsers) => {
    let localUsers = [];
    if (getStoredUsers) {
      localUsers = getStoredUsers();
    }

    const combined = [...fetchedUsers];
    
    localUsers.forEach(lu => {
      if (!combined.some(u => u.id === lu.id || u.email === lu.email)) {
        combined.push(lu);
      }
    });

    initialDoctorSeed.forEach(seed => {
      if (!combined.some(u => u.id === seed.id || u.email === seed.email)) {
        combined.push(seed);
      }
    });

    setUsersList(combined);
  };

  const fallbackToLocalStorage = () => {
    if (getStoredUsers) {
      const stored = getStoredUsers();
      const combined = [...stored];
      initialDoctorSeed.forEach(seed => {
        if (!combined.some(u => u.id === seed.id || u.email === seed.email)) {
          combined.push(seed);
        }
      });
      setUsersList(combined);
    } else {
      setUsersList([
        { id: 'USR-1', name: 'System Administrator', email: 'admin@vidcare.in', role: 'admin', status: 'approved' },
        ...initialDoctorSeed,
        { id: 'USR-3', name: 'Rahul Sharma', email: 'patient@vidcare.in', role: 'patient', status: 'approved' },
        { id: 'USR-4', name: 'Pooja Verma', email: 'pooja@patient.in', role: 'patient', status: 'approved' },
        { id: 'USR-5', name: 'Manish Gupta', email: 'manish@patient.in', role: 'patient', status: 'approved' }
      ]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Update user / doctor status (approved | rejected | pending)
  const handleUpdateStatus = async (userId, newStatus) => {
    if (approveDoctor) {
      const res = await approveDoctor(userId, newStatus);
      const actionVerb = newStatus === 'approved' ? 'Approved & Accepted' : newStatus === 'rejected' ? 'Rejected' : 'Set to Pending';
      setActionMessage(res?.message || `User account has been ${actionVerb}!`);
    }

    // Update in local state immediately
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    setTimeout(() => setActionMessage(''), 4500);
  };

  // Counts for Badges
  const doctorCount = usersList.filter(u => u.role === 'doctor').length;
  const patientCount = usersList.filter(u => u.role === 'patient').length;
  const adminCount = usersList.filter(u => u.role === 'admin').length;
  const pendingCount = usersList.filter(u => u.status === 'pending').length;
  const approvedCount = usersList.filter(u => u.status === 'approved').length;
  const rejectedCount = usersList.filter(u => u.status === 'rejected').length;

  // Filtered Users List matching both Search Name/Query and Role Filter
  const filteredUsers = usersList.filter(u => {
    const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
    const matchesStatus = selectedStatusFilter === 'all' || u.status === selectedStatusFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = query === '' || 
      u.name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.id?.toLowerCase().includes(query) ||
      u.specialization?.toLowerCase().includes(query) ||
      u.qualifications?.toLowerCase().includes(query);

    return matchesRole && matchesStatus && matchesSearch;
  });

  // Filtered Doctors list for Tab 1
  const filteredDoctors = usersList.filter(u => {
    if (u.role !== 'doctor') return false;
    const matchesStatus = selectedStatusFilter === 'all' || u.status === selectedStatusFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = query === '' || 
      u.name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.specialization?.toLowerCase().includes(query) ||
      u.qualifications?.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRoleFilter('all');
    setSelectedStatusFilter('all');
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '3.5rem' }}>
      
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
        background: 'linear-gradient(90deg, #FA520F 0%, #FFA110 35%, #FFB83E 65%, #FFD900 85%, #FFF8E0 100%)',
        padding: '2.25rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid #EDEDED',
        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.05)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1F1F1F', color: '#FFFFFF', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.75rem' }}>
            <ShieldCheck size={14} /> ADMINISTRATOR CONTROL CONSOLE
          </div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--text-primary)', margin: 0, fontWeight: '800' }}>
            Dashboard & User Access Management
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem', fontSize: '0.95rem' }}>
            Logged in as <strong>{user?.name || 'Administrator'}</strong>. Search by name, filter by role, accept or reject registrations, and restore rejected profiles.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loadingUsers}
          className="btn-purple"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px 20px' }}
        >
          <RefreshCw size={16} className={loadingUsers ? 'animate-spin' : ''} />
          <span>Sync Database</span>
        </button>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div className="animate-fade-in" style={{
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
          <CheckCircle size={20} color="#FA520F" /> {actionMessage}
        </div>
      )}

      {/* Overview Metric Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard title="Total Registered Users" value={usersList.length} icon={<Users size={22} color="#FA520F" />} bg="#FFF8E0" />
        <StatCard title="Total Doctors" value={doctorCount} icon={<Stethoscope size={22} color="#FA520F" />} bg="#FFF8E0" />
        <StatCard title="Total Patients" value={patientCount} icon={<User size={22} color="#FA520F" />} bg="#FFF0C2" />
        <StatCard title="Pending Approvals" value={pendingCount} icon={<Clock size={22} color="#FFA110" />} bg="#FFF8E0" highlight={pendingCount > 0} />
        <StatCard title="Rejected / Blocked" value={rejectedCount} icon={<UserX size={22} color="#CC3A05" />} bg="#FFF8E0" />
      </div>

      {/* ======================================================== */}
      {/* SEARCH AND ROLE FILTER BAR (Interactive & Real-time)     */}
      {/* ======================================================== */}
      <div style={{
        background: 'white',
        borderRadius: '18px',
        padding: '1.5rem 1.75rem',
        marginBottom: '2rem',
        border: '1px solid #EDEDED',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          
          {/* Name Search Box */}
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8A8A8A' }} />
            <input
              type="text"
              placeholder="Search by Name (e.g. Dr. Priya, Rahul), Email, ID, or Specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{
                paddingLeft: '44px',
                height: '46px',
                fontSize: '0.95rem',
                border: searchQuery ? '1.5px solid #FA520F' : '1px solid #EDEDED'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#EDEDED',
                  border: 'none',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  color: '#8A8A8A'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Clear Button if any filter is active */}
          {(searchQuery || selectedRoleFilter !== 'all' || selectedStatusFilter !== 'all') && (
            <button
              onClick={clearFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                background: '#FAFAFA',
                color: '#8A8A8A',
                border: '1px solid #EDEDED',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} /> Clear Filters
            </button>
          )}
        </div>

        {/* Filter Rows: Role Filter & Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #FAFAFA' }}>
          
          {/* Role Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
              <Filter size={15} /> Filter by Role:
            </span>

            <RolePill 
              active={selectedRoleFilter === 'all'} 
              onClick={() => setSelectedRoleFilter('all')}
              label="All Roles"
              count={usersList.length}
            />
            <RolePill 
              active={selectedRoleFilter === 'doctor'} 
              onClick={() => setSelectedRoleFilter('doctor')}
              label="🩺 Doctors"
              count={doctorCount}
              activeColor="#FA520F"
              activeBg="#FFF8E0"
            />
            <RolePill 
              active={selectedRoleFilter === 'patient'} 
              onClick={() => setSelectedRoleFilter('patient')}
              label="👤 Patients"
              count={patientCount}
              activeColor="#FA520F"
              activeBg="#FAFAFA"
            />
            <RolePill 
              active={selectedRoleFilter === 'admin'} 
              onClick={() => setSelectedRoleFilter('admin')}
              label="🛡️ Admins"
              count={adminCount}
              activeColor="#FA520F"
              activeBg="#FAFAFA"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
              Status:
            </span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="input-field"
              style={{
                height: '36px',
                fontSize: '0.85rem',
                padding: '4px 12px',
                width: '160px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Statuses ({usersList.length})</option>
              <option value="pending">⏳ Pending ({pendingCount})</option>
              <option value="approved">✓ Approved ({approvedCount})</option>
              <option value="rejected">✕ Rejected ({rejectedCount})</option>
            </select>
          </div>
        </div>

        {/* Live Filter Indicator */}
        <div style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: '#8A8A8A', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>
            Showing <strong>{activeTab === 'applied_doctors' ? filteredDoctors.length : filteredUsers.length}</strong> of <strong>{usersList.length}</strong> accounts
          </span>
          {searchQuery && (
            <span>• matching name: <em>"{searchQuery}"</em></span>
          )}
          {selectedRoleFilter !== 'all' && (
            <span>• Role: <strong style={{ textTransform: 'capitalize' }}>{selectedRoleFilter}</strong></span>
          )}
          {selectedStatusFilter !== 'all' && (
            <span>• Status: <strong style={{ textTransform: 'capitalize' }}>{selectedStatusFilter}</strong></span>
          )}
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '10px',
        borderBottom: '2px solid #EDEDED',
        marginBottom: '2rem',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        <TabButton 
          active={activeTab === 'applied_doctors'} 
          onClick={() => setActiveTab('applied_doctors')}
          icon={<Stethoscope size={18} />}
          label="All Applied Doctors & Verification"
          badge={pendingCount > 0 ? `${pendingCount} Pending` : `${doctorCount}`}
          badgeColor={pendingCount > 0 ? '#FFA110' : '#FA520F'}
        />
        <TabButton 
          active={activeTab === 'all_users'} 
          onClick={() => setActiveTab('all_users')}
          icon={<Users size={18} />}
          label="All Users & Login Access Directory"
          badge={`${filteredUsers.length}`}
          badgeColor="#FA520F"
        />
        <TabButton 
          active={activeTab === 'ai_engines'} 
          onClick={() => setActiveTab('ai_engines')}
          icon={<Layers size={18} />}
          label="Diagnostic Engines"
        />
      </div>

      {/* ======================================================== */}
      {/* TAB 1: ALL APPLIED DOCTORS & VERIFICATION QUEUE           */}
      {/* ======================================================== */}
      {activeTab === 'applied_doctors' && (
        <div className="glass-panel" style={{ padding: '2rem', background: 'white' }}>
          
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
                Applied Doctors Verification Queue ({filteredDoctors.length})
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Review doctor profile applications. Accept new registrations, reject unverified accounts, or re-accept previously rejected doctors.
              </p>
            </div>
          </div>

          {/* Applied Doctors Cards Grid */}
          {filteredDoctors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#FAFAFA', borderRadius: 'var(--radius-lg)', border: '1.5px dashed #EDEDED' }}>
              <Stethoscope size={44} color="#8A8A8A" style={{ margin: '0 auto 0.75rem auto' }} />
              <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
                No Doctors Found
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
                No doctor profiles match the current name search "{searchQuery}" or status filter.
              </p>
              <button
                onClick={clearFilters}
                className="btn-outline"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {filteredDoctors.map((doc) => {
                const isPending = doc.status === 'pending';
                const isApproved = doc.status === 'approved';
                const isRejected = doc.status === 'rejected';

                return (
                  <div
                    key={doc.id}
                    style={{
                      background: '#ffffff',
                      border: isPending ? '2px solid #FFD06A' : isRejected ? '1.5px solid #E6D5A8' : '1.5px solid #EDEDED',
                      borderRadius: '18px',
                      padding: '1.75rem',
                      boxShadow: isPending ? '0 6px 18px rgba(245, 158, 11, 0.12)' : '0 2px 10px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Top Row: Doctor Info & Quick Action Buttons */}
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
                          background: isPending ? '#FFF0C2' : isApproved ? '#FFF8E0' : '#FFF8E0',
                          color: isPending ? '#FA520F' : isApproved ? '#FA520F' : '#CC3A05',
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
                            <h4 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0, fontWeight: '700' }}>
                              {doc.name}
                            </h4>
                            
                            {/* Status Badge */}
                            {isPending && (
                              <span style={{ background: '#FFF0C2', color: '#CC3A05', border: '1px solid #FFF0C2', fontSize: '0.75rem', fontWeight: '700', padding: '3px 10px', borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} /> Pending Approval
                              </span>
                            )}
                            {isApproved && (
                              <span style={{ background: '#FFF8E0', color: '#FA520F', border: '1px solid #E6D5A8', fontSize: '0.75rem', fontWeight: '700', padding: '3px 10px', borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <CheckCircle size={12} /> Approved & Active
                              </span>
                            )}
                            {isRejected && (
                              <span style={{ background: '#FFF8E0', color: '#CC3A05', border: '1px solid #E6D5A8', fontSize: '0.75rem', fontWeight: '700', padding: '3px 10px', borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <X size={12} /> Rejected / Access Blocked
                              </span>
                            )}
                          </div>

                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                            {doc.email} • {doc.phone || '+1-555-0102'} • ID: <strong>{doc.id}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons for Accept / Reject / Change status */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        
                        {/* 1. If Doctor is Pending -> Show Accept / Reject */}
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(doc.id, 'approved')}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '9px 18px',
                                background: '#FA520F',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.85rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                              }}
                            >
                              <Check size={16} /> Accept Doctor
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(doc.id, 'rejected')}
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
                              <X size={16} /> Reject
                            </button>
                          </>
                        )}

                        {/* 2. If Doctor is Rejected -> Admin can Change to Accept! */}
                        {isRejected && (
                          <button
                            onClick={() => handleUpdateStatus(doc.id, 'approved')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '9px 20px',
                              background: '#FA520F',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: 'var(--radius-md)',
                              fontSize: '0.85rem',
                              fontWeight: '700',
                              cursor: 'pointer',
                              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
                            }}
                          >
                            <Check size={16} /> Accept Doctor (Change Rejected to Approved)
                          </button>
                        )}

                        {/* 3. If Doctor is Approved -> Admin can Revoke / Reject or Set to Pending */}
                        {isApproved && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(doc.id, 'rejected')}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                background: '#FFF8E0',
                                color: '#CC3A05',
                                border: '1px solid #E6D5A8',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              <X size={14} /> Reject / Block Access
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(doc.id, 'pending')}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '8px 12px',
                                background: '#FAFAFA',
                                color: '#8A8A8A',
                                border: '1px solid #EDEDED',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                              }}
                              title="Reset status to pending"
                            >
                              <RotateCcw size={14} /> Reset
                            </button>
                          </>
                        )}

                      </div>
                    </div>

                    {/* Middle Detail Row: Specialization, Experience, Fee, Applied Date */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '0.75rem',
                      background: '#FAFAFA',
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      border: '1px solid #FAFAFA'
                    }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Specialization</span>
                        <strong style={{ color: '#1F1F1F', fontSize: '0.95rem' }}>{doc.specialization || 'General Physician'}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Experience</span>
                        <strong style={{ color: '#1F1F1F', fontSize: '0.95rem' }}>{doc.experience || '10'} Years Experience</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Consultation Fee</span>
                        <strong style={{ color: '#FA520F', fontSize: '0.95rem' }}>${doc.fee || '100'} USD</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>Applied Date</span>
                        <strong style={{ color: '#8A8A8A', fontSize: '0.95rem' }}>{doc.appliedAt || '2026-08-20'}</strong>
                      </div>
                    </div>

                    {/* Qualifications */}
                    {doc.qualifications && (
                      <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <strong>Medical Qualifications & Fellowships:</strong> {doc.qualifications}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ALL USERS & LOGIN ACCESS DIRECTORY                 */}
      {/* ======================================================== */}
      {activeTab === 'all_users' && (
        <div className="glass-panel" style={{ padding: '2rem', background: 'white' }}>
          
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
                All Accounts & Login Access Directory ({filteredUsers.length})
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Manage account permissions for Doctors, Patients, and System Administrators. Enable or revoke login access at any time.
              </p>
            </div>
          </div>

          {/* Users Table */}
          {filteredUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#FAFAFA', borderRadius: 'var(--radius-lg)', border: '1.5px dashed #EDEDED' }}>
              <Users size={44} color="#8A8A8A" style={{ margin: '0 auto 0.75rem auto' }} />
              <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
                No Accounts Match Search Criteria
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
                Try searching for a different name or reset role and status filters.
              </p>
              <button
                onClick={clearFilters}
                className="btn-outline"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #EDEDED', color: '#8A8A8A', background: '#FAFAFA' }}>
                    <th style={{ padding: '14px 16px', fontWeight: '700' }}>User ID</th>
                    <th style={{ padding: '14px 16px', fontWeight: '700' }}>Full Name</th>
                    <th style={{ padding: '14px 16px', fontWeight: '700' }}>Email Address</th>
                    <th style={{ padding: '14px 16px', fontWeight: '700' }}>Role</th>
                    <th style={{ padding: '14px 16px', fontWeight: '700' }}>Specialization / Department</th>
                    <th style={{ padding: '14px 16px', fontWeight: '700' }}>Login Status</th>
                    <th style={{ padding: '14px 16px', fontWeight: '700', textAlign: 'right' }}>Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u, i) => (
                    <tr key={u.id || i} style={{ borderBottom: '1px solid #FAFAFA', transition: 'background 0.2s' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '600', color: 'var(--text-muted)' }}>
                        {u.id || `USR-${i+1}`}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {u.name}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                        {u.email}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          background: u.role === 'admin' ? '#FAFAFA' : u.role === 'doctor' ? '#FFF8E0' : '#FAFAFA',
                          color: u.role === 'admin' ? '#FA520F' : u.role === 'doctor' ? '#FA520F' : '#FA520F'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {u.specialization || (u.role === 'admin' ? 'System Administrator' : 'General Patient')}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {u.status === 'pending' ? (
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            background: '#FFF0C2',
                            color: '#CC3A05',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Clock size={12} /> Pending Approval
                          </span>
                        ) : u.status === 'rejected' ? (
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            background: '#FFF8E0',
                            color: '#CC3A05'
                          }}>
                            ✕ Blocked / Rejected
                          </span>
                        ) : (
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            background: '#FFF8E0',
                            color: '#FA520F',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <CheckCircle size={12} /> Active / Allowed
                          </span>
                        )}
                      </td>

                      {/* Action Controls for Admin */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        {u.role === 'admin' ? (
                          <span style={{ color: '#EDEDED', fontSize: '0.8rem' }}>Superuser</span>
                        ) : u.status === 'rejected' ? (
                          <button
                            onClick={() => handleUpdateStatus(u.id, 'approved')}
                            style={{
                              background: '#FA520F',
                              color: '#FFFFFF',
                              border: 'none',
                              padding: '6px 14px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            Accept & Enable
                          </button>
                        ) : u.status === 'pending' ? (
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => handleUpdateStatus(u.id, 'approved')}
                              style={{
                                background: '#FA520F',
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(u.id, 'rejected')}
                              style={{
                                background: '#FFF8E0',
                                color: '#CC3A05',
                                border: '1px solid #E6D5A8',
                                padding: '6px 10px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(u.id, 'rejected')}
                            style={{
                              background: '#FAFAFA',
                              color: '#CC3A05',
                              border: '1px solid #E6D5A8',
                              padding: '5px 12px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Block / Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: DIAGNOSTIC ENGINES CONTROL                     */}
      {/* ======================================================== */}
      {activeTab === 'ai_engines' && (
        <div className="glass-panel" style={{ padding: '2rem', background: 'white' }}>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', fontWeight: '700' }}>
            Diagnostic Engine Control & Clinical Models
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            Deep learning neural networks and clinical prediction classifiers active on the platform.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            <AdminToolLink to="/tool/chest-xray" title="Chest X-Ray COVID & Pneumonia" desc="Deep Learning ResNet Classifier" />
            <AdminToolLink to="/tool/breast-cancer" title="Breast Cancer Diagnostic" desc="BI-RADS Mammogram Classifier" />
            <AdminToolLink to="/tool/liver-disease" title="Liver Disease Classifier" desc="Hepatic Enzyme & Fibrosis Predictor" />
            <AdminToolLink to="/tool/skin-cancer" title="Skin Cancer Detector" desc="HAM10000 CNN Model" />
            <AdminToolLink to="/tool/brain-tumor" title="Brain MRI Tumor Detector" desc="3D Multi-Sequence Segmentation" />
            <AdminToolLink to="/tool/alzheimers" title="Alzheimer's Early Predictor" desc="Cognitive & Neuroimaging Classifier" />
            <AdminToolLink to="/tool/heart-disease" title="Heart Disease Risk Engine" desc="Cardiovascular Clinical Predictor" />
            <AdminToolLink to="/tool/pneumonia" title="Pediatric Pneumonia Classifier" desc="High-Resolution Chest Radiograph" />
          </div>
        </div>
      )}

    </div>
  );
};

const StatCard = ({ title, value, icon, bg, highlight }) => (
  <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: highlight ? '1.5px solid #FFA110' : '1px solid var(--border-light)', background: 'white' }}>
    <div style={{ background: bg, width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    <div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600', margin: '0 0 2px 0' }}>{title}</p>
      <h3 style={{ fontSize: '1.6rem', color: 'var(--text-primary)', margin: 0, fontWeight: '800' }}>{value}</h3>
    </div>
  </div>
);

const TabButton = ({ active, onClick, icon, label, badge, badgeColor }) => (
  <button
    onClick={onClick}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 20px',
      border: 'none',
      borderBottom: active ? '3px solid #FA520F' : '3px solid transparent',
      background: active ? '#FAFAFA' : 'transparent',
      color: active ? '#FA520F' : '#8A8A8A',
      fontWeight: active ? '700' : '600',
      fontSize: '0.95rem',
      cursor: 'pointer',
      borderRadius: '8px 8px 0 0',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap'
    }}
  >
    {icon}
    <span>{label}</span>
    {badge && (
      <span style={{
        background: badgeColor || '#FA520F',
        color: '#FFFFFF',
        padding: '2px 8px',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.75rem',
        fontWeight: '700'
      }}>
        {badge}
      </span>
    )}
  </button>
);

const RolePill = ({ active, onClick, label, count, activeColor, activeBg }) => (
  <button
    onClick={onClick}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 14px',
      borderRadius: 'var(--radius-full)',
      border: active ? `1.5px solid ${activeColor || '#FA520F'}` : '1px solid #EDEDED',
      background: active ? (activeBg || '#FAFAFA') : '#ffffff',
      color: active ? (activeColor || '#FA520F') : '#8A8A8A',
      fontWeight: active ? '700' : '500',
      fontSize: '0.85rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: active ? '0 2px 8px rgba(0,0,0,0.06)' : 'none'
    }}
  >
    <span>{label}</span>
    <span style={{
      background: active ? (activeColor || '#FA520F') : '#FAFAFA',
      color: active ? 'white' : '#8A8A8A',
      padding: '1px 7px',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.75rem',
      fontWeight: '700'
    }}>
      {count}
    </span>
  </button>
);

const AdminToolLink = ({ to, title, desc }) => (
  <Link to={to} style={{
    display: 'block',
    padding: '1.25rem',
    background: '#FAFAFA',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-light)',
    color: 'inherit',
    textDecoration: 'none',
    transition: 'all 0.2s ease'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <strong style={{ fontSize: '0.95rem', color: '#1F1F1F' }}>{title}</strong>
      <ArrowUpRight size={16} color="var(--text-muted)" />
    </div>
    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem', marginBottom: 0 }}>{desc}</p>
  </Link>
);

export default AdminDashboard;
