interface Message {
    data: any;
    origin: string;
    source: Window | MessagePort | ServiceWorker | null;
    timestamp: string;
}

interface MessageListener {
    (message: Message): void;
}

export class MessageLogger {
    private messages: Message[];
    private listeners: Set<MessageListener>;

    constructor() {
        this.messages = [];
        this.listeners = new Set();
        this.initMessageListener();
    }

    public addListener(listener: MessageListener): void {
        this.listeners.add(listener);
    }

    public removeListener(listener: MessageListener): void {
        this.listeners.delete(listener);
    }

    private initMessageListener(): void {
        window.addEventListener('message', (event: MessageEvent) => {
            const message: Message = {
                data: event.data,
                origin: event.origin,
                source: event.source,
                timestamp: new Date().toISOString()
            };
            this.messages.push(message);
            this.notifyNewMessage(message);
        });
    }

    private notifyNewMessage(message: Message): void {
        this.listeners.forEach(listener => {
            try {
                listener(message);
            } catch (error) {
                console.error('Error in message listener:', error);
            }
        });

        if (message.data?.type === 'error' || message.data?.priority === 'high') {
            console.warn('Important message received:', message);
        }
    }

    resendMessage(message: Message, targetOrigin: string = '*'): void {
        window.postMessage(message.data, targetOrigin);
    }

    modifyAndResendMessage(message: Message, modifications: Record<string, any>, targetOrigin: string = '*'): void {
        const modifiedData = { ...message.data, ...modifications };
        window.postMessage(modifiedData, targetOrigin);
    }

    getMessages(): Message[] {
        return this.messages;
    }
}