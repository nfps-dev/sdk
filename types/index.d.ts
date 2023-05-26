import type acorn from 'acorn';

declare module 'acorn-import-assertions' {
	export function importAssertions(y_parser: acorn.Parser): acorn.Parser;
}
