export interface Options {
	shouldRemoveDuplicates: boolean;
	shouldPrependCustomClasses: boolean;
	customTailwindPrefix: string;
	separator?: RegExp;
	replacement?: string;
	baseDir?: string;  // Base directory for resolving Tailwind config
}

export type LangConfig =
	| string
	| string[]
	| { regex?: string | string[]; separator?: string; replacement?: string }
	| undefined;

export type Matcher = {
	regex: RegExp[];
	separator?: RegExp;
	replacement?: string;
};
