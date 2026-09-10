import { useState, useEffect } from 'react';
import { Activity, HardDrive, Network, Cpu, Database, ChevronLeft, ChevronRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { getSystemStatusApi } from './api';

// Simple Circular Progress Component
const CircularProgress = ({ value, label, color = 'text-blue-500' }: { value: number, label: string, color?: string }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="40" cy="40" r={radius} className="stroke-white/10 fill-none" strokeWidth="6" />
          <circle 
            cx="40" cy="40" r={radius} 
            className={`fill-none ${color.replace('text-', 'stroke-')}`} 
            strokeWidth="6" strokeLinecap="round"
            style={{ strokeDasharray: circumference, strokeDashoffset: offset, transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute text-sm font-semibold">{Math.round(value)}%</div>
      </div>
      <span className="text-xs text-white/60 font-medium uppercase tracking-wider">{label}</span>
    </div>
  );
};

export default function Dashboard() {
  const [status, setStatus] = useState<any>(null);
  const [netHistory, setNetHistory] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      const token = localStorage.getItem('feiniu_token') || '';
      const data = await getSystemStatusApi(token);
      setStatus(data);
      
      setNetHistory(prev => {
        const next = [...prev, { time: Date.now(), up: data.network.upload_speed, down: data.network.download_speed }];
        if (next.length > 20) return next.slice(next.length - 20);
        return next;
      });
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 1000); // Refresh every second
    return () => clearInterval(interval);
  }, []);

  if (!status) {
    return (
      <aside className="absolute right-4 top-14 bottom-4 w-16 backdrop-blur-3xl bg-slate-900/40 border border-white/10 rounded-3xl flex items-center justify-center z-40">
        <Activity className="w-5 h-5 animate-pulse text-white/50" />
      </aside>
    );
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600*24));
    const h = Math.floor(seconds % (3600*24) / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    return `${d}d ${h}h ${m}m`;
  };

  return (
    <aside className={`absolute right-4 top-14 bottom-4 z-40 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] backdrop-blur-3xl bg-slate-900/60 border border-white/10 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col ${isExpanded ? 'w-[320px] lg:w-[360px]' : 'w-16'}`}>
      
      {/* Compact View */}
      <div className={`absolute inset-0 flex flex-col items-center py-6 gap-8 transition-opacity duration-300 ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <button onClick={() => setIsExpanded(true)} className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors mb-2">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center gap-1.5 group cursor-pointer" onClick={() => setIsExpanded(true)}>
          <Cpu className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-medium text-white/70">{Math.round(status.cpu.usage)}%</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 group cursor-pointer" onClick={() => setIsExpanded(true)}>
          <Database className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-medium text-white/70">{Math.round(status.memory.percent)}%</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 group cursor-pointer" onClick={() => setIsExpanded(true)}>
          <Network className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-medium text-white/70">{(status.network.upload_speed / 1024).toFixed(0)}K</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 group cursor-pointer mt-auto" onClick={() => setIsExpanded(true)}>
          <HardDrive className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-medium text-white/70">{status.disk.percent}%</span>
        </div>
      </div>

      {/* Expanded View */}
      <div className={`absolute inset-0 w-[320px] lg:w-[360px] p-6 flex flex-col gap-4 overflow-y-auto scrollbar-hide transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-wide text-white/90">System Monitor</h2>
            <div className="flex items-center gap-2 text-[10px] font-medium bg-white/10 px-2 py-0.5 rounded-full text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              RK3288
            </div>
          </div>
          <button onClick={() => setIsExpanded(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      {/* Card 1: Runtime Status */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-6">
          <Cpu className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-medium text-white/80">运行状态</h3>
          <span className="ml-auto text-xs text-white/40">Uptime: {formatUptime(status.uptime)}</span>
        </div>
        <div className="flex justify-between items-center px-2">
          <CircularProgress value={status.cpu.usage} label={`CPU ${Math.round(status.cpu.temperature)}°C`} color="text-blue-500" />
          <CircularProgress value={status.memory.percent} label="RAM" color="text-emerald-500" />
          <CircularProgress value={status.gpu.usage} label="GPU" color="text-purple-500" />
        </div>
      </div>

      {/* Card 2: Network */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md overflow-hidden relative">
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <Network className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-medium text-white/80">网络</h3>
        </div>
        <div className="flex gap-4 relative z-10 mb-4">
          <div className="flex-1 bg-black/20 rounded-2xl p-4 border border-white/5">
            <div className="text-xs text-white/50 mb-1">上传速度</div>
            <div className="text-xl font-semibold text-cyan-400">{formatBytes(status.network.upload_speed)}/s</div>
          </div>
          <div className="flex-1 bg-black/20 rounded-2xl p-4 border border-white/5">
            <div className="text-xs text-white/50 mb-1">下载速度</div>
            <div className="text-xl font-semibold text-indigo-400">{formatBytes(status.network.download_speed)}/s</div>
          </div>
        </div>
        
        {/* Tiny Recharts Area Chart for Network */}
        <div className="h-16 w-full -mx-2 -mb-4 opacity-50 relative z-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={netHistory}>
              <Area type="monotone" dataKey="down" stroke="#818cf8" fill="#818cf8" fillOpacity={0.2} strokeWidth={2} isAnimationActive={false} />
              <Area type="monotone" dataKey="up" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} strokeWidth={2} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Card 3: Storage IO */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-6">
          <HardDrive className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-medium text-white/80">存储读写</h3>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-white/50">读取</span>
              <span className="text-amber-400 font-medium">{formatBytes(status.disk.io_read)}/s</span>
            </div>
            <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min((status.disk.io_read / (1024 * 1024)) * 100, 100)}%`, transition: 'width 0.5s' }}></div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-white/50">写入</span>
              <span className="text-rose-400 font-medium">{formatBytes(status.disk.io_write)}/s</span>
            </div>
            <div className="h-1.5 w-full bg-black/30 rounded-full overflow-hidden">
              <div className="h-full bg-rose-400 rounded-full" style={{ width: `${Math.min((status.disk.io_write / (1024 * 1024)) * 100, 100)}%`, transition: 'width 0.5s' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: Storage Space */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-6">
          <Database className="w-5 h-5 text-pink-400" />
          <h3 className="text-sm font-medium text-white/80">存储空间</h3>
        </div>
        <div className="space-y-4">
          
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-white/80 font-medium">/ (Root)</span>
              <span className="text-white/50">{formatBytes(status.disk.used)} / {formatBytes(status.disk.total)}</span>
            </div>
            <div className="h-2.5 w-full bg-black/30 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full" style={{ width: `${status.disk.percent}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-white/80 font-medium">/tmp</span>
              <span className="text-white/50">120 MB / 1 GB</span>
            </div>
            <div className="h-2.5 w-full bg-black/30 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full" style={{ width: `12%` }}></div>
            </div>
          </div>

        </div>
      </div>

      </div>
    </aside>
  );
}

