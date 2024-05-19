(() => {
    console.log('Content script loaded');

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "injectOverlay") {
            console.log('Injecting overlay');
            injectOverlay();
            observeVideoElement();
        } else if (request.action === "updateOverlay") {
            console.log('Updating overlay with settings:', request.settings);
            updateOverlay(request.settings);
        }
    });

    const injectOverlay = () => {
        console.log('Creating overlay');
        let subtitleOverlay = document.getElementById('subtitle-overlay');
        if (!subtitleOverlay) {
            subtitleOverlay = document.createElement('div');
            subtitleOverlay.id = 'subtitle-overlay';
            subtitleOverlay.className = 'subtitle-overlay';
            document.body.appendChild(subtitleOverlay);
        }

        // Load position from localStorage
        const savedPosition = localStorage.getItem('subtitleOverlayPosition');
        if (savedPosition) {
            const position = JSON.parse(savedPosition);
            console.log('Loaded position:', position);
            subtitleOverlay.style.top = `${position.top}px`;
            subtitleOverlay.style.left = `${position.left}px`;
        } else {
            console.log('No saved position found. Using default position.');
            subtitleOverlay.style.top = '10%';
            subtitleOverlay.style.left = '10%';
        }

        // Load customization settings from localStorage
        const savedSettings = localStorage.getItem('subtitleOverlaySettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            console.log('Loaded settings:', settings);
            subtitleOverlay.style.backgroundColor = hexToRGBA(settings.bgColor || '#808080', settings.bgOpacity || 0.7);
            subtitleOverlay.style.color = settings.textColor || 'white';
            subtitleOverlay.style.fontSize = `${settings.textSize || 20}px`;
        } else {
            console.log('No saved settings found. Using default values.');
            subtitleOverlay.style.backgroundColor = 'rgba(128, 128, 128, 0.7)'; // default to grey
            subtitleOverlay.style.color = 'white';
            subtitleOverlay.style.fontSize = '20px';
        }

        subtitleOverlay.innerText = 'Subtitles translation';
        subtitleOverlay.style.position = 'fixed';
        subtitleOverlay.style.padding = '10px';
        subtitleOverlay.style.borderRadius = '5px';
        subtitleOverlay.style.zIndex = '10000'; // Ensure it's on top of other elements
        subtitleOverlay.style.cursor = 'move'; // Indicate that the overlay is movable
        subtitleOverlay.style.pointerEvents = 'auto'; // Allow interactions with the overlay
        makeMovable(subtitleOverlay);
        console.log('Overlay created', subtitleOverlay);
    };

    const updateOverlay = (settings) => {
        const subtitleOverlay = document.getElementById('subtitle-overlay');
        if (subtitleOverlay) {
            subtitleOverlay.style.backgroundColor = hexToRGBA(settings.bgColor || '#808080', settings.bgOpacity || 0.7);
            subtitleOverlay.style.color = settings.textColor || 'white';
            subtitleOverlay.style.fontSize = `${settings.textSize || 20}px`;
            console.log('Overlay updated with new settings:', settings);
        } else {
            console.error('Subtitle overlay not found');
        }
    };

    const observeVideoElement = () => {
        const video = document.querySelector('video');
        if (!video) {
            console.log('No video element found');
            return;
        }
        console.log('Video element found:', video);

        const observer = new MutationObserver((mutationsList, observer) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeName === 'TRACK') {
                            console.log('Text track added:', node);
                            processTextTracks(video);
                        }
                    }
                }
            }
        });

        observer.observe(video, { childList: true, subtree: true });

        // Also check for existing tracks
        processTextTracks(video);
    };

    const processTextTracks = (video) => {
        const tracks = video.textTracks;
        console.log('Text tracks found:', tracks.length);
        for (let i = 0; i < tracks.length; i++) {
            const track = tracks[i];
            console.log(`Track ${i}:`, track);
            track.mode = 'hidden';
            track.addEventListener('cuechange', async () => {
                const activeCues = track.activeCues;
                console.log('Active cues:', activeCues.length);
                for (let j = 0; j < activeCues.length; j++) {
                    const cue = activeCues[j];
                    console.log('Original subtitle:', cue.text);
                    const translatedText = await translateText(cue.text);
                    console.log('Translated subtitle:', translatedText);
                    displayTranslatedSubtitle(translatedText);
                }
            });
        }
    };

    const translateText = async (text) => {
        console.log('Translating text:', text);
        /*
        console.log('Translating text:', text);
    try {
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=fi|en`);
      const data = await response.json();
      console.log('Translation response:', data);
      return data.responseData.translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
         */
        const lines = text.split('\n').map(line => line.trim());
        console.log('Lines to translate:', lines);

        const translations = await Promise.all(lines.map(async (line) => {
            try {
                const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=fi&tl=en&dt=t&q=${encodeURIComponent(line)}`);
                const data = await response.json();
                console.log('Translation response for line:', line, data);
                return data[0][0][0];
            } catch (error) {
                console.error('Google Translate error:', error);
                return line;
            }
        }));

        const translatedText = translations.join('\n');
        console.log('Complete translated text:', translatedText);
        return translatedText;
    };

    const displayTranslatedSubtitle = (text) => {
        console.log('Displaying translated subtitle:', text);
        let subtitleOverlay = document.getElementById('subtitle-overlay');
        if (!subtitleOverlay) {
            console.error('Subtitle overlay not found');
            return;
        }
        subtitleOverlay.innerText = text;
    };

    const makeMovable = (element) => {
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        element.addEventListener('mousedown', (event) => {
            isDragging = true;
            offsetX = event.clientX - parseInt(window.getComputedStyle(element).left, 10);
            offsetY = event.clientY - parseInt(window.getComputedStyle(element).top, 10);
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        const onMouseMove = (event) => {
            if (!isDragging) return;
            element.style.left = `${event.clientX - offsetX}px`;
            element.style.top = `${event.clientY - offsetY}px`;
        };

        const onMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            // Save position to localStorage
            const position = {
                top: parseInt(window.getComputedStyle(element).top, 10),
                left: parseInt(window.getComputedStyle(element).left, 10)
            };
            console.log('Saving position:', position);
            localStorage.setItem('subtitleOverlayPosition', JSON.stringify(position));
        };
    };

    const hexToRGBA = (hex, opacity) => {
        const bigint = parseInt(hex.replace("#", ""), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };
})();
