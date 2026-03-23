const input = document.querySelector("#user-text");
const chat = document.querySelector(".chat-history");
const submit = document.querySelector("#message-form");

let chatHistory = [];

// Helper function to force scroll to the bottom
function scrollToBottom(smooth = true) {
  chat.scrollTo({
    top: chat.scrollHeight,
    behavior: smooth ? "smooth" : "auto"
  });
}

function renderCopyButton(parent, text) {
  if (parent.querySelector('.copy-btn')) return;
  const btn = document.createElement("button");
  btn.className = "copy-btn";
  btn.innerText = "Copy";
  btn.onclick = (e) => {
    e.preventDefault(); // Prevents any form weirdness
    navigator.clipboard.writeText(text);
    btn.innerText = "Copied!";
    setTimeout(() => btn.innerText = "Copy", 2000);
  };
  parent.appendChild(btn);
}

function AppendMessage(role, text, isNew = true) {
  const msgDiv = document.createElement("div");
  const isAI = (role === "model" || role === "assistant");
  msgDiv.classList.add("msg", isAI ? "incoming" : "outgoing");

  if (!isNew) {
    msgDiv.style.animation = "none";
    msgDiv.style.opacity = "1";
  }

  const textSpan = document.createElement("span");
  textSpan.textContent = text;
  msgDiv.appendChild(textSpan);

  if (isAI && text !== "...") {
    renderCopyButton(msgDiv, text);
  }

  chat.appendChild(msgDiv);

  if (isNew) {
    // We scroll the NEW bubble into view. 
    // block: "start" ensures the top of the message is what you see.
    setTimeout(() => {
      msgDiv.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return textSpan;
}

async function askChatbot(message) {
  chatHistory.push({ role: "user", content: message });
  AppendMessage("user", message);

  // Add the "..." bubble
  const aiTextElement = AppendMessage("model", "...");
  const aiBubble = aiTextElement.parentElement;

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/chat?user_message=${encodeURIComponent(message)}`,
      { method: "POST" }
    );

    if (!response.ok) throw new Error("Server Error");
    const data = await response.json();
    
    // Replace the "..." with the real text
    aiTextElement.textContent = data.reply;
    chatHistory.push({ role: "assistant", content: data.reply });

    renderCopyButton(aiBubble, data.reply);
    setTimeout(() => {
      aiBubble.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);

  } catch (e) {
    aiTextElement.textContent = "Error: Nate is offline.";
  }
}

async function getHistory() {
  try {
    const res = await fetch("http://127.0.0.1:8000/history");
    chatHistory = await res.json();
    chat.replaceChildren();
    
    chatHistory.forEach(m => AppendMessage(m.role, m.content, false));
    
    // CRITICAL: Scroll to the very end instantly on load
    setTimeout(() => scrollToBottom(false), 100);
  } catch (err) {
    console.error("History load failed", err);
  }
}

submit.addEventListener("submit", async (e) => {
  e.preventDefault(); // This STOPS the page from jumping to top/refreshing
  const val = input.value.trim();
  if (!val) return;

  input.value = "";
  input.focus(); 
  await askChatbot(val);
});

document.addEventListener("DOMContentLoaded", getHistory);