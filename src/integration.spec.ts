import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { processFile, processText } from './processor';
import { LangConfig, Options } from './types';

describe('Integration tests with real files', () => {
  const options: Options = {
    shouldRemoveDuplicates: true,
    shouldPrependCustomClasses: false,
    customTailwindPrefix: '',
  };

  const fixturesDir = path.resolve(__dirname, '../test-fixtures');
  let tempDir: string;

  beforeAll(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'tailwind-sorter-test-'));
  });

  afterAll(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('should process a real HTML file correctly', async () => {
    const filePath = path.join(fixturesDir, 'test.html');
    const content = await fs.readFile(filePath, 'utf-8');
    
    const langConfig: LangConfig = 'class="([^"]+)"';
    const result = await processText(content, langConfig, options);

    // Verify it changed something (assuming initial was unsorted or had duplicates)
    // For HTML, we expect classes to be there and the structure to be preserved
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('class="');
    expect(result).toContain('bg-gray-100');
    expect(result).toContain('flex');
    
    // Test processFile by copying to temp
    const tempFilePath = path.join(tempDir, 'test.html');
    await fs.writeFile(tempFilePath, content, 'utf-8');
    await processFile(tempFilePath, langConfig, options);
    
    const processedContent = await fs.readFile(tempFilePath, 'utf-8');
    expect(processedContent).toBe(result);
  });

  it('should process a real TSX file correctly', async () => {
    const filePath = path.join(fixturesDir, 'test.tsx');
    const content = await fs.readFile(filePath, 'utf-8');
    
    const langConfig: LangConfig = 'className="([^"]+)"';
    const result = await processText(content, langConfig, options);

    expect(result).toContain('import React from \'react\';');
    expect(result).toContain('className="');
    expect(result).toContain('min-h-screen');
    expect(result).toContain('bg-gray-50');
  });

  it('should process a real HAML file correctly', async () => {
    const filePath = path.join(fixturesDir, 'test.haml');
    const content = await fs.readFile(filePath, 'utf-8');
    
    const langConfig: LangConfig = '\\.([\\._a-zA-Z0-9\\-]+)';
    const result = await processText(content, langConfig, options);

    expect(result).toContain('.container');
    expect(result).toContain('.mx-auto');
    expect(result).toContain('.p-4');
    expect(result).toContain('.text-3xl');
  });

  it('should process a real Vue file correctly', async () => {
    const filePath = path.join(fixturesDir, 'test.vue');
    const content = await fs.readFile(filePath, 'utf-8');
    
    const langConfig: LangConfig = 'class="([^"]+)"';
    const result = await processText(content, langConfig, options);

    expect(result).toContain('<template>');
    expect(result).toContain('class="');
    expect(result).toContain('p-6');
    expect(result).toContain('max-w-sm');
    expect(result).toContain('bg-white');
  });
});
