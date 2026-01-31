export interface Options {
	shouldRemoveDuplicates: boolean;
	shouldPrependCustomClasses: boolean;
	customTailwindPrefix: string;
	separator?: RegExp;
	replacement?: string;
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
