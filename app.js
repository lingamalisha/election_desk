/**
 * app.js — India Election Guide · Main Application Logic
 *
 * Handles:
 *  - Chat UI (messages, typing indicator, auto-grow textarea)
 *  - Anthropic API calls with full conversation history
 *  - Markdown rendering
 *  - Quick-topic chip shortcuts
 *  - Accessibility (aria-live, focus management)
 */

// ── State ────────────────────────────────────────────────────
const conversationHistory = [];
let isLoading = false;

// ── DOM refs ─────────────────────────────────────────────────
const chatArea  = document.getElementById("chatArea");
const userInput = document.getElementById("userInput");
const sendBtn   = document.getElementById("sendBtn");

// ── API ──────────────────────────────────────────────────────
/**
 * Sends the full conversation to the Anthropic API and returns the reply.
 * @param {string} userMessage
 * @returns {Promise<string>}
 */
async function callClaude(userMessage) {
  conversationHistory.push({ role: "user", content: userMessage });

  const endpoint = "https://api.anthropic.com/v1/messages";
  const headers  = {
    "Content-Type": "application/json",
    "anthropic-dangerous-allow-cors": "true",
  };

  // Only add auth header if key is provided (dev mode)
  if (typeof ANTHROPIC_API_KEY !== "undefined" && ANTHROPIC_API_KEY) {
    headers["x-api-key"] = ANTHROPIC_API_KEY;
    headers["anthropic-version"] = "2023-06-01";
  }

  const body = {
    model: typeof MODEL !== "undefined" ? MODEL : "claude-sonnet-4-20250514",
    max_tokens: typeof MAX_TOKENS !== "undefined" ? MAX_TOKENS : 1000,
    system: typeof SYSTEM_PROMPT !== "undefined" ? SYSTEM_PROMPT : "",
    messages: conversationHistory,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("API error:", response.status, err);
    throw new Error(`API error ${response.status}`);
  }

  const data  = await response.json();
  const reply = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  conversationHistory.push({ role: "assistant", content: reply });
  return reply;
}

// ── Markdown renderer ────────────────────────────────────────
/**
 * Converts a small subset of markdown to HTML.
 * Handles: bold, italic, inline code, links, unordered lists, line breaks.
 */
function renderMarkdown(text) {
  let html = escapeHtml(text);

  // Bold & italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g,     "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g,          "<em>$1</em>");

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Links [text](url)
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Bare URLs (not already in an anchor)
  html = html.replace(
    /(?<!href=["'])(https?:\/\/[^\s<>"']+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Unordered list lines (- item)
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>[\s\S]+?<\/li>)(?=\n|$)/g, "<ul>$1</ul>");
  // Merge consecutive <li> inside single <ul>
  html = html.replace(/<\/ul>\n?<ul>/g, "");

  // Paragraphs / line breaks
  html = html.replace(/\n{2,}/g, "<br><br>");
  html = html.replace(/\n/g,     "<br>");

  return html;
}

/** Escapes HTML special chars to prevent XSS from user input. */
function escapeHtml(str) {
  return str
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#39;");
}

// ── UI helpers ───────────────────────────────────────────────
/**
 * Appends a chat bubble to the chat area.
 * @param {"bot"|"user"} role
 * @param {string} text — raw text (user) or markdown (bot)
 */
function addMessage(role, text) {
  const msgEl = document.createElement("div");
  msgEl.className = `message ${role}`;
  msgEl.setAttribute("role", "article");
  msgEl.setAttribute("aria-label", `${role === "bot" ? "Assistant" : "You"}: ${text.slice(0, 80)}`);

  const avatarHtml =
    role === "bot"
      ? `<div class="avatar bot" aria-hidden="true">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <circle cx="12" cy="12" r="10"/>
             <line x1="2" y1="12" x2="22" y2="12"/>
             <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
           </svg>
         </div>`
      : `<div class="avatar user" aria-hidden="true">You</div>`;

  const bubbleContent =
    role === "bot" ? renderMarkdown(text) : escapeHtml(text);

  msgEl.innerHTML = `${avatarHtml}<div class="bubble ${role}">${bubbleContent}</div>`;
  chatArea.appendChild(msgEl);
  scrollToBottom();
}

/** Shows the animated typing indicator. */
function showTyping() {
  const el = document.createElement("div");
  el.className = "message";
  el.id = "typingIndicator";
  el.setAttribute("aria-label", "Assistant is typing");
  el.setAttribute("aria-live", "polite");
  el.innerHTML = `
    <div class="avatar bot" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff"
           stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    </div>
    <div class="bubble bot">
      <div class="typing-indicator" role="status">
        <span></span><span></span><span></span>
      </div>
    </div>`;
  chatArea.appendChild(el);
  scrollToBottom();
}

/** Removes the typing indicator. */
function removeTyping() {
  const el = document.getElementById("typingIndicator");
  if (el) el.remove();
}

function scrollToBottom() {
  chatArea.scrollTop = chatArea.scrollHeight;
}

/** Auto-expands textarea up to max-height. */
function autoGrow(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 120) + "px";
}

// ── Send logic ───────────────────────────────────────────────
async function handleSend() {
  if (isLoading) return;
  const text = userInput.value.trim();
  if (!text) return;

  isLoading = true;
  userInput.value = "";
  userInput.style.height = "auto";
  sendBtn.disabled = true;

  addMessage("user", text);
  showTyping();

  try {
    const reply = await callClaude(text);
    removeTyping();
    addMessage("bot", reply);
  } catch (error) {
    console.error("Claude API error:", error);
    removeTyping();
    addMessage(
      "bot",
      "I'm having trouble connecting right now. Please try again, or reach out directly:\n\n- **Voter Helpline:** 1950 (toll-free)\n- **Website:** [voters.eci.gov.in](https://voters.eci.gov.in)"
    );
  } finally {
    isLoading = false;
    sendBtn.disabled = false;
    userInput.focus();
  }
}

/** Handles Enter key (send) vs Shift+Enter (newline). */
function handleKey(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    handleSend();
  }
}

/** Prefills input from a quick-topic chip and sends. */
function sendChip(chipEl) {
  userInput.value = chipEl.textContent.trim();
  handleSend();
}
