import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Power, Settings, Bell, FolderOpen, Terminal, Music, Clock, Database, X, Maximize2, Minus, LogOut, RefreshCw } from 'lucide-react';
import Dashboard from './Dashboard';
import { rebootSystemApi } from './api';

// Import apps
import TerminalApp from './apps/TerminalApp';
import FileExplorer from './apps/FileExplorer';
import DockerManager from './apps/DockerManager';
import MusicPlayer from './apps/MusicPlayer';
import SettingsApp from './apps/SettingsApp';
import ClockApp from './apps/ClockApp';

interface DesktopProps {
  onLogout: () => void;
}

interface AppWindow {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  isMaximized?: boolean;
}

const APPS = [
  { id: 'files', title: '文件管理', icon: <FolderOpen className="w-6 h-6 text-blue-400" />, component: <FileExplorer /> },
  { id: 'terminal', title: '终端控制', icon: <Terminal className="w-6 h-6 text-emerald-400" />, component: <TerminalApp /> },
  { id: 'music', title: '音乐播放', icon: <Music className="w-6 h-6 text-pink-400" />, component: <MusicPlayer /> },
  { id: 'clock', title: '时钟切换', icon: <Clock className="w-6 h-6 text-amber-400" />, component: <ClockApp /> },
  { id: 'docker', title: 'Docker 控制', icon: <Database className="w-6 h-6 text-cyan-400" />, component: <DockerManager /> },
];

export default function Desktop({ onLogout }: DesktopProps) {
  const [activeWindows, setActiveWindows] = useState<AppWindow[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // New States for System UI Overlays
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPowerMenu, setShowPowerMenu] = useState(false);
  const [isRebooting, setIsRebooting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const openApp = (app: Omit<AppWindow, 'isMaximized'>) => {
    if (!activeWindows.find(w => w.id === app.id)) {
      setActiveWindows([...activeWindows, { ...app, isMaximized: false }]);
    } else {
      bringToFront(app.id);
    }
  };

  const openSettings = () => {
    openApp({
      id: 'settings',
      title: '系统设置',
      icon: <Settings className="w-6 h-6 text-slate-400" />,
      component: <SettingsApp />
    });
  };

  const closeWindow = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveWindows(prev => prev.filter(w => w.id !== id));
  };

  const toggleMaximize = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  };

  const bringToFront = (id: string) => {
    setActiveWindows(prev => {
      const win = prev.find(w => w.id === id);
      if (!win) return prev;
      return [...prev.filter(w => w.id !== id), win];
    });
  };

  const handleReboot = async () => {
    setIsRebooting(true);
    const token = localStorage.getItem('feiniu_token') || '';
    await rebootSystemApi(token);
    // Simulate hardware reboot delay
    setTimeout(() => {
      onLogout();
    }, 3000);
  };

  return (
    <div className="w-full h-full flex flex-row relative text-slate-100">
      
      {/* Power Menu Overlay */}
      <AnimatePresence>
        {showPowerMenu && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            {isRebooting ? (
              <div className="flex flex-col items-center gap-4 text-white">
                <RefreshCw className="w-12 h-12 animate-spin text-blue-500" />
                <div className="text-xl font-medium tracking-widest">系统正在重启...</div>
              </div>
            ) : (
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-slate-900/90 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-2xl max-w-sm w-full"
              >
                <h3 className="text-xl font-semibold text-center mb-6 text-white">电源选项</h3>
                <div className="flex flex-col gap-3">
                  <button onClick={handleReboot} className="flex items-center justify-center gap-3 w-full py-4 bg-white/5 hover:bg-blue-500/20 text-blue-400 rounded-2xl transition-colors">
                    <RefreshCw className="w-5 h-5" /> 重启设备
                  </button>
                  <button onClick={onLogout} className="flex items-center justify-center gap-3 w-full py-4 bg-white/5 hover:bg-rose-500/20 text-rose-400 rounded-2xl transition-colors">
                    <Power className="w-5 h-5" /> 关闭电源
                  </button>
                  <button onClick={onLogout} className="flex items-center justify-center gap-3 w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-colors">
                    <LogOut className="w-5 h-5" /> 注销登录
                  </button>
                  <button onClick={() => setShowPowerMenu(false)} className="mt-4 py-3 text-white/50 hover:text-white transition-colors w-full">
                    取消
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dock (Left Side) */}
      <nav className="w-16 h-full backdrop-blur-3xl bg-black/20 border-r border-white/5 flex flex-col items-center py-4 shadow-2xl relative z-40">
        <div className="flex flex-col gap-4 flex-1">
          {APPS.map(app => (
            <button 
              key={app.id}
              onClick={() => openApp(app)}
              className="group relative p-2.5 rounded-xl hover:bg-white/10 transition-colors active:scale-95"
            >
              {app.icon}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black/80 backdrop-blur-md text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-white/5">
                {app.title}
              </div>
              {/* Active dot indicator */}
              {activeWindows.find(w => w.id === app.id) && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full opacity-50"></div>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 mt-auto relative">
          {/* Notification Popover */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, x: -20, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -20, scale: 0.95 }}
                className="absolute left-full bottom-20 ml-6 w-80 bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-3xl overflow-hidden"
              >
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                  <h4 className="font-semibold text-white">通知中心</h4>
                  <button onClick={() => setShowNotifications(false)} className="text-white/50 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-4 flex flex-col gap-3 max-h-[300px] overflow-y-auto">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="text-sm font-medium text-emerald-400 mb-1">系统启动成功</div>
                    <div className="text-xs text-white/60">所有核心服务已就绪。CPU 温度正常。</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="text-sm font-medium text-blue-400 mb-1">Docker 引擎</div>
                    <div className="text-xs text-white/60">检测到 4 个容器配置，其中 3 个正在运行中。</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2.5 rounded-xl transition-colors relative ${showNotifications ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/70 hover:text-white'}`}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-black/50"></span>
          </button>
          <button 
            onClick={openSettings}
            className="group relative p-2.5 rounded-xl hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          >
            <Settings className="w-5 h-5" />
            {activeWindows.find(w => w.id === 'settings') && (
              <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full opacity-50"></div>
            )}
          </button>
          <button 
            onClick={() => setShowPowerMenu(true)}
            className="p-2.5 rounded-xl hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors mt-1"
          >
            <Power className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Main Desktop Area */}
      <main className="flex-1 h-full relative overflow-hidden">
        {/* Top Bar (Optional, macOS style) */}
        <header className="absolute top-0 inset-x-0 h-10 backdrop-blur-md bg-black/20 border-b border-white/5 flex items-center justify-end px-6 z-30">
          <div className="text-sm font-medium text-white/90 tracking-wide">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </header>

        {/* Windows Container */}
        <div className="absolute inset-0 pt-10 p-6 pointer-events-none">
          <AnimatePresence>
            {activeWindows.map((win, idx) => {
              const isTop = idx === activeWindows.length - 1;
              return (
                <motion.div
                  key={win.id}
                  drag={!win.isMaximized}
                  dragMomentum={false}
                  dragConstraints={{ left: -100, top: 0, right: 1000, bottom: 800 }}
                  onPointerDown={() => bringToFront(win.id)}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    y: 0,
                    width: win.isMaximized ? '100%' : 750,
                    height: win.isMaximized ? '100%' : 480,
                    top: win.isMaximized ? 0 : 50 + (activeWindows.indexOf(win) * 30),
                    left: win.isMaximized ? 0 : 100 + (activeWindows.indexOf(win) * 30),
                  }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                  className={`absolute shadow-2xl overflow-hidden border backdrop-blur-2xl bg-slate-900/80 flex flex-col pointer-events-auto ${win.isMaximized ? 'rounded-none border-transparent' : 'rounded-2xl border-white/20 shadow-black/60'} ${isTop ? 'ring-1 ring-white/10' : 'opacity-90'}`}
                  style={{ zIndex: 10 + idx }}
                >
                  {/* Window Header */}
                  <div className="h-12 bg-white/10 border-b border-white/10 flex items-center px-4 cursor-grab active:cursor-grabbing justify-between">
                    <div className="flex items-center gap-3">
                      <div className="scale-75 opacity-80">{win.icon}</div>
                      <span className="font-medium text-sm text-white/90 tracking-wide">{win.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onPointerDown={(e) => e.stopPropagation()}
                        className="w-3.5 h-3.5 rounded-full bg-slate-600 hover:bg-slate-500 flex items-center justify-center group transition-colors"
                      >
                        <Minus className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100" />
                      </button>
                      <button 
                        onPointerDown={(e) => toggleMaximize(win.id, e)}
                        className="w-3.5 h-3.5 rounded-full bg-slate-600 hover:bg-slate-500 flex items-center justify-center group transition-colors"
                      >
                        <Maximize2 className="w-2 h-2 opacity-0 group-hover:opacity-100" />
                      </button>
                      <button 
                        onPointerDown={(e) => closeWindow(win.id, e)}
                        className="w-3.5 h-3.5 rounded-full bg-rose-500 hover:bg-rose-400 flex items-center justify-center group transition-colors"
                      >
                        <X className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-black/50" />
                      </button>
                    </div>
                  </div>
                  {/* Window Content */}
                  <div className="flex-1 relative overflow-hidden">
                    {win.component}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>

      {/* Dashboard Sidebar (Right Side) */}
      <Dashboard />
    </div>
  );
}
