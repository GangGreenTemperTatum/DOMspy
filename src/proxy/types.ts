export interface ProxyConfig {
    enabled: boolean;
    scheme: 'http' | 'https' | 'socks4' | 'socks5';
    host: string;
    port: number;
    username?: string;
    password?: string;
}

export interface ProxyManager {
    setProxy(config: ProxyConfig): Promise<void>;
    disable(): Promise<void>;
    getStatus(): Promise<{
        enabled: boolean;
        config: ProxyConfig | null;
    }>;
}
