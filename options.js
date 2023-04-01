document.addEventListener("DOMContentLoaded", function () {
  const apiKeyInput = document.getElementById("api-key");
  const saveButton = document.getElementById("save-button");

  chrome.storage.local.get("api_key", function (data) {
    apiKeyInput.value = data.api_key || "";
  });

  saveButton.addEventListener("click", () => {
    chrome.storage.local.set({"api_key": apiKeyInput.value.trim()}, function () {
      alert("API Key saved.");
    });
  });
});
