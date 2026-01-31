import { Options, LangConfig, Matcher } from './types';

/**
 * Sorts a string of CSS classes according to a predefined order.
 * @param classString The string to sort
 * @param sortOrder The default order to sort the array at
 * @param options Configuration options for sorting behavior
 *
 * @returns The sorted string
 */
export const sortClassString = (
	classString: string,
	sortOrder: string[],
	options: Options
): string => {

	const default_separator = classString.includes(' ') ? /\s+/g : '.';
	const default_replacement = classString.includes(' ') ? ' ' : '.';

	let classArray = classString.split(options.separator || default_separator);

	classArray = classArray.filter((el) => el !== '');

	if (options.shouldRemoveDuplicates) {
		classArray = removeDuplicates(classArray);
	}

	// prepend custom tailwind prefix to all tailwind sortOrder-classes
	const sortOrderClone = options.customTailwindPrefix.length > 0
		? sortOrder.map(className => options.customTailwindPrefix + className)
		: [...sortOrder];

	classArray = sortClassArray(
		classArray,
		sortOrderClone,
		options.shouldPrependCustomClasses
	);

	const result = classArray.join(options.replacement || default_replacement).trim()
	if( (default_separator === ".") && (classString.startsWith(".")))
	{
		return "." + result;
	}
	else
	{
		return result
	};
};

const sortClassArray = (
	classArray: string[],
	sortOrder: string[],
	shouldPrependCustomClasses: boolean
): string[] => [
	...classArray.filter(
		(el) => shouldPrependCustomClasses && sortOrder.indexOf(el) === -1
	), // append the classes that were not in the sort order if configured this way
	...classArray
		.filter((el) => sortOrder.indexOf(el) !== -1) // take the classes that are in the sort order
		.sort((a, b) => sortOrder.indexOf(a) - sortOrder.indexOf(b)), // and sort them
	...classArray.filter(
		(el) => !shouldPrependCustomClasses && sortOrder.indexOf(el) === -1
	), // prepend the classes that were not in the sort order if configured this way
];

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

// Re-export types
export type { Options, LangConfig, Matcher } from './types';
