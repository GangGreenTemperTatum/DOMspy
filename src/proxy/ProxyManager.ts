import type { ProxyConfig, ProxyManager } from './types';
import { writable } from 'svelte/store';

export const proxyStore = writable<ProxyConfig | null>(null);
export const proxyStatus = writable<{ active: boolean; error?: string }>({ active: false });

class ChromeProxyManager implements ProxyManager {
    async setProxy(config: ProxyConfig): Promise<void> {
        try {
            const proxyConfig = {
                mode: "fixed_servers",
                rules: {
                    singleProxy: {
                        scheme: config.scheme,
                        host: config.host,
                        port: config.port
                    },
                    bypassList: ["localhost", "127.0.0.1"]
                }
            };

            console.log('Setting proxy configuration:', proxyConfig);

            await chrome.proxy.settings.set({
                value: proxyConfig,
                scope: 'regular'
            });

            // Verify the proxy was set correctly
            const settings = await chrome.proxy.settings.get({});
            console.log('Current proxy settings:', settings);

            if (settings.value.mode !== 'fixed_servers') {
                throw new Error('Proxy settings were not applied correctly');
            }

            await chrome.storage.local.set({ proxyConfig: config });
            proxyStore.set(config);
            proxyStatus.set({ active: true });

        } catch (error) {
            console.error('Proxy setup failed:', error);
            proxyStatus.set({ active: false, error: error.message });
            throw error;
        }
    }

    async disable(): Promise<void> {
        try {
            await chrome.proxy.settings.clear({ scope: 'regular' });
            await chrome.storage.local.remove('proxyConfig');
            proxyStore.set(null);
            proxyStatus.set({ active: false });
        } catch (error) {
            console.error('Failed to disable proxy:', error);
            throw error;
        }
    }

    async getStatus(): Promise<{ enabled: boolean; config: ProxyConfig | null }> {
        try {
            const settings = await chrome.proxy.settings.get({});
            console.log('Current proxy settings:', settings);

            const { proxyConfig } = await chrome.storage.local.get('proxyConfig');

            const enabled = settings.value.mode === 'fixed_servers';
            if (enabled && proxyConfig) {
                proxyStore.set(proxyConfig);
                proxyStatus.set({ active: true });
                return { enabled: true, config: proxyConfig };
            }

            proxyStatus.set({ active: false });
            return { enabled: false, config: null };
        } catch (error) {
            console.error('Failed to get proxy status:', error);
            proxyStatus.set({ active: false, error: error.message });
            return { enabled: false, config: null };
        }
    }
}

export const proxyManager = new ChromeProxyManager();
