interface DOMData {
  element: Element;
  tagName: string;
  nodes: number;
  depth: number;
  length: number | 'NA';
  _children: DOMData[];
  attributes?: { [key: string]: string };
  path?: string;
}

export class DOMAnalyzer {
    static analyze(root: Element | Document = document, order: 'nodes' | 'depth' | 'length' = 'nodes') {
        let maxDepth = 0;

        const processNode = (element: Element | Document | ChildNode, depth = 0, path = ''): any => {
            const nodeName = element.nodeName.toLowerCase();
            const currentPath = path ? `${path} > ${nodeName}` : nodeName;
            maxDepth = Math.max(maxDepth, depth);

            if (element.nodeType === Node.DOCUMENT_NODE) {
                const doc = element as Document;
                const children = [];

                if (doc.doctype) {
                    children.push({
                        tagName: '<!DOCTYPE>',
                        element: doc.doctype,
                        attributes: {},
                        path: '<!DOCTYPE>',
                        depth: depth + 1,
                        nodes: 1,
                        _children: []
                    });
                }

                const allNodes = [doc.documentElement, ...Array.from(doc.head?.childNodes || []), ...Array.from(doc.body?.childNodes || [])];
                for (const node of allNodes) {
                    const processed = processNode(node, depth + 1, currentPath);
                    if (processed) children.push(processed);
                }

                return {
                    tagName: '#document',
                    element: doc,
                    attributes: {},
                    path: currentPath,
                    depth,
                    nodes: getTotalNodeCount(children),
                    _children: children
                };
            }

            if (element.nodeType === Node.ELEMENT_NODE) {
                const el = element as Element;
                const attributes = Array.from(el.attributes || [])
                    .reduce((acc, attr) => {
                        acc[attr.name] = attr.value;
                        return acc;
                    }, {} as Record<string, string>);

                const children = Array.from(el.childNodes)
                    .map(child => processNode(child, depth + 1, currentPath))
                    .filter(Boolean);

                const totalNodes = getTotalNodeCount(children) + 1;

                return {
                    tagName: nodeName,
                    element: el,
                    attributes,
                    path: currentPath,
                    depth,
                    nodes: totalNodes,
                    _children: children
                };
            }

            if (element.nodeType === Node.TEXT_NODE && element.textContent?.trim()) {
                return {
                    tagName: '#text',
                    element,
                    text: element.textContent.trim(),
                    path: currentPath,
                    depth,
                    nodes: 1,
                    _children: []
                };
            }

            if (element.nodeType === Node.COMMENT_NODE) {
                return {
                    tagName: '#comment',
                    element,
                    text: element.textContent,
                    path: currentPath,
                    depth,
                    nodes: 1,
                    _children: []
                };
            }

            return null;
        };

        function getTotalNodeCount(children: any[]): number {
            if (!children || !children.length) return 0;
            return children.reduce((count, child) =>
                count + (child.nodes || 1) + getTotalNodeCount(child._children || []), 0);
        }

        const analysis = processNode(root);

        const sortChildren = (node: any) => {
            if (node._children?.length) {
                node._children.sort((a: any, b: any) => {
                    switch (order) {
                        case 'nodes':
                            return b.nodes - a.nodes;
                        case 'depth':
                            return b.depth - a.depth;
                        case 'length':
                            return (b.element?.outerHTML?.length || 0) -
                                   (a.element?.outerHTML?.length || 0);
                        default:
                            return 0;
                    }
                });
                node._children.forEach(sortChildren);
            }
        };

        sortChildren(analysis);
        return analysis;
    }
}