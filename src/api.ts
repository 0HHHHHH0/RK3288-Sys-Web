// Mock implementation for preview purposes.
// In a real environment, this would call http://localhost:6666/api/...

const MOCK_DELAY = 500;

export async function loginApi(username: string, password: string) {
  // Simulate network
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  
  if (username === 'admin' && password === 'admin') {
    return { token: 'mock_jwt_token_12345' };
  }
  throw new Error('Invalid credentials');
}

// State variables for smooth mock transitions
let mockUptime = performance.now() / 1000 + 120000;
let mockCpu = 15;
let mockMem = 40;
let mockGpu = 10;
let mockNetUp = 50 * 1024;
let mockNetDown = 200 * 1024;
let mockRead = 10 * 1024;
let mockWrite = 5 * 1024;

export async function getSystemStatusApi(token: string) {
  // Try actual API first (if user runs the FastAPI backend locally)
  try {
    const res = await fetch('http://localhost:6666/api/system/status', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback to mock data for preview
  }

  // Realistic looking mock data for RK3288 with smoothing
  mockUptime += 1;
  mockCpu = Math.max(5, Math.min(95, mockCpu + (Math.random() * 10 - 5)));
  mockMem = Math.max(20, Math.min(80, mockMem + (Math.random() * 2 - 1)));
  mockGpu = Math.max(0, Math.min(50, mockGpu + (Math.random() * 8 - 4)));
  
  mockNetUp = Math.max(0, mockNetUp + (Math.random() * 100 * 1024 - 50 * 1024));
  mockNetDown = Math.max(0, mockNetDown + (Math.random() * 500 * 1024 - 200 * 1024));
  
  mockRead = Math.max(0, mockRead + (Math.random() * 100 * 1024 - 40 * 1024));
  mockWrite = Math.max(0, mockWrite + (Math.random() * 50 * 1024 - 20 * 1024));

  return {
    cpu: {
      usage: mockCpu,
      temperature: 42 + Math.random() * 2
    },
    memory: {
      total: 2 * 1024 * 1024 * 1024,
      used: (mockMem / 100) * (2 * 1024 * 1024 * 1024),
      percent: mockMem
    },
    gpu: {
      usage: mockGpu
    },
    disk: {
      total: 32 * 1024 * 1024 * 1024,
      used: 12 * 1024 * 1024 * 1024,
      percent: 37.5,
      io_read: mockRead,
      io_write: mockWrite
    },
    network: {
      bytes_sent: 1024 * 1024 * 10,
      bytes_recv: 1024 * 1024 * 50,
      upload_speed: mockNetUp,
      download_speed: mockNetDown
    },
    uptime: mockUptime
  };
}

export async function rebootSystemApi(token: string) {
  try {
    const res = await fetch('http://localhost:6666/api/system/reboot', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback
  }
  return { status: 'success', message: 'Rebooting mock...' };
}

export async function listDirectoryApi(token: string, path: string) {
  try {
    const res = await fetch(`http://localhost:6666/api/fs/list?path=${encodeURIComponent(path)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback mock
  }

  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network latency

  const MOCK_FS: Record<string, string[]> = {
    '/': ['home', 'etc', 'var', 'tmp', 'usr', 'opt', 'root'],
    '/home': ['admin', 'guest'],
    '/home/admin': ['Documents', 'Downloads', 'Pictures', 'Videos', 'notes.txt', 'config.json'],
    '/home/admin/Documents': ['project_plan.pdf', 'budget_2024.xlsx', 'readme.md'],
    '/home/admin/Downloads': ['ubuntu-24.04-desktop-amd64.iso', 'feiniu_os_update.tar.gz'],
    '/home/admin/Pictures': ['wallpaper1.jpg', 'wallpaper2.png', 'screenshot.png'],
  };

  return {
    path,
    items: MOCK_FS[path] || []
  };
}
