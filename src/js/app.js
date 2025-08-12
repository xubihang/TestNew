import { autoResizeTextarea, toggleSendButton, appendBotMessage, showLoading, hideLoading, updateSendButtonPosition, appendMessage } from './ui.js';
import { register, login, fetchMessages, sendMessage } from './chatService.js';

const messageInput = document.querySelector('.message-input');
const sendBtn = document.querySelector('.send-btn');
const inputContainer = document.querySelector('.input-container');
const messagesContainer = document.querySelector('.messages-container');
const loadMoreBtn = document.querySelector('.load-more');
loadMoreBtn.style.display = 'none';

const state = {
  messages: [],
  loading: false,
  page: 1,
  total: 0
};

async function init() {
  let result = await register('demo', 'password');
  if (result.error) {
    if (result.error === 'User exists') {
      result = await login('demo', 'password');
    }
  }
  if (result.error) {
    appendBotMessage(messagesContainer, `登录失败：${result.error}`);
    return;
  }
  await loadMessages(state.page);
}

async function loadMessages(page) {
  const result = await fetchMessages(page);
  if (result.error) {
    appendBotMessage(messagesContainer, `加载失败：${result.error}`);
    return;
  }
  const list = result.data.data || [];
  state.total = result.data.total || 0;
  list.forEach(msg => {
    state.messages.push(msg);
    appendMessage(messagesContainer, msg);
  });
  if (state.messages.length >= state.total) {
    loadMoreBtn.style.display = 'none';
  } else {
    loadMoreBtn.style.display = 'block';
  }
}
function resetInput() {
  messageInput.value = '';
  messageInput.style.height = 'auto';
  autoResizeTextarea(messageInput, sendBtn);
  toggleSendButton(messageInput, sendBtn, inputContainer);
}

async function handleSend() {
  const text = messageInput.value.trim();
  if (!text) return;

  const userMsg = { role: 'user', type: 'text', content: text };
  state.messages.push(userMsg);
  appendMessage(messagesContainer, userMsg);
  resetInput();

  state.loading = true;
  showLoading(messagesContainer);

  const result = await sendMessage(text);
  hideLoading(messagesContainer);
  state.loading = false;

  if (result.error) {
    appendBotMessage(messagesContainer, `错误：${result.error}`);
  } else {
    state.messages.push(result.data);
    appendMessage(messagesContainer, result.data);
  }
}

messageInput.addEventListener('input', () => {
  autoResizeTextarea(messageInput, sendBtn);
  toggleSendButton(messageInput, sendBtn, inputContainer);
});

messageInput.addEventListener('focus', () => {
  toggleSendButton(messageInput, sendBtn, inputContainer);
});

messageInput.addEventListener('blur', () => {
  toggleSendButton(messageInput, sendBtn, inputContainer);
});

sendBtn.addEventListener('click', handleSend);

messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});

loadMoreBtn.addEventListener('click', () => {
  state.page += 1;
  loadMessages(state.page);
});

window.addEventListener('resize', () => {
  updateSendButtonPosition(messageInput, sendBtn);
});

autoResizeTextarea(messageInput, sendBtn);
toggleSendButton(messageInput, sendBtn, inputContainer);
updateSendButtonPosition(messageInput, sendBtn);
init();
