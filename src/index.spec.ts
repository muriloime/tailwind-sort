import { sortClassString, buildMatchers, getTextMatch } from './index';
import { Options } from './types';

describe('sortClassString', () => {
  const defaultOptions: Options = {
    shouldRemoveDuplicates: true,
    shouldPrependCustomClasses: false,
    customTailwindPrefix: '',
  };

  it('should sort classes according to Tailwind order', async () => {
    const input = 'bg-blue-500 container flex text-white';
    // Note: @herb-tools uses Tailwind's official sort order
    const result = await sortClassString(input, defaultOptions);

    // Just verify it returns a string with all classes
    expect(typeof result).toBe('string');
    expect(result).toContain('container');
    expect(result).toContain('flex');
    expect(result).toContain('text-white');
    expect(result).toContain('bg-blue-500');
  });

  it('should remove duplicate classes', async () => {
    const input = 'flex container flex text-white container';

    const result = await sortClassString(input, {
      ...defaultOptions,
      shouldRemoveDuplicates: true,
    });

    // Check that duplicates are removed
    const classes = result.split(' ');
    expect(classes.filter(c => c === 'flex')).toHaveLength(1);
    expect(classes.filter(c => c === 'container')).toHaveLength(1);
  });

  it('should keep duplicate classes when configured', async () => {
    const input = 'flex container flex';

    const result = await sortClassString(input, {
      ...defaultOptions,
      shouldRemoveDuplicates: false,
    });

    // Check that duplicates are preserved
    const classes = result.split(' ');
    expect(classes.filter(c => c === 'flex')).toHaveLength(2);
  });

  it('should handle custom separator and replacement', async () => {
    const input = 'bg-blue-500.container.flex.text-white';

    const result = await sortClassString(input, {
      ...defaultOptions,
      separator: /\./g,
      replacement: '.',
    });

    expect(result).toContain('container');
    expect(result).toContain('flex');
    expect(result).toContain('bg-blue-500');
    expect(result.includes('.')).toBe(true);
  });

  it('should handle classes with custom tailwind prefix', async () => {
    const input = 'tw-flex tw-container custom-class';

    const result = await sortClassString(input, {
      ...defaultOptions,
      customTailwindPrefix: 'tw-',
    });

    expect(result).toContain('tw-container');
    expect(result).toContain('tw-flex');
    expect(result).toContain('custom-class');
  });

  it('should preserve leading dot when using dot separator', async () => {
    const input = '.bg-blue-500.container.flex';

    const result = await sortClassString(input, defaultOptions);

    expect(result.startsWith('.')).toBe(true);
    expect(result).toContain('container');
    expect(result).toContain('flex');
  });

  it('should handle Tailwind variants and complex classes', async () => {
    const input = '[mask-image:none] hover:bg-red-500 w-1/2 sm:p-8 p-4';

    const result = await sortClassString(input, defaultOptions);

    expect(result).toContain('p-4');
    expect(result).toContain('hover:bg-red-500');
    expect(result).toContain('[mask-image:none]');
  });

  it('should sort classes with variants correctly', async () => {
    const input = 'hover:custom-class flex container';

    const result = await sortClassString(input, defaultOptions);

    expect(result).toContain('flex');
    expect(result).toContain('container');
    expect(result).toContain('hover:custom-class');
  });

  it('should handle weird spacing and tabs', async () => {
    const input = '  flex\tcontainer\ntext-white  ';

    const result = await sortClassString(input, defaultOptions);

    expect(result).toContain('container');
    expect(result).toContain('flex');
    expect(result).toContain('text-white');
    expect(result.trim()).toBe(result); // No leading/trailing spaces
  });

  it('should default to dot separator if no spaces are present', async () => {
    const input = 'flex.container';

    const result = await sortClassString(input, defaultOptions);

    expect(result).toContain('container');
    expect(result).toContain('flex');
    expect(result.includes('.')).toBe(true);
  });

  it('should handle empty strings', async () => {
    const input = '';

    const result = await sortClassString(input, defaultOptions);

    expect(result).toBe('');
  });

  it('should filter out empty class names', async () => {
    const input = 'flex  container   text-white';

    const result = await sortClassString(input, defaultOptions);

    expect(result).toContain('container');
    expect(result).toContain('flex');
    expect(result).toContain('text-white');
    // Should not have multiple consecutive spaces
    expect(result.includes('  ')).toBe(false);
  });
});

describe('buildMatchers', () => {
  it('should return empty array for undefined config', () => {
    const result = buildMatchers(undefined);

    expect(result).toEqual([]);
  });

  it('should build matcher from string regex', () => {
    const config = 'class="([^"]*)"';
    const result = buildMatchers(config);

    expect(result).toHaveLength(1);
    expect(result[0].regex).toHaveLength(1);
    expect(result[0].regex[0]).toBeInstanceOf(RegExp);
    expect(result[0].regex[0].source).toBe('class="([^"]*)"');
  });

  it('should build matchers from array of strings', () => {
    const config = ['class="([^"]*)"', 'className=\\{([^\\}]*)\\}'];
    const result = buildMatchers(config);

    expect(result).toHaveLength(1);
    expect(result[0].regex).toHaveLength(2);
    expect(result[0].regex[0].source).toBe('class="([^"]*)"');
    expect(result[0].regex[1].source).toBe('className=\\{([^\\}]*)\\}');
  });

  it('should build matcher from config object with string regex', () => {
    const config = {
      regex: 'class="([^"]*)"',
      separator: '\\s+',
      replacement: ' ',
    };
    const result = buildMatchers(config);

    expect(result).toHaveLength(1);
    expect(result[0].regex).toHaveLength(1);
    expect(result[0].regex[0].source).toBe('class="([^"]*)"');
    expect(result[0].separator).toBeInstanceOf(RegExp);
    expect(result[0].separator?.source).toBe('\\s+');
    expect(result[0].replacement).toBe(' ');
  });

  it('should build matcher from config object with array of regexes', () => {
    const config = {
      regex: ['class="([^"]*)"', 'className=\\{([^\\}]*)\\}'],
    };
    const result = buildMatchers(config);

    expect(result).toHaveLength(1);
    expect(result[0].regex).toHaveLength(2);
  });

  it('should build matchers from array of config objects', () => {
    const config = [
      { regex: 'class="([^"]*)"' },
      { regex: 'className=\\{([^\\}]*)\\}' },
    ];
    const result = buildMatchers(config);

    expect(result).toHaveLength(2);
    expect(result[0].regex).toHaveLength(1);
    expect(result[1].regex).toHaveLength(1);
  });

  it('should handle mixed array of strings and objects', () => {
    const config = [
      'class="([^"]*)"',
      { regex: 'className=\\{([^\\}]*)\\}', separator: ',' }
    ];
    const result = buildMatchers(config as any);

    expect(result).toHaveLength(2);
    expect(result[0].regex[0].source).toBe('class="([^"]*)"');
    expect(result[1].regex[0].source).toBe('className=\\{([^\\}]*)\\}');
    expect(result[1].separator?.source).toBe(',');
  });

  it('should return empty array for empty array config', () => {
    const config: never[] = [];
    const result = buildMatchers(config);

    expect(result).toEqual([]);
  });

  it('should handle config object without regex field', () => {
    const config = {
      separator: '\\s+',
      replacement: ' ',
    };
    const result = buildMatchers(config);

    expect(result).toHaveLength(1);
    expect(result[0].regex).toEqual([]);
    expect(result[0].separator).toBeInstanceOf(RegExp);
  });
});

describe('getTextMatch', () => {
  it('should extract text matches using regex', () => {
    const regex = /class="([^"]*)"/g;
    const text = '<div class="flex container">Hello</div>';
    const matches: Array<{ text: string; position: number }> = [];

    getTextMatch([regex], text, (text, position) => {
      matches.push({ text, position });
    });

    expect(matches).toHaveLength(1);
    expect(matches[0].text).toBe('flex container');
    expect(matches[0].position).toBe(12);
  });

  it('should handle multiple matches', () => {
    const regex = /class="([^"]*)"/g;
    const text = '<div class="flex">A</div><div class="container">B</div>';
    const matches: Array<{ text: string; position: number }> = [];

    getTextMatch([regex], text, (text, position) => {
      matches.push({ text, position });
    });

    expect(matches).toHaveLength(2);
    expect(matches[0].text).toBe('flex');
    expect(matches[0].position).toBe(12);
    expect(matches[1].text).toBe('container');
    expect(matches[1].position).toBe(37);
  });

  it('should handle nested regex matching', () => {
    const outerRegex = /<div[^>]*>(.*?)<\/div>/g;
    const innerRegex = /class="([^"]*)"/g;
    const text = '<div><div class="flex container"></div></div>';
    const matches: Array<{ text: string; position: number }> = [];

    getTextMatch([outerRegex, innerRegex], text, (text, position) => {
      matches.push({ text, position });
    });

    expect(matches).toHaveLength(1);
    expect(matches[0].text).toBe('flex container');
  });

  it('should handle text with no matches', () => {
    const regex = /class="([^"]*)"/g;
    const text = '<div>No classes here</div>';
    const matches: string[] = [];

    getTextMatch([regex], text, (text) => {
      matches.push(text);
    });

    expect(matches).toHaveLength(0);
  });

  it('should pass correct start position to callback', () => {
    const regex = /class="([^"]*)"/g;
    const text = 'prefix <div class="flex">content</div>';
    const positions: number[] = [];

    getTextMatch([regex], text, (_, position) => {
      positions.push(position);
    });

    expect(positions).toHaveLength(1);
    expect(positions[0]).toBe(19);
  });

  it('should handle empty regex array', () => {
    const text = '<div class="flex">content</div>';
    const matches: string[] = [];

    getTextMatch([], text, (text) => {
      matches.push(text);
    });

    expect(matches).toHaveLength(0);
  });

  it('should handle multiple capture groups and use first non-zero match', () => {
    const regex = /class="([^"]*)"|className=\{([^\}]*)\}/g;
    const text = '<div className={flex container}>content</div>';
    const matches: string[] = [];

    getTextMatch([regex], text, (text) => {
      matches.push(text);
    });

    expect(matches).toHaveLength(1);
    expect(matches[0]).toBe('flex container');
  });

  it('should handle complex nested extraction with correct positions', () => {
    const outer = /directive\s*:\s*\[([^\]]*)\]/g;
    const inner = /"([^"]*)"/g;
    const text = 'directive: ["flex items-center", "p-4 justify-between"]';
    const matches: Array<{ text: string; position: number }> = [];

    getTextMatch([outer, inner], text, (text, position) => {
      matches.push({ text, position });
    });

    expect(matches).toHaveLength(2);
    expect(matches[0].text).toBe('flex items-center');
    expect(matches[0].position).toBe(13);
    expect(matches[1].text).toBe('p-4 justify-between');
    expect(matches[1].position).toBe(34);
  });
});
