import { DOMAnalyzer } from '../lib/DOMAnalyzer';
import { DOMHighlighter } from '../lib/DOMHighlighter';
import { TestRunner } from '../lib/TestRunner';
import { logger } from '../lib/logger';
import { DOMTreeAnalyzer } from '../lib/DOMTreeAnalyzer';

logger.log("Content script loading...");

let highlighter: DOMHighlighter;
let testRunner: TestRunner;
let selectedElement: HTMLElement | null = null;
let isInitialized = false;

function initialize() {
    if (isInitialized) return;

    try {
        highlighter = new DOMHighlighter();
        testRunner = new TestRunner();
        highlighter.enable();
        isInitialized = true;
        logger.log("Content script initialized successfully");
    } catch (error) {
        logger.error("Failed to initialize content script", error as Error);
    }
}

function captureDOMStructure() {
    try {
        const analyzer = new DOMTreeAnalyzer();
        const domTree = analyzer.analyzeDOM();
        console.log('Captured DOM tree:', domTree);

        if (!domTree || !domTree.children || domTree.children.length === 0) {
            console.error('Invalid DOM tree structure');
            return {
                success: false,
                error: 'Invalid DOM tree structure'
            };
        }

        return {
            success: true,
            treeData: domTree
        };
    } catch (error) {
        console.error('Error capturing DOM:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to capture DOM'
        };
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    logger.log("Content script received message", request);

    if (!isInitialized) {
        initialize();
    }

    if (request.action === 'getDOMTree') {
        try {
            const response = captureDOMStructure();
            console.log('Sending DOM tree response:', response);
            sendResponse(response);
        } catch (error) {
            console.error('Error in getDOMTree handler:', error);
            sendResponse({
                success: false,
                error: 'Failed to process DOM tree'
            });
        }
        return true;
    }

    try {
        switch (request.action) {
            case 'startHighlighting':
                logger.log("Starting highlighting");
                highlighter.enable();
                sendResponse({ success: true });
                break;

            case 'stopHighlighting':
                logger.log("Stopping highlighting");
                highlighter.disable();
                sendResponse({ success: true });
                break;

            case 'analyzeDom':
                logger.log("Starting DOM analysis");
                const analysis = DOMAnalyzer.analyze(document, request.order);
                logger.log("Analysis complete", analysis);

                chrome.runtime.sendMessage({
                    action: 'domAnalysisResult',
                    data: analysis
                });
                sendResponse({ success: true });
                break;

            case 'injectPayload':
                logger.log("Injecting test payload");
                if (selectedElement) {
                    testRunner.testElement(selectedElement, request.testName)
                        .then(results => {
                            logger.log("Test completed", results);
                            chrome.runtime.sendMessage({
                                action: 'testResult',
                                result: results
                            });
                            sendResponse({ success: true });
                        })
                        .catch(error => {
                            logger.error("Test failed", error);
                            chrome.runtime.sendMessage({
                                action: 'error',
                                error: error instanceof Error ? error.message : 'Unknown error'
                            });
                            sendResponse({ success: false, error });
                        });
                }
                break;

            default:
                logger.error(`Unknown action: ${request.action}`);
                sendResponse({ success: false, error: 'Unknown action' });
        }
    } catch (error) {
        logger.error("Error handling message", error as Error);
        sendResponse({ success: false, error });
    }

    return true;
});

initialize();

document.addEventListener('mousemove', (e: MouseEvent) => {
    if (!isInitialized) return;

    if (e.altKey) {
        console.log('Mouse move with Alt key:', {
            target: (e.target as HTMLElement).tagName,
            altKey: e.altKey
        });
    }

    const target = e.target as HTMLElement;
    highlighter.highlight(target);
});

document.addEventListener('click', (e: MouseEvent) => {
    if (!isInitialized) return;

    console.log('Click event:', {
        target: (e.target as HTMLElement).tagName,
        altKey: e.altKey,
        isHighlightMode: highlighter.isInHighlightMode()
    });

    const target = e.target as HTMLElement;

    if (highlighter.isInHighlightMode()) {
        if (target.classList.contains('dom-invader-highlight') ||
            target.classList.contains('dom-invader-persisted')) {
            e.preventDefault();
            e.stopPropagation();
            selectedElement = target;

            chrome.runtime.sendMessage({
                action: 'elementSelected',
                element: {
                    outerHTML: selectedElement.outerHTML,
                    tagName: selectedElement.tagName,
                    id: selectedElement.id,
                    className: selectedElement.className
                }
            });
        }
    }
});

window.addEventListener('beforeunload', () => {
    if (isInitialized) {
        highlighter.clearAllHighlights();
    }
});

logger.log("Content script loaded successfully");