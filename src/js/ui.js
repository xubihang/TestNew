export function updateSendButtonPosition(input, sendBtn) {
  const containerPadding = 15; // input-container padding
  sendBtn.style.bottom = `${containerPadding}px`;
}

export function autoResizeTextarea(el, sendBtn) {
  const style = window.getComputedStyle(el);
  const lineHeight = parseFloat(style.lineHeight) || 20;
  const paddingTop = parseFloat(style.paddingTop) || 0;
  const paddingBottom = parseFloat(style.paddingBottom) || 0;
  const minHeight = lineHeight + paddingTop + paddingBottom; // 单行的最小高度
  const maxHeight = lineHeight * 4 + paddingTop + paddingBottom;

  const currentHeight = el.offsetHeight;

  const clone = el.cloneNode(true);
  clone.style.position = 'absolute';
  clone.style.visibility = 'hidden';
  clone.style.height = 'auto';
  clone.style.maxHeight = 'none';
  clone.style.minHeight = 'auto';
  clone.style.transition = 'none';
  clone.style.width = el.offsetWidth + 'px';
  clone.value = el.value;
  el.parentNode.appendChild(clone);

  let contentHeight = clone.scrollHeight;
  el.parentNode.removeChild(clone);

  contentHeight = Math.max(contentHeight, minHeight);
  const target = Math.min(contentHeight, maxHeight);

  if (Math.abs(currentHeight - target) > 1) {
    el.style.height = `${target}px`;
  }

  el.style.overflowY = contentHeight > maxHeight ? 'auto' : 'hidden';

  updateSendButtonPosition(el, sendBtn);
}

export function toggleSendButton(input, sendBtn, container) {
  const hasContent = input.value.trim().length > 0;
  if (hasContent) {
    sendBtn.classList.add('visible');
    container.classList.add('has-send-btn');
  } else {
    sendBtn.classList.remove('visible');
    container.classList.remove('has-send-btn');
  }
}

export function appendUserMessage(container, text) {
  const messageGroup = document.createElement('div');
  messageGroup.className = 'message-group sent';

  const message = document.createElement('div');
  message.className = 'message sent';
  message.innerHTML = `${text}<div class="message-time">刚刚</div>`;

  messageGroup.appendChild(message);
  container.appendChild(messageGroup);
  container.scrollTop = container.scrollHeight;
}

export function appendBotMessage(container, text) {
  const messageGroup = document.createElement('div');
  messageGroup.className = 'message-group received';

  const message = document.createElement('div');
  message.className = 'message received';
  message.innerHTML = `${text}<div class="message-time">刚刚</div>`;

  messageGroup.appendChild(message);
  container.appendChild(messageGroup);
  container.scrollTop = container.scrollHeight;
}

let loadingGroup = null;
export function showLoading(container) {
  if (loadingGroup) return;
  loadingGroup = document.createElement('div');
  loadingGroup.className = 'message-group received';
  const message = document.createElement('div');
  message.className = 'message received';
  message.textContent = 'AI 正在输入...';
  loadingGroup.appendChild(message);
  container.appendChild(loadingGroup);
  container.scrollTop = container.scrollHeight;
}

export function hideLoading(container) {
  if (loadingGroup && container.contains(loadingGroup)) {
    container.removeChild(loadingGroup);
  }
  loadingGroup = null;
}
