import { useState, useEffect } from 'react';
import { Play, Square, RotateCw, Database, Activity, AlertCircle } from 'lucide-react';

interface Container {
  id: string;
  name: string;
  image: string;
  state: 'running' | 'exited';
  ports: string;
  cpu?: string;
  mem?: string;
}

const MOCK_CONTAINERS: Container[] = [
  { id: 'a1b2c3d4', name: 'nginx-proxy', image: 'nginx:latest', state: 'running', ports: '80:80, 443:443', cpu: '0.5%', mem: '45MB' },
  { id: 'e5f6g7h8', name: 'redis-cache', image: 'redis:alpine', state: 'running', ports: '6379:6379', cpu: '1.2%', mem: '120MB' },
  { id: 'i9j0k1l2', name: 'homeassistant', image: 'homeassistant/home-assistant', state: 'running', ports: '8123:8123', cpu: '5.4%', mem: '450MB' },
  { id: 'm3n4o5p6', name: 'jellyfin', image: 'jellyfin/jellyfin', state: 'exited', ports: '8096:8096', cpu: '0%', mem: '0MB' },
];

export default function DockerManager() {
  const [containers, setContainers] = useState<Container[]>(MOCK_CONTAINERS);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const toggleContainer = (id: string) => {
    setLoadingId(id);
    setTimeout(() => {
      setContainers(prev => prev.map(c => {
        if (c.id === id) {
          return { ...c, state: c.state === 'running' ? 'exited' : 'running', cpu: c.state === 'running' ? '0%' : '1.5%', mem: c.state === 'running' ? '0MB' : '85MB' };
        }
        return c;
      }));
      setLoadingId(null);
    }, 800);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900/90 text-slate-200 overflow-hidden backdrop-blur-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-cyan-400" />
          <div>
            <h2 className="text-xl font-semibold text-white">Docker 容器管理</h2>
            <p className="text-sm text-white/50">运行环境: RK3288 Docker Engine v24.0.5</p>
          </div>
        </div>
        <div className="flex gap-4 text-sm text-white/60">
          <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
            <Activity className="w-4 h-4 text-emerald-400" /> 运行中: {containers.filter(c => c.state === 'running').length}
          </div>
          <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
            <AlertCircle className="w-4 h-4 text-rose-400" /> 已停止: {containers.filter(c => c.state === 'exited').length}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {containers.map(container => (
          <div key={container.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors group">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${container.state === 'running' ? 'bg-emerald-400' : 'bg-slate-600'}`}></div>
                {container.state === 'running' && (
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-400 animate-ping opacity-50"></div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white text-lg">{container.name}</h3>
                <div className="text-sm text-white/50 mt-1 flex items-center gap-4">
                  <span className="bg-black/30 px-2 py-0.5 rounded text-xs border border-white/5">{container.image}</span>
                  <span>{container.ports}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {container.state === 'running' && (
                <div className="flex items-center gap-4 text-xs font-mono text-white/60">
                  <div className="flex flex-col"><span className="text-white/40">CPU</span>{container.cpu}</div>
                  <div className="flex flex-col"><span className="text-white/40">RAM</span>{container.mem}</div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleContainer(container.id)}
                  disabled={loadingId === container.id}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 ${container.state === 'running' ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}
                >
                  {loadingId === container.id ? <RotateCw className="w-5 h-5 animate-spin" /> : (container.state === 'running' ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />)}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
