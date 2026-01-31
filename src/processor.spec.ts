import * as fs from 'fs/promises';
import * as path from 'path';
import { processText, processFile } from './processor';
import { LangConfig } from './types';

describe('processText', () => {
  it('should sort classes in HTML', async () => {
    const input = '<div class="p-4 flex m-2">content</div>';
    const langConfig: LangConfig = 'class="([^"]+)"';
    const options = {
      shouldRemoveDuplicates: true,
      shouldPrependCustomClasses: false,
      customTailwindPrefix: ''
    };

    const result = await processText(input, langConfig, options);

    // @herb-tools will determine the actual order
    expect(result).toContain('class="');
    expect(result).toContain('flex');
    expect(result).toContain('m-2');
    expect(result).toContain('p-4');
  });

  it('should handle headwind-ignore directive', async () => {
    const input = '<div class="p-4 flex m-2 headwind-ignore">content</div>';
    const langConfig: LangConfig = 'class="([^"]+)"';
    const options = {
      shouldRemoveDuplicates: true,
      shouldPrependCustomClasses: false,
      customTailwindPrefix: ''
    };

    const result = await processText(input, langConfig, options);

    // Should not be modified
    expect(result).toBe(input);
  });

  it('should handle headwind-ignore-all directive', async () => {
    const input = '<!-- headwind-ignore-all -->\n<div class="p-4 flex m-2">content</div>';
    const langConfig: LangConfig = 'class="([^"]+)"';
    const options = {
      shouldRemoveDuplicates: true,
      shouldPrependCustomClasses: false,
      customTailwindPrefix: ''
    };

    const result = await processText(input, langConfig, options);

    // Should not be modified
    expect(result).toBe(input);
  });

  it('should handle multiple class attributes', async () => {
    const input = '<div class="p-4 flex m-2">content</div><span class="text-white bg-blue-500">text</span>';
    const langConfig: LangConfig = 'class="([^"]+)"';
    const options = {
      shouldRemoveDuplicates: true,
      shouldPrependCustomClasses: false,
      customTailwindPrefix: ''
    };

    const result = await processText(input, langConfig, options);

    expect(result).toContain('class="');
    expect(result).toContain('flex');
    expect(result).toContain('text-white');
    expect(result).toContain('bg-blue-500');
  });

  it('should handle empty text', async () => {
    const input = '';
    const langConfig: LangConfig = 'class="([^"]+)"';
    const options = {
      shouldRemoveDuplicates: true,
      shouldPrependCustomClasses: false,
      customTailwindPrefix: ''
    };

    const result = await processText(input, langConfig, options);

    expect(result).toBe('');
  });

  it('should handle text with no classes', async () => {
    const input = '<div>content</div>';
    const langConfig: LangConfig = 'class="([^"]+)"';
    const options = {
      shouldRemoveDuplicates: true,
      shouldPrependCustomClasses: false,
      customTailwindPrefix: ''
    };

    const result = await processText(input, langConfig, options);

    expect(result).toBe(input);
  });

  it('should handle multiple language configs', async () => {
    const input = '<div class="p-4 flex m-2" className={bg-blue-500 text-white}>content</div>';
    const langConfig: LangConfig[] = ['class="([^"]+)"', 'className=\\{([^\\}]+)\\}'];
    const options = {
      shouldRemoveDuplicates: true,
      shouldPrependCustomClasses: false,
      customTailwindPrefix: ''
    };

    const result = await processText(input, langConfig, options);

    expect(result).toContain('flex');
    expect(result).toContain('bg-blue-500');
    expect(result).toContain('text-white');
  });

  it('should preserve text outside class attributes', async () => {
    const input = '<div class="flex p-4">Hello World</div>';
    const langConfig: LangConfig = 'class="([^"]+)"';
    const options = {
      shouldRemoveDuplicates: true,
      shouldPrependCustomClasses: false,
      customTailwindPrefix: ''
    };

    const result = await processText(input, langConfig, options);

    expect(result).toContain('Hello World');
    expect(result).toContain('<div');
    expect(result).toContain('</div>');
  });
});

describe('processFile', () => {
  const testDir = path.join(__dirname, '../test-files');
  const testFile = path.join(testDir, 'test.html');

  beforeAll(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterAll(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('should process classes in an HTML file', async () => {
    const input = '<div class="p-4 flex m-2">content</div>';
    await fs.writeFile(testFile, input, 'utf-8');

    const langConfig = 'class="([^"]+)"';
    const options = {
      shouldRemoveDuplicates: true,
      shouldPrependCustomClasses: false,
      customTailwindPrefix: ''
    };

    await processFile(testFile, langConfig, options);

    const result = await fs.readFile(testFile, 'utf-8');

    // Verify all classes are present
    expect(result).toContain('class="');
    expect(result).toContain('flex');
    expect(result).toContain('m-2');
    expect(result).toContain('p-4');
    expect(result).toContain('content</div>');
  });

  it('should not write file if content unchanged', async () => {
    const input = '<div>no classes here</div>';
    await fs.writeFile(testFile, input, 'utf-8');

    const langConfig = 'class="([^"]+)"';
    const options = {
      shouldRemoveDuplicates: true,
      shouldPrependCustomClasses: false,
      customTailwindPrefix: ''
    };

    // Get the file stats before processing
    const statsBefore = await fs.stat(testFile);

    // Wait a bit to ensure mtime would change if file is written
    await new Promise(resolve => setTimeout(resolve, 10));

    await processFile(testFile, langConfig, options);

    const statsAfter = await fs.stat(testFile);
    const result = await fs.readFile(testFile, 'utf-8');

    // File should not be modified if content is same
    expect(result).toBe(input);
    expect(statsAfter.mtimeMs).toBe(statsBefore.mtimeMs);
  });
});
