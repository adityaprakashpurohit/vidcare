import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Salad, 
  Apple, 
  Dumbbell, 
  Ruler, 
  Scale, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  Heart,
  Droplets,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';

const BMICalculator = () => {
  const navigate = useNavigate();

  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('70');
  const [calculated, setCalculated] = useState(true); // Default to showing results matching screenshot or after calculate
  const [bmiData, setBmiData] = useState({
    bmi: 24.2,
    category: 'Normal',
    height: 170,
    weight: 70
  });
  const [loading, setLoading] = useState(false);

  const getDietPlan = (category, bmi) => {
    if (category === 'Underweight' || bmi < 18.5) {
      return {
        caloricTarget: '2,400 - 2,800 kcal/day (Caloric Surplus)',
        macronutrients: '50% Complex Carbs, 25% High-Quality Protein, 25% Healthy Fats',
        breakfast: 'Oatmeal cooked in whole milk with banana slices, chia seeds, and 2 tbsp peanut butter + 2 boiled eggs.',
        lunch: 'Brown rice with grilled salmon or chicken breast, avocado slices, and roasted olive oil sweet potatoes.',
        snacks: 'Greek yogurt with mixed berries, trail mix of almonds/walnuts, and fruit smoothie.',
        dinner: 'Whole wheat pasta or lentil curry with tofu/paneer, sautéed spinach, and pumpkin seeds.',
        hydration: 'Drink 2.5L water daily. Have smoothies and fruit shakes between meals for extra nutrients.',
        avoid: 'Empty calorie junk food, sugary sodas that suppress healthy appetite.'
      };
    } else if (category === 'Overweight' || (bmi >= 25 && bmi < 30)) {
      return {
        caloricTarget: '1,700 - 1,950 kcal/day (Moderate Caloric Deficit)',
        macronutrients: '40% Protein, 35% Fiber-rich Carbs, 25% Healthy Fats',
        breakfast: 'Scrambled egg whites with spinach, tomatoes, and 1 slice of sprouted whole-grain toast + green tea.',
        lunch: 'Large Mediterranean salad with grilled chicken breast, quinoa, cucumber, bell peppers, and lemon-vinaigrette.',
        snacks: 'Sliced cucumbers with hummus, 1 small green apple, or roasted chickpeas.',
        dinner: 'Baked white fish or grilled tofu with steamed broccoli, cauliflower rice, and asparagus.',
        hydration: 'Drink 3.0L water daily. Drink 1 glass of water 15 minutes before every meal.',
        avoid: 'Sugary beverages, deep-fried snacks, processed meats, refined flour, and late-night snacking.'
      };
    } else if (category === 'Obese' || category === 'Obesity' || bmi >= 30) {
      return {
        caloricTarget: '1,500 - 1,750 kcal/day (Structured Deficit)',
        macronutrients: '45% Lean Protein, 30% Complex Low-GI Carbs, 25% Healthy Fats',
        breakfast: 'Chia seed pudding with unsweetened almond milk, berries, and 1 scoop whey/plant protein.',
        lunch: 'Steamed turkey or lentil bowl with dark leafy greens, zucchini, and 1/2 avocado.',
        snacks: 'Celery sticks with 1 tbsp almond butter, green tea, or warm lemon water.',
        dinner: 'Grilled salmon or tofu stir-fry with bok choy, mushrooms, and cauliflower mash.',
        hydration: 'Drink 3.2L water daily. Completely eliminate liquid calories.',
        avoid: 'Fast food, sweet pastries, artificial sweeteners, soda, and refined carbohydrates.'
      };
    } else {
      // Normal weight
      return {
        caloricTarget: '2,000 - 2,200 kcal/day (Maintenance & Vitality)',
        macronutrients: '45% Complex Carbs, 30% Lean Protein, 25% Essential Healthy Fats',
        breakfast: 'Overnight oats with blueberries, flaxseeds, a drizzle of honey, and 2 poached eggs.',
        lunch: 'Quinoa bowl with grilled chicken or tempeh, mixed greens, cherry tomatoes, and olive oil dressing.',
        snacks: 'Handful of raw almonds, 1 fresh seasonal fruit (apple/orange), and coconut water.',
        dinner: 'Pan-seared salmon or paneer stir-fry with steamed broccoli, brown rice, and lentils.',
        hydration: 'Drink 2.5 - 3.0L of water daily to support metabolic function and cellular vitality.',
        avoid: 'Excessive refined sugar, deep-fried fast food, and overly processed packaged snacks.'
      };
    }
  };

  const getExercisePlan = (category, bmi) => {
    if (category === 'Underweight' || bmi < 18.5) {
      return {
        goal: 'Hypertrophy & Muscle Mass Building (Minimal High-Intensity Cardio)',
        split: '4 Days Resistance Training + 1 Day Light Mobility + 2 Days Rest',
        day1: 'Upper Body: Bench Press / Pushups (3x10), Dumbbell Rows (3x12), Overhead Press (3x10)',
        day2: 'Lower Body: Barbell/Goblet Squats (4x10), Romanian Deadlifts (3x12), Walking Lunges (3x10/leg)',
        day3: 'Active Rest / Gentle 20-min Walk & Joint Mobility Stretching',
        day4: 'Full Body Compound: Pull-ups/Lat Pulldowns (3x10), Dumbbell Incline Press (3x12), Leg Press (3x12)',
        day5: 'Core & Arm Hypertrophy: Bicep Curls (3x12), Tricep Dips (3x12), Plank Holds (3x45s)',
        notes: 'Rest 90-120 seconds between heavy sets. Ensure adequate sleep (7-9 hours) for muscular recovery.'
      };
    } else if (category === 'Overweight' || (bmi >= 25 && bmi < 30)) {
      return {
        goal: 'Fat Loss, Metabolic Conditioning & Cardiovascular Endurance',
        split: '3 Days HIIT/Cardio + 3 Days Functional Strength Training + 1 Day Rest',
        day1: 'Cardio & Fat Burn: 30-min Incline Treadmill Walk / Steady Cycling (Zone 2 Heart Rate)',
        day2: 'Upper Body Resistance: Pushups (3x15), Dumbbell Rows (3x12), Shoulder Press (3x12), Plank (3x60s)',
        day3: 'HIIT Circuit: 20 mins (30s Kettlebell Swings, 30s Mountain Climbers, 30s Jump Rope, 30s Rest)',
        day4: 'Lower Body: Bodyweight/Dumbbell Squats (4x15), Glute Bridges (4x15), Step-ups (3x12/leg)',
        day5: 'Zone 2 Cardio: 40-min brisk walk, light jogging, or lap swimming',
        notes: 'Maintain heart rate in 65-75% max zone for optimal lipid oxidation. Stay consistent.'
      };
    } else if (category === 'Obese' || category === 'Obesity' || bmi >= 30) {
      return {
        goal: 'Low-Impact Fat Burn, Joint Protection & Gradual Endurance Building',
        split: '5 Days Low-Impact Movement + 2 Days Rest',
        day1: 'Low-Impact Cardio: 25-30 min Brisk Flat Walking or Stationary Recumbent Cycling',
        day2: 'Joint-Friendly Strength: Chair Squats (3x10), Wall Pushups (3x12), Resistance Band Rows (3x12)',
        day3: 'Aquatic Exercise or 30-min Swimming (Zero Joint Compression)',
        day4: 'Core & Mobility: Seated Leg Extensions (3x12), Bird-Dogs (3x8/side), Standing Side Bends (3x12)',
        day5: 'Interval Walking: 3 mins moderate walk + 1 min slightly faster walk (Repeat 6 cycles)',
        notes: 'Wear supportive cushioned footwear. Discontinue immediately if joint pain occurs.'
      };
    } else {
      // Normal weight
      return {
        goal: 'Cardiovascular Longevity, Muscle Tone & Athletic Performance',
        split: '3 Days Strength Training + 2 Days Aerobic Cardio + 2 Days Active Recovery',
        day1: 'Upper Body Hypertrophy: Pushups (3x15), Pull-ups (3x8-10), Dumbbell Chest Press (3x12)',
        day2: 'Cardio Endurance: 35-min 5K Run, Cycling, or Rowing Session',
        day3: 'Lower Body & Core: Squats (4x12), Romanian Deadlifts (3x12), Lunges (3x10), Plank (3x60s)',
        day4: 'Active Recovery: 45-min Nature Walk, Vinyasa Yoga, or Swimming',
        day5: 'Full Body Functional HIIT: 25-min Circuit (Burpees, Dumbbell Cleans, Box Jumps, Hollow Holds)',
        notes: 'Target 150+ minutes of moderate activity per week. Focus on progressive overload and mobility.'
      };
    }
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (!h || !w) return;

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/bmi', { height: h, weight: w });
      if (res.data) {
        const bmiVal = res.data.bmi;
        let cat = res.data.category;
        if (cat === 'Normal weight') cat = 'Normal';
        
        setBmiData({
          bmi: bmiVal,
          category: cat,
          height: h,
          weight: w
        });
        setCalculated(true);

        // Save to BMI History
        try {
          const existing = JSON.parse(localStorage.getItem('vidcare_bmi_history') || '[]');
          const entry = {
            id: `BMI-${Date.now().toString().slice(-5)}`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            height: h,
            weight: w,
            bmi: bmiVal,
            category: cat,
            plan: res.data.diet_plan || 'Personalized plan generated'
          };
          existing.unshift(entry);
          localStorage.setItem('vidcare_bmi_history', JSON.stringify(existing));
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Calculating BMI locally:', err);
      const hMeters = h / 100;
      const calcBmi = parseFloat((w / (hMeters * hMeters)).toFixed(1));
      let cat = 'Normal';
      if (calcBmi < 18.5) cat = 'Underweight';
      else if (calcBmi >= 25 && calcBmi < 30) cat = 'Overweight';
      else if (calcBmi >= 30) cat = 'Obese';

      setBmiData({
        bmi: calcBmi,
        category: cat,
        height: h,
        weight: w
      });
      setCalculated(true);

      try {
        const existing = JSON.parse(localStorage.getItem('vidcare_bmi_history') || '[]');
        const entry = {
          id: `BMI-${Date.now().toString().slice(-5)}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          height: h,
          weight: w,
          bmi: calcBmi,
          category: cat,
          plan: `Tailored plan for ${cat}`
        };
        existing.unshift(entry);
        localStorage.setItem('vidcare_bmi_history', JSON.stringify(existing));
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  const dietPlan = getDietPlan(bmiData.category, bmiData.bmi);
  const exercisePlan = getExercisePlan(bmiData.category, bmiData.bmi);

  const getBadgeStyle = (category) => {
    switch (category) {
      case 'Normal':
      case 'Normal weight':
        return { bg: '#FFF8E0', color: '#FA520F', label: 'Normal' };
      case 'Underweight':
        return { bg: '#FFFAEB', color: '#FFA110', label: 'Underweight' };
      case 'Overweight':
        return { bg: '#FFF0C2', color: '#FF8105', label: 'Overweight' };
      case 'Obese':
      case 'Obesity':
        return { bg: '#1C1C1E', color: '#FFFFFF', label: 'Obese' };
      default:
        return { bg: '#FFF8E0', color: '#FA520F', label: 'Normal' };
    }
  };

  const badgeStyle = getBadgeStyle(bmiData.category);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1020px', margin: '0 auto', paddingBottom: '3rem' }}>
      
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

        {/* Green Rounded Salad / Nutrition Icon */}
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '14px',
          background: 'linear-gradient(90deg, #FA520F 0%, #FFA110 35%, #FFB83E 65%, #FFD900 85%, #FFF8E0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          boxShadow: '0 4px 12px rgba(250, 82, 15, 0.25)'
        }}>
          <Salad size={24} />
        </div>

        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            Diet & Exercise Plans
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, marginTop: '2px' }}>
            Personalized recommendations for you
          </p>
        </div>
      </div>

      {/* Input Adjuster Form (Collapsible / Clean) */}
      <div style={{
        background: 'white',
        border: '1px solid #EDEDED',
        borderRadius: '16px',
        padding: '1.25rem 1.75rem',
        marginBottom: '1.75rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <form onSubmit={handleCalculate} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Height:</label>
              <div style={{ position: 'relative', width: '130px' }}>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="input-field"
                  placeholder="Height"
                  style={{ paddingRight: '38px', height: '40px' }}
                  required
                />
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: '#8A8A8A' }}>cm</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Weight:</label>
              <div style={{ position: 'relative', width: '130px' }}>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="input-field"
                  placeholder="Weight"
                  style={{ paddingRight: '38px', height: '40px' }}
                  required
                />
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: '#8A8A8A' }}>kg</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 22px',
              borderRadius: 'var(--radius-md)',
              background: '#FA520F',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(250, 82, 15, 0.25)'
            }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Recalculate Plan</span>
          </button>
        </form>
      </div>

      {calculated && (
        <>
          {/* Top Banner (BMI Result Summary Card Matching Screenshot) */}
          <div style={{
            background: 'linear-gradient(90deg, #FA520F 0%, #FFA110 35%, #FFB83E 65%, #FFD900 85%, #FFF8E0 100%)',
            border: '1.5px solid #E6D5A8',
            borderRadius: '20px',
            padding: '1.75rem 2.5rem',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
            boxShadow: '0 4px 14px rgba(250, 82, 15, 0.08)'
          }}>
            <div>
              <span style={{
                color: '#8A8A8A',
                fontSize: '0.95rem',
                fontWeight: '500',
                display: 'block',
                marginBottom: '0.2rem'
              }}>
                Your BMI
              </span>
              <h2 style={{
                fontSize: '2.8rem',
                fontWeight: '800',
                color: '#1F1F1F',
                margin: 0,
                lineHeight: '1.1'
              }}>
                {bmiData.bmi}
              </h2>
              <div style={{ marginTop: '0.6rem' }}>
                <span style={{
                  display: 'inline-block',
                  background: badgeStyle.bg,
                  color: badgeStyle.color,
                  padding: '4px 16px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: '700'
                }}>
                  {badgeStyle.label}
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right', fontSize: '0.95rem', color: '#3D3D3D' }}>
              <div style={{ marginBottom: '0.4rem' }}>
                Height: <strong style={{ color: '#1F1F1F' }}>{bmiData.height} cm</strong>
              </div>
              <div>
                Weight: <strong style={{ color: '#1F1F1F' }}>{bmiData.weight} kg</strong>
              </div>
            </div>
          </div>

          {/* Two-Column Grid: Diet Plan (Orange) & Exercise Plan (Blue) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
            gap: '1.75rem'
          }}>

            {/* Card 1: Diet Plan (Orange) */}
            <div style={{
              background: 'white',
              border: '1px solid #FAFAFA',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: '#FA520F',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(250, 82, 15, 0.25)'
                }}>
                  <Apple size={22} />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  Diet Plan
                </h3>
              </div>

              {/* Diet Content */}
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                
                {/* Target Calorie Banner */}
                <div style={{ background: '#FFF8E0', border: '1px solid #E6D5A8', padding: '12px 16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#CC3A05', textTransform: 'uppercase', marginBottom: '2px' }}>
                    Daily Caloric & Macro Target
                  </div>
                  <strong style={{ color: '#1F1F1F', fontSize: '0.95rem' }}>{dietPlan.caloricTarget}</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#3D3D3D' }}>{dietPlan.macronutrients}</p>
                </div>

                {/* Meal Breakdown */}
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1F1F1F', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🍳 Daily Meal Schedule
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ background: '#FAFAFA', padding: '10px 14px', borderRadius: '10px', border: '1px solid #FAFAFA' }}>
                      <strong style={{ color: '#FA520F', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Breakfast</strong>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem' }}>{dietPlan.breakfast}</p>
                    </div>

                    <div style={{ background: '#FAFAFA', padding: '10px 14px', borderRadius: '10px', border: '1px solid #FAFAFA' }}>
                      <strong style={{ color: '#FA520F', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Lunch</strong>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem' }}>{dietPlan.lunch}</p>
                    </div>

                    <div style={{ background: '#FAFAFA', padding: '10px 14px', borderRadius: '10px', border: '1px solid #FAFAFA' }}>
                      <strong style={{ color: '#FA520F', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Midday Snacks</strong>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem' }}>{dietPlan.snacks}</p>
                    </div>

                    <div style={{ background: '#FAFAFA', padding: '10px 14px', borderRadius: '10px', border: '1px solid #FAFAFA' }}>
                      <strong style={{ color: '#FA520F', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Dinner</strong>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem' }}>{dietPlan.dinner}</p>
                    </div>
                  </div>
                </div>

                {/* Hydration & Guidelines */}
                <div style={{ borderTop: '1px solid #FAFAFA', paddingTop: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FFA110', fontWeight: '600', marginBottom: '4px' }}>
                    <Droplets size={16} /> Hydration Protocol
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>{dietPlan.hydration}</p>
                </div>
              </div>
            </div>

            {/* Card 2: Exercise Plan (Blue) */}
            <div style={{
              background: 'white',
              border: '1px solid #FAFAFA',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: '#FFA110',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(255, 161, 16, 0.25)'
                }}>
                  <Dumbbell size={22} />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  Exercise Plan
                </h3>
              </div>

              {/* Exercise Content */}
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                
                {/* Workout Goal Banner */}
                <div style={{ background: '#FAFAFA', border: '1px solid #EDEDED', padding: '12px 16px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#FFA110', textTransform: 'uppercase', marginBottom: '2px' }}>
                    Primary Fitness Target
                  </div>
                  <strong style={{ color: '#FFA110', fontSize: '0.95rem' }}>{exercisePlan.goal}</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#FFA110' }}>Split: {exercisePlan.split}</p>
                </div>

                {/* Workout Routine Breakdown */}
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1F1F1F', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🏋️ Weekly Training Breakdown
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ background: '#FAFAFA', padding: '10px 14px', borderRadius: '10px', border: '1px solid #FAFAFA' }}>
                      <strong style={{ color: '#FFA110', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Day 1 Routine</strong>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem' }}>{exercisePlan.day1}</p>
                    </div>

                    <div style={{ background: '#FAFAFA', padding: '10px 14px', borderRadius: '10px', border: '1px solid #FAFAFA' }}>
                      <strong style={{ color: '#FFA110', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Day 2 Routine</strong>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem' }}>{exercisePlan.day2}</p>
                    </div>

                    <div style={{ background: '#FAFAFA', padding: '10px 14px', borderRadius: '10px', border: '1px solid #FAFAFA' }}>
                      <strong style={{ color: '#FFA110', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Day 3 Routine</strong>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem' }}>{exercisePlan.day3}</p>
                    </div>

                    <div style={{ background: '#FAFAFA', padding: '10px 14px', borderRadius: '10px', border: '1px solid #FAFAFA' }}>
                      <strong style={{ color: '#FFA110', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Day 4 & 5 Routine</strong>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem' }}>{exercisePlan.day4 || exercisePlan.day5}</p>
                    </div>
                  </div>
                </div>

                {/* Safety & Progression Protocol */}
                <div style={{ borderTop: '1px solid #FAFAFA', paddingTop: '1rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FA520F', fontWeight: '600', marginBottom: '4px' }}>
                    <Activity size={16} /> Progression & Safety Tips
                  </div>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>{exercisePlan.notes}</p>
                </div>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
};

export default BMICalculator;
