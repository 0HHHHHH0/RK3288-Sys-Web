import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export default function ClockApp() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const currentYear = time.getFullYear();
  const currentMonth = time.getMonth();
  const currentDate = time.getDate();
  
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }, (_, i) => i);
  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-900/80 backdrop-blur-3xl p-8 relative overflow-hidden">
      
      {/* Decorative gradient blur */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-amber-500/40 blur-[128px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-500/40 blur-[128px] rounded-full"></div>
      </div>

      <div className="flex gap-16 relative z-10 w-full max-w-3xl">
        
        {/* Digital Clock Section */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[6rem] font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40 tracking-tighter tabular-nums leading-none mb-4 drop-shadow-2xl"
          >
            {time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
          </motion.div>
          <div className="text-3xl font-medium text-amber-400 tabular-nums">
            {time.getSeconds().toString().padStart(2, '0')}
          </div>
          <div className="mt-8 text-xl text-white/60 font-medium tracking-widest uppercase border-t border-white/10 pt-4 px-8">
            {time.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Calendar Section */}
        <div className="w-72 bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
          <div className="flex justify-between items-center mb-6 px-1">
            <h3 className="text-lg font-bold text-white">
              {time.toLocaleDateString('zh-CN', { month: 'long' })}
            </h3>
            <span className="text-sm font-medium text-white/40">{currentYear}</span>
          </div>

          <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center mb-2">
            {weekDays.map(d => (
              <div key={d} className="text-xs font-medium text-white/40">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {blanks.map(b => (
              <div key={`blank-${b}`} className="aspect-square"></div>
            ))}
            {days.map(d => (
              <div key={d} className="aspect-square flex items-center justify-center relative">
                {d === currentDate ? (
                  <motion.div 
                    layoutId="current-date"
                    className="absolute inset-0 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                  ></motion.div>
                ) : null}
                <span className={`relative text-sm font-medium z-10 ${d === currentDate ? 'text-white' : 'text-white/80 hover:text-white cursor-pointer'}`}>
                  {d}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
