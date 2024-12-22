<script lang="ts">
  import { onMount } from 'svelte';
  export let domAnalysis: any;
  export let analysisOrder: 'nodes' | 'depth' | 'length';
  export let onAnalyze: () => void;

  let showDetails = false;
  let selectedNode: any = null;
  let complexElements: any[] = [];

  $: if (domAnalysis?._children) {
    complexElements = domAnalysis._children
      .filter(node => node.nodes > 1)
      .map(node => ({
        outerHTML: node.element.outerHTML,
        depth: node.depth,
        children: node.nodes
      }))
      .slice(0, 5);
  }

  $: elementTypes = domAnalysis?._children.reduce((acc, node) => {
    acc[node.tagName] = (acc[node.tagName] || 0) + 1;
    return acc;
  }, {});

  $: maxDepthPath = domAnalysis?._children
    .sort((a, b) => b.depth - a.depth)[0];

  function getNodeDetails(node) {
    return {
      attributes: node.attributes || {},
      children: node._children?.length || 0,
      innerText: node.element.innerText?.slice(0, 100) + '...',
      path: node.path
    };
  }

  function handleKeyDown(event: KeyboardEvent, node: any) {
    if (event.key === 'Enter' || event.key === ' ') {
      selectedNode = node;
      event.preventDefault();
    }
  }

  function formatAttributeValue(value: string): string {
    if (value.length > 50) {
      if (value.startsWith('http')) {
        const url = new URL(value);
        return `${url.origin}/...${url.pathname.slice(-20)}`;
      }
      return value.substring(0, 47) + '...';
    }
    return value;
  }

  function formatElementDisplay(node: any) {
    const attrs = Object.entries(node.attributes || {})
      .map(([key, value]) => `${key}="${formatAttributeValue(value as string)}"`)
      .join('\n  ');

    return `<${node.tagName}${attrs ? '\n  ' + attrs : ''}>`;
  }
</script>

<div class="analyzer-container">
  <div class="analyzer-panel">
    <div class="controls">
      <select bind:value={analysisOrder}>
        <option value="nodes">Sort by Node Count</option>
        <option value="depth">Sort by Depth</option>
        <option value="length">Sort by Length</option>
      </select>
      <button on:click={onAnalyze}>Analyze DOM</button>
      {#if domAnalysis}
        <button on:click={() => showDetails = !showDetails}>
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      {/if}
    </div>

    {#if domAnalysis}
      <div class="results">
        <div class="summary">
          <h3>DOM Summary</h3>
          <ul>
            <li>Total Nodes: {domAnalysis.nodes}</li>
            <li>Max Depth: {domAnalysis.depth}</li>
            <li>Total Size: {domAnalysis.length} characters</li>
            <li>Unique Element Types: {Object.keys(elementTypes).length}</li>
          </ul>
        </div>

        {#if showDetails}
          <div class="details">
            <div class="element-types">
              <h3>Element Distribution</h3>
              <ul>
                {#each Object.entries(elementTypes) as [tag, count]}
                  <li>
                    <code>{tag}</code>: {count} instances
                  </li>
                {/each}
              </ul>
            </div>

            <div class="complex-paths">
              <h3>Most Complex Elements</h3>
              <ul>
                {#each domAnalysis._children.slice(0, 5) as node}
                  <button
                    class="node-item"
                    class:selected={selectedNode === node}
                    on:click={() => selectedNode = node}
                    on:keydown={(e) => handleKeyDown(e, node)}
                    type="button"
                  >
                    <div class="node-header">
                      <code>{node.tagName}</code>
                      <span class="stats">
                        (Nodes: {node.nodes}, Depth: {node.depth})
                      </span>
                    </div>
                    <pre class="node-attributes">{formatElementDisplay(node)}</pre>
                    {#if selectedNode === node}
                      <div class="node-details">
                        <h4>Attributes:</h4>
                        <ul class="attribute-list">
                          {#each Object.entries(node.attributes || {}) as [key, value]}
                            <li>
                              <code>{key}</code>:
                              <span class="attribute-value">{value}</span>
                            </li>
                          {/each}
                        </ul>
                        {#if node._children.length > 0}
                          <h4>Direct Children: {node._children.length}</h4>
                          <ul class="child-list">
                            {#each node._children.slice(0, 3) as child}
                              <li><code>{child.tagName}</code></li>
                            {/each}
                            {#if node._children.length > 3}
                              <li>... and {node._children.length - 3} more</li>
                            {/if}
                          </ul>
                        {/if}
                      </div>
                    {/if}
                  </button>
                {/each}
              </ul>
            </div>

            <div class="deepest-path">
              <h3>Deepest Path</h3>
              <p class="path-chain">{maxDepthPath?.path || 'N/A'}</p>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  {#if complexElements && complexElements.length > 0}
    <section class="complex-elements">
      <h3>Most Complex Elements</h3>
      <div class="elements-list">
        {#each complexElements as element}
          <div class="element-card">
            <pre class="element-content selectable">{element.outerHTML}</pre>
            <div class="element-stats selectable">
              <span>Depth: {element.depth}</span>
              <span>Children: {element.children}</span>
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/if}
</div>

<style>
  .analyzer-panel {
    background: #333;
    border-radius: 8px;
    padding: 1.5rem;
  }

  .controls {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  select {
    background: #2a2a2a;
    color: #e1e1e1;
    border: 1px solid #404040;
    border-radius: 6px;
    padding: 0.5rem;
    font-size: 0.9rem;
  }

  .summary {
    background: #2a2a2a;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
  }

  .summary h3 {
    color: #00bcd4;
    margin: 0 0 1rem;
  }

  .summary ul {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .details {
    background: #2a2a2a;
    border-radius: 8px;
    padding: 1.5rem;
  }

  .element-types {
    margin-bottom: 2rem;
  }

  .node-item {
    width: 100%;
    text-align: left;
    background: #333;
    border: 1px solid #404040;
    border-radius: 6px;
    padding: 1rem;
    margin: 0.5rem 0;
    color: #e1e1e1;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .node-item:hover {
    background: #404040;
    border-color: #00bcd4;
  }

  .node-item.selected {
    background: #004d40;
    border-color: #00bcd4;
  }

  code {
    background: #1a1a1a;
    color: #00bcd4;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  }

  .path-chain {
    background: #1a1a1a;
    padding: 1rem;
    border-radius: 6px;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
    color: #00bcd4;
    word-break: break-all;
  }

  h3 {
    color: #00bcd4;
    margin: 0 0 1rem;
    font-size: 1.1rem;
  }

  .child-list {
    background: #1a1a1a;
    padding: 0.75rem;
    border-radius: 6px;
    margin: 0.5rem 0;
  }

  .analyzer-container {
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
    color: #e1e1e1;
    padding: 1rem;
  }

  .element-card {
    padding: 10px;
    margin: 5px 0;
    background: var(--surface-2);
    border-radius: 4px;
    overflow: auto;
    user-select: text;
    -webkit-user-select: text;
  }

  .element-content {
    white-space: pre-wrap;
    word-break: break-word;
    font-family: monospace;
    margin: 0;
    padding: 5px;
    background: var(--surface-3);
    border-radius: 2px;
    cursor: text;
  }

  .element-stats {
    margin-top: 5px;
    font-size: 0.9em;
    color: var(--text-2);
  }

  .selectable {
    user-select: text;
    -webkit-user-select: text;
    cursor: text;
  }

  :global(.analyzer-container *) {
    user-select: text !important;
    -webkit-user-select: text !important;
  }

  .node-attributes {
    font-family: monospace;
    font-size: 0.9em;
    background: #1a1a1a;
    padding: 0.5rem;
    margin: 0.5rem 0;
    border-radius: 4px;
    white-space: pre-wrap;
    word-break: break-word;
    max-width: 100%;
    overflow-x: auto;
  }

  .attribute-list {
    list-style: none;
    padding: 0;
    margin: 0;
    background: #1a1a1a;
    border-radius: 4px;
    padding: 0.5rem;
  }

  .attribute-list li {
    padding: 0.25rem 0;
    border-bottom: 1px solid #333;
  }

  .attribute-list li:last-child {
    border-bottom: none;
  }

  .attribute-value {
    color: #4caf50;
    word-break: break-word;
    display: inline-block;
    max-width: 100%;
  }
</style>
