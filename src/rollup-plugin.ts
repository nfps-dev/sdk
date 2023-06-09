import type {NfpModuleConfig, Plugin} from './_types.js';

import path from 'node:path';

import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import {svelte} from '@sveltejs/vite-plugin-svelte';

import filesize from 'rollup-plugin-filesize';
import sveltePreprocess from 'svelte-preprocess';
import uglify from 'uglify-js';

import {contextualize_svelte} from './plugins/contextualize-svelte.js';
import {transformCode} from './plugins/dynamic-imports.js';
import envVars from './plugins/env-vars.js';
import nfpxWindow from './plugins/nfpx.js';
import {optimize_svgs} from './plugins/optimize-svgs.js';
import rewriteDecls from './plugins/rewrite-decls.js';

export function nfpModule(gc_nfpm: NfpModuleConfig): Plugin[] {
	let p_entry = '';

	const b_dev = 'development' === process.env['NFP_ENV'];

	return [
		// node-style resolution
		resolve({
			browser: true,
		}),

		{
			name: 'nfpx-primer',

			buildStart(gc_opt) {
				p_entry = 'string' === typeof gc_opt.input? gc_opt.input: (gc_opt.input as string[])[0];
				p_entry = path.resolve(p_entry);
			},

			// resolveId(source, importer, options) {
			// 	console.log('resolve: '+source);
			// },

			// load(si_module) {
			// 	console.log('load: '+si_module);
			// },

			// resolveId(si_module, p_importer) {
			// 	if(p_importer === p_entry && /^\.\.?\//.test(si_module)) {
			// 		console.log(p_importer+': '+si_module);
			// 	}
			// },

		},

		// env var substitution
		envVars(gc_nfpm),

		// nfp module system
		nfpxWindow(gc_nfpm),

		// enable typescript
		typescript({
			sourceMap: true,
			include: gc_nfpm.include || ['src/**/*.ts'],
			...gc_nfpm.exclude? {exclude:gc_nfpm.exclude}: {},
			...gc_nfpm.tsconfig? {tsconfig:gc_nfpm.tsconfig}: {},
			...gc_nfpm.typescript? {typescript:gc_nfpm.typescript}: {},
			...gc_nfpm.compilerOptions? {compilerOptions:gc_nfpm.compilerOptions}: {},
			transformers: {
				...gc_nfpm.transformers,
			},
		}),

		// rewrite typescript declaration outputs
		rewriteDecls(gc_nfpm),

		...gc_nfpm.svelte? [
			// // optimize imported svg files
			// ...gc_nfpm.svgo || 'undefined' === typeof gc_nfpm.svgo
			// 	? [optimize_svgs(gc_nfpm, b_dev)]: [],

			// build svelte components
			...svelte({
				compilerOptions: {
					immutable: true,
					css: 'injected',
					// eslint-disable-next-line @typescript-eslint/naming-convention
					cssHash: ({hash, css, name, filename}) => `sv${hash(css)}`,
					// namespace: 'svg',
				},
				preprocess: {
					...sveltePreprocess({}),
					async script(gc_pre: any) {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
						const g_transform = await sveltePreprocess({})!.script!(gc_pre);

						return g_transform? await transformCode(g_transform.code, 'app'): g_transform;
					},
				},
			}) as Plugin[],

			// contextualize svelte internals for SVG document
			contextualize_svelte(gc_nfpm, b_dev),
		]: [],

		// minify using terser
		...'development' !== process.env['NFP_ENV']? [
			terser({
				compress: {
					passes: 3,
					ecma: 2020,
					// toplevel: true,
					keep_fargs: false,
					unsafe_arrows: true,
					// unsafe_comps: true,
					unsafe_methods: true,
					unsafe_proto: true,
					unsafe_regexp: true,

					// this can cause an error when web crypto API expects a boolean
					// booleans_as_integers: true,

					pure_funcs: [
						'buffer',
						'sha256',
						'sha256d',
						'sha384',
						'sha512',
						'hmac',
						'text_to_buffer',
						'buffer_to_text',
						'base64_to_text',
						'text_to_base64',
						'json_to_buffer',
						'buffer_to_json',
						'buffer_to_hex',
						'hex_to_buffer',
						'buffer_to_base64',
						'base64_to_buffer',
						'string8_to_buffer',
						'buffer_to_string8',
						'buffer_to_base93',
						'base93_to_buffer',
						'buffer_to_base58',
						'base58_to_buffer',
						'concat',
						'concat2',
					],
				},
				mangle: {
					toplevel: true,
				},
				format: {
					wrap_func_args: false,
				},
			}),

			// terser is not perfect on its own, use uglify to clean up remainder
			{
				name: 'uglify',
				generateBundle(gc_bundle, h_bundle, b_write) {
					for(const [, g_bundle] of Object.entries(h_bundle)) {
						if('chunk' === g_bundle.type) {
							g_bundle.code = uglify.minify(g_bundle.code).code;
						}
					}
				},
			} as Plugin,

			// display the bundled sizes
			filesize(),
		]: [],
	];
}
