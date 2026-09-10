import { useState, useEffect } from 'react';
import Login from './Login';
import Desktop from './Desktop';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('feiniu_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (token: string) => {
    localStorage.setItem('feiniu_token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('feiniu_token');
    setIsAuthenticated(false);
  };

  return (
    <div className="w-full h-screen overflow-hidden text-slate-100 font-sans selection:bg-blue-500/30">
      {/* Global Background Wallpaper */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1449034446853-66c86144b0ad?q=80&w=2560&auto=format&fit=crop)' }}
      >
        <div className="absolute inset-0 bg-slate-900/20"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full h-full">
        {isAuthenticated ? (
          <Desktop onLogout={handleLogout} />
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </div>
    </div>
  );
}
