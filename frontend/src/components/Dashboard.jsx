import React from 'react';

const Dashboard = () => {
  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Welcome to <span className="text-gradient-blue">VidCare</span></h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Your personal medical health monitoring and clinical consultation system.</p>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginTop: '2rem'
      }}>
        <DashboardCard 
          title="Symptom Checker" 
          description="Utilize evidence-based diagnostic models to evaluate possible health conditions from symptoms."
          linkTo="/symptom-checker"
          btnText="Check Symptoms"
        />
        <DashboardCard 
          title="Medical Consultation Assistant" 
          description="Consult our specialized medical assistant on health conditions and clinical guidelines securely."
          linkTo="/chatbot"
          btnText="Consult Assistant"
        />
        <DashboardCard 
          title="Consult a Doctor" 
          description="Book a virtual telehealth consultation with verified clinical specialists via Google Meet."
          linkTo="/consultation"
          btnText="Book Appointment"
        />
      </div>
      
      <div className="glass-panel" style={{ padding: '2rem', marginTop: '3rem' }}>
        <h3>Your Recent Activity</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>No recent activity to show. Start by checking your symptoms!</p>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, description, linkTo, btnText }) => {
  return (
    <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', flex: 1 }}>{description}</p>
      <a href={linkTo} className="btn-outline" style={{ textAlign: 'center', display: 'block' }}>
        {btnText}
      </a>
    </div>
  );
};

export default Dashboard;
