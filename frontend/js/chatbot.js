document.addEventListener('DOMContentLoaded', () => {
  const chatFab = document.getElementById('chat-fab');
  const chatWidget = document.getElementById('chatbot-widget');
  const closeChat = document.getElementById('close-chat');
  const chatInput = document.getElementById('chat-input');
  const sendChat = document.getElementById('send-chat');
  const chatMessages = document.getElementById('chat-messages');

  // Toggle chatbot visibility
  chatFab.addEventListener('click', () => {
    chatWidget.classList.toggle('hidden');
    if (!chatWidget.classList.contains('hidden')) {
      chatInput.focus();
    }
  });

  closeChat.addEventListener('click', () => {
    chatWidget.classList.add('hidden');
  });

  // Handle sending messages
  const sendMessage = async () => {
    const text = chatInput.value.trim();
    if (!text) return;

    // Add user message to UI
    appendMessage(text, 'user-message');
    chatInput.value = '';

    // Show typing indicator
    const typingIndicator = appendMessage('...', 'ai-message');

    try {
      // We pass a mock risk_score based on the UI state if possible
      // Assuming window.currentRiskScore is set somewhere, otherwise default to 5
      const currentRisk = window.currentRiskScore || 5;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: text,
          risk_score: currentRisk
        }),
      });

      const data = await response.json();
      
      // Remove typing indicator
      typingIndicator.remove();
      
      if (data.status === 'success') {
        appendMessage(data.response, 'ai-message');
      } else {
        appendMessage('Sorry, I am having trouble connecting to the server.', 'ai-message');
      }
    } catch (error) {
      console.error('Chat error:', error);
      typingIndicator.remove();
      appendMessage('Connection error. Please try again later.', 'ai-message');
    }
  };

  sendChat.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  function appendMessage(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${className}`;
    msgDiv.textContent = text;
    chatMessages.appendChild(msgDiv);
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msgDiv;
  }
});
