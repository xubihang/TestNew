const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function sendMessage(message, timeout = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
      signal: controller.signal
    });
    clearTimeout(timer);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return { data: data.reply ?? data.message ?? '' };
  } catch (err) {
    return { error: err.message };
  }
}
