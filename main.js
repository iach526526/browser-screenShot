// ==UserScript==
// @name         Screenshot Element to Clipboard
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Take a screenshot of a hovered HTML element, including iframes and Google ads(not complete), and copy it to the clipboard when pressing the spacebar in screenshot mode (Ctrl+Shift+Y).
// @author       Your Name
// @match        *://*/*
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/html2canvas@1.0.0-rc.5/dist/html2canvas.min.js
// ==/UserScript==

(function() {
    'use strict';

    let isScreenshotMode = false;
    let lastHoveredElement = null;

    // Toggle screenshot mode when Ctrl+Shift+Y is pressed
    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.shiftKey && event.key === 'Y') {
            isScreenshotMode = !isScreenshotMode;
            if (isScreenshotMode) {
                alert('Screenshot mode activated. Hover over an element and press spacebar to take a screenshot.');
            } else {
                alert('Screenshot mode deactivated.');
                if (lastHoveredElement) {
                    lastHoveredElement.style.outline = ''; // Remove outline when exiting the mode
                }
            }
        }
    });

    // Listen for mouseover events to track the hovered element
    document.addEventListener('mouseover', function(event) {
        if (isScreenshotMode) {
            if (lastHoveredElement) {
                lastHoveredElement.style.outline = ''; // Remove outline from the previously hovered element
            }
            lastHoveredElement = event.target;
            lastHoveredElement.style.outline = '2px dashed red'; // Highlight the element
        }
    });

    // Take a screenshot when the user presses the spacebar while in screenshot mode
    document.addEventListener('keydown', function(event) {
        if (isScreenshotMode && event.key === ' ') {
            event.preventDefault(); // Prevent default action (scrolling)
            if (lastHoveredElement) {
                // Check if the hovered element is an iframe or contains an iframe
                if (lastHoveredElement.tagName.toLowerCase() === 'iframe') {
                    takeIframeScreenshot(lastHoveredElement);
                } else {
                    html2canvas(lastHoveredElement).then(function(canvas) {
                        copyCanvasToClipboard(canvas);
                    });
                }

                // Reset the element's outline
                lastHoveredElement.style.outline = '';
                lastHoveredElement = null; // Clear the reference to the hovered element
            }
        }
    });

    // Function to take a screenshot of the iframe's content
    function takeIframeScreenshot(iframeElement) {
        try {
            const iframeDocument = iframeElement.contentDocument || iframeElement.contentWindow.document;
            html2canvas(iframeDocument.body).then(function(canvas) {
                copyCanvasToClipboard(canvas);
            });
        } catch (error) {
            console.error('Failed to access iframe content for screenshot:', error);
            alert('Unable to capture screenshot of this iframe due to cross-origin restrictions.');
        }
    }

    // Function to copy the canvas content to the clipboard
    function copyCanvasToClipboard(canvas) {
        canvas.toBlob(function(blob) {
            navigator.clipboard.write([
                new ClipboardItem(
                    Object.defineProperty({}, blob.type, {
                        value: blob,
                        enumerable: true
                    })
                )
            ]).then(function() {
                alert('Screenshot copied to clipboard!');
            }).catch(function(error) {
                console.error('Failed to copy screenshot to clipboard:', error);
            });
        });
    }
})();
