<script lang="ts">
    import { onMount } from 'svelte';
    import { proxyStore, proxyStatus } from '../../proxy/ProxyManager';
    import { proxyManager } from '../../proxy/ProxyManager';
    import type { ProxyConfig } from '../../proxy/types';

    let loading = false;
    let message = { type: '', text: '' };
    let testingConnection = false;
    let config: ProxyConfig = {
        enabled: false,
        scheme: 'http',
        host: '',
        port: 8080,
        username: '',
        password: ''
    };

    onMount(async () => {
        try {
            const status = await proxyManager.getStatus();
            if (status.config) {
                config = status.config;
            }
        } catch (error) {
            console.error('Failed to load proxy settings:', error);
        }
    });

    $: if ($proxyStore) {
        config = $proxyStore;
    }

    async function handleSubmit() {
        loading = true;
        message = { type: '', text: '' };

        try {
            if (config.enabled) {
                await proxyManager.setProxy(config);
                message = { type: 'success', text: 'Proxy settings saved successfully' };
            } else {
                await proxyManager.disable();
                message = { type: 'success', text: 'Proxy disabled successfully' };
            }
        } catch (error) {
            console.error('Proxy operation failed:', error);
            message = { type: 'error', text: 'Failed to save proxy settings' };
        } finally {
            loading = false;
        }
    }

    async function testConnection() {
        testingConnection = true;
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            message = {
                type: 'success',
                text: `Connection successful! IP: ${data.ip}`
            };
        } catch (error) {
            message = {
                type: 'error',
                text: `Connection failed: ${error.message}`
            };
        } finally {
            testingConnection = false;
        }
    }
</script>

<div class="proxy-settings">
    <h3>Proxy Settings</h3>

    <!-- Show current proxy status -->
    {#if $proxyStatus.active}
        <div class="status active">
            Proxy is active
        </div>
    {:else}
        <div class="status inactive">
            Proxy is inactive
            {#if $proxyStatus.error}
                <div class="error-details">
                    Error: {$proxyStatus.error}
                </div>
            {/if}
        </div>
    {/if}

    <form on:submit|preventDefault={handleSubmit}>
        <label>
            <input type="checkbox" bind:checked={config.enabled}>
            Enable Proxy
        </label>

        {#if config.enabled}
            <div class="form-group">
                <label>
                    Scheme:
                    <select bind:value={config.scheme}>
                        <option value="http">HTTP</option>
                        <option value="https">HTTPS</option>
                        <option value="socks4">SOCKS4</option>
                        <option value="socks5">SOCKS5</option>
                    </select>
                </label>
            </div>

            <div class="form-group">
                <label>
                    Host:
                    <input type="text" bind:value={config.host} required>
                </label>
            </div>

            <div class="form-group">
                <label>
                    Port:
                    <input type="number" bind:value={config.port} required>
                </label>
            </div>

            <div class="form-group">
                <label>
                    Username:
                    <input type="text" bind:value={config.username}>
                </label>
            </div>

            <div class="form-group">
                <label>
                    Password:
                    <input type="password" bind:value={config.password}>
                </label>
            </div>
        {/if}

        {#if message.text}
            <div class="message {message.type}">
                {message.text}
            </div>
        {/if}

        <button type="submit" disabled={loading}>
            {#if loading}
                Saving...
            {:else}
                {config.enabled ? 'Save Proxy Settings' : 'Disable Proxy'}
            {/if}
        </button>
    </form>

    {#if config.enabled && !loading}
        <button type="button" on:click={testConnection} disabled={testingConnection}>
            {testingConnection ? 'Testing...' : 'Test Connection'}
        </button>
    {/if}
</div>

<style>
    .proxy-settings {
        padding: 1rem;
    }

    .form-group {
        margin: 0.5rem 0;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
    }

    input, select {
        margin-left: 0.5rem;
    }

    button {
        margin-top: 1rem;
    }

    .message {
        padding: 0.5rem;
        margin: 1rem 0;
        border-radius: 4px;
    }

    .message.success {
        background: #4caf50;
        color: white;
    }

    .message.error {
        background: #f44336;
        color: white;
    }

    button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .status {
        padding: 0.5rem;
        margin: 0.5rem 0;
        border-radius: 4px;
        font-weight: bold;
    }

    .status.active {
        background: #4caf50;
        color: white;
    }

    .status.inactive {
        background: #ff9800;
        color: white;
    }

    .error-details {
        font-size: 0.9em;
        margin-top: 0.5rem;
        color: #f44336;
    }
</style>
