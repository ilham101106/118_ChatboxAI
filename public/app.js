/**
 * Express AI Chatbox - Client Application Logic
 * Integrasi OpenRouter API model: liquid/lfm-2.5-2.6b:free
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');

  const apiKeyInput = document.getElementById('apiKeyInput');
  const toggleApiKeyVisibility = document.getElementById('toggleApiKeyVisibility');
  const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
  const apiKeyStatusDot = document.getElementById('apiKeyStatusDot');
  const apiKeyPill = document.getElementById('apiKeyPill');
  const apiKeyPillText = document.getElementById('apiKeyPillText');
  const apiKeyBanner = document.getElementById('apiKeyBanner');
  const openSettingsFromBanner = document.getElementById('openSettingsFromBanner');

  const modelSelect = document.getElementById('modelSelect');
  const activeModelLabel = document.getElementById('activeModelLabel');
  const systemPromptInput = document.getElementById('systemPromptInput');
  const resetSystemPromptBtn = document.getElementById('resetSystemPromptBtn');

  const clearChatBtn = document.getElementById('clearChatBtn');
  const quickClearBtn = document.getElementById('quickClearBtn');

  const chatBody = document.getElementById('chatBody');
  const welcomeHero = document.getElementById('welcomeHero');
  const messagesContainer = document.getElementById('messagesContainer');
  const typingIndicator = document.getElementById('typingIndicator');

  const chatForm = document.getElementById('chatForm');
  const userPromptInput = document.getElementById('userPromptInput');
  const sendBtn = document.getElementById('sendBtn');
  const suggestionCards = document.querySelectorAll('.suggestion-card');

  // Application State
  let apiKey = localStorage.getItem('openrouter_api_key') || '';
  let selectedModel = localStorage.getItem('selected_model') || 'liquid/lfm-2.5-2.6b:free';
  let systemPrompt = localStorage.getItem('system_prompt') || systemPromptInput.value;
  let chatHistory = JSON.parse(localStorage.getItem('chat_history') || '[]');

  // Configure Marked.js options
  marked.setOptions({
    gfm: true,
    breaks: true,
    highlight: function(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value;
        } catch (err) {}
      }
      return hljs.highlightAuto(code).value;
    }
  });

  // --- Initial Setup & UI State Sync ---
  function init() {
    // Populate form elements from state
    apiKeyInput.value = apiKey;
    modelSelect.value = selectedModel;
    activeModelLabel.textContent = selectedModel;
    systemPromptInput.value = systemPrompt;

    updateApiKeyUI();
    renderChatHistory();
    setupEventListeners();

    // Jika API Key belum diatur saat pertama kali dibuka, otomatis buka sidebar pengaturan
    if (!apiKey || apiKey.trim() === '') {
      openSidebar();
    }
  }

  // --- Update API Key UI Indicators ---
  function updateApiKeyUI() {
    const hasKey = Boolean(apiKey && apiKey.trim().length > 0);

    if (hasKey) {
      apiKeyStatusDot.classList.add('connected');
      apiKeyPill.classList.add('active');
      apiKeyPillText.textContent = 'API Key Aktif';
      apiKeyBanner.style.display = 'none';
    } else {
      apiKeyStatusDot.classList.remove('connected');
      apiKeyPill.classList.remove('active');
      apiKeyPillText.textContent = 'API Key Belum Diatur';
      apiKeyBanner.style.display = 'flex';
    }
  }

  // --- Sidebar Drawer Controls ---
  function openSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('active');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
  }

  function toggleSidebar() {
    if (sidebar.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  }

  // --- Auto Resize Textarea ---
  function autoResizeTextarea() {
    userPromptInput.style.height = 'auto';
    userPromptInput.style.height = Math.min(userPromptInput.scrollHeight, 150) + 'px';
  }

  // --- Render Chat Messages ---
  function renderChatHistory() {
    messagesContainer.innerHTML = '';

    if (chatHistory.length === 0) {
      welcomeHero.style.display = 'flex';
      messagesContainer.style.display = 'none';
    } else {
      welcomeHero.style.display = 'none';
      messagesContainer.style.display = 'flex';

      chatHistory.forEach(msg => {
        appendMessageUI(msg.role, msg.content, msg.timestamp, false);
      });

      scrollToBottom();
    }
  }

  // --- Append Single Message to UI ---
  function appendMessageUI(role, content, timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), animate = true) {
    welcomeHero.style.display = 'none';
    messagesContainer.style.display = 'flex';

    const messageItem = document.createElement('div');
    messageItem.className = `message-item ${role}`;
    if (!animate) messageItem.style.animation = 'none';

    const avatarHtml = role === 'user' 
      ? `<div class="avatar user-avatar"><i class="fa-solid fa-user"></i></div>`
      : `<div class="avatar ai-avatar"><i class="fa-solid fa-droplet"></i></div>`;

    // Process Markdown for AI messages
    const formattedContent = role === 'assistant' ? processMarkdown(content) : escapeHtml(content);

    messageItem.innerHTML = `
      ${avatarHtml}
      <div class="message-bubble-wrapper">
        <div class="message-bubble">${formattedContent}</div>
        <div class="message-meta">
          <span>${role === 'user' ? 'Anda' : 'Liquid AI'}</span> • <span>${timestamp}</span>
        </div>
      </div>
    `;

    messagesContainer.appendChild(messageItem);
    attachCopyCodeListeners(messageItem);
    scrollToBottom();
  }

  // --- Process Markdown & Format Code Blocks with Copy Buttons ---
  function processMarkdown(rawText) {
    let html = marked.parse(rawText);

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const preElements = tempDiv.querySelectorAll('pre');
    preElements.forEach((pre) => {
      const codeElem = pre.querySelector('code');
      let lang = 'code';

      if (codeElem) {
        const classNames = codeElem.className.split(' ');
        classNames.forEach(cls => {
          if (cls.startsWith('language-')) {
            lang = cls.replace('language-', '');
          }
        });
      }

      const codeHeader = document.createElement('div');
      codeHeader.className = 'code-header';
      codeHeader.innerHTML = `
        <span><i class="fa-solid fa-code"></i> ${lang}</span>
        <button class="copy-btn"><i class="fa-regular fa-copy"></i> Salin</button>
      `;

      pre.insertBefore(codeHeader, pre.firstChild);
    });

    return tempDiv.innerHTML;
  }

  // --- Attach Copy Listener to Code Snippets ---
  function attachCopyCodeListeners(container) {
    const copyBtns = container.querySelectorAll('.copy-btn');
    copyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const pre = btn.closest('pre');
        const code = pre.querySelector('code')?.innerText || '';

        navigator.clipboard.writeText(code).then(() => {
          btn.innerHTML = `<i class="fa-solid fa-check"></i> Tersalin!`;
          setTimeout(() => {
            btn.innerHTML = `<i class="fa-regular fa-copy"></i> Salin`;
          }, 2000);
        }).catch(err => {
          console.error('Gagal menyalin:', err);
        });
      });
    });
  }

  // --- Escape Raw HTML for User Safety ---
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
  }

  // --- Scroll Chat to Bottom ---
  function scrollToBottom() {
    chatBody.scrollTo({
      top: chatBody.scrollHeight,
      behavior: 'smooth'
    });
  }

  // --- Send Message Handler ---
  async function handleSendMessage() {
    const promptText = userPromptInput.value.trim();
    if (!promptText) return;

    // Check API Key
    if (!apiKey || apiKey.trim() === '') {
      openSidebar();
      apiKeyInput.focus();
      alert('Silakan masukkan OpenRouter API Key Anda terlebih dahulu di menu Pengaturan!');
      return;
    }

    // Collapse sidebar saat mulai mengirim pesan agar layar lebih luas
    closeSidebar();

    // Append User Message to State & UI
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = { role: 'user', content: promptText, timestamp: timeNow };
    chatHistory.push(userMessage);
    localStorage.setItem('chat_history', JSON.stringify(chatHistory));

    appendMessageUI('user', promptText, timeNow);

    // Reset Input
    userPromptInput.value = '';
    autoResizeTextarea();

    // Show Typing Indicator
    typingIndicator.classList.add('active');
    sendBtn.disabled = true;
    scrollToBottom();

    try {
      const apiMessagesPayload = chatHistory.map(item => ({
        role: item.role,
        content: item.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: apiMessagesPayload,
          apiKey: apiKey.trim(),
          model: selectedModel,
          systemPrompt: systemPrompt
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Terjadi kesalahan saat menghubungkan ke AI.');
      }

      const aiReply = data.message || 'Tidak ada balasan dari AI.';
      const aiTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Save Assistant Message
      const aiMessageObj = { role: 'assistant', content: aiReply, timestamp: aiTime };
      chatHistory.push(aiMessageObj);
      localStorage.setItem('chat_history', JSON.stringify(chatHistory));

      appendMessageUI('assistant', aiReply, aiTime);

    } catch (error) {
      console.error('Chat Error:', error);
      const errTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const errorMessage = `⚠️ **Error:** ${error.message}`;
      
      appendMessageUI('assistant', errorMessage, errTime);
    } finally {
      typingIndicator.classList.remove('active');
      sendBtn.disabled = false;
      scrollToBottom();
    }
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Sidebar Toggles
    if (toggleSidebarBtn) toggleSidebarBtn.addEventListener('click', toggleSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

    if (openSettingsFromBanner) {
      openSettingsFromBanner.addEventListener('click', () => {
        openSidebar();
        apiKeyInput.focus();
      });
    }

    // Save API Key
    saveApiKeyBtn.addEventListener('click', () => {
      apiKey = apiKeyInput.value.trim();
      localStorage.setItem('openrouter_api_key', apiKey);
      updateApiKeyUI();

      saveApiKeyBtn.innerHTML = `<i class="fa-solid fa-check"></i> Tersimpan!`;
      setTimeout(() => {
        saveApiKeyBtn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Simpan Key`;
        closeSidebar();
      }, 1200);
    });

    // Toggle Eye Password
    toggleApiKeyVisibility.addEventListener('click', () => {
      const type = apiKeyInput.getAttribute('type') === 'password' ? 'text' : 'password';
      apiKeyInput.setAttribute('type', type);
      toggleApiKeyVisibility.innerHTML = type === 'password' 
        ? `<i class="fa-solid fa-eye"></i>` 
        : `<i class="fa-solid fa-eye-slash"></i>`;
    });

    // Change Model
    modelSelect.addEventListener('change', (e) => {
      selectedModel = e.target.value;
      localStorage.setItem('selected_model', selectedModel);
      activeModelLabel.textContent = selectedModel;
    });

    // System Prompt Editor
    systemPromptInput.addEventListener('input', (e) => {
      systemPrompt = e.target.value;
      localStorage.setItem('system_prompt', systemPrompt);
    });

    resetSystemPromptBtn.addEventListener('click', () => {
      const defaultPrompt = 'Kamu adalah Liquid AI, asisten virtual yang cerdas, ramah, dan sangat membantu dalam bahasa Indonesia.';
      systemPrompt = defaultPrompt;
      systemPromptInput.value = defaultPrompt;
      localStorage.setItem('system_prompt', defaultPrompt);
    });

    // Clear Chat History
    const clearChatHandler = () => {
      if (confirm('Apakah Anda yakin ingin menghapus seluruh riwayat chat?')) {
        chatHistory = [];
        localStorage.removeItem('chat_history');
        renderChatHistory();
        closeSidebar();
      }
    };

    clearChatBtn.addEventListener('click', clearChatHandler);
    quickClearBtn.addEventListener('click', clearChatHandler);

    // Auto resize input & keyboard shortcuts
    userPromptInput.addEventListener('input', autoResizeTextarea);
    userPromptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });

    // Form submit
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSendMessage();
    });

    // Quick Suggestions
    suggestionCards.forEach(card => {
      card.addEventListener('click', () => {
        const prompt = card.getAttribute('data-prompt');
        if (prompt) {
          userPromptInput.value = prompt;
          autoResizeTextarea();
          userPromptInput.focus();
        }
      });
    });
  }

  // Start App
  init();
});
