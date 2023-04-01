chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "sendToChatGPT") {
    const { apiKey, input } = message;

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: input }
        ],
        max_tokens: 2048,
        n: 1,
        stop: null,
        temperature: 1.0
      })
    };

    fetch("https://api.openai.com/v1/chat/completions", requestOptions)
      .then(response => response.json())
      .then(data => {
        if (data.choices && data.choices.length > 0) {
          sendResponse({ success: true, response: data.choices[0].message.content.trim() });
        } else {
          sendResponse({ success: false, error: "No response from ChatGPT." });
        }
      })
      .catch(error => {
        sendResponse({ success: false, error: `Error: ${error.message}` });
      });

    return true; // Keep the message channel open for async response
  }
});
