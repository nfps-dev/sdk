import type {NfpModuleConfig} from '../_types';
import type {Plugin} from 'rollup';

export function contextualize_svelte(gc_nfpm: NfpModuleConfig, b_dev: boolean): Plugin {
	return {
		name: 'svelte-svg-context',
		renderChunk(sx_code: string) {
			return /* js */`
				(function(document) {
					${sx_code}
				})(...(() => [
					Object.defineProperties(document, {
						head: {
							get: () => document.documentElement,
						},
						body: {
							get: () => document.documentElement,
						},
						createElement: {
							value: (...a_args) => document.createElementNS("http://www.w3.org/1999/xhtml", ...a_args),
						},
					}),
				])());
			`;
		},
	};
}
