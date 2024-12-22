<script lang="ts">
  export let selectedElement: any;
</script>

<section class="instructions">
  <p>Hover over elements to highlight them. Click to select for testing.</p>
  <div class="element-selector">
    <div class="instructions">
      <h3>Element Selection</h3>
      <ul>
        <li>Hold <kbd>Alt</kbd> (or <kbd>Option</kbd> on Mac) to enter highlight mode</li>
        <li>Move mouse over elements to highlight them</li>
        <li>Click while highlighting to persist the selection</li>
        <li>Release <kbd>Alt</kbd> key to use page normally</li>
      </ul>
    </div>
  </div>
  {#if selectedElement}
    <div class="selected-element"></div>
      <p class="selected">Selected: {selectedElement.tagName}</p>
      {#if selectedElement.id}
        <p class="element-info">ID: {selectedElement.id}</p>
      {/if}
      {#if selectedElement.className}
        <p class="element-info">Class: {selectedElement.className}</p>
      {/if}
    </div>
  {/if}
</section>

<style>
  .instructions {
    background: #e3f2fd;
    padding: 1rem;
    border-radius: 4px;
    margin: 1rem 0;
  }

  .instructions p {
    margin: 0;
    color: #1565c0;
  }

  .selected-element {
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: white;
    border-radius: 4px;
    border: 1px solid #bbdefb;
  }

  .selected {
    font-weight: bold;
    color: #1976d2;
    margin: 0;
  }

  .element-info {
    margin: 0.25rem 0;
    color: #666;
    font-size: 0.9rem;
  }

  kbd {
    background: var(--surface-2);
    border: 1px solid var(--surface-3);
    border-radius: 3px;
    padding: 2px 6px;
    font-family: monospace;
    font-size: 0.9em;
  }

  .instructions ul {
    list-style: none;
    padding-left: 0;
    margin: 0.5rem 0;
  }

  .instructions li {
    margin: 0.5rem 0;
    line-height: 1.4;
  }
</style>
