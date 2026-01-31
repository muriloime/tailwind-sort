import * as fs from 'fs/promises';
import { sortClassString, buildMatchers, getTextMatch } from './index';
import { LangConfig, Options } from './types';

/**
 * Processes text and sorts Tailwind CSS classes found using language-specific regex.
 * @param text The text content to process
 * @param langConfig Language configuration for finding class strings
 * @param options Sorting options
 * @returns Text with sorted classes
 */
export async function processText(
  text: string,
  langConfig: LangConfig | LangConfig[],
  options: Options
): Promise<string> {
  // Check for headwind-ignore-all
  if (text.includes('headwind-ignore-all')) {
    return text;
  }

  const matchers = buildMatchers(langConfig);

  // Collect all matches first (getTextMatch callback is synchronous)
  const matches: Array<{ classString: string; startPosition: number }> = [];

  for (const matcher of matchers) {
    getTextMatch(matcher.regex, text, (classString, startPosition) => {
      // Skip if has headwind-ignore
      if (!classString.includes('headwind-ignore')) {
        matches.push({ classString, startPosition });
      }
    });
  }

  // If no matches, return original text
  if (matches.length === 0) {
    return text;
  }

  // Sort matches by position in reverse order for safe replacement
  matches.sort((a, b) => b.startPosition - a.startPosition);

  // Process all matches and build replacements
  const replacements: Array<{ start: number; end: number; replacement: string }> = [];

  for (const match of matches) {
    const sorted = await sortClassString(match.classString, options);

    if (sorted !== match.classString) {
      replacements.push({
        start: match.startPosition,
        end: match.startPosition + match.classString.length,
        replacement: sorted
      });
    }
  }

  // Apply replacements (already sorted in reverse order)
  let result = text;
  for (const { start, end, replacement } of replacements) {
    result = result.slice(0, start) + replacement + result.slice(end);
  }

  return result;
}

/**
 * Processes a file and sorts Tailwind CSS classes.
 * @param filePath Path to the file to process
 * @param langConfig Language configuration for finding class strings
 * @param options Sorting options
 */
export async function processFile(
  filePath: string,
  langConfig: LangConfig | LangConfig[],
  options: Options
): Promise<void> {
  const content = await fs.readFile(filePath, 'utf-8');
  const processed = await processText(content, langConfig, options);

  if (processed !== content) {
    await fs.writeFile(filePath, processed, 'utf-8');
  }
}
