import { useState, useEffect } from 'react';
import { Power, Monitor, Loader2, Play, Clock, Music, MonitorOff } from 'lucide-react';
import { executeCommandApi } from '../api';

export default function ScreenController() {
  const [clockStatus, setClockStatus] = useState<'running' | 'stopped' | 'unknown'>('unknown');
  const [musicStatus, setMusicStatus] = useState<'running' | 'stopped' | 'unknown'>('unknown');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string>('');

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('feiniu_token') || '';
      
      const clockRes = await executeCommandApi(token, 'systemctl is-active weather-clock.service');
      setClockStatus(clockRes.output?.trim() === 'active' ? 'running' : 'stopped');

      const musicRes = await executeCommandApi(token, 'pgrep -f "flutter-pi"');
      setMusicStatus(musicRes.output?.trim() ? 'running' : 'stopped');
    } catch (e) {
      setClockStatus('unknown');
      setMusicStatus('unknown');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkStatus();
    const timer = setInterval(checkStatus, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleAction = async (action: 'start-clock' | 'start-music' | 'stop-all') => {
    setIsLoading(true);
    const token = localStorage.getItem('feiniu_token') || '';
    
    let cmd = '';
    if (action === 'start-clock') {
      cmd = 'pkill -f flutter-pi; systemctl restart weather-clock.service';
    } else if (action === 'start-music') {
      cmd = 'systemctl stop weather-clock.service; nohup flutter-pi /root/flutter_assets/ > /dev/null 2>&1 &';
    } else if (action === 'stop-all') {
      cmd = 'systemctl stop weather-clock.service; pkill -f flutter-pi';
    }

    const res = await executeCommandApi(token, cmd);
    setLogs(`> ${cmd}\n${res.output || (res.exit_code === 0 ? '操作成功执行' : '执行失败 (Exit Code: ' + res.exit_code + ')')}`);
    
    // 等待一秒后再次刷新状态，以确保服务已完全启动或退出
    setTimeout(checkStatus, 1000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900/90 backdrop-blur-3xl p-8 text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-purple-500/20 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
          <div className="p-4 bg-blue-500/20 text-blue-400 rounded-2xl">
            <Monitor className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wide">外屏显示控制器</h1>
            <p className="text-white/50">管理并切换外接屏幕上的互斥应用</p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button 
              onClick={() => handleAction('stop-all')}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-lg border border-rose-500/30 transition-all disabled:opacity-50"
            >
              <MonitorOff className="w-4 h-4" />
              <span className="text-sm font-medium">息屏 / 停止所有应用</span>
            </button>
            <button onClick={checkStatus} disabled={isLoading} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Loader2 className={`w-5 h-5 text-white/50 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Weather Clock Card */}
          <div className={`relative p-6 rounded-2xl border transition-all ${clockStatus === 'running' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-black/30 border-white/10'}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg">天气时钟</h3>
                <p className="text-xs text-white/40 font-mono mt-1">weather-clock.service</p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${clockStatus === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`}></div>
              </div>
            </div>
            
            <button 
              onClick={() => handleAction('start-clock')}
              disabled={clockStatus === 'running' || isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-amber-500/20 hover:border-amber-500/30 transition-all disabled:opacity-50 disabled:pointer-events-none group"
            >
              <Play className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium">{clockStatus === 'running' ? '正在显示' : '在外屏显示'}</span>
            </button>
          </div>

          {/* Music Player Card */}
          <div className={`relative p-6 rounded-2xl border transition-all ${musicStatus === 'running' ? 'bg-purple-500/10 border-purple-500/30' : 'bg-black/30 border-white/10'}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl">
                <Music className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg">Flutter 音乐页面</h3>
                <p className="text-xs text-white/40 font-mono mt-1">/root/flutter_assets/</p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${musicStatus === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`}></div>
              </div>
            </div>
            
            <button 
              onClick={() => handleAction('start-music')}
              disabled={musicStatus === 'running' || isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-purple-500/20 hover:border-purple-500/30 transition-all disabled:opacity-50 disabled:pointer-events-none group"
            >
              <Play className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="font-medium">{musicStatus === 'running' ? '正在显示' : '在外屏显示'}</span>
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-black/40 border border-white/10 rounded-2xl p-4 overflow-hidden">
          <div className="text-white/40 mb-2 font-mono text-sm">// 终端执行日志</div>
          <div className="flex-1 overflow-y-auto font-mono text-sm text-white/70 whitespace-pre-wrap">
            {logs || '等待操作...'}
          </div>
        </div>
      </div>
    </div>
  );
}
