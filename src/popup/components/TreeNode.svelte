<script lang="ts">
    export let node: any;
    export let expanded = false;
    let selected = false;

    function toggleExpanded() {
        expanded = !expanded;
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleExpanded();
        }
    }

    function handleSelect() {
        selected = !selected;
        toggleExpanded();
    }

    function formatNodeDisplay(node: any): string {
        if (!node) return 'undefined';
        console.log('Formatting node:', node);
        if (node.tag === '#document') return '#document';
        if (node.tag === '#text') return `"${node.text}"`;
        if (node.tag === '#comment') return `<!-- ${node.text} -->`;
        if (node.tag === '<!DOCTYPE html>') return '<!DOCTYPE html>';

        let display = `<${node.tag}`;

        if (node.attributes && Object.keys(node.attributes).length > 0) {
            const attrs = Object.entries(node.attributes)
                .map(([key, value]) => `${key}="${value}"`)
                .join(' ');
            display += attrs.length > 40 ? '\n  ' + attrs : ' ' + attrs;
        }

        display += '>';
        return display;
    }
</script>

<div
    class="tree-node"
    role="treeitem"
    aria-expanded={expanded}
    aria-selected={selected}
>
    <button
        class="node-content selectable"
        on:click={handleSelect}
        on:keydown={handleKeydown}
        type="button"
        aria-label={`Toggle ${node.tag || 'unknown'} node`}
    >
        <span class="expander" aria-hidden="true">
            {node.children?.length ? (expanded ? '▼' : '▶') : '•'}
        </span>
        <span class="tag selectable" class:has-children={node.children?.length > 0}>
            {formatNodeDisplay(node)}
        </span>
    </button>

    {#if expanded && node.children?.length}
        <div class="children selectable" role="group">
            {#each node.children as child}
                <svelte:self node={child} />
            {/each}
        </div>
    {/if}
</div>

<style>
    .tree-node {
        padding-left: 1.5rem;
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
        color: #e1e1e1;
    }

    .node-content {
        cursor: pointer;
        padding: 4px 8px;
        background: none;
        border: none;
        font-family: inherit;
        font-size: inherit;
        color: inherit;
        display: flex;
        align-items: flex-start;
        width: 100%;
        text-align: left;
        border-radius: 4px;
        white-space: pre-wrap;
        word-break: break-word;
    }

    .node-content:hover {
        background-color: #404040;
        cursor: pointer;
    }

    .node-content:focus {
        outline: none;
        background-color: #404040;
        box-shadow: 0 0 0 2px #00bcd4;
    }

    .expander {
        display: inline-block;
        width: 1.5rem;
        color: #808080;
        font-size: 0.8em;
        user-select: none;
        -webkit-user-select: none;
        cursor: pointer;
    }

    .children {
        border-left: 1px dotted #404040;
        margin-left: 0.5rem;
    }

    .tree-node[aria-selected="true"] > .node-content {
        background-color: #004d40;
    }

    .tag {
        color: #00bcd4;
        white-space: pre-wrap;
        word-break: break-word;
        overflow-wrap: break-word;
        max-width: calc(100% - 2rem);
        display: inline-block;
    }

    .tag.has-children {
        font-weight: 500;
    }

    .tag :global([data-type]) {
        all: unset;
    }

    :global(.attribute-name) {
        color: #4caf50;
    }

    :global(.attribute-value) {
        color: #ff9800;
    }

    :global(.text-content) {
        color: #9e9e9e;
    }

    .selectable {
        user-select: text;
        -webkit-user-select: text;
        cursor: text;
    }

    button.selectable {
        user-select: text;
        -webkit-user-select: text;
    }

    button.selectable::selection,
    button.selectable *::selection {
        background-color: rgba(0, 188, 212, 0.3);
        color: inherit;
    }
</style>
