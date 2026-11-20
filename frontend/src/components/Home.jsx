import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, 
  HeartPulse, 
  Activity, 
  Stethoscope, 
  CalendarPlus, 
  ArrowRight, 
  ShieldCheck, 
  FileCheck, 
  Stethoscope as Scope, 
  Zap, 
  Heart, 
  Brain, 
  Wind, 
  Sparkles,
  TrendingUp,
  Microscope,
  FileText,
  Clock,
  Calendar
} from 'lucide-react';

const Home = () => {
  const { role } = useAuth();
  const showAdvancedImaging = role === 'doctor' || role === 'admin';

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '0rem 0 3rem 0', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Your Personal <span className="text-gradient-blue">Health Companion</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
          Get instant medical guidance and professional clinical support. Available 24/7 to help you understand and manage your health better.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldCheck size={18} color="var(--accent-emerald)" /> Private & Secure</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FileCheck size={18} color="var(--accent-pink)" /> Evidence-Based</span>
        </div>
      </div>

      {/* Main Features */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        <MainFeatureCard 
          icon={<MessageSquare size={24} />} 
          title="Medical Assistant" 
          desc="Get medicine suggestions, dosage information, and care instructions for your symptoms"
          color="blue"
          to="/chatbot"
        />
        <MainFeatureCard 
          icon={<Brain size={24} />} 
          title="Mental Health Check" 
          desc="Take a quick assessment to understand your mental wellbeing and get personalized tips"
          color="emerald"
          to="/mental-health"
        />
        <MainFeatureCard 
          icon={<Activity size={24} />} 
          title="BMI Calculator" 
          desc="Calculate your BMI and get personalized diet plans and exercise routines"
          color="emerald"
          to="/bmi"
        />
        <MainFeatureCard 
          icon={<Scope size={24} />} 
          title="Symptom Checker" 
          desc="Check your symptoms and get certified clinical health insights and recommendations"
          color="purple"
          to="/symptom-checker"
        />
        <MainFeatureCard 
          icon={<Calendar size={24} />} 
          title="My Appointments" 
          desc="Track your approved, pending, and scheduled consultations with direct video meeting links"
          color="blue"
          to="/appointments"
        />
        <MainFeatureCard 
          icon={<CalendarPlus size={24} />} 
          title="Book Appointment" 
          desc="Schedule online consultations with specialized doctors"
          color="pink"
          to="/consultation"
        />
        <MainFeatureCard 
          icon={<FileText size={24} />} 
          title="Patient Records" 
          desc="Upload and organize your lab reports, imaging results, and medical history"
          color="blue"
          to="/records"
        />
        <MainFeatureCard 
          icon={<Clock size={24} />} 
          title="Health History" 
          desc="View your complete medical timeline, detections, assessments, and appointments"
          color="purple"
          to="/health-history"
        />
      </div>

      {/* Clinical Diagnostic Tools Title Header & Cards - Visible only to Doctors and Admins */}
      {showAdvancedImaging && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Advanced medical imaging and risk prediction
            </h2>
          </div>

          {/* 8 Clinical Diagnostic Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <DiagnosticCard 
              icon={<ScanSquareIcon />} 
              title="Chest X-ray COVID-19" 
              desc="COVID-19 detection and lung screening" 
              to="/tool/chest-xray" 
              color="#FFFFFF" 
              iconBg="#FA520F" 
            />
            <DiagnosticCard 
              icon={<Heart size={20} />} 
              title="Breast Cancer" 
              desc="Mammogram BI-RADS analysis" 
              to="/tool/breast-cancer" 
              color="#FFFFFF" 
              iconBg="#FA520F" 
            />
            <DiagnosticCard 
              icon={<Activity size={20} />} 
              title="Liver Disease" 
              desc="Hepatic steatosis & enzyme analysis" 
              to="/tool/liver-disease" 
              color="#FFFFFF" 
              iconBg="#FA520F" 
            />
            <DiagnosticCard 
              icon={<Microscope size={20} />} 
              title="Disease Detection" 
              desc="Multi-organ medical imaging" 
              to="/tool/disease-detection" 
              color="#FFFFFF" 
              iconBg="#FA520F" 
            />
            <DiagnosticCard 
              icon={<SunIcon />} 
              title="Skin Cancer" 
              desc="ABCDE lesion analysis" 
              to="/tool/skin-cancer" 
              color="#FFFFFF" 
              iconBg="#FA520F" 
            />
            <DiagnosticCard 
              icon={<Heart size={20} />} 
              title="Heart Disease" 
              desc="Cardiovascular risk assessment" 
              to="/tool/heart-disease" 
              color="#FFFFFF" 
              iconBg="#FA520F" 
            />
            <DiagnosticCard 
              icon={<Brain size={20} />} 
              title="Brain Tumor" 
              desc="MRI segmentation analysis" 
              to="/tool/brain-tumor" 
              color="#FFFFFF" 
              iconBg="#FA520F" 
            />
            <DiagnosticCard 
              icon={<Wind size={20} />} 
              title="Pneumonia" 
              desc="Chest X-ray detection" 
              to="/tool/pneumonia" 
              color="#FFFFFF" 
              iconBg="#FA520F" 
            />
          </div>
        </div>
      )}
    </div>
  );
};

const MainFeatureCard = ({ icon, title, desc, color, to }) => {
  const getColors = () => {
    switch(color) {
      case 'blue': return { bg: '#FFFFFF', iconBg: '#FA520F', btn: 'btn-primary' };
      case 'emerald': return { bg: '#FFFFFF', iconBg: '#FFA110', btn: 'btn-primary' };
      case 'purple': return { bg: '#FFFFFF', iconBg: '#FF8105', btn: 'btn-primary' };
      case 'pink': return { bg: '#FFFFFF', iconBg: '#FA520F', btn: 'btn-primary' };
      default: return { bg: '#FFFFFF', iconBg: '#FA520F', btn: 'btn-primary' };
    }
  };
  const colors = getColors();

  return (
    <div className="glass-panel" style={{ background: colors.bg, padding: '2rem', display: 'flex', flexDirection: 'column' }}>
      <div className="card-icon-container" style={{ background: colors.iconBg }}>
        {icon}
      </div>
      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1, fontSize: '0.95rem' }}>{desc}</p>
      <Link to={to} className={colors.btn} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: 'max-content' }}>
        Get Started <ArrowRight size={16} />
      </Link>
    </div>
  );
};

const DiagnosticCard = ({ icon, title, desc, to, color, iconBg }) => {
  return (
    <Link 
      to={to} 
      className="glass-panel" 
      style={{ 
        background: color, 
        padding: '1.75rem 1.5rem', 
        textDecoration: 'none', 
        color: 'inherit', 
        display: 'block',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid #EDEDED'
      }}
    >
      <div 
        className="card-icon-container" 
        style={{ 
          background: iconBg, 
          width: '44px', 
          height: '44px', 
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          marginBottom: '1rem',
          boxShadow: `0 4px 10px ${iconBg}30`
        }}
      >
        {icon}
      </div>
      <h4 style={{ marginBottom: '0.4rem', fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: '700' }}>
        {title}
      </h4>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>
        {desc}
      </p>
    </Link>
  );
};

const ScanSquareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
    <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
    <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
    <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
  </svg>
);

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"></circle>
    <path d="M12 2v2"></path>
    <path d="M12 20v2"></path>
    <path d="M4.93 4.93l1.41 1.41"></path>
    <path d="M17.66 17.66l1.41 1.41"></path>
    <path d="M2 12h2"></path>
    <path d="M20 12h2"></path>
    <path d="M6.34 17.66l-1.41 1.41"></path>
    <path d="M19.07 4.93l-1.41 1.41"></path>
  </svg>
);

export default Home;
