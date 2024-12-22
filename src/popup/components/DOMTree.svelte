<script lang="ts">
    import TreeNode from './TreeNode.svelte';
    import SearchBar from './SearchBar.svelte';

    export let domAnalysis: any = { tag: '#document', children: [] };
    let processedTree: any = null;
    let searchQuery = "";

    $: {
        console.log('DOMTree received analysis:', domAnalysis);
        if (domAnalysis) {
            try {
                processedTree = domAnalysis.tag === '#document' ?
                    domAnalysis :
                    (domAnalysis.success && domAnalysis.treeData ?
                        domAnalysis.treeData :
                        { tag: '#document', children: [] });

                console.log('Processed tree:', processedTree);
            } catch (error) {
                console.error('Error processing tree data:', error);
                processedTree = { tag: '#document', children: [] };
            }
        }
    }

    function formatNode(node: any, depth = 0): string {
        if (!node) return '';
        const indent = '  '.repeat(depth);

        if (node.tag === '#text') return `${indent}"${node.text}"`;
        if (node.tag === '#comment') return `${indent}<!-- ${node.text} -->`;
        if (node.tag === '<!DOCTYPE html>') return `${indent}<!DOCTYPE html>`;

        let output = `${indent}<${node.tag}`;

        if (node.attributes && Object.keys(node.attributes).length > 0) {
            Object.entries(node.attributes).forEach(([key, value]) => {
                output += ` ${key}="${value}"`;
            });
        }

        if (node.children && node.children.length > 0) {
            output += '>\n';
            output += node.children
                .map((child: any) => formatNode(child, depth + 1))
                .join('\n');
            output += `\n${indent}</${node.tag}>`;
        } else {
            output += ' />';
        }

        return output;
    }

    function copyTreeToClipboard() {
        if (!processedTree) return;
        const treeText = formatNode(processedTree);
        navigator.clipboard.writeText(treeText);
    }

    function copyFilteredTreeToClipboard() {
        if (!filteredTree) return;
        const treeText = formatNode(filteredTree);
        navigator.clipboard.writeText(treeText);
    }

    function filterTree(node: any, query: string): any {
        if (!node) return null;
        if (!query) return node;

        const searchText = query.toLowerCase();
        const matches = (text: string) => text.toLowerCase().includes(searchText);

        const nodeMatches = matches(node.tag) ||
            (node.text && matches(node.text)) ||
            (node.attributes && Object.entries(node.attributes)
                .some(([key, value]) => matches(key) || matches(value)));

        if (nodeMatches) {
            return {...node};
        }

        if (node.children && node.children.length > 0) {
            const filteredChildren = node.children
                .map((child: any) => filterTree(child, query))
                .filter(Boolean);

            if (filteredChildren.length > 0) {
                return {
                    ...node,
                    children: filteredChildren
                };
            }
        }

        return null;
    }

    $: filteredTree = searchQuery ?
        filterTree(processedTree, searchQuery) :
        processedTree;

    async function handleExport(filtered = false) {
        console.log('Export initiated:', { filtered });
        const tree = filtered ? filteredTree : processedTree;
        if (!tree) {
            console.error('No tree data to export');
            return;
        }

        try {
            const treeText = formatNode(tree);
            const timestamp = new Date().toISOString().replace(/[\.:]/g, '-').slice(0, 19);
            const prefix = filtered ? 'filtered-dom' : 'full-dom';
            const ext = filtered ? '.txt' : '.html';
            const filename = `${prefix}-${timestamp}${ext}`;

            const content = filtered ? treeText : `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DOM Tree Export - ${timestamp}</title>
    <style>
        body { background: #1a1a1a; color: #e1e1e1; font-family: monospace; padding: 2rem; }
        pre { background: #2a2a2a; padding: 2rem; border-radius: 8px; }
    </style>
</head>
<body>
    <pre>${treeText}</pre>
</body>
</html>`;

            console.log('Sending download message:', { filename, type: filtered ? 'text/plain' : 'text/html' });

            chrome.runtime.sendMessage({
                action: 'downloadFile',
                data: {
                    content,
                    filename,
                    type: filtered ? 'text/plain' : 'text/html'
                }
            }, (response) => {
                console.log('Download response:', response);
                if (response?.success) {
                    console.log('Download initiated:', filename);
                } else {
                    console.error('Download failed:', response?.error);
                }
            });

        } catch (error) {
            console.error('Export failed:', error);
        }
    }
</script>

<div class="dom-tree-container selectable">
    <div class="tree-header">
        <h3>DOM Tree</h3>
        <div class="button-group">
            <button
                type="button"
                class="action-button"
                on:click={() => copyTreeToClipboard()}
                disabled={!processedTree}
                title="Copy complete DOM tree"
            >
                Copy All
            </button>
            <button
                type="button"
                class="action-button"
                on:click={() => handleExport(false)}
                disabled={!processedTree}
                title="Export complete DOM tree as HTML file"
            >
                Export HTML
            </button>
            {#if searchQuery}
                <button
                    type="button"
                    class="action-button"
                    on:click={() => copyFilteredTreeToClipboard()}
                    disabled={!filteredTree}
                    title="Copy filtered/matching elements"
                >
                    Copy Filtered
                </button>
                <button
                    type="button"
                    class="action-button"
                    on:click={() => handleExport(true)}
                    disabled={!filteredTree}
                    title="Export filtered tree as text"
                >
                    Export Filtered
                </button>
            {/if}
        </div>
    </div>

    <SearchBar
        placeholder="Search in DOM tree..."
        bind:value={searchQuery}
        onSearch={(query) => searchQuery = query}
    />

    <div class="tree-content" role="tree" aria-label="DOM tree structure">
        {#if filteredTree}
            <TreeNode node={filteredTree} expanded={!!searchQuery} />
        {:else if searchQuery}
            <p class="placeholder">No matching elements found</p>
        {:else}
            <p class="placeholder">
                {domAnalysis?.error || 'Loading DOM tree...'}
            </p>
        {/if}
    </div>
</div>

<style>
    .dom-tree-container {
        max-height: 500px;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 1rem;
        background: #333;
        border-radius: 8px;
        color: #e1e1e1;
        width: 100%;
        box-sizing: border-box;
    }

    .tree-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .tree-header h3 {
        color: #00bcd4;
        margin: 0;
        font-size: 1.1rem;
    }

    .button-group {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        flex-wrap: wrap;
    }

    .tree-content {
        background: #2a2a2a;
        border: 1px solid #404040;
        border-radius: 6px;
        padding: 1rem;
        font-size: 13px;
        line-height: 1.5;
        width: 100%;
        box-sizing: border-box;
        word-wrap: break-word;
        overflow-x: hidden;
        user-select: text;
        -webkit-user-select: text;
    }

    .placeholder {
        color: #808080;
        text-align: center;
        padding: 2rem;
    }

    .selectable {
        user-select: text;
        -webkit-user-select: text;
        cursor: text;
    }

    ::selection {
        background-color: rgba(0, 188, 212, 0.3);
        color: inherit;
    }

    .action-button {
        font-size: 0.9rem;
        padding: 6px 12px;
        background: #2a2a2a;
        color: #e1e1e1;
        border: 1px solid #404040;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 80px;
        font-weight: 500;
        user-select: none;
        -webkit-user-select: none;
    }

    .action-button:hover:not(:disabled) {
        background: #404040;
        border-color: #00bcd4;
        color: #00bcd4;
    }

    .action-button:active:not(:disabled) {
        background: #333;
        transform: translateY(1px);
    }

    .action-button:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(0, 188, 212, 0.3);
    }

    .action-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: #333;
    }

    .button-group {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        flex-wrap: wrap;
    }
</style>
