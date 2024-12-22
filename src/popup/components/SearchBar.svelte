<script lang="ts">
    export let placeholder = "Search...";
    export let onSearch: (query: string) => void;
    export let value = "";

    function handleInput(event: Event) {
        const target = event.target as HTMLInputElement;
        value = target.value;
        onSearch(value);
    }

    function handleClear() {
        value = "";
        onSearch("");
    }
</script>

<div class="search-container">
    <input
        type="text"
        {placeholder}
        bind:value
        on:input={handleInput}
        class="search-input"
    />
    {#if value}
        <button class="clear-button" on:click={handleClear} aria-label="Clear search">
            ×
        </button>
    {/if}
</div>

<style>
    .search-container {
        position: relative;
        margin-bottom: 1rem;
        width: 100%;
    }

    .search-input {
        width: 100%;
        padding: 8px 32px 8px 12px;
        background: #2a2a2a;
        border: 1px solid #404040;
        border-radius: 6px;
        color: #e1e1e1;
        font-size: 0.9rem;
        box-sizing: border-box;
    }

    .search-input:focus {
        outline: none;
        border-color: #00bcd4;
        box-shadow: 0 0 0 2px rgba(0, 188, 212, 0.2);
    }

    .clear-button {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: #808080;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 4px;
        line-height: 1;
    }

    .clear-button:hover {
        color: #e1e1e1;
    }
</style>
