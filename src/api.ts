// Dynamically point to the host serving the frontend, assuming backend is on port 6666
const HOST = window.location.hostname;
const BASE_URL = `http://${HOST}:6666`;

export async function loginApi(username: string, password: string) {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) return await res.json();
    throw new Error('用户名或密码错误');
  } catch (e: any) {
    // If we are in the AI Studio preview (run.app), the fetch will fail due to Mixed Content / network isolation.
    // Allow a bypass so the user can see the UI (which will then show 'Backend disconnected' in the apps).
    if (HOST.includes('run.app') || HOST === 'localhost') {
      if (username === 'admin' && password === 'admin') {
        console.warn('Backend fetch failed. Using preview mode bypass token.');
        return { token: 'preview_mode_token' };
      }
    }
    // Otherwise throw the real error
    throw new Error(e.message === 'Failed to fetch' ? '无法连接到后端 API (Backend disconnected)' : e.message);
  }
}

export async function getSystemStatusApi(token: string) {
  const res = await fetch(`${BASE_URL}/api/system/status`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (res.ok) return await res.json();
  return null; // Return null to indicate disconnected state
}

export async function getSystemInfoApi(token: string) {
  const res = await fetch(`${BASE_URL}/api/system/info`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (res.ok) return await res.json();
  return null;
}

export async function rebootSystemApi(token: string) {
  const res = await fetch(`${BASE_URL}/api/system/reboot`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (res.ok) return await res.json();
  return { status: 'error', message: 'Failed to connect to backend' };
}

export async function executeCommandApi(token: string, command: string) {
  try {
    const res = await fetch(`${BASE_URL}/api/terminal/execute`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ command })
    });
    if (res.ok) return await res.json();
  } catch (e) {
    // Return a clear error if fetch fails
  }
  return { output: `[Error] Could not execute command. Backend disconnected.`, exit_code: -1 };
}

export async function getDockerContainersApi(token: string) {
  const res = await fetch(`${BASE_URL}/api/docker/containers`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (res.ok) return await res.json();
  return { containers: [], error: 'Backend disconnected' };
}

export async function listDirectoryApi(token: string, path: string) {
  const res = await fetch(`${BASE_URL}/api/fs/list?path=${encodeURIComponent(path)}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (res.ok) return await res.json();
  return { path, items: [], error: 'Backend disconnected' };
}
