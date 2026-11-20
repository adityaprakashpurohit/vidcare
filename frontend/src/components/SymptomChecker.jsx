import React, { useState } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle2, Stethoscope, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setError('Please enter your symptoms');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const symptomList = symptoms.split(',').map(s => s.trim()).filter(Boolean);
      const response = await axios.post('http://localhost:5000/api/predict', { symptoms: symptomList });
      setResult(response.data.prediction);
    } catch (err) {
      console.error(err);
      setError('Failed to connect to the prediction server. Please ensure the Flask backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '880px' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
          <Stethoscope size={24} color="var(--accent-blue)" />
          <h1 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--text-primary)' }}>
            Clinical Symptom <span className="text-gradient-blue">Checker</span>
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Enter your physical symptoms separated by commas. Our clinical diagnostic engine will evaluate potential conditions based on evidence-based protocols.
        </p>
      </header>

      <div className="glass-panel" style={{ padding: '2rem', border: '1px solid #EDEDED', background: '#FFFFFF' }}>
        <form onSubmit={handlePredict}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1F1F1F' }}>
              Describe your symptoms
            </label>
            <textarea 
              className="input-field" 
              rows="4" 
              placeholder="e.g., headache, mild fever, persistent dry cough, fatigue..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              style={{ 
                background: '#FAFAFA', 
                border: '1px solid #EDEDED', 
                color: '#1F1F1F',
                fontSize: '0.95rem',
                lineHeight: '1.6'
              }}
            />
          </div>
          
          {error && (
            <div style={{ color: 'var(--accent-danger)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '12px 28px', fontSize: '1rem' }}>
            {loading ? 'Analyzing Clinical Symptoms...' : 'Analyze Symptoms'}
          </button>
        </form>
      </div>

      {result && (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem', marginTop: '2rem', borderLeft: '4px solid #FA520F', background: '#FFFFFF', border: '1px solid #EDEDED' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem', color: '#1F1F1F', margin: 0 }}>
              <CheckCircle2 color="var(--accent-emerald)" size={22} /> Assessment Result
            </h2>
            <div style={{ display: 'inline-block', background: '#FFF0C2', color: '#CC3A05', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.88rem', fontWeight: 700 }}>
              Confidence: {(result.confidence * 100).toFixed(1)}%
            </div>
          </div>

          <div style={{ background: '#FAFAFA', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #EDEDED', marginBottom: '1.2rem' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: '#1F1F1F' }}>
              {result.name}
            </h3>
            <p style={{ color: '#3D3D3D', lineHeight: '1.6', fontSize: '0.95rem', margin: 0 }}>
              {result.description}
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.5rem' }}>
            <p style={{ color: '#CC3A05', margin: 0, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={16} /> Disclaimer: This clinical assessment provides assistive screening and is not a substitute for formal physician evaluation.
            </p>
            <Link to="/consultation" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', padding: '8px 18px', textDecoration: 'none' }}>
              Book Doctor Consultation <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomChecker;
