import { sortTailwindClasses } from '@herb-tools/tailwind-class-sorter';
import { Options, LangConfig, Matcher } from './types';

/**
 * Sorts a string of CSS classes using @herb-tools/tailwind-class-sorter.
 * @param classString The string to sort
 * @param options Configuration options for sorting behavior
 * @returns Promise resolving to the sorted string
 */
export const sortClassString = async (
	classString: string,
	options: Options
): Promise<string> => {

	const default_separator = classString.includes(' ') ? /\s+/g : '.';
	const default_replacement = classString.includes(' ') ? ' ' : '.';

	let classArray = classString.split(options.separator || default_separator);
	classArray = classArray.filter((el) => el !== '');

	if (options.shouldRemoveDuplicates) {
		classArray = removeDuplicates(classArray);
	}

	// Apply custom prefix if specified
	if (options.customTailwindPrefix.length > 0) {
		classArray = classArray.map(className =>
			className.startsWith(options.customTailwindPrefix)
				? className
				: options.customTailwindPrefix + className
		);
	}

	// Use @herb-tools/tailwind-class-sorter for sorting
	const joined = classArray.join(' ');
	let sorted: string;

	try {
		sorted = await sortTailwindClasses(joined, {
			tailwindPreserveDuplicates: !options.shouldRemoveDuplicates
		});
	} catch (e) {
		// Fallback to unsorted if sorting fails
		sorted = joined;
	}

	// Split back and apply custom replacement if needed
	const sortedArray = sorted.split(' ').filter(el => el !== '');
	const result = sortedArray.join(options.replacement || default_replacement).trim();

	if (default_separator === '.' && classString.startsWith('.')) {
		return '.' + result;
	}

	return result;
};

const removeDuplicates = (classArray: string[]): string[] => [
	...new Set(classArray),
];

function isArrayOfStrings(value: unknown): value is string[] {
	return (
		Array.isArray(value) && value.every((item) => typeof item === 'string')
	);
}

function buildMatcher(value: LangConfig): Matcher {
	if (typeof value === 'string') {
		return {
			regex: [new RegExp(value, 'gi')],
		};
	} else if (isArrayOfStrings(value)) {
		return {
			regex: value.map((v) => new RegExp(v, 'gi')),
		};
	} else if (value === undefined) {
		return {
			regex: [],
		};
	} else {
		return {
			regex:
				typeof value.regex === 'string'
					? [new RegExp(value.regex, 'gi')]
					: isArrayOfStrings(value.regex)
					? value.regex.map((v) => new RegExp(v, 'gi'))
					: [],
			separator:
				typeof value.separator === 'string'
					? new RegExp(value.separator, 'g')
					: undefined,
			replacement: value.replacement || value.separator,
		};
	}
}

/**
 * Builds an array of matchers from language configuration.
 * Converts various configuration formats into a normalized array of Matcher objects.
 * @param value Language configuration as a string, array of strings, config object, or array of configs
 *
 * @returns Array of Matcher objects containing regex patterns and optional separators
 */
export function buildMatchers(value: LangConfig | LangConfig[]): Matcher[] {
	if (value === undefined) {
		return [];
	} else if (Array.isArray(value)) {
		if (!value.length) {
			return [];
		} else if (!isArrayOfStrings(value)) {
			return value.map((v) => buildMatcher(v));
		}
	}
	return [buildMatcher(value)];
}

/**
 * Recursively matches text against a series of regular expressions.
 * Used to extract class strings from nested language constructs.
 * @param regexes Array of regular expressions to match sequentially
 * @param text The text to search in
 * @param callback Function called for each match with the matched text and its position
 * @param startPosition Starting position offset for calculating absolute positions
 */
export function getTextMatch(
	regexes: RegExp[],
	text: string,
	callback: (text: string, startPosition: number) => void,
	startPosition: number = 0
): void {
	if (regexes.length >= 1) {
		let wrapper: RegExpExecArray | null;
		while ((wrapper = regexes[0].exec(text)) !== null) {
			const wrapperMatch = wrapper[0];
			const valueMatchIndex = wrapper.findIndex(
				(match, idx) => idx !== 0 && match
			);
			const valueMatch = wrapper[valueMatchIndex];

			const newStartPosition =
				startPosition + wrapper.index + wrapperMatch.lastIndexOf(valueMatch);

			if (regexes.length === 1) {
				callback(valueMatch, newStartPosition);
			} else {
				getTextMatch(regexes.slice(1), valueMatch, callback, newStartPosition);
			}
		}
	}
}

// Re-export processor functions
export { processText, processFile } from './processor';

// Re-export types (using compatible syntax for older TypeScript versions)
export { Options, LangConfig, Matcher } from './types';
