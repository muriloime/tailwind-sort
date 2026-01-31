# tailwind-class-sorter

A standalone Tailwind CSS class sorter utility for sorting, deduplicating, and organizing Tailwind classes.

## Installation

```bash
npm install tailwind-class-sorter
```

## Usage

```typescript
import { sortClassString } from 'tailwind-class-sorter';

const sorted = sortClassString('px-4 container mx-auto text-center', {
  classOrder: ['container', 'mx-auto', 'px-4', 'text-center'],
  shouldRemoveDuplicates: true,
  shouldPrependCustomClasses: false
});

console.log(sorted); // "container mx-auto px-4 text-center"
```

## API

### `sortClassString(classString: string, options: SorterOptions): string`

Sorts a string of Tailwind CSS classes according to the provided configuration.

**Parameters:**
- `classString` - A space-separated string of CSS classes
- `options` - Configuration object containing:
  - `classOrder` - Array defining the order of class patterns
  - `shouldRemoveDuplicates` - Whether to remove duplicate classes
  - `shouldPrependCustomClasses` - Whether custom classes appear before or after Tailwind classes

**Returns:** A sorted and optionally deduplicated string of classes

### `buildMatchers(classOrder: string[]): Array<{ regex: RegExp, order: number }>`

Builds regex matchers from class order configuration.

### `getTextMatch(text: string, classWrapperRegex: RegExp): RegExpExecArray | null`

Extracts class strings from text using a wrapper regex pattern.

## License

MIT
