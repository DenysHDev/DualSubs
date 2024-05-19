document.getElementById('translate').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['content.js']
        }, () => {
            console.log('Content script injected');
            chrome.tabs.sendMessage(tabs[0].id, { action: "injectOverlay" });
        });
    });
});

document.getElementById('customize').addEventListener('click', () => {
    const options = document.querySelector('.options');
    options.style.display = options.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('save').addEventListener('click', () => {
    const bgColor = document.getElementById('bgColor').value;
    const textColor = document.getElementById('textColor').value;
    const textSize = document.getElementById('textSize').value;
    const bgOpacity = document.getElementById('bgOpacity').value;

    const settings = {
        bgColor,
        textColor,
        textSize,
        bgOpacity
    };

    console.log('Saving settings:', settings);
    localStorage.setItem('subtitleOverlaySettings', JSON.stringify(settings));

    // Send message to content script to update the overlay immediately
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: "updateOverlay", settings });
    });
});

// Load saved settings to populate the form
document.addEventListener('DOMContentLoaded', () => {
    const savedSettings = localStorage.getItem('subtitleOverlaySettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        console.log('Loaded settings:', settings);
        document.getElementById('bgColor').value = settings.bgColor || '#808080'; // default to grey
        document.getElementById('textColor').value = settings.textColor || '#ffffff';
        document.getElementById('textSize').value = settings.textSize || 20;
        document.getElementById('bgOpacity').value = settings.bgOpacity || 0.7;
    } else {
        console.log('No saved settings found. Using default values.');
        document.getElementById('bgColor').value = '#808080'; // default to grey
        document.getElementById('textColor').value = '#ffffff';
        document.getElementById('textSize').value = 20;
        document.getElementById('bgOpacity').value = 0.7;
    }
});
