# DOMspy Chrome Extension

DOMspy is a Chrome DevTools extension focused on DOM security research and analysis. Currently available on the Chrome Web Store, this project is in active development with advanced testing features coming soon.

<br clear="left"/>

<div align="center">

<img src="public/images/DOMspy.png" width="64" height="64" align="center" style="margin-right: 12px"/>

<br>
<br>

[![Available in the Chrome Web Store](https://img.shields.io/chrome-web-store/v/lkohdnochhmepplamlachopogndhkghm.svg)](https://chrome.google.com/webstore/detail/domspy/lkohdnochhmepplamlachopogndhkghm)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/GangGreenTemperTatum/DOMspy)](https://github.com/GangGreenTemperTatum/DOMspy/releases)
[![GitHub stars](https://img.shields.io/github/stars/GangGreenTemperTatum/DOMspy?style=social)](https://github.com/GangGreenTemperTatum/DOMspy/stargazers)
[![GitHub license](https://img.shields.io/github/license/GangGreenTemperTatum/DOMspy)](https://github.com/GangGreenTemperTatum/DOMspy/blob/main/LICENSE)

[Chrome Web Store](https://chrome.google.com/webstore/detail/domspy/lkohdnochhmepplamlachopogndhkghm) •
[Report Bug](https://github.com/GangGreenTemperTatum/DOMspy/issues) •
[Request Feature](https://github.com/GangGreenTemperTatum/DOMspy/issues)

</div>

<br>

- [DOMspy Chrome Extension](#domspy-chrome-extension)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Setup Instructions](#setup-instructions)
  - [Loading the Extension in Chrome](#loading-the-extension-in-chrome)
  - [Testing the Extension](#testing-the-extension)
  - [Key Controls](#key-controls)
  - [Extension Features](#extension-features)
    - [Element Tester Tab (**Coming soon**)](#element-tester-tab-coming-soon)
    - [DOM Analyzer Tab](#dom-analyzer-tab)
  - [Use Cases](#use-cases)
    - [Security Testing (**Coming soon**)](#security-testing-coming-soon)
    - [Performance Analysis](#performance-analysis)
    - [Development Workflow](#development-workflow)
  - [Development](#development)
    - [Project Structure](#project-structure)
    - [Key Components](#key-components)
    - [Development Workflow](#development-workflow-1)
      - [Destroy and Restart Environment](#destroy-and-restart-environment)
    - [Component Architecture](#component-architecture)
    - [Technology Stack](#technology-stack)
    - [Svelte Highlights](#svelte-highlights)
  - [Security Considerations](#security-considerations)
  - [Updating the Extension](#updating-the-extension)
  - [Contributing and Supporting](#contributing-and-supporting)
    - [Star History](#star-history)
  - [License](#license)
  - [Development Notes](#development-notes)
  - [Best Practices](#best-practices)

---

## Features
- Web Message Interception & Monitoring
- Prototype Pollution Detection
- DOM Clobbering Detection
- DevTools Panel Integration
- Real-time DOM Element Highlighting
- Interactive Payload Testing
- Message Modification and Replay

---

## Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)
- Chrome Browser

---

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/GangGreenTemperTatum/DOMspy.git
   cd DOMspy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

---

## Loading the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select the `dist` directory from your project folder
5. The extension icon should appear in your Chrome toolbar
   - If you don't see it, click the puzzle piece icon
   - Find "DOMspy" in the list
   - Click the pin icon to keep it visible

---

## Testing the Extension

1. Click the extension icon to open the popup interface
2. Visit any webpage
3. Hold the Alt key (Option key on Mac) to enter highlight mode
4. While holding Alt/Option:
   - Move your mouse over elements to highlight them
   - Click an element to persist its highlight (shown in green)
   - Click a persisted element again to remove the highlight
5. Release Alt/Option key to:
   - Exit highlight mode
   - Return to normal page interaction
   - Use links and buttons normally
6. Test message interception using the console:
   ```typescript
   window.postMessage({test: "Hello from DOMspy!"}, "*");
   ```

## Key Controls
- **Alt/Option Key**:
  - Hold: Enter highlight mode
  - Release: Exit highlight mode
- **Mouse Movement**:
  - Hover over elements while holding Alt/Option to highlight
- **Click**:
  - While highlighting: Persist element highlight
  - Normal mode: Regular page interaction
  - On persisted element: Remove highlight

---

## Extension Features

### Element Tester Tab (**Coming soon**)
The Element Tester provides interactive DOM element security testing:

1. **Element Selection**
   - Hover over any element on the page to highlight it
   - Click to select an element for testing
   - Selected element details (tag, ID, classes) are displayed

2. **Security Tests**
   - XSS Testing: Attempts to inject JavaScript via element properties
   - Prototype Pollution: Tests for JavaScript prototype chain vulnerabilities
   - DOM Clobbering: Checks for HTML element naming conflicts

3. **Real-time Feedback**
   - Messages show test execution status
   - Results are color-coded (green for success, red for errors)
   - Detailed error messages for debugging

### DOM Analyzer Tab
The DOM Analyzer provides deep insights into page structure:

1. **DOM Summary**
   - Total node count
   - Maximum DOM depth
   - Total size in characters
   - Number of unique element types

2. **Element Distribution**
   - Shows all HTML element types used
   - Count of instances per element type
   - Sortable by frequency

3. **Complex Elements Analysis**
   - Lists most complex DOM structures
   - Click elements to see detailed attributes
   - Shows element hierarchy and children
   - Identifies potential performance bottlenecks

4. **Sorting Options**
   - By Node Count: Elements with most children
   - By Depth: Deepest nested elements
   - By Length: Largest elements by character count

## Use Cases

### Security Testing (**Coming soon**)
1. **XSS Detection**
   ```javascript
   // Tests if element allows script injection
   payload: "<img src=x onerror=alert(1)>"
   ```

2. **Prototype Pollution**
   ```javascript
   // Tests object prototype manipulation
   payload: "__proto__[test]=polluted"
   ```

3. **DOM Clobbering**
   ```javascript
   // Tests HTML element naming conflicts
   payload: "<form name='x'><input name='y'></form>"
   ```

### Performance Analysis
1. **DOM Complexity Assessment**
   - Identify deep nesting (performance impact)
   - Find large DOM subtrees
   - Analyze element distribution

2. **Structure Analysis**
   - Track DOM hierarchy
   - Identify problematic patterns
   - Monitor DOM size metrics

### Development Workflow
1. **Element Investigation**
   - Select elements for testing
   - View detailed properties
   - Monitor changes in real-time

2. **Test Execution**
   - Run security tests
   - View immediate results
   - Debug issues with detailed logs

---

## Development

### Project Structure
```shell
DOMspy/
│   manifest.json          # Chrome extension manifest
├── src/                          # Source code
│   ├── background/              # Chrome extension background service worker
│   │   └── background.ts       # Background script for extension
│   ├── content-scripts/        # Scripts injected into web pages
│   │   └── content.ts         # Main content script for DOM interaction
│   ├── lib/                   # Shared utilities and core functionality
│   │   ├── DOMAnalyzer.ts    # DOM structure analysis tools
│   │   ├── DOMHighlighter.ts # Element highlighting functionality
│   │   ├── MessageLogger.ts  # Message logging system
│   │   ├── TestRunner.ts    # Security test execution engine
│   │   └── logger.ts       # Core logging singleton
│   ├── popup/              # Extension popup interface
│   │   ├── Popup.svelte   # Main popup component
│   │   ├── components/    # UI components
│   │   │   ├── DOMAnalyzer.svelte    # DOM analysis interface
│   │   │   ├── ElementSelector.svelte # Element selection UI
│   │   │   ├── MessageLogger.svelte   # Message display
│   │   │   └── TestPanel.svelte      # Security test controls
│   │   └── popup.ts               # Popup initialization
│   └── types/                    # TypeScript type definitions
│       └── svelte.d.ts          # Svelte type declarations
├── public/                      # Static assets
│   ├── images/                 # Extension icons and images
│   └── popup.html            # Popup entry point
├── scripts/                  # Build and utility scripts
│   ├── build.ts            # Main build script
│   └── update-imports.js   # Import path updater
├── dist/                   # Built extension files (generated)
└── config files           # Configuration files
    ├── vite.config.ts    # Vite bundler configuration
    ├── tsconfig.json    # TypeScript configuration
    ├── eslintrc.ts     # ESLint configuration
    └── prettier.rc     # Prettier configuration
```

### Key Components

1. **DOM Analysis**
   - `DOMAnalyzer.ts`: Analyzes page structure
   - `DOMHighlighter.ts`: Visual element highlighting
   - Features: depth analysis, node counting, complexity metrics

2. **Security Testing**
   - `TestRunner.ts`: Test execution engine
   - Tests: XSS, Prototype Pollution, DOM Clobbering
   - Real-time result reporting

3. **User Interface**
   - Two main tabs:
     - Element Tester: Security testing interface
     - DOM Analyzer: Structure analysis tools
   - Dark mode themed
   - Interactive element selection

4. **Build System**
   - Vite for bundling
   - TypeScript compilation
   - Svelte component processing
   - Asset management

5. **Extension Architecture**
   - Background service worker
   - Content script injection
   - Popup interface
   - Message passing system

### Development Workflow

1. **Making Changes**
   ```bash
   # Make your code changes
   npm run build    # Build the extension
   ```

2. **Testing Changes**
   - Go to `chrome://extensions/`
   - Find DOMspy in the list
   - Click the refresh/reload icon (🔄)
   - No need to remove and re-add the extension

   Note: Full reinstall is only needed when:
   - Changing `manifest.json`
   - Adding new permissions
   - Changing extension structure
   - Modifying service workers

3. **Development Commands**
   ```bash
   # Start development server
   npm run dev

   # Build for production
   npm run build

   # Quick rebuild and test
   npm run clean && npm run build
   # Then just reload the extension in Chrome
   ```

#### Destroy and Restart Environment

```shell
rm -rf node_modules package-lock.json
rm -rf dist
npm install
npm run build
```

For production build:

`npm run clean && npm run build`

### Component Architecture
- `Popup.svelte`: Main container component
- `ElementSelector.svelte`: Handles DOM element selection and display
- `TestPanel.svelte`: Security test payload execution
- `MessageLogger.svelte`: Message monitoring and display
- `DOMAnalyzer.svelte`: DOM structure analysis visualization

### Technology Stack
- Svelte for UI components
- TypeScript for type safety
- Chrome Extension APIs
- Native DOM manipulation

### Svelte Highlights
- Built with Svelte for reactive UI components
- Uses Svelte stores for state management
- Component-based architecture for maintainability
- Fast runtime performance with minimal overhead

An example flow of the code, this is a standard structure for Svelte-based Chrome extensions. You need all three files (example being `popup.X`) because:

   - Chrome requires an HTML entry point
   - Svelte needs an initializer to mount the component
   - The Svelte component contains the actual implementation

      ```typescript
      Chrome Extension -> popup.html -> popup.ts -> Popup.svelte
      (manifest)        (container)    (initializer) (component)
      ```

---

## Security Considerations
- This is a security testing tool - use responsibly
- Only test on systems you have permission to test
- Be cautious with payload execution
- Monitor for unintended side effects

---

## Updating the Extension
During development:
1. Make your changes
2. Run `npm run build`
3. Go to `chrome://extensions/`
4. Click the refresh icon on the DOMspy card

---

## Contributing and Supporting
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

[![GitHub stars](https://img.shields.io/github/stars/GangGreenTemperTatum/DOMspy.svg?style=social&label=Star&maxAge=2592000)](https://github.com/GangGreenTemperTatum/DOMspy/stargazers/)

### Star History

[![Star History Chart](https://api.star-history.com/svg?repos=GangGreenTemperTatum/DOMspy&type=Date)](https://star-history.com/#GangGreenTemperTatum/DOMspy&Date)

---

## License
This project is licensed under the MIT License - see the LICENSE file for details.

---

## Development Notes

- This is a security research project in active development
- Advanced testing features are coming soon
- Current focus is on DOM analysis and monitoring

## Best Practices
1. **Element Testing**
   - Test one element at a time
   - Monitor for unexpected changes
   - Check test results thoroughly

2. **DOM Analysis**
   - Regular complexity checks
   - Monitor performance metrics
   - Track DOM changes over time

3. **Security Testing**
   - Test in isolated environments
   - Document found vulnerabilities
   - Verify fixes with retesting