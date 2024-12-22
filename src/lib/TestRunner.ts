interface TestResult {
    payload: string;
    success: boolean;
    details?: string;
    error?: string;
}

declare global {
    interface Window {
        polluted?: boolean;
    }
}

export class TestRunner {
    private testPayloads: Record<string, string[]>;

    constructor() {
        this.testPayloads = {
            xss: [
                '<img src=x onerror=alert(1)>',
                'javascript:alert(1)',
                '"><script>alert(1)</script>'
            ],
            prototypePollution: [
                '{"__proto__": {"polluted": true}}',
                '{"constructor": {"prototype": {"polluted": true}}}',
                '{"__proto__.[test]": "polluted"}'
            ],
            domClobbering: [
                '<form name="x"><input name="y"></form>',
                '<object name="x"></object>',
                '<img name="x">'
            ]
        };
    }

    async testElement(element: HTMLElement, testType: string): Promise<TestResult[]> {
        const results: TestResult[] = [];
        const payloads = this.testPayloads[testType];

        try {
            for (const payload of payloads) {
                if ('value' in element) {
                    const originalValue = (element as HTMLInputElement).value;
                    (element as HTMLInputElement).value = payload;
                    element.dispatchEvent(new Event('input'));

                    const result: TestResult = {
                        payload,
                        success: false,
                        details: ''
                    };

                    switch (testType) {
                        case 'xss':
                            result.success = document.querySelector('script[src="x"]') !== null;
                            break;
                        case 'prototypePollution':
                            result.success = window.polluted === true;
                            break;
                        case 'domClobbering': {
                            const elementName = element.getAttribute('name') || '';
                            result.success = elementName in window;
                            break;
                        }
                    }

                    results.push(result);
                    (element as HTMLInputElement).value = originalValue;
                }
            }
        } catch (error) {
            results.push({
                payload: 'Error during test execution',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }

        return results;
    }
}