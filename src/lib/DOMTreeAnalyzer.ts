interface TreeNode {
    id: string;
    label: string;
    tagName: string;
    attributes: Record<string, string>;
    children: TreeNode[];
    depth: number;
    path: string;
}

interface DOMNode {
    tag: string;
    attributes?: Record<string, string>;
    children: DOMNode[];
    text?: string;
}

export class DOMTreeAnalyzer {
    static normalizeAttributes(rawAttrs: any): Record<string, string> {
        if (!rawAttrs) return {};

        if (typeof rawAttrs === 'object' && !Array.isArray(rawAttrs)) {
            return rawAttrs;
        }

        if (Array.isArray(rawAttrs)) {
            return rawAttrs.reduce((acc, attr) => {
                const [key, value] = attr.split('=');
                acc[key] = value?.replace(/['"]/g, '') || '';
                return acc;
            }, {} as Record<string, string>);
        }

        return {};
    }

    static getNodeName(node: any): string {
        if (!node || (!node.tagName && !node.element)) return 'unknown';

        const rawName = (
            node.tagName?.toLowerCase() ||
            node.element?.tagName?.toLowerCase() ||
            node.element?.nodeName?.toLowerCase()
        );

        if (node.attributes) {
            const testId = node.attributes['data-testid'];
            const contentType = node.attributes['data-content-type'];
            if (testId || contentType) {
                return testId?.replace(/-/g, '_') ||
                       contentType?.replace(/-/g, '_') ||
                       rawName;
            }
        }

        return rawName || 'unknown';
    }

    static processNode(node: any, depth = 0, path = ''): TreeNode | null {
        if (!node) return null;

        const nodeName = this.getNodeName(node);
        const currentPath = path ? `${path} > ${nodeName}` : nodeName;
        const attrs = this.normalizeAttributes(node.attributes);

        return {
            id: Math.random().toString(36).substring(2),
            label: nodeName,
            tagName: nodeName,
            attributes: attrs,
            children: (node._children || [])
                .filter((child: any) => child && this.getNodeName(child) !== '#text')
                .map((child: any) => this.processNode(child, depth + 1, currentPath))
                .filter(Boolean) as TreeNode[],
            depth,
            path: currentPath
        };
    }

    static analyze(domData: any): DOMNode {
        if (!domData) return { tag: 'empty', children: [] };

        return {
            tag: domData.tag || domData.tagName || 'unknown',
            attributes: domData.attributes || {},
            children: (domData._children || domData.children || [])
                .map((child: any) => this.analyze(child))
                .filter(Boolean),
            text: domData.text
        };
    }

    static formatAttributeValue(value: string, maxLength = 50): string {
        if (!value || value.length <= maxLength) return value;

        if (value.startsWith('http')) {
            try {
                const url = new URL(value);
                return `${url.origin}/...${url.pathname.slice(-20)}`;
            } catch {
                return value.substring(0, maxLength - 3) + '...';
            }
        }

        return value.substring(0, maxLength - 3) + '...';
    }

    public analyzeDOMTree(): any {
        const rootNode = document.documentElement;
        return this.createNodeTree(rootNode);
    }

    private createNodeTree(node: Element): any {
        const nodeInfo = {
            tag: node.tagName.toLowerCase(),
            id: node.id || undefined,
            classes: Array.from(node.classList).join(' ') || undefined,
            children: [],
            text: node.childNodes.length === 1 && node.firstChild?.nodeType === Node.TEXT_NODE
                ? node.textContent?.trim()
                : undefined
        };

        const children = Array.from(node.children).filter(child =>
            !(child.nodeType === Node.TEXT_NODE && !child.textContent?.trim())
        );

        for (const child of children) {
            nodeInfo.children.push(this.createNodeTree(child));
        }

        return nodeInfo;
    }

    analyzeDOM(): DOMNode {
        try {
            const doc = document;
            console.log('Starting DOM analysis from document:', doc);

            const rootNode: DOMNode = {
                tag: '#document',
                children: []
            };

            try {
                if (doc.doctype) {
                    rootNode.children.push({
                        tag: '<!DOCTYPE html>',
                        children: []
                    });
                }

                if (doc.documentElement) {
                    const htmlNode = this.analyzeNode(doc.documentElement);
                    if (htmlNode) {
                        rootNode.children.push(htmlNode);
                    }
                }
            } catch (innerError) {
                console.error('Error processing DOM nodes:', innerError);
            }

            console.log('Analyzed DOM tree:', rootNode);
            return rootNode;

        } catch (error) {
            console.error('Error in analyzeDOM:', error);
            return {
                tag: '#document',
                children: [{
                    tag: 'error',
                    text: 'Failed to analyze DOM',
                    children: []
                }]
            };
        }
    }

    private analyzeNode(node: Node): DOMNode | null {
        if (!node) return null;

        try {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent?.trim();
                if (!text) return null;
                return { tag: '#text', text, children: [] };
            }

            if (node.nodeType === Node.COMMENT_NODE) {
                const text = node.textContent?.trim();
                if (!text) return null;
                return { tag: '#comment', text, children: [] };
            }

            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                const attributes = {} as Record<string, string>;

                element.getAttributeNames().forEach(name => {
                    attributes[name] = element.getAttribute(name) || '';
                });

                const children = Array.from(node.childNodes)
                    .map(child => this.analyzeNode(child))
                    .filter((node): node is DOMNode => node !== null);

                return {
                    tag: element.tagName.toLowerCase(),
                    attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
                    children
                };
            }

            return null;
        } catch (error) {
            console.error('Error analyzing node:', error, node);
            return {
                tag: 'error',
                text: `Failed to analyze node: ${error instanceof Error ? error.message : String(error)}`,
                children: []
            };
        }
    }

    private getElementAttributes(element: Element): Record<string, string> {
        const attrs: Record<string, string> = {};
        for (const attr of element.attributes) {
            attrs[attr.name] = attr.value;
        }
        return attrs;
    }
}
