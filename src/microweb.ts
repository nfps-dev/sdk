import type {
	OutputPlugin,
} from 'rollup';

import resolve from '@rollup/plugin-node-resolve';

import terser from '@rollup/plugin-terser';
import typescript, {type RollupTypescriptPluginOptions} from '@rollup/plugin-typescript';

import filesize from 'rollup-plugin-filesize';
import uglify from 'uglify-js';

export interface MicroWebConfig extends Pick<
	RollupTypescriptPluginOptions,
	'include' | 'exclude' | 'tsconfig' | 'compilerOptions' | 'typescript' | 'transformers'
> {
}

export function microWeb(gc_microweb: MicroWebConfig={}): OutputPlugin[] {
	return [
		// node-style resolution
		resolve({
			browser: true,
		}),

		// enable typescript
		typescript({
			sourceMap: true,
			include: gc_microweb.include || ['src/**/*.ts'],
			...gc_microweb.exclude? {exclude:gc_microweb.exclude}: {},
			...gc_microweb.tsconfig? {tsconfig:gc_microweb.tsconfig}: {},
			...gc_microweb.typescript? {typescript:gc_microweb.typescript}: {},
			...gc_microweb.compilerOptions? {compilerOptions:gc_microweb.compilerOptions}: {},
			...gc_microweb.transformers? {transformers:gc_microweb.transformers}: {},
		}),

		// minify using terser
		...'development' !== process.env['NODE_ENV']? [
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
				generateBundle: {
					handler(gc_bundle, h_bundle, b_write) {
						for(const [, g_bundle] of Object.entries(h_bundle)) {
							if('chunk' === g_bundle.type) {
								g_bundle.code = uglify.minify(g_bundle.code).code;
							}
						}
					},
				},
			} as OutputPlugin,

			// display the bundled sizes
			filesize(),
		]: [],
	];
}
