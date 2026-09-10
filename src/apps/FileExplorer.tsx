import { useState, useEffect } from 'react';
import { Folder, FileText, Image as ImageIcon, Video, File, ChevronRight, HardDrive, Home, Download, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { listDirectoryApi } from '../api';

export default function FileExplorer() {
  const [currentPath, setCurrentPath] = useState('/home/admin');
  const [items, setItems] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>(['/home/admin']);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchDir = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('feiniu_token') || '';
      const data = await listDirectoryApi(token, currentPath);
      setItems(data.items);
      setIsLoading(false);
    };
    fetchDir();
  }, [currentPath]);

  const navigateTo = (path: string) => {
    setCurrentPath(path);
    setHistory(prev => [...prev, path]);
  };

  const navigateUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    navigateTo('/' + parts.join('/'));
  };

  const getIcon = (name: string) => {
    if (!name.includes('.')) return <Folder className="w-12 h-12 text-blue-400 fill-blue-400/20" />;
    if (name.endsWith('.jpg') || name.endsWith('.png')) return <ImageIcon className="w-12 h-12 text-emerald-400" />;
    if (name.endsWith('.pdf') || name.endsWith('.md') || name.endsWith('.txt')) return <FileText className="w-12 h-12 text-slate-400" />;
    if (name.endsWith('.mp4') || name.endsWith('.mkv')) return <Video className="w-12 h-12 text-purple-400" />;
    return <File className="w-12 h-12 text-slate-400" />;
  };

  return (
    <div className="w-full h-full flex bg-slate-900/80 text-slate-200 overflow-hidden backdrop-blur-3xl">
      {/* Sidebar */}
      <div className="w-48 border-r border-white/10 bg-black/20 p-4 flex flex-col gap-2">
        <div className="text-xs font-semibold text-white/40 mb-2 uppercase tracking-wider">快捷访问</div>
        <button onClick={() => navigateTo('/home/admin')} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${currentPath.startsWith('/home/admin') ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/5'}`}>
          <Home className="w-4 h-4" /> 主目录
        </button>
        <button onClick={() => navigateTo('/home/admin/Downloads')} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${currentPath === '/home/admin/Downloads' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/5'}`}>
          <Download className="w-4 h-4" /> 下载
        </button>
        <div className="text-xs font-semibold text-white/40 mt-4 mb-2 uppercase tracking-wider">设备</div>
        <button onClick={() => navigateTo('/')} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${currentPath === '/' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/5'}`}>
          <HardDrive className="w-4 h-4" /> 系统根目录 (/)
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-14 border-b border-white/10 bg-white/5 flex items-center px-4 gap-4">
          <button onClick={navigateUp} disabled={currentPath === '/'} className="p-1.5 rounded-md hover:bg-white/10 disabled:opacity-50">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/70 flex items-center">
            {currentPath}
          </div>
        </div>

        {/* File Grid */}
        <div className="flex-1 p-6 overflow-y-auto relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {items.map((item, idx) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  onDoubleClick={() => !item.includes('.') && navigateTo(currentPath === '/' ? `/${item}` : `${currentPath}/${item}`)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/10 cursor-pointer group"
                >
                  <div className="group-active:scale-95 transition-transform">
                    {getIcon(item)}
                  </div>
                  <span className="text-xs text-center w-full truncate text-white/80 group-hover:text-white">
                    {item}
                  </span>
                </motion.div>
              ))}
              {items.length === 0 && (
                <div className="col-span-full text-center text-white/40 mt-10">
                  文件夹为空
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
