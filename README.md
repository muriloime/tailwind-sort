# tailwind-class-sorter

A standalone Tailwind CSS class sorter utility powered by [@herb-tools/tailwind-class-sorter](https://www.npmjs.com/package/@herb-tools/tailwind-class-sorter). This package provides Prettier-compatible sorting, deduplication, and organization of Tailwind classes with support for multiple languages and frameworks.

## Features

- **Prettier-Compatible Sorting** - Uses @herb-tools/tailwind-class-sorter for consistent, Prettier-compatible class ordering
- **Async API** - Modern async/await interface for all functions
- **Language Support** - Built-in support for HTML, JSX/TSX, Haml, and customizable patterns
- **CLI Tool** - Command-line interface for processing files
- **Ignore Comments** - Respect `headwind-ignore` and `headwind-ignore-all` comments
- **File & Text Processing** - Process entire files or text snippets programmatically
- **TypeScript Support** - Full type definitions included

## Installation

```bash
npm install tailwind-class-sorter
```

## Quick Start

### Programmatic Usage

```typescript
import { sortClassString } from 'tailwind-class-sorter';

// Sort classes (async)
const sorted = await sortClassString('px-4 container mx-auto text-center', {
  shouldRemoveDuplicates: true,
  shouldPrependCustomClasses: false,
  customTailwindPrefix: ''
});

console.log(sorted); // "container mx-auto px-4 text-center"
```

### CLI Usage

```bash
# Sort classes in a file
npx tailwind-class-sorter src/components/Button.tsx

# Process with custom config
npx tailwind-class-sorter src/index.html --config tailwind.config.json

# Keep duplicates
npx tailwind-class-sorter src/page.jsx --no-duplicates

# Use custom Tailwind prefix
npx tailwind-class-sorter src/app.tsx --prefix "tw-"
```

## API Reference

### `sortClassString(classString: string, options: Options): Promise<string>`

Sorts a string of CSS classes using @herb-tools/tailwind-class-sorter.

**Parameters:**
- `classString` - A space-separated string of CSS classes
- `options` - Configuration object:
  - `shouldRemoveDuplicates: boolean` - Whether to remove duplicate classes
  - `shouldPrependCustomClasses: boolean` - Whether custom classes appear before Tailwind classes
  - `customTailwindPrefix: string` - Custom prefix for Tailwind classes (e.g., "tw-")
  - `separator?: RegExp` - Optional custom separator pattern
  - `replacement?: string` - Optional custom replacement separator

**Returns:** `Promise<string>` - The sorted and optionally deduplicated string of classes

**Example:**
```typescript
import { sortClassString } from 'tailwind-class-sorter';

const sorted = await sortClassString('text-lg p-4 bg-blue-500 text-center', {
  shouldRemoveDuplicates: true,
  shouldPrependCustomClasses: false,
  customTailwindPrefix: ''
});

console.log(sorted); // "bg-blue-500 p-4 text-center text-lg"
```

### `processText(text: string, langConfig: LangConfig | LangConfig[], options: Options): Promise<string>`

Processes text and sorts Tailwind CSS classes found using language-specific regex patterns.

**Parameters:**
- `text` - The text content to process
- `langConfig` - Language configuration (string regex, array of regexes, or config object)
- `options` - Same options as `sortClassString`

**Returns:** `Promise<string>` - Text with sorted classes

**Example:**
```typescript
import { processText } from 'tailwind-class-sorter';

const html = '<div class="px-4 container mx-auto">Content</div>';
const processed = await processText(html, 'class="([^"]+)"', {
  shouldRemoveDuplicates: true,
  shouldPrependCustomClasses: false,
  customTailwindPrefix: ''
});

console.log(processed); // '<div class="container mx-auto px-4">Content</div>'
```

**Language Config Examples:**
```typescript
// Simple regex string
const htmlConfig = 'class="([^"]+)"';

// JSX/React
const jsxConfig = 'className="([^"]+)"';

// Haml
const hamlConfig = '\\.([\\._a-zA-Z0-9\\-]+)';

// Multiple patterns
const multiConfig = ['class="([^"]+)"', 'className="([^"]+)"'];

// With custom separator
const customConfig = {
  regex: 'class="([^"]+)"',
  separator: '\\.',
  replacement: '.'
};
```

### `processFile(filePath: string, langConfig: LangConfig | LangConfig[], options: Options): Promise<void>`

Processes a file and sorts Tailwind CSS classes in place.

**Parameters:**
- `filePath` - Path to the file to process
- `langConfig` - Language configuration for finding class strings
- `options` - Same options as `sortClassString`

**Returns:** `Promise<void>` - Resolves when file is processed and saved

**Example:**
```typescript
import { processFile } from 'tailwind-class-sorter';

// Process HTML file
await processFile('src/index.html', 'class="([^"]+)"', {
  shouldRemoveDuplicates: true,
  shouldPrependCustomClasses: false,
  customTailwindPrefix: ''
});

// Process JSX file
await processFile('src/App.jsx', 'className="([^"]+)"', {
  shouldRemoveDuplicates: true,
  shouldPrependCustomClasses: false,
  customTailwindPrefix: ''
});
```

### Utility Functions

#### `buildMatchers(value: LangConfig | LangConfig[]): Matcher[]`

Builds an array of matchers from language configuration. Converts various configuration formats into a normalized array of Matcher objects.

#### `getTextMatch(regexes: RegExp[], text: string, callback: Function, startPosition?: number): void`

Recursively matches text against a series of regular expressions. Used internally to extract class strings from nested language constructs.

## CLI Usage

The package includes a command-line tool for processing files directly.

### Command

```bash
tailwind-class-sorter <file> [options]
```

### Options

- `-c, --config <path>` - Path to config file with langConfig (JSON)
- `--no-duplicates` - Do not remove duplicate classes
- `--prepend-custom` - Place custom classes before Tailwind classes
- `--prefix <prefix>` - Custom Tailwind prefix (e.g., "tw-")

### Examples

```bash
# Basic usage
tailwind-class-sorter src/index.html

# With config file
tailwind-class-sorter src/app.tsx --config my-config.json

# Keep duplicates and use custom prefix
tailwind-class-sorter src/styles.jsx --no-duplicates --prefix "tw-"

# JSX files (automatically detected)
tailwind-class-sorter src/components/Button.tsx
```

### Config File Format

```json
{
  "langConfig": "className=\"([^\"]+)\""
}
```

Or with multiple patterns:

```json
{
  "langConfig": [
    "class=\"([^\"]+)\"",
    "className=\"([^\"]+)\""
  ]
}
```

## Ignore Comments

You can prevent sorting of specific classes using special comments:

### `headwind-ignore`

Prevents sorting of a single class string:

```html
<!-- headwind-ignore -->
<div class="custom-order z-50 p-4 bg-blue-500">Content</div>
```

```jsx
{/* headwind-ignore */}
<div className="custom-order z-50 p-4 bg-blue-500">Content</div>
```

### `headwind-ignore-all`

Prevents sorting of all classes in a file:

```html
<!-- headwind-ignore-all -->
<html>
  <div class="unsorted classes here">Content</div>
  <div class="these too will stay">More content</div>
</html>
```

## Breaking Changes in v2.0.0

### Migration Guide from v1.x

Version 2.0.0 introduces significant breaking changes. Follow this guide to migrate:

#### 1. All Functions Are Now Async

**v1.x:**
```typescript
const sorted = sortClassString('px-4 container', options);
```

**v2.0.0:**
```typescript
const sorted = await sortClassString('px-4 container', options);
```

#### 2. `sortOrder` Parameter Removed

The `sortOrder` parameter has been removed. Sorting now uses @herb-tools/tailwind-class-sorter which provides Prettier-compatible ordering.

**v1.x:**
```typescript
sortClassString('px-4 container', {
  classOrder: ['container', 'px-4'], // ❌ No longer used
  shouldRemoveDuplicates: true,
  shouldPrependCustomClasses: false
});
```

**v2.0.0:**
```typescript
await sortClassString('px-4 container', {
  shouldRemoveDuplicates: true,
  shouldPrependCustomClasses: false,
  customTailwindPrefix: ''
});
```

#### 3. Options Interface Changed

**v1.x:**
```typescript
interface Options {
  classOrder: string[];  // ❌ Removed
  shouldRemoveDuplicates: boolean;
  shouldPrependCustomClasses: boolean;
}
```

**v2.0.0:**
```typescript
interface Options {
  shouldRemoveDuplicates: boolean;
  shouldPrependCustomClasses: boolean;
  customTailwindPrefix: string;  // ✅ New
  separator?: RegExp;             // ✅ New
  replacement?: string;           // ✅ New
}
```

#### 4. Sort Order May Change

Due to the switch to @herb-tools/tailwind-class-sorter, the sort order may differ from v1.x. The new ordering is Prettier-compatible and follows Tailwind CSS's recommended class order.

**Example:**
```typescript
// Input
'px-4 hover:bg-blue-500 lg:px-8 text-center'

// v1.x output (depends on classOrder config)
'px-4 lg:px-8 hover:bg-blue-500 text-center'

// v2.0.0 output (Prettier-compatible)
'px-4 text-center hover:bg-blue-500 lg:px-8'
```

#### 5. New Features

v2.0.0 adds new capabilities:

```typescript
// Process entire text blocks
const processed = await processText(htmlContent, 'class="([^"]+)"', options);

// Process files directly
await processFile('src/index.html', 'class="([^"]+)"', options);

// Use CLI
// npx tailwind-class-sorter src/app.tsx
```

## Use Cases

### In Build Scripts

```javascript
import { processFile } from 'tailwind-class-sorter';
import { glob } from 'glob';

async function sortAllClasses() {
  const files = await glob('src/**/*.{html,jsx,tsx}');

  for (const file of files) {
    const langConfig = file.endsWith('.html')
      ? 'class="([^"]+)"'
      : 'className="([^"]+)"';

    await processFile(file, langConfig, {
      shouldRemoveDuplicates: true,
      shouldPrependCustomClasses: false,
      customTailwindPrefix: ''
    });

    console.log(`Processed ${file}`);
  }
}

sortAllClasses();
```

### As Pre-commit Hook

```json
{
  "scripts": {
    "precommit": "tailwind-class-sorter $(git diff --cached --name-only --diff-filter=ACM | grep -E '\\.(html|jsx|tsx)$')"
  }
}
```

### With Custom Tailwind Prefix

```typescript
const sorted = await sortClassString('tw-px-4 tw-container tw-mx-auto', {
  shouldRemoveDuplicates: true,
  shouldPrependCustomClasses: false,
  customTailwindPrefix: 'tw-'
});
```

### Processing React Components

```typescript
import { processText } from 'tailwind-class-sorter';
import * as fs from 'fs/promises';

async function sortReactComponent(filePath: string) {
  const content = await fs.readFile(filePath, 'utf-8');

  const processed = await processText(content, 'className="([^"]+)"', {
    shouldRemoveDuplicates: true,
    shouldPrependCustomClasses: false,
    customTailwindPrefix: ''
  });

  await fs.writeFile(filePath, processed, 'utf-8');
}
```

## TypeScript Support

This package is written in TypeScript and includes full type definitions.

```typescript
import {
  sortClassString,
  processText,
  processFile,
  buildMatchers,
  getTextMatch,
  Options,
  LangConfig,
  Matcher
} from 'tailwind-class-sorter';

// Full type safety
const options: Options = {
  shouldRemoveDuplicates: true,
  shouldPrependCustomClasses: false,
  customTailwindPrefix: ''
};

const sorted: Promise<string> = sortClassString('px-4 container', options);
```

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test
```

## Publishing

Before publishing:

1. Ensure all tests pass: `npm test`
2. Build the package: `npm run build`
3. Update version in package.json
4. Login to npm: `npm login`
5. Publish: `npm publish`

The `prepublishOnly` script will automatically run build and tests before publishing.

## Related Projects

- [@herb-tools/tailwind-class-sorter](https://www.npmjs.com/package/@herb-tools/tailwind-class-sorter) - The underlying sorting engine
- [Headwind VS Code Extension](https://marketplace.visualstudio.com/items?itemName=heybourn.headwind) - VS Code extension using this package

## License

MIT

## Author

Murilo <muriloime@gmail.com>

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/muriloime/tailwind-class-sorter/issues) on GitHub.
