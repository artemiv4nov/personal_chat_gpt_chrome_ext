const inputField = document.getElementById("input");
const sendButton = document.getElementById("send-button");
const chatBox = document.getElementById("chat-box");

const clearButton = document.getElementById("clear-button");
clearButton.addEventListener("click", clearChatHistory);

const md = new markdownit();

// Add this function to clear chat history
function clearChatHistory() {
  chatBox.innerHTML = "";
  chrome.storage.local.set({ chat_history: [] });
}

sendButton.addEventListener("click", sendMessage);
inputField.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey && !event.metaKey) {
    event.preventDefault();
    sendMessage();
  }
});

function sendMessage() {
  const userInput = inputField.value.trim();
  if (!userInput) return;

  inputField.value = "";

  addChatMessage(userInput, "user-message");
  saveChatHistory(userInput, "user-message");

  // Add a blinking cursor
  const cursorElement = addChatMessage("", "cursor");
  chatBox.scrollTop = chatBox.scrollHeight;

  chrome.storage.local.get("api_key", function (data) {
    const apiKey = data.api_key || "";

    if (!apiKey) {
      addChatMessage("Please set your API Key in the options page.", "error-message");
      cursorElement.remove();
      return;
    }

    chrome.runtime.sendMessage({
      type: "sendToChatGPT",
      apiKey: apiKey,
      input: userInput
    }, function (response) {
      cursorElement.remove();
      if (response.success) {
        addChatMessage(response.response, "gpt-response");
        saveChatHistory(response.response, "gpt-response");
      } else {
        addChatMessage(response.error, "error-message");
      }
    });
  });
}

function saveChatHistory(message, cssClass) {
  chrome.storage.local.get("chat_history", function (data) {
    const chatHistory = data.chat_history || [];
    chatHistory.push({ message, cssClass });
    chrome.storage.local.set({ chat_history: chatHistory });
  });
}

function addChatMessage(message, cssClass) {
  const messageElement = document.createElement("div");
  messageElement.classList.add(cssClass);
  messageElement.innerHTML = md.render(message);

  chatBox.appendChild(messageElement);
  chatBox.scrollTop = chatBox.scrollHeight;

  return messageElement;
}

// Load chat history
document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.local.get("chat_history", function (data) {
    const chatHistory = data.chat_history || [];
    for (const item of chatHistory) {
      addChatMessage(item.message, item.cssClass);
    }
  });
});
