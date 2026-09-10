import { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';

export default function TerminalApp() {
  const [history, setHistory] = useState<{ type: 'input' | 'output' | 'error'; text: string }[]>([
    { type: 'output', text: 'FeiNiu OS (RK3288) Terminal v1.0.0' },
    { type: 'output', text: 'Type "help" to see available commands.' }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    setHistory(prev => [...prev, { type: 'input', text: trimmedCmd }]);

    let output = '';
    let isError = false;

    const parts = trimmedCmd.split(' ');
    const baseCmd = parts[0].toLowerCase();

    switch (baseCmd) {
      case 'help':
        output = 'Available commands: help, clear, whoami, date, uname, echo, ls';
        break;
      case 'clear':
        setHistory([]);
        return;
      case 'whoami':
        output = 'admin';
        break;
      case 'date':
        output = new Date().toString();
        break;
      case 'uname':
        output = 'Linux rk3288 4.4.194 #1 SMP PREEMPT aarch64 GNU/Linux';
        break;
      case 'echo':
        output = parts.slice(1).join(' ');
        break;
      case 'ls':
        output = 'Desktop  Documents  Downloads  Music  Pictures  Public  Templates  Videos';
        break;
      default:
        output = `Command not found: ${baseCmd}`;
        isError = true;
    }

    setHistory(prev => [...prev, { type: isError ? 'error' : 'output', text: output }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
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
            className="flex-1 bg-transparent outline-none text-white border-none focus:ring-0 p-0 m-0"
            autoFocus
            spellCheck={false}
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
