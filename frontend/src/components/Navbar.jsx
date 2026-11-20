import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  Stethoscope, 
  MessageSquare, 
  CalendarPlus, 
  HeartPulse, 
  Sparkles, 
  Menu, 
  X, 
  LogOut, 
  ShieldCheck, 
  User, 
  LayoutDashboard, 
  Layers,
  FileText,
  Clock,
  AlertTriangle,
  Calendar
} from 'lucide-react';

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobile) setIsOpen(false);
  }, [location.pathname, isMobile]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarStyle = {
    width: '270px',
    background: 'white',
    borderRight: '1px solid var(--border-light)',
    padding: '1.75rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    left: 0,
    top: 0,
    zIndex: 50,
    transition: 'transform 0.3s ease',
    transform: isMobile ? (isOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
    boxShadow: isMobile && isOpen ? '0 0 20px rgba(0,0,0,0.1)' : 'none'
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return { label: 'Admin', color: '#FA520F', bg: '#FAFAFA', icon: <ShieldCheck size={14} /> };
      case 'doctor':
        return { label: 'Doctor', color: '#FA520F', bg: '#FAFAFA', icon: <Stethoscope size={14} /> };
      default:
        return { label: 'Patient', color: '#FA520F', bg: '#FAFAFA', icon: <User size={14} /> };
    }
  };

  const badge = getRoleBadge();

  return (
    <>
      {/* Mobile Top Bar */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '70px',
          background: 'white', borderBottom: '1px solid var(--border-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1rem', zIndex: 40, boxShadow: 'var(--shadow-card)'
        }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '1.2rem', margin: 0 }}>
            <Activity size={24} color="var(--accent-blue)" /> VidCare
          </h2>
          <button onClick={toggleMenu} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      )}

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 45 }}
        />
      )}

      {/* Sidebar Navigation */}
      <nav style={sidebarStyle}>
        {/* Brand Logo */}
        <div style={{ marginBottom: '1.5rem', padding: '0 0.5rem', display: isMobile ? 'none' : 'block' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', fontSize: '1.4rem', margin: 0 }}>
            <Activity size={26} color="var(--accent-blue)" />
            VidCare
          </h2>
        </div>

        {/* User Profile Card */}
        {user && (
          <div style={{
            background: badge.bg,
            border: `1px solid ${badge.color}25`,
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: badge.color,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '0.9rem'
            }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name || 'User'}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: badge.color, fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                {badge.icon} {badge.label}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items based on Role */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, overflowY: 'auto' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem', paddingLeft: '0.5rem' }}>
            {role === 'admin' ? 'Administration' : role === 'doctor' ? 'Clinical Navigation' : 'Patient Services'}
          </p>

          {/* Role-Specific Navigation Links */}
          {role === 'admin' && (
            <>
              <NavItem to="/admin" icon={<LayoutDashboard size={19} />} label="Admin Dashboard" />
              <NavItem to="/doctor" icon={<Stethoscope size={19} />} label="Doctor Portal" />
              <NavItem to="/health-history" icon={<Clock size={19} />} label="Health History" />
              <NavItem to="/records" icon={<FileText size={19} />} label="Patient Records" />
              <NavItem to="/" icon={<Sparkles size={19} />} label="Overview & Clinical Hub" />
              <NavItem to="/tool/chest-xray" icon={<Layers size={19} />} label="Diagnostic Engines" />
              <NavItem to="/chatbot" icon={<MessageSquare size={19} />} label="Medical Assistant" />
              <NavItem to="/symptom-checker" icon={<Activity size={19} />} label="Symptom Checker" />
              <NavItem to="/mental-health" icon={<HeartPulse size={19} />} label="Mental Health" />
              <NavItem to="/bmi" icon={<Layers size={19} />} label="BMI Calculator" />
              <NavItem to="/consultation" icon={<CalendarPlus size={19} />} label="Appointments & Consult" />
              <NavItem to="/emergency" icon={<AlertTriangle size={19} color="#CC3A05" />} label="Emergency Support" />
            </>
          )}

          {role === 'doctor' && (
            <>
              <NavItem to="/doctor" icon={<LayoutDashboard size={19} />} label="Doctor Portal" />
              <NavItem to="/doctor/appointments" icon={<Calendar size={19} />} label="My Appointments" />
              <NavItem to="/doctor/profile" icon={<User size={19} />} label="Doctor Profile" />
              <NavItem to="/health-history" icon={<Clock size={19} />} label="Health History" />
              <NavItem to="/" icon={<Sparkles size={19} />} label="Overview" />
              <NavItem to="/tool/chest-xray" icon={<Activity size={19} />} label="Clinical Diagnostic Tools" />
              <NavItem to="/chatbot" icon={<MessageSquare size={19} />} label="Medical Assistant" />
              <NavItem to="/symptom-checker" icon={<Stethoscope size={19} />} label="Symptom Checker" />
              <NavItem to="/mental-health" icon={<HeartPulse size={19} />} label="Mental Health Review" />
              <NavItem to="/bmi" icon={<Layers size={19} />} label="BMI Calculator" />
              <NavItem to="/emergency" icon={<AlertTriangle size={19} color="#CC3A05" />} label="Emergency Support" />
            </>
          )}

          {role === 'patient' && (
            <>
              <NavItem to="/" icon={<Sparkles size={19} />} label="Home" />
              <NavItem to="/appointments" icon={<Calendar size={19} />} label="My Appointments" />
              <NavItem to="/health-history" icon={<Clock size={19} />} label="Health History" />
              <NavItem to="/records" icon={<FileText size={19} />} label="Patient Records" />
              <NavItem to="/chatbot" icon={<MessageSquare size={19} />} label="Medical Assistant" />
              <NavItem to="/symptom-checker" icon={<Stethoscope size={19} />} label="Symptom Checker" />
              <NavItem to="/mental-health" icon={<HeartPulse size={19} />} label="Mental Health Check" />
              <NavItem to="/bmi" icon={<Activity size={19} />} label="BMI Calculator" />
              <NavItem to="/consultation" icon={<CalendarPlus size={19} />} label="Book Appointment" />
              <NavItem to="/emergency" icon={<AlertTriangle size={19} color="#CC3A05" />} label="Emergency Support" />
            </>
          )}
        </div>

        {/* Footer with Logout */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: 'auto' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: '#FFF8E0',
              color: 'var(--accent-danger)',
              fontWeight: '600',
              fontSize: '0.9rem',
              transition: 'all 0.2s ease'
            }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>
    </>
  );
};

const NavItem = ({ to, icon, label }) => {
  return (
    <NavLink 
      to={to}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 12px',
        borderRadius: 'var(--radius-md)',
        color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
        background: isActive ? '#FFF8E0' : 'transparent',
        transition: 'all 0.2s ease',
        fontWeight: isActive ? '600' : '500',
        fontSize: '0.9rem'
      })}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

export default Navbar;
