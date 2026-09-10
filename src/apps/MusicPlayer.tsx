import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Repeat, Shuffle } from 'lucide-react';
import { motion } from 'motion/react';

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(30);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(p => (p >= 100 ? 0 : p + 0.5));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/40 to-slate-900 p-8 text-white relative overflow-hidden backdrop-blur-3xl">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-500 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Album Art */}
        <motion.div 
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-48 h-48 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl shadow-purple-500/20 mb-8 relative"
        >
          <img 
            src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop" 
            alt="Album Art"
            className="w-full h-full object-cover"
          />
          {/* Vinyl center hole */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-slate-900 rounded-full border-2 border-white/20 shadow-inner"></div>
          </div>
        </motion.div>

        {/* Track Info */}
        <div className="text-center mb-8 w-full">
          <h2 className="text-2xl font-bold text-white drop-shadow-md truncate">Midnight City Drive</h2>
          <p className="text-purple-300 font-medium mt-1 truncate">Synthwave Essentials</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full mb-8">
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden cursor-pointer relative">
            <div 
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-white/50 mt-2 font-mono">
            <span>{Math.floor(progress * 2.4 / 60)}:{(Math.floor(progress * 2.4 % 60)).toString().padStart(2, '0')}</span>
            <span>4:00</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 w-full">
          <button className="text-white/50 hover:text-white transition-colors">
            <Shuffle className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4 flex-1 justify-center">
            <button className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white">
              <SkipBack className="w-6 h-6 fill-current" />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 flex items-center justify-center rounded-full bg-white text-slate-900 hover:scale-105 transition-transform shadow-xl shadow-white/10"
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>
            <button className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white">
              <SkipForward className="w-6 h-6 fill-current" />
            </button>
          </div>

          <button className="text-white/50 hover:text-white transition-colors">
            <Repeat className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
