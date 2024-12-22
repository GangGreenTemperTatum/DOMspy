<script lang="ts">
  export let messages: any[];
  export let clearMessages: () => void;
</script>

<section class="logger">
  <div class="logger-header">
    <h2>Message Log</h2>
    <button on:click={clearMessages} class="clear-button">Clear</button>
  </div>
  <div class="messages">
    {#each messages as message}
      <div class="message {message.type}">
        <span class="timestamp"
          >{new Date(message.timestamp).toLocaleTimeString()}</span
        >
        <span class="content">{message.content}</span>
      </div>
    {/each}
  </div>
</section>

<style>
  .logger {
    margin-top: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 1rem;
  }

  .logger-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .logger-header h2 {
    margin: 0;
    font-size: 1.1rem;
  }

  .clear-button {
    padding: 0.25rem 0.5rem;
    background: #f44336;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .messages {
    max-height: 200px;
    overflow-y: auto;
  }

  .message {
    padding: 0.5rem;
    margin: 0.25rem 0;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .message.error {
    background: #ffebee;
    color: #c62828;
  }

  .message.warning {
    background: #fff3e0;
    color: #ef6c00;
  }

  .message.info {
    background: #e3f2fd;
    color: #1565c0;
  }

  .message.result {
    background: #e8f5e9;
    color: #2e7d32;
  }

  .timestamp {
    color: #666;
    font-size: 0.8rem;
    margin-right: 0.5rem;
  }
</style>
