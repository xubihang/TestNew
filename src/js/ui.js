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

function createLinkCard(data) {
  const card = document.createElement('div');
  card.className = 'message-card';
  if (data.ext) {
    card.dataset.ext = JSON.stringify(data.ext);
  }

  if (data.thumbnail) {
    const img = document.createElement('img');
    img.className = 'card-image';
    img.src = data.thumbnail;
    img.alt = data.title || '';
    card.appendChild(img);
  }

  const content = document.createElement('div');
  content.className = 'card-content';

  if (data.title) {
    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = data.title;
    content.appendChild(title);
  }
  if (data.description) {
    const desc = document.createElement('div');
    desc.className = 'card-description';
    desc.textContent = data.description;
    content.appendChild(desc);
  }
  const link = document.createElement('a');
  link.className = 'card-link';
  link.href = data.url;
  link.target = '_blank';
  link.textContent = data.linkText || '查看详情 →';
  content.appendChild(link);

  card.appendChild(content);
  return card;
}

function createImageCard(data) {
  const card = document.createElement('div');
  card.className = 'message-card image-card';
  const img = document.createElement('img');
  img.className = 'card-image';
  img.src = data.url;
  img.alt = data.alt || '';
  card.appendChild(img);
  return card;
}

function createAudioCard(data) {
  const card = document.createElement('div');
  card.className = 'audio-message as-received-card';

  const playBtn = document.createElement('button');
  playBtn.className = 'play-btn';
  playBtn.textContent = '▶';
  card.appendChild(playBtn);

  const progress = document.createElement('div');
  progress.className = 'audio-progress';
  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  progress.appendChild(bar);
  card.appendChild(progress);
  const durationEl = document.createElement('div');
  durationEl.className = 'audio-duration';
  card.appendChild(durationEl);

  const audio = document.createElement('audio');
  audio.src = data.url;
  card.appendChild(audio);

  const MIN_WIDTH = 60;
  const MAX_WIDTH = 200;
  const WIDTH_PER_SEC = 20;
  const setVisuals = (sec) => {
    durationEl.textContent = `${Math.round(sec)}s`;
    const w = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, sec * WIDTH_PER_SEC));
    progress.style.width = `${w}px`;
  };

  if (data.duration) {
    setVisuals(Number(data.duration));
  } else {
    audio.addEventListener('loadedmetadata', () => setVisuals(audio.duration));
  }

  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      playBtn.textContent = '⏸';
    } else {
      audio.pause();
      playBtn.textContent = '▶';
    }
  });

  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      const percent = (audio.currentTime / audio.duration) * 100;
      bar.style.width = `${percent}%`;
    }
  });

  audio.addEventListener('ended', () => {
    playBtn.textContent = '▶';
    bar.style.width = '0%';
  });

  return card;
}

export function appendMessage(container, msg) {
  if (!msg) return;
  if (msg.type === 'text') {
    if (msg.role === 'user') {
      appendUserMessage(container, msg.content);
    } else {
      appendBotMessage(container, msg.content);
    }
    return;
  }

  const messageGroup = document.createElement('div');
  messageGroup.className = `message-group ${msg.role === 'user' ? 'sent' : 'received'}`;
  let element;
  if (msg.type === 'link') {
    element = createLinkCard(msg.content);
  } else if (msg.type === 'image') {
    element = createImageCard(msg.content);
  } else if (msg.type === 'audio') {
    element = createAudioCard(msg.content);
  }
  if (element) {
    messageGroup.appendChild(element);
    container.appendChild(messageGroup);
    container.scrollTop = container.scrollHeight;
  }
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
