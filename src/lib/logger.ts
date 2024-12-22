export class Logger {
    private static instance: Logger | null = null;

    private constructor() {
        // Private constructor to enforce singleton pattern
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    log(message: string, data?: any): void {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${message}`);
        if (data) console.log(data);
    }

    error(message: string, error?: Error): void {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] ERROR: ${message}`);
        if (error) console.error(error);
    }
}

export const logger = Logger.getInstance();