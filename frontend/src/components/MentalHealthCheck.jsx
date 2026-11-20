import React, { useState } from 'react';
import { ArrowRight, CheckCircle, RefreshCcw } from 'lucide-react';
import axios from 'axios';

const questions = [
  "Little interest or pleasure in doing things?",
  "Feeling down, depressed, or hopeless?",
  "Trouble falling or staying asleep, or sleeping too much?",
  "Feeling tired or having little energy?",
  "Poor appetite or overeating?",
  "Feeling bad about yourself — or that you are a failure or have let yourself or your family down?",
  "Trouble concentrating on things, such as reading the newspaper or watching television?",
  "Moving or speaking so slowly that other people could have noticed? Or so fidgety or restless that you have been moving a lot more than usual?",
  "Thoughts that you would be better off dead, or thoughts of hurting yourself in some way?"
];

const options = [
  { text: "Not at all", score: 0 },
  { text: "Several days", score: 1 },
  { text: "More than half the days", score: 2 },
  { text: "Nearly every day", score: 3 }
];

const MentalHealthCheck = () => {
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleStart = () => setStarted(true);

  const handleOption = async (score) => {
    const newAnswers = [...answers, score];
    if (currentQ < questions.length - 1) {
      setAnswers(newAnswers);
      setCurrentQ(currentQ + 1);
    } else {
      setLoading(true);
      setAnswers(newAnswers);
      try {
        // Send to backend to get interpretation
        const totalScore = newAnswers.reduce((a, b) => a + b, 0);
        let resData = null;
        if (res.data) {
          resData = res.data;
          setResult(res.data);
        }

        if (resData) {
          try {
            const existing = JSON.parse(localStorage.getItem('vidcare_mental_health_history') || '[]');
            const entry = {
              id: `MH-${Date.now().toString().slice(-5)}`,
              date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              score: totalScore,
              severity: resData.severity,
              recommendation: resData.recommendation,
              answersCount: 9
            };
            existing.unshift(entry);
            localStorage.setItem('vidcare_mental_health_history', JSON.stringify(existing));
          } catch (e) {}
        }
      } catch (err) {
        console.error(err);
        const totalScore = newAnswers.reduce((a, b) => a + b, 0);
        const fallback = {
          score: totalScore,
          severity: totalScore <= 4 ? "None-minimal" : totalScore <= 9 ? "Mild" : "Moderate",
          recommendation: totalScore <= 4 
            ? "Your score suggests minimal depression. Continue maintaining a healthy lifestyle."
            : "Mild to moderate symptoms noted. Recommended regular exercise and consultation."
        };
        setResult(fallback);

        try {
          const existing = JSON.parse(localStorage.getItem('vidcare_mental_health_history') || '[]');
          const entry = {
            id: `MH-${Date.now().toString().slice(-5)}`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            score: totalScore,
            severity: fallback.severity,
            recommendation: fallback.recommendation,
            answersCount: 9
          };
          existing.unshift(entry);
          localStorage.setItem('vidcare_mental_health_history', JSON.stringify(existing));
        } catch (e) {}
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReset = () => {
    setStarted(false);
    setCurrentQ(0);
    setAnswers([]);
    setResult(null);
  };

  if (result) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', paddingTop: '2rem' }}>
        <div className="glass-panel" style={{ padding: '3rem 2rem', background: '#FFF8E0' }}>
          <CheckCircle size={64} color="#FA520F" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ marginBottom: '1rem' }}>Assessment Complete</h2>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#FA520F', marginBottom: '0.5rem' }}>
            Score: {result.score}
          </div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Severity: {result.severity}</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            {result.recommendation}
          </p>
          <button onClick={handleReset} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCcw size={18} /> Retake Assessment
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', paddingTop: '3rem' }}>
        <h1 style={{ marginBottom: '1rem' }}>Mental Health <span className="text-gradient-blue">Check</span></h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem' }}>
          Take the PHQ-9 assessment to understand your mental wellbeing. It takes less than 2 minutes.
        </p>
        <button onClick={handleStart} className="btn-primary" style={{ fontSize: '1.1rem', padding: '14px 32px' }}>
          Start Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Question {currentQ + 1} of {questions.length}</span>
        <div style={{ width: '60%', height: '8px', background: '#EDEDED', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${((currentQ) / questions.length) * 100}%`, height: '100%', background: '#FA520F', transition: 'width 0.3s ease' }}></div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem', background: '#FFFFFF' }}>
        <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', lineHeight: '1.4' }}>
          Over the last 2 weeks, how often have you been bothered by: <br/><br/>
          <span style={{ color: '#FA520F' }}>"{questions[currentQ]}"</span>
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>Analyzing results...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {options.map((opt, idx) => (
              <button 
                key={idx}
                onClick={() => handleOption(opt.score)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px 24px', background: '#FAFAFA', border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)', fontSize: '1.1rem', color: 'var(--text-primary)',
                  transition: 'all 0.2s ease', cursor: 'pointer', textAlign: 'left'
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#FFF8E0'; e.currentTarget.style.borderColor = '#FA520F'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#FAFAFA'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
              >
                {opt.text}
                <ArrowRight size={20} color="#FA520F" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentalHealthCheck;
