# Double Subtitles Chrome Extension

This Chrome extension translates subtitles in real-time from Finnish to English. It captures subtitles from videos, translates them using Unofficial Google Translate API, and displays them as an overlay on the video.

## Features

- Captures subtitles from video elements.
- Translates subtitles from Finnish to English using Google Translate API.
- Displays translated subtitles as a movable overlay.
- Allows customization of overlay appearance (background color, text color, text size, opacity).
- Saves overlay position and customization settings between sessions.

## Supported Sites

This extension has been tested and works on the following sites:
- [Yle Areena](https://areena.yle.fi/tv)
- [Yle](https://yle.fi/)

Note: The extension may not work on other sites due to different methods of presenting subtitles.

## Installation

1. Clone or download this repository to your local machine.

2. Open Google Chrome and navigate to `chrome://extensions/`.

3. Enable "Developer mode" by toggling the switch in the upper-right corner.

4. Click the "Load unpacked" button and select the directory where you downloaded this repository.

## Usage

1. Open a video with subtitles in Finnish on one of the supported sites.

2. Click the extension icon in the Chrome toolbar.

3. Click the "Translate Subtitles" button to start translating subtitles.

4. The translated subtitles will appear as an overlay on the video. You can drag the overlay to move it around the screen.

5. Click the "Customize Overlay" button to change the appearance of the overlay. You can modify the background color, text color, text size and opacity.

## Customization

- **Background Color**: Change the background color of the overlay.
- **Text Color**: Change the text color of the overlay.
- **Text Size**: Change the size of the text in the overlay.
- **Opacity**: Adjust the opacity of the overlay background.

## Notes

- The extension uses the unofficial Google Translate API for translation. Due to the nature of this API, it may not always provide reliable results.
- It is recommended to use an official translation API if available to ensure better performance and reliability.