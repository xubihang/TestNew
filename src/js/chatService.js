const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

let authToken = '';

function createTimeout(timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  return {
    signal: controller.signal,
    finalize: () => clearTimeout(timer)
  };
}

async function request(path, { method = 'GET', body, timeout = 10000 } = {}) {
  const { signal, finalize } = createTimeout(timeout);
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal
    });
    finalize();
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || res.statusText);
    }
    return { data };
  } catch (err) {
    return { error: err.message };
  }
}

export async function register(username, password, timeout) {
  const result = await request('/register', { method: 'POST', body: { username, password }, timeout });
  if (result.data && result.data.token) {
    authToken = result.data.token;
  }
  return result;
}

export async function login(username, password, timeout) {
  const result = await request('/login', { method: 'POST', body: { username, password }, timeout });
  if (result.data && result.data.token) {
    authToken = result.data.token;
  }
  return result;
}

export async function fetchMessages(page = 1, limit = 20, timeout) {
  const query = `?page=${page}&limit=${limit}`;
  const result = await request(`/messages${query}`, { method: 'GET', timeout });
  return result;
}

export async function sendMessage(message, timeout = 10000) {
  const body = typeof message === 'string' ? { type: 'text', content: message } : message;
  const result = await request('/messages', { method: 'POST', body, timeout });
  if (result.data && result.data.message) {
    return { data: result.data.message };
  }
  return result;
}
