import { autoResizeTextarea, toggleSendButton, appendUserMessage, appendBotMessage, showLoading, hideLoading, updateSendButtonPosition } from './ui.js';
import { sendMessage } from './chatService.js';

const messageInput = document.querySelector('.message-input');
const sendBtn = document.querySelector('.send-btn');
const inputContainer = document.querySelector('.input-container');
const messagesContainer = document.querySelector('.messages-container');

const state = {
  messages: [],
  loading: false
};

function resetInput() {
  messageInput.value = '';
  messageInput.style.height = 'auto';
  autoResizeTextarea(messageInput, sendBtn);
  toggleSendButton(messageInput, sendBtn, inputContainer);
}

async function handleSend() {
  const text = messageInput.value.trim();
  if (!text) return;

  state.messages.push({ role: 'user', content: text });
  appendUserMessage(messagesContainer, text);
  resetInput();

  state.loading = true;
  showLoading(messagesContainer);

  const result = await sendMessage(text);
  hideLoading(messagesContainer);
  state.loading = false;

  if (result.error) {
    appendBotMessage(messagesContainer, `错误：${result.error}`);
  } else {
    state.messages.push({ role: 'bot', content: result.data });
    appendBotMessage(messagesContainer, result.data);
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

window.addEventListener('resize', () => {
  updateSendButtonPosition(messageInput, sendBtn);
});

autoResizeTextarea(messageInput, sendBtn);
toggleSendButton(messageInput, sendBtn, inputContainer);
updateSendButtonPosition(messageInput, sendBtn);
