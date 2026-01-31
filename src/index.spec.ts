import { sortClassString, buildMatchers, getTextMatch } from './index';
import { Options } from './types';

describe('sortClassString', () => {
  const sortOrder = ['container', 'flex', 'items-center', 'justify-center', 'p-4', 'text-white', 'bg-blue-500'];

  const defaultOptions: Options = {
    shouldRemoveDuplicates: true,
    shouldPrependCustomClasses: false,
    customTailwindPrefix: '',
  };

  it('should sort classes according to sort order', () => {
    const input = 'bg-blue-500 container flex text-white';
    const expected = 'container flex text-white bg-blue-500';

    const result = sortClassString(input, sortOrder, defaultOptions);

    expect(result).toBe(expected);
  });

  it('should remove duplicate classes', () => {
    const input = 'flex container flex text-white container';
    const expected = 'container flex text-white';

    const result = sortClassString(input, sortOrder, {
      ...defaultOptions,
      shouldRemoveDuplicates: true,
    });

    expect(result).toBe(expected);
  });

  it('should keep duplicate classes when configured', () => {
    const input = 'flex container flex';

    const result = sortClassString(input, sortOrder, {
      ...defaultOptions,
      shouldRemoveDuplicates: false,
    });

    expect(result).toBe('container flex flex');
  });

  it('should prepend custom classes when configured', () => {
    const input = 'custom-class flex container another-custom';
    const expected = 'custom-class another-custom container flex';

    const result = sortClassString(input, sortOrder, {
      ...defaultOptions,
      shouldPrependCustomClasses: true,
    });

    expect(result).toBe(expected);
  });

  it('should append custom classes by default', () => {
    const input = 'custom-class flex container another-custom';
    const expected = 'container flex custom-class another-custom';

    const result = sortClassString(input, sortOrder, {
      ...defaultOptions,
      shouldPrependCustomClasses: false,
    });

    expect(result).toBe(expected);
  });

  it('should handle custom separator and replacement', () => {
    const input = 'bg-blue-500.container.flex.text-white';
    const expected = 'container.flex.text-white.bg-blue-500';

    const result = sortClassString(input, sortOrder, {
      ...defaultOptions,
      separator: /\./g,
      replacement: '.',
    });

    expect(result).toBe(expected);
  });

  it('should handle classes with custom tailwind prefix', () => {
    const sortOrderWithoutPrefix = ['container', 'flex', 'items-center'];
    const input = 'tw-flex tw-container custom-class';
    const expected = 'tw-container tw-flex custom-class';

    const result = sortClassString(input, sortOrderWithoutPrefix, {
      ...defaultOptions,
      customTailwindPrefix: 'tw-',
    });

    expect(result).toBe(expected);
  });

  it('should preserve leading dot when using dot separator', () => {
    const input = '.bg-blue-500.container.flex';
    const expected = '.container.flex.bg-blue-500';

    const result = sortClassString(input, sortOrder, defaultOptions);

    expect(result).toBe(expected);
  });

  it('should handle Tailwind variants and complex classes', () => {
    const customSortOrder = ['p-4', 'sm:p-8', 'hover:bg-red-500', 'w-1/2', '[mask-image:none]'];
    const input = '[mask-image:none] hover:bg-red-500 w-1/2 sm:p-8 p-4';
    const expected = 'p-4 sm:p-8 hover:bg-red-500 w-1/2 [mask-image:none]';

    const result = sortClassString(input, customSortOrder, defaultOptions);

    expect(result).toBe(expected);
  });

  it('should sort classes with variants correctly even if not in sort order', () => {
    const input = 'hover:custom-class flex container';
    const expected = 'container flex hover:custom-class';

    const result = sortClassString(input, sortOrder, defaultOptions);

    expect(result).toBe(expected);
  });

  it('should handle weird spacing and tabs', () => {
    const input = '  flex\tcontainer\ntext-white  ';
    const expected = 'container flex text-white';

    const result = sortClassString(input, sortOrder, defaultOptions);

    expect(result).toBe(expected);
  });

  it('should default to dot separator if no spaces are present', () => {
    const input = 'flex.container';
    const expected = 'container.flex';

    const result = sortClassString(input, sortOrder, defaultOptions);

    expect(result).toBe(expected);
  });

  it('should handle empty strings', () => {
    const input = '';
    const expected = '';

    const result = sortClassString(input, sortOrder, defaultOptions);

    expect(result).toBe(expected);
  });

  it('should filter out empty class names', () => {
    const input = 'flex  container   text-white';
    const expected = 'container flex text-white';

    const result = sortClassString(input, sortOrder, defaultOptions);

    expect(result).toBe(expected);
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
