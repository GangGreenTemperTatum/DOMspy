interface HighlightedElement {
    element: HTMLElement;
    originalStyles: {
        backgroundColor: string;
        outline: string;
        transition: string;
    };
}

export class DOMHighlighter {
    private currentHighlight: HTMLElement | null = null;
    private persistedHighlights: Set<HTMLElement> = new Set();
    private highlightClass = 'dom-invader-highlight';
    private persistedClass = 'dom-invader-persisted';
    private isActive = false;
    private isHighlightingMode = false;
    private handlers: Map<HTMLElement, (e: MouseEvent) => void> = new Map();

    constructor() {
        this.initialize();
    }

    private initialize() {
        const style = document.createElement('style');
        style.textContent = `
            .${this.highlightClass} {
                outline: 2px solid #ff0000 !important;
                outline-offset: 1px !important;
            }
            .${this.persistedClass} {
                outline: 2px solid #00ff00 !important;
                outline-offset: 1px !important;
            }
        `;
        document.head.appendChild(style);
    }

    public enable() {
        this.isActive = true;
        this.setupKeyListeners();
        console.log('DOMHighlighter enabled - Active state:', this.isActive);
    }

    public disable() {
        this.isActive = false;
        this.isHighlightingMode = false;

        this.handlers.forEach((handler, element) => {
            element.removeEventListener('click', handler);
        });
        this.handlers.clear();

        this.clearAllHighlights();
        this.removeKeyListeners();
    }

    private setupKeyListeners() {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    private removeKeyListeners() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }

    private handleKeyDown = (e: KeyboardEvent) => {
        if (e.altKey && this.isActive) {
            this.isHighlightingMode = true;
            console.log('Highlight mode enabled:', {
                isActive: this.isActive,
                isHighlightingMode: this.isHighlightingMode
            });
        }
    }

    private handleKeyUp = (e: KeyboardEvent) => {
        if (!e.altKey) {
            this.isHighlightingMode = false;
            console.log('Highlight mode disabled:', {
                isActive: this.isActive,
                isHighlightingMode: this.isHighlightingMode
            });

            if (this.currentHighlight && !this.persistedHighlights.has(this.currentHighlight)) {
                this.currentHighlight.classList.remove(this.highlightClass);
                this.removeClickHandler(this.currentHighlight);
                this.currentHighlight = null;
            }

            this.handlers.forEach((handler, element) => {
                element.removeEventListener('click', handler);
            });
            this.handlers.clear();
        }
    }

    public highlight(element: HTMLElement) {
        console.log('Highlight called:', {
            isActive: this.isActive,
            isHighlightingMode: this.isHighlightingMode,
            element: element.tagName
        });

        if (!this.isActive || !this.isHighlightingMode) return;

        if (this.currentHighlight && !this.persistedHighlights.has(this.currentHighlight)) {
            this.currentHighlight.classList.remove(this.highlightClass);
            this.removeClickHandler(this.currentHighlight);
        }

        if (!this.persistedHighlights.has(element)) {
            element.classList.add(this.highlightClass);
            this.currentHighlight = element;
            this.addClickHandler(element);
        }
    }

    private addClickHandler(element: HTMLElement) {
        this.removeClickHandler(element);

        const handler = (e: MouseEvent) => {
            if (!this.isActive || !this.isHighlightingMode) return;
            e.preventDefault();
            e.stopPropagation();
            this.persistHighlight(element);
        };

        element.addEventListener('click', handler);
        this.handlers.set(element, handler);
        element.setAttribute('data-dom-invader-click', 'true');
    }

    private removeClickHandler(element: HTMLElement) {
        const handler = this.handlers.get(element);
        if (handler) {
            element.removeEventListener('click', handler);
            this.handlers.delete(element);
        }
        element.removeAttribute('data-dom-invader-click');
    }

    private persistHighlight(element: HTMLElement) {
        if (this.persistedHighlights.has(element)) {
            this.persistedHighlights.delete(element);
            element.classList.remove(this.persistedClass);
        } else {
            this.persistedHighlights.add(element);
            element.classList.remove(this.highlightClass);
            element.classList.add(this.persistedClass);
        }
    }

    public clearAllHighlights() {
        if (this.currentHighlight) {
            this.currentHighlight.classList.remove(this.highlightClass);
            this.currentHighlight = null;
        }

        this.persistedHighlights.forEach(element => {
            element.classList.remove(this.persistedClass);
        });
        this.persistedHighlights.clear();
    }

    public clearHighlights(): void {
        this.clearAllHighlights();
    }

    public isInHighlightMode(): boolean {
        return this.isHighlightingMode;
    }
}