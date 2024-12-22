<script lang="ts">
  export let testPayloads: any[];
  export let selectedElement: any;
  export let runTest: (payload: string, testName: string) => void;
</script>

<section class="test-buttons">
  {#each testPayloads as test}
    <div class="test-container">
      <button
        on:click={() => runTest(test.payload, test.name)}
        class="test-button"
        disabled={!selectedElement}
        title={test.description}
      >
        {test.name}
      </button>
      <div class="tooltip">{test.description}</div>
    </div>
  {/each}
</section>

<style>
  .test-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .test-container {
    position: relative;
    display: inline-block;
  }

  .test-button {
    width: 100%;
    padding: 0.5rem;
    border: none;
    border-radius: 4px;
    background: #4a90e2;
    color: white;
    cursor: pointer;
    transition: background 0.2s;
  }

  .test-button:hover {
    background: #357abd;
  }

  .test-button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  .tooltip {
    visibility: hidden;
    position: absolute;
    z-index: 1;
    width: 200px;
    background-color: #333;
    color: white;
    text-align: center;
    padding: 5px;
    border-radius: 6px;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 5px;
    font-size: 0.8rem;
  }

  .test-container:hover .tooltip {
    visibility: visible;
  }
</style>
