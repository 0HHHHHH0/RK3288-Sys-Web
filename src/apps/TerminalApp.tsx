import { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';
import { executeCommandApi } from '../api';

export default function TerminalApp() {
  const [history, setHistory] = useState<{ type: 'input' | 'output' | 'error'; text: string }[]>([
    { type: 'output', text: 'FeiNiu OS (RK3288) Terminal v1.0.0' },
    { type: 'output', text: 'Type "help" to see available commands or try real bash commands.' }
  ]);
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    setHistory(prev => [...prev, { type: 'input', text: trimmedCmd }]);

    if (trimmedCmd.toLowerCase() === 'clear') {
      setHistory([]);
      return;
    }

    setIsExecuting(true);
    const token = localStorage.getItem('feiniu_token') || '';
    const res = await executeCommandApi(token, trimmedCmd);
    
    setHistory(prev => [...prev, { type: res.exit_code === 0 ? 'output' : 'error', text: res.output || (res.exit_code === 0 ? '' : 'Command failed without output.') }]);
    setIsExecuting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isExecuting) {
      handleCommand(input);
      setInput('');
    }
  };

  return (
    <div className="w-full h-full bg-slate-950/90 text-emerald-400 font-mono p-4 overflow-y-auto flex flex-col text-sm shadow-inner relative">
      <div className="flex-1 space-y-1">
        {history.map((line, i) => (
          <div key={i} className={`whitespace-pre-wrap ${line.type === 'error' ? 'text-red-400' : line.type === 'input' ? 'text-white' : 'text-emerald-400'}`}>
            {line.type === 'input' ? <span className="text-emerald-500 mr-2">admin@rk3288:~$</span> : null}
            {line.text}
          </div>
        ))}
        <div className="flex items-center text-white mt-2">
          <span className="text-emerald-500 mr-2">admin@rk3288:~$</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPointerDown={(e) => e.stopPropagation()}
            disabled={isExecuting}
            className={`flex-1 bg-transparent outline-none text-white border-none focus:ring-0 p-0 m-0 ${isExecuting ? 'opacity-50 cursor-not-allowed' : ''}`}
            autoFocus
            spellCheck={false}
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
