import { useState, useEffect } from 'react';
import { Monitor, Wifi, Cpu, HardDrive, Shield, Info, Palette } from 'lucide-react';
import { getSystemStatusApi } from '../api';

const MENU_ITEMS = [
  { id: 'system', icon: <Cpu className="w-5 h-5" />, label: '系统信息' },
  { id: 'network', icon: <Wifi className="w-5 h-5" />, label: '网络设置' },
  { id: 'display', icon: <Monitor className="w-5 h-5" />, label: '显示与外观' },
  { id: 'storage', icon: <HardDrive className="w-5 h-5" />, label: '存储管理' },
  { id: 'security', icon: <Shield className="w-5 h-5" />, label: '安全与隐私' },
  { id: 'about', icon: <Info className="w-5 h-5" />, label: '关于本机' },
];

export default function SettingsApp() {
  const [activeTab, setActiveTab] = useState('system');
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const token = localStorage.getItem('feiniu_token') || '';
      const data = await getSystemStatusApi(token);
      setStatus(data);
    };
    fetchStatus();
    
    // Only fetch occasionally for settings since it's mostly static info
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex bg-slate-900/90 text-slate-200 overflow-hidden backdrop-blur-3xl">
      {/* Sidebar */}
      <div className="w-56 border-r border-white/10 bg-black/20 p-4 flex flex-col gap-1">
        <div className="text-xl font-bold text-white mb-6 px-2">系统设置</div>
        {MENU_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              activeTab === item.id 
                ? 'bg-blue-500/20 text-blue-400 font-medium' 
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'system' && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-semibold text-white mb-6">系统信息</h2>
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Monitor className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">FeiNiu OS</div>
                    <div className="text-sm text-white/50">Version 1.0.0 (Build 202609)</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                  <div className="space-y-1">
                    <div className="text-white/40">处理器</div>
                    <div className="text-white/90">Rockchip RK3288 Quad-Core Cortex-A17</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-white/40">图形处理器</div>
                    <div className="text-white/90">ARM Mali-T760 MP4</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-white/40">已安装内存 (RAM)</div>
                    <div className="text-white/90">{status ? (status.memory.total / (1024 ** 3)).toFixed(2) : '2.00'} GB LPDDR3</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-white/40">系统架构</div>
                    <div className="text-white/90">aarch64 GNU/Linux</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'display' && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-semibold text-white mb-6">显示与外观</h2>
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">深色模式</div>
                  <div className="text-sm text-white/50 mt-1">自动根据时间调整系统外观</div>
                </div>
                <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="text-white font-medium mb-4">强调色</div>
                <div className="flex gap-4">
                  {['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-emerald-500', 'bg-amber-500'].map(color => (
                    <button key={color} className={`w-8 h-8 rounded-full ${color} ${color === 'bg-blue-500' ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}`}></button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'network' && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-semibold text-white mb-6">网络设置</h2>
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <Wifi className="w-6 h-6 text-emerald-400" />
                     <div>
                       <div className="text-white font-medium">eth0 (以太网)</div>
                       <div className="text-sm text-emerald-400">已连接</div>
                     </div>
                   </div>
                   <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm border-t border-white/10 pt-4">
                  <div>
                    <div className="text-white/40 mb-1">IP 地址</div>
                    <div className="text-white/90">{status?.network?.ip_address || '192.168.1.100'}</div>
                  </div>
                  <div>
                    <div className="text-white/40 mb-1">MAC 地址</div>
                    <div className="text-white/90 font-mono">{status?.network?.mac_address || '00:1A:2B:3C:4D:5E'}</div>
                  </div>
                  <div>
                    <div className="text-white/40 mb-1">实时下载速率</div>
                    <div className="text-white/90">{status ? (status.network.download_speed / 1024).toFixed(1) : 0} KB/s</div>
                  </div>
                  <div>
                    <div className="text-white/40 mb-1">实时上传速率</div>
                    <div className="text-white/90">{status ? (status.network.upload_speed / 1024).toFixed(1) : 0} KB/s</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-semibold text-white mb-6">存储管理</h2>
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                 <div className="flex items-center gap-3 mb-6">
                   <HardDrive className="w-6 h-6 text-blue-400" />
                   <div>
                     <div className="text-lg font-medium text-white">内部存储 (/)</div>
                     <div className="text-sm text-white/50">挂载点: /</div>
                   </div>
                 </div>
                 <div className="space-y-3">
                   <div className="flex justify-between text-sm">
                     <span className="text-white/70">已用 {status ? (status.disk.used / (1024 ** 3)).toFixed(1) : 12.5} GB</span>
                     <span className="text-white/40">共 {status ? (status.disk.total / (1024 ** 3)).toFixed(1) : 32.0} GB</span>
                   </div>
                   <div className="h-4 w-full bg-black/30 rounded-full overflow-hidden flex border border-white/5">
                     <div className="h-full bg-blue-500" style={{ width: `${status?.disk?.percent || 25}%` }} title="系统使用"></div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4 mt-6 text-sm border-t border-white/10 pt-4">
                     <div>
                       <div className="text-white/40 mb-1">实时读取速率 (IO)</div>
                       <div className="text-white/90">{status ? (status.disk.io_read / 1024).toFixed(1) : 0} KB/s</div>
                     </div>
                     <div>
                       <div className="text-white/40 mb-1">实时写入速率 (IO)</div>
                       <div className="text-white/90">{status ? (status.disk.io_write / 1024).toFixed(1) : 0} KB/s</div>
                     </div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-semibold text-white mb-6">安全中心</h2>
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                 <h3 className="text-lg font-medium text-white mb-4">系统防火墙 (UFW)</h3>
                 <div className="flex items-center justify-between">
                   <div className="text-sm text-white/60">当前防火墙状态: <span className="text-emerald-400">已开启</span></div>
                   <div className="w-12 h-6 bg-blue-500 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                   </div>
                 </div>
                 <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/40">
                   允许 22 (SSH), 80 (HTTP), 443 (HTTPS), 6666 (API) 端口的入站连接。
                 </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                 <h3 className="text-lg font-medium text-white mb-4">修改管理员密码</h3>
                 <div className="space-y-3">
                   <input type="password" placeholder="当前密码" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors" />
                   <input type="password" placeholder="新密码" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500 transition-colors" />
                   <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded-xl transition-colors mt-2">
                     确认修改
                   </button>
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-semibold text-white mb-6">关于系统</h2>
            <div className="flex flex-col items-center justify-center p-12 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 pointer-events-none"></div>
              
              <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-6 relative z-10">
                <span className="text-4xl font-bold text-white tracking-tighter">FN</span>
              </div>
              
              <h1 className="text-3xl font-bold text-white tracking-wide z-10">FeiNiu OS</h1>
              <p className="text-white/60 mt-2 z-10">专业级嵌入式微型 NAS 系统</p>
              
              <div className="mt-10 grid grid-cols-2 gap-x-12 gap-y-4 text-sm w-full max-w-sm z-10">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-white/40">系统版本</span>
                  <span className="text-white">v2.4.0 (Stable)</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-white/40">内核版本</span>
                  <span className="text-white">Linux 4.4.194-rk3288</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-white/40">构建时间</span>
                  <span className="text-white">2026-09-01</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-white/40">设备型号</span>
                  <span className="text-white">Rockchip RK3288</span>
                </div>
              </div>

              <button className="mt-10 bg-white text-slate-900 px-6 py-2.5 rounded-full font-semibold shadow-xl hover:scale-105 active:scale-95 transition-transform z-10">
                检查系统更新
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
