interface TabChangeInfo {
    status?: string;
}

chrome.tabs.onUpdated.addListener((tabId: number, changeInfo: TabChangeInfo, tab: chrome.tabs.Tab) => {
    if (changeInfo.status === 'complete') {
        chrome.scripting.executeScript({
            target: { tabId },
            files: ['content.js']
        });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request);

    if (request.type === 'logMessage') {
        console.log('Message intercepted:', request.data);
        return;
    }

    if (request.action === 'downloadFile') {
        try {
            const { content, filename, type } = request.data;
            console.log('Starting download:', { filename, type });

            const blob = new Blob([content], { type: `${type};charset=utf-8` });
            const url = URL.createObjectURL(blob);

            chrome.downloads.download({
                url: url,
                filename: filename,
                saveAs: true
            }, (downloadId) => {
                URL.revokeObjectURL(url);
                const success = !chrome.runtime.lastError;
                console.log('Download result:', { success, downloadId, error: chrome.runtime.lastError });
                sendResponse({
                    success,
                    downloadId,
                    error: chrome.runtime.lastError?.message
                });
            });

            return true;
        } catch (error) {
            console.error('Download error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to initiate download';
            sendResponse({
                success: false,
                error: errorMessage
            });
        }
    }

    return true;
});