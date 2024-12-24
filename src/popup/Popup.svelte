<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { logger } from '../lib/logger';
  import type { Message, ElementData } from '../types';
  import DOMAnalyzer from './components/DOMAnalyzer.svelte';
  import DOMTree from './components/DOMTree.svelte';

  let messages: Message[] = [];
  let selectedElement: ElementData | null = null;
  let isHighlighting = false;
  let domAnalysis: any = { _children: [] };
  let analysisOrder: 'nodes' | 'depth' | 'length' = 'length';
  let activeTab: 'tester' | 'analyzer' | 'tree' = 'tester';
  let domTreeData: any = { tag: '#document', children: [] };

  const testPayloads = [
    {
      name: "XSS Test",
      payload: "<img src=x onerror=alert(1)>",
      description: "Tests for Cross-Site Scripting vulnerabilities"
    },
    {
      name: "Prototype Pollution",
      payload: "__proto__[test]=polluted",
      description: "Tests for JavaScript prototype pollution"
    },
    {
      name: "DOM Clobbering",
      payload: "<form name='x'><input name='y'></form>",
      description: "Tests for DOM clobbering vulnerabilities"
    }
  ];

  function addMessage(type: string, content: string) {
    logger.log(`Adding message: ${type}`, content);
    messages = [...messages, {
      timestamp: new Date().toISOString(),
      type,
      content
    }];
  }

  async function getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  async function isValidTab(tab: chrome.tabs.Tab) {
    return tab?.url?.startsWith("http") || tab?.url?.startsWith("https");
  }

  async function loadDOMTree() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab.id) {
        try {
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'getDOMTree'
            });
            console.log('DOM tree response:', response);

            if (response?.success) {
                domTreeData = response.treeData;
            } else {
                console.error('Failed to get DOM tree:', response?.error);
            }
        } catch (error) {
            console.error('Error getting DOM tree:', error);
        }
    }
  }

  async function initializeData() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) return;

        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getDOMTree' });
        console.log('Initial DOM tree response:', response);

        if (response?.success && response.treeData) {
            domTreeData = response.treeData;
            console.log('DOM tree data initialized:', domTreeData);
        }
    } catch (error) {
        console.error('Error initializing DOM tree:', error);
    }
  }

  onMount(async () => {
    logger.log("Popup mounted");

    try {
      const currentTab = await getCurrentTab();

      if (!currentTab?.id) {
        logger.error("No active tab found");
        addMessage("error", "No active tab found");
        return;
      }

      if (!await isValidTab(currentTab)) {
        logger.error("Invalid tab URL");
        addMessage("warning", "Extension cannot run on this page");
        return;
      }

      try {
        await chrome.scripting.executeScript({
          target: { tabId: currentTab.id },
          files: ['content.js']
        });
        logger.log("Content script injected");
      } catch (error) {
        logger.log("Content script already exists", error);
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      await chrome.tabs.sendMessage(currentTab.id, {
        action: "startHighlighting"
      });

      isHighlighting = true;
      addMessage("info", "Highlighting enabled");

      const messageListener = (request) => {
        logger.log("Received message", request);
        handleMessage(request);
        return true;
      };

      chrome.runtime.onMessage.addListener(messageListener);

      return () => {
        chrome.runtime.onMessage.removeListener(messageListener);
      };

    } catch (error) {
      logger.error("Error in onMount", error as Error);
      addMessage("error", "Failed to initialize extension");
    }

    console.log('Popup mounted, requesting DOM tree...');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab.id) {
        try {
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'getDOMTree' });
            console.log('Received DOM tree response:', response);
            if (response?.success) {
                domTreeData = response.treeData;
            } else {
                console.error('Failed to get DOM tree:', response?.error);
            }
        } catch (error) {
            console.error('Error getting DOM tree:', error);
        }
    }

    await loadDOMTree();
    await initializeData();
  });

  onDestroy(async () => {
    try {
      const currentTab = await getCurrentTab();
      if (currentTab?.id && await isValidTab(currentTab)) {
        await chrome.tabs.sendMessage(currentTab.id, {
          action: "stopHighlighting"
        });
      }
    } catch (error) {
      logger.error("Error in onDestroy", error as Error);
    }
  });

  function handleMessage(request: any) {
    switch (request.action) {
      case "elementSelected":
        selectedElement = request.element;
        addMessage("info", `Selected element: ${selectedElement.tagName}`);
        break;
      case "testResult":
        addMessage("result", JSON.stringify(request.result));
        break;
      case "domAnalysisResult":
        domAnalysis = request.data;
        addMessage("info", "DOM analysis completed");
        break;
      case "error":
        addMessage("error", request.error);
        break;
    }
  }

  async function runTest(payload: string, testName: string): Promise<void> {
    try {
      const currentTab = await getCurrentTab();

      if (!currentTab?.id) {
        addMessage("error", "No active tab found");
        return;
      }

      if (!selectedElement) {
        addMessage("warning", "Please select an element first");
        return;
      }

      logger.log(`Running test: ${testName}`, { payload });
      addMessage("info", `Running ${testName} test...`);

      await chrome.tabs.sendMessage(currentTab.id, {
        action: "injectPayload",
        payload,
        testName
      });
    } catch (error) {
      logger.error("Error running test", error as Error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      addMessage("error", `Error running test: ${errorMessage}`);
    }
  }

  async function analyzeDom(): Promise<void> {
    try {
      const currentTab = await getCurrentTab();
      if (!currentTab?.id) {
        addMessage("error", "No active tab found");
        return;
      }

      logger.log("Starting DOM analysis");
      addMessage("info", "Starting DOM analysis...");

      await chrome.tabs.sendMessage(currentTab.id, {
        action: "analyzeDom",
        order: analysisOrder
      });

    } catch (error) {
      logger.error("Analysis failed", error as Error);
      addMessage("error", `DOM analysis failed: ${error}`);
    }
  }

  function clearMessages(): void {
    logger.log("Clearing messages");
    messages = [];
  }

  async function handleTabChange(newTab: 'tester' | 'analyzer' | 'tree') {
    const currentTab = await getCurrentTab();

    if (currentTab?.id && await isValidTab(currentTab)) {
        if (newTab === 'analyzer' || newTab === 'tree') {
            await chrome.tabs.sendMessage(currentTab.id, {
                action: "stopHighlighting"
            });
            isHighlighting = false;
        } else if (newTab === 'tester') {
            await chrome.tabs.sendMessage(currentTab.id, {
                action: "startHighlighting"
            });
            isHighlighting = true;
        }
    }

    if (newTab === 'tree') {
        await loadDOMTree();
    }
    activeTab = newTab;
  }
</script>

<main class="container">
  <header>
    <h1>DOMspy</h1>
    <div class="mode-indicator" class:active={isHighlighting}>
      {isHighlighting ? 'Highlighting Active' : 'Highlighting Inactive'}
    </div>
    <nav class="tabs">
      <button
        class:active={activeTab === 'tester'}
        on:click={() => handleTabChange('tester')}>
        <span class="icon">🎯</span>
        Element Tester
      </button>
      <button
        class:active={activeTab === 'analyzer'}
        on:click={() => handleTabChange('analyzer')}>
        <span class="icon">🔍</span>
        DOM Analyzer
      </button>
      <button
        class:active={activeTab === 'tree'}
        on:click={() => handleTabChange('tree')}>
        <span class="icon">🌳</span>
        DOM Tree
      </button>
    </nav>
  </header>

  <div class="content">
    {#if activeTab === 'tester'}
      <!-- Selected Element Display -->
      {#if selectedElement}
        <section class="selected-element">
          <h2>Selected Element</h2>
          <div class="element-info">
            <p>Tag: {selectedElement.tagName}</p>
            {#if selectedElement.id}
              <p>ID: {selectedElement.id}</p>
            {/if}
            {#if selectedElement.className}
              <p>Class: {selectedElement.className}</p>
            {/if}
          </div>
        </section>
      {/if}

      <!-- Test Controls -->
      <section class="test-controls">
        <h2>Security Tests (COMING SOON 👀)</h2>
        <div class="test-buttons">
          {#each testPayloads as test}
            <button
              on:click={() => runTest(test.payload, test.name)}
              disabled={!selectedElement}
              title={test.description}
            >
              {test.name}
            </button>
          {/each}
        </div>
      </section>
    {:else if activeTab === 'analyzer'}
      <DOMAnalyzer
        {domAnalysis}
        {analysisOrder}
        onAnalyze={analyzeDom}
      />
    {:else}
      <DOMTree domAnalysis={domTreeData} />
    {/if}
  </div>

  <!-- Message Log -->
  <section class="message-log">
    <div class="log-header">
      <h2>Messages</h2>
      <button on:click={clearMessages}>Clear</button>
    </div>
    <div class="messages">
      {#each messages as message}
        <div class="message {message.type}">
          <span class="timestamp">{new Date(message.timestamp).toLocaleTimeString()}</span>
          <span class="content">{message.content}</span>
        </div>
      {/each}
    </div>
  </section>
</main>

<style>
  :global(body) {
    margin: 0;
    background: #1a1a1a;
    color: #e1e1e1;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, sans-serif;
  }

  .container {
    width: 800px;
    min-height: 600px;
    padding: 1rem;
    display: grid;
    grid-template-rows: auto 1fr auto;
    gap: 1rem;
  }

  header {
    background: #2a2a2a;
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  h1 {
    margin: 0 0 1rem;
    color: #00bcd4;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .mode-indicator {
    font-size: 0.8rem;
    padding: 4px 8px;
    border-radius: 4px;
    background: var(--surface-2);
    color: var(--text-2);
  }

  .mode-indicator.active {
    background: var(--accent);
    color: var(--text-1);
  }

  .content {
    background: #2a2a2a;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .tabs {
    display: flex;
    gap: 0.5rem;
    border-bottom: 1px solid #404040;
    padding-bottom: 0.5rem;
  }

  .tabs button {
    flex: 1;
    padding: 0.75rem 1rem;
    background: #333;
    border: none;
    border-radius: 6px;
    color: #e1e1e1;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .tabs button:hover {
    background: #404040;
  }

  .tabs button.active {
    background: #00bcd4;
    color: #1a1a1a;
  }

  .icon {
    font-size: 1.1rem;
  }

  button {
    background: #00bcd4;
    color: #1a1a1a;
    border: none;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  button:hover {
    background: #00acc1;
  }

  button:disabled {
    background: #404040;
    color: #666;
    cursor: not-allowed;
  }

  section {
    background: #333;
    border: 1px solid #404040;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .element-info {
    background: #2a2a2a;
    padding: 1rem;
    border-radius: 6px;
  }

  .message-log {
    background: #2a2a2a;
    border-radius: 8px;
    padding: 1rem;
    margin-top: auto;
  }

  .messages {
    max-height: 200px;
    overflow-y: auto;
    padding: 0.5rem;
    background: #333;
    border-radius: 6px;
  }

  .message {
    padding: 0.75rem;
    margin: 0.25rem 0;
    border-radius: 6px;
    font-size: 0.9rem;
  }

  .message.error {
    background: #ff5252;
    color: #fff;
  }

  .message.warning {
    background: #ffd740;
    color: #000;
  }

  .message.info {
    background: #333;
    color: #e1e1e1;
    border: 1px solid #404040;
  }

  .message.result {
    background: #00c853;
    color: #fff;
  }

  .timestamp {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.8rem;
    margin-right: 0.5rem;
  }
</style>