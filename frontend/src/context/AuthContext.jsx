import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE = 'http://localhost:5000/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vidcare_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('vidcare_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('vidcare_user');
    }
  }, [user]);

  const getStoredUsers = () => {
    try {
      const stored = localStorage.getItem('vidcare_registered_users');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [
      { email: 'admin@vidcare.in', password: 'admin123', name: 'System Administrator', role: 'admin', id: 'USR-1', status: 'approved' },
      { email: 'doctor@vidcare.in', password: 'doctor123', name: 'Dr. Priya Sharma', role: 'doctor', id: 'USR-2', status: 'approved', specialization: 'Cardiologist', phone: '+91 98201 12345', experience: '15', fee: '120', qualifications: 'MD, DM Cardiology' },
      { email: 'patient@vidcare.in', password: 'patient123', name: 'Rahul Sharma', role: 'patient', id: 'USR-3', status: 'approved' }
    ];
  };

  const saveStoredUsers = (users) => {
    localStorage.setItem('vidcare_registered_users', JSON.stringify(users));
  };

  const login = async (email, password, role) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        setLoading(false);
        return { success: true, user: data.user, message: data.message };
      } else {
        setLoading(false);
        return { 
          success: false, 
          isPending: data.status === 'pending',
          isRejected: data.status === 'rejected',
          message: data.message || 'Login failed' 
        };
      }
    } catch (err) {
      console.warn('Backend not responding, using demo credentials validation:', err);
      const demoUsers = getStoredUsers();

      const found = demoUsers.find(
        (u) => (u.email.toLowerCase() === email.toLowerCase() || u.email.replace('@vidcare.in', '@vidcare.ai').toLowerCase() === email.toLowerCase() || u.email.replace('@vidcare.ai', '@vidcare.in').toLowerCase() === email.toLowerCase()) && u.password === password
      );

      if (found) {
        if (role && found.role !== role) {
          setLoading(false);
          return { success: false, message: `Account is registered as ${found.role}, not ${role}.` };
        }

        if (found.role === 'doctor' && found.status === 'pending') {
          setLoading(false);
          return { 
            success: false, 
            isPending: true, 
            message: 'Your doctor account is pending administrator approval. Please wait for confirmation.' 
          };
        }

        if (found.role === 'doctor' && found.status === 'rejected') {
          setLoading(false);
          return { 
            success: false, 
            isRejected: true, 
            message: 'Your doctor registration was rejected by the administrator.' 
          };
        }

        setUser(found);
        setLoading(false);
        return { success: true, user: found, message: 'Logged in (Demo Mode)' };
      }

      setLoading(false);
      return { success: false, message: 'Invalid credentials or backend unavailable.' };
    }
  };

  const register = async (name, email, password, role, profileData = {}) => {
    setLoading(true);
    try {
      const payload = { name, email, password, role, ...profileData };
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (role !== 'doctor') {
          setUser(data.user);
        }
        setLoading(false);
        return { 
          success: true, 
          isPending: data.status === 'pending' || role === 'doctor',
          user: data.user, 
          message: data.message 
        };
      } else {
        setLoading(false);
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (err) {
      console.warn('Backend not responding, using offline demo registration:', err);
      const isDoc = role === 'doctor';
      const newUser = {
        id: 'USR-' + Date.now().toString().slice(-4),
        name,
        email,
        password,
        role: role || 'patient',
        status: isDoc ? 'pending' : 'approved',
        appliedAt: new Date().toLocaleDateString(),
        ...profileData
      };
      
      const currentUsers = getStoredUsers();
      currentUsers.push(newUser);
      saveStoredUsers(currentUsers);

      if (!isDoc) {
        setUser(newUser);
      }
      setLoading(false);
      return { 
        success: true, 
        isPending: isDoc,
        user: newUser, 
        message: isDoc ? 'Doctor registration submitted! Please wait for administrator approval.' : 'Registered in Demo Mode' 
      };
    }
  };

  const approveDoctor = async (userId, action = 'approved') => {
    try {
      const res = await fetch(`${API_BASE}/approve-doctor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action })
      });
      const data = await res.json();
      
      // Update local storage
      const currentUsers = getStoredUsers();
      const target = currentUsers.find(u => u.id === userId);
      if (target) {
        target.status = action;
        saveStoredUsers(currentUsers);
      }
      return data;
    } catch (err) {
      const currentUsers = getStoredUsers();
      const target = currentUsers.find(u => u.id === userId);
      if (target) {
        target.status = action;
        saveStoredUsers(currentUsers);
      }
      return { success: true, message: `Doctor ${action} successfully in offline storage.` };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vidcare_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        approveDoctor,
        getStoredUsers,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
