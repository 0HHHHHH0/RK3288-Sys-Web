import { useState, useEffect } from 'react';
import { Folder, FileText, Image as ImageIcon, Video, File, ChevronRight, HardDrive, Home, Download, Loader2, LayoutGrid, List as ListIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { listDirectoryApi } from '../api';

export default function FileExplorer() {
  const [currentPath, setCurrentPath] = useState('/home/admin');
  const [items, setItems] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>(['/home/admin']);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
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
          <div className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-white/10">
            <button 
              onClick={() => setViewMode('grid')} 
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white/80'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* File Grid */}
        <div className="flex-1 p-6 overflow-y-auto relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (items as any).error ? (
            <div className="absolute inset-0 flex items-center justify-center text-rose-500">
              {(items as any).error}
            </div>
          ) : (
            viewMode === 'grid' ? (
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
            ) : (
              <div className="flex flex-col">
                <div className="flex items-center gap-4 px-4 py-2 border-b border-white/10 text-xs font-medium text-white/50 mb-2">
                  <div className="w-8"></div>
                  <div className="flex-1">名称</div>
                  <div className="w-24 text-right">类型</div>
                </div>
                {items.map((item, idx) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.01 }}
                    onDoubleClick={() => !item.includes('.') && navigateTo(currentPath === '/' ? `/${item}` : `${currentPath}/${item}`)}
                    className="flex items-center gap-4 px-4 py-2 rounded-lg hover:bg-white/10 cursor-pointer group"
                  >
                    <div className="w-8 flex items-center justify-center scale-75">
                      {getIcon(item)}
                    </div>
                    <div className="flex-1 text-sm text-white/80 group-hover:text-white truncate">
                      {item}
                    </div>
                    <div className="w-24 text-right text-xs text-white/40">
                      {item.includes('.') ? item.split('.').pop()?.toUpperCase() + ' 文件' : '文件夹'}
                    </div>
                  </motion.div>
                ))}
                {items.length === 0 && (
                  <div className="text-center text-white/40 mt-10 text-sm">
                    文件夹为空
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
