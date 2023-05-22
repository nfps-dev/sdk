import type {NfpModuleConfig} from './_types';
import type {Dict} from '@blake.regalia/belt';
import type {
	BaseNode,
	CallExpression,
	Property,
	ExportNamedDeclaration,
	Node,
	Identifier,
} from 'estree';

import type {PluginContext, Plugin as RollupPlugin} from 'rollup';

import type {Plugin as VitePlugin} from 'vite';

import fs from 'node:fs/promises';
import path from 'node:path';

import {attachScopes, createFilter, makeLegalIdentifier} from '@rollup/pluginutils';
import * as astring from 'astring';
import {walk} from 'estree-walker';
import MagicString from 'magic-string';

const S_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function encode_symbol(i_index: number): string {
	let s_encoded = '';
	const nl_alphabet = S_ALPHABET.length;
	do {
		const i_char = i_index % nl_alphabet;
		s_encoded = S_ALPHABET[i_char] + s_encoded;
		i_index = Math.floor(i_index / nl_alphabet) - 1;
	} while(i_index >= 0);

	return s_encoded;
}

const identifier_for_module = (si_file: string) => makeLegalIdentifier('nfpx_'+path.parse(si_file).name);

const SI_NFPX_EXPORT = '\0nfpx-export';
const SI_SUFFIX = '?inject-nfpx-imports';
const SI_NFPX_IMPORT = '\0nfpx-import?';
const SI_NFPX_SPECIFIER_PREFIX = 'nfpx:';

interface NfpxJson {
	exports: {
		[si_other: string]: Dict;
		'.': Dict;
	};
}

export function nfpxWindow(gc_nfpm: NfpModuleConfig): VitePlugin {
	const si_export = gc_nfpm.id;
	if(!si_export) {
		throw new Error(`Must supply an 'id' option to nfpxWindow()`);
	}

	const si_export_identifier = identifier_for_module(si_export);

	const f_filter = createFilter(gc_nfpm.include ?? './**/*.ts', gc_nfpm.exclude);

	const h_entries: Dict<Dict<{
		alias: string;
		symbol: string;
		init?: string;
		dynamic?: boolean;
	}>> = {};

	let a_entries: string[] = [];

	// typed hook helpers
	/* eslint-disable @typescript-eslint/no-unsafe-argument */
	const f_hooks = (y_hook: PluginContext, y_magic?: MagicString) => ({
		// typed overwrite
		f_replace: (y_node: BaseNode, sx_write: string) => y_magic?.overwrite((y_node as any).start, (y_node as any).end, sx_write),

		// typed warn
		f_warn: (s_msg: string, y_node?: BaseNode) => y_hook.warn(s_msg, (y_node as any)?.start),

		// typed error
		f_error: (s_msg: string, y_node?: BaseNode) => y_hook.error(s_msg, (y_node as any)?.start),
		/* eslint-enable */
	});


	return {
		name: 'nfpxWindow',

		// for exporting
		buildStart(gc_opts) {
			a_entries = [];

			if(Array.isArray(gc_opts.input)) {
				a_entries = gc_opts.input.map(sr_file => path.resolve(sr_file));
			}
			else if('object' === typeof gc_opts.input) {
				for(const [, sr_file] of Object.entries(gc_opts.input)) {
					a_entries.push(path.resolve(sr_file));
				}
			}
			else {
				throw new Error(`Failed to determine type of RollupOptions.input; expected string[] or object`);
			}
		},

		// for importing
		async resolveId(si_specifier, si_importer, gc_resolve) {
			if(si_specifier === SI_NFPX_EXPORT) {
				return {
					id: SI_NFPX_EXPORT,
					moduleSideEffects: true,
				};
			}
			else if(si_specifier.startsWith(SI_NFPX_SPECIFIER_PREFIX)) {
				return {
					id: SI_NFPX_IMPORT+si_specifier.slice(SI_NFPX_SPECIFIER_PREFIX.length),
					moduleSideEffects: true,
				};
			}
			else if(gc_resolve.isEntry) {
				const g_resolution = await this.resolve(si_specifier, si_importer, {
					skipSelf: true,
					...gc_resolve,
				});

				if(!g_resolution || g_resolution.external) return g_resolution;

				const g_module = await this.load(g_resolution);

				g_module.moduleSideEffects = true;

				return si_specifier+SI_SUFFIX;
			}

			return null;
		},

		// for importing
		async load(si_module) {
			const {
				f_error,
			} = f_hooks(this);

			if(si_module === SI_NFPX_EXPORT) {
				// nfpx-export
				return '';
			}
			else if(si_module.startsWith(SI_NFPX_IMPORT)) {
				const si_nfpx = si_module.slice(SI_NFPX_IMPORT.length);

				const sr_nfpx_json = `./dist/${si_nfpx}.nfpx.json`;

				// read from json file
				let sx_nfpx_json: string;
				try {
					sx_nfpx_json = await fs.readFile(sr_nfpx_json, 'utf-8');
				}
				catch(e_read) {
					return f_error(`Failed to read ${sr_nfpx_json}; did you build the module first?`);
				}

				// parse
				let g_nfpx_json: NfpxJson;
				try {
					g_nfpx_json = JSON.parse(sx_nfpx_json) as NfpxJson;
				}
				catch(e_parse) {
					return f_error(`Corrupt nfpx json file "${sr_nfpx_json}"; failed to parse JSON`);
				}

				const a_destructures: string[] = [];
				const a_aliases: string[] = [];

				// exports for this module
				const h_module = g_nfpx_json.exports['.'];

				if(!h_module) {
					return f_error(`Corrupt nfpx json file ${sr_nfpx_json}; missing default export: ${sr_nfpx_json}`);
				}

				for(const [si_alias, si_identifier] of Object.entries(h_module)) {
					a_destructures.push(`${si_identifier}:${si_alias}`);
					a_aliases.push(si_alias);
				}

				return `
					// destructure exports from reserved window identifier
					const {${a_destructures.join(',')}} = window.${identifier_for_module(si_nfpx)};

					export {${a_aliases.join(',')}};
				`.split(/\s*\n\s*/g).join('\n');
			}
			else if(si_module.endsWith(SI_SUFFIX)) {
				const si_entry = si_module.slice(0, -SI_SUFFIX.length);

				const b_default = this.getModuleInfo(si_entry)?.hasDefaultExport;

				let sx_out = `
					import ${JSON.stringify(SI_NFPX_EXPORT)};
					export * from ${JSON.stringify(si_entry)}
				`;

				if(b_default) {
					sx_out += `export {default} from ${JSON.stringify(si_entry)};`;
				}

				return sx_out;
			}

			return null;
		},

		// for exporting
		transform(sx_code, si_module) {
			if(!f_filter(si_module)) return;

			const b_entry = a_entries.includes(si_module);

			const y_ast = this.parse(sx_code);

			let y_scope = attachScopes(y_ast, 'scope');

			const y_magic = new MagicString(sx_code);

			const {
				f_replace,
				f_warn,
				f_error,
			} = f_hooks(this, y_magic);

			h_entries[si_module] = {};
			const h_exports = h_entries[si_module];

			function dynamic_export(s_alias: string) {
				const i_symbol = Object.keys(h_entries).length;

				return (h_exports[s_alias] = {
					dynamic: true,
					alias: s_alias,
					symbol: encode_symbol(i_symbol),
				}).symbol;
			}

			function add_export(s_alias: string, s_init: string) {
				const i_symbol = Object.keys(h_exports).length;

				const si_symbol = encode_symbol(i_symbol);

				return h_exports[s_alias] = {
					alias: s_alias,
					symbol: si_symbol,
					init: s_init,
				};
			}

			walk(y_ast as Node, {
				enter(y_node, y_parent, si_prop, i_index): void {
					// @ts-expect-error scope
					if(y_node.scope) y_scope = y_node.scope;

					// find all dynamic exports `exportNfpx(...)`
					if('CallExpression' === y_node.type) {
						// type-cast call node
						const y_call = y_node as CallExpression;

						// exportNfpx callee
						const y_callee = y_call.callee;
						if('Identifier' === y_callee.type && 'exportNfpx' === y_callee.name) {
							const nl_args = y_call.arguments.length;

							// no-args is a no-op
							if(!nl_args) {
								// issue warning
								f_warn('No-arg call to `exportNfpx()` is a no-op and has no effect', y_call);

								// delete call
								f_replace(y_call, '');
							}
							// correct number of args
							else if(1 === y_call.arguments.length) {
								const y_arg = y_call.arguments[0];

								if('ObjectExpression' !== y_arg.type) {
									return f_error('Call to exportNfpx()` must pass an object literal expression');
								}

								const a_export_pairs: string[] = [];

								// each property in expr
								for(const y_prop of y_arg.properties) {
									if('Property' !== y_prop.type) {
										return f_error(`${y_prop.type} not allowed in call to exportNfpx()`);
									}

									if('init' !== y_prop.kind) {
										return f_error(`${y_prop.kind} property not allowed in call to exportNfpx()`);
									}

									if('Identifier' !== y_prop.key.type) {
										return f_error(`${y_prop.key.type} is not an identifier; All keys must be identifiers in call to exportNfpx()`);
									}

									// create/lookup id from alias
									const si_alias = y_prop.key.name;

									// declare dynamic export
									const si_symbol = dynamic_export(si_alias);

									// add serialized code to list
									a_export_pairs.push(si_symbol+':'+astring.generate(y_prop.value));
								}

								// serialize object literal
								const sx_exports_object = `{${a_export_pairs.join(',')}}`;

								// replace call with merge
								f_replace(y_call, `window.${si_export_identifier} = Object.assign(window.${si_export_identifier} || {}, ${sx_exports_object});\n`);
							}
							// too many arguments
							else {
								return f_error('Call to `exportNfpx()` passed too many arguments', y_call);
							}
						}
					}
					// export expression
					else if('ExportNamedDeclaration' === y_node.type) {
						// onnly replace exports of the entry file
						if(!b_entry) return;

						const y_export = y_node;

						// single entry
						if(y_export.declaration) {
							const y_decl = y_export.declaration;
							switch(y_decl.type) {
								case 'VariableDeclaration': {
									if('const' !== y_decl.kind) {
										return f_error('Export variable must be const', y_decl);
									}

									for(const y_var of y_decl.declarations) {
										add_export((y_var.id as Identifier).name, astring.generate(y_var.init!));
									}

									break;
								}

								case 'FunctionDeclaration': {
									add_export(y_decl.id!.name, astring.generate(y_decl));
									break;
								}

								case 'ClassDeclaration': {
									add_export(y_decl.id!.name, astring.generate(y_decl));
									break;
								}

								default: {
									return f_error(`Unsupported export type`, y_decl);
								}
							}

							// replace export with declaration
							f_replace(y_export, astring.generate(y_decl));
						}
						// specifier group
						else {
							const a_exports: {
								local: string;
								alias: string;
							}[] = [];

							// each specifier
							for(const y_spec of y_export.specifiers) {
								a_exports.push({
									local: y_spec.local.name,
									alias: y_spec.exported.name,
								});

								add_export(y_spec.exported.name, y_spec.local.name);
							}

							// // ammend map
							// Object.assign(h_nfpx_exports, a_exports.reduce((h_out, g_export, i_export) => ({
							// 	...h_out,
							// 	[g_export.alias]: encode_symbol(i_export),
							// }), {}));

							// // create the encoded symbols object literal map
							// const a_encoded = a_exports.map((g_export, i_export) => encode_symbol(i_export)+':'+g_export.local);

							// // prep the window identifier
							// const si_identifier = makeLegalIdentifier('nfpx_'+path.parse(p_file).name);

							// // write the export annotation and window assignment expression
							// const sx_out = [
							// 	`window.${si_identifier} = {${a_encoded.join(', ')}};`,
							// ].join('\n')+'\n';

							// // replace declaration with window write
							// f_replace(y_export, sx_out);

							// remove export
							f_replace(y_export, '');
						}
					}
				},

				// pop scope
				leave(y_node) {
					// @ts-expect-error scope
					if(y_node.scope) y_scope = y_scope.parent;
				},
			});

			// serialize to code
			if(b_entry) {
				const a_encoded = Object.values(h_entries[si_module])
					.filter(g => !g.dynamic)
					.map(g => `${g.symbol}: ${g.init || 'void 0'}`);

				// append exports
				y_magic.append(`window.${si_export_identifier} = {\n${a_encoded.join(',\n')}\n};`);
			}

			return {
				code: y_magic.toString(),
				map: y_magic.generateMap({
					hires: true,
				}),
			};
		},

		// for exporting
		async generateBundle(gc_output, h_bundle) {
			let sr_outdir = '';

			if(gc_output.dir) {
				sr_outdir = gc_output.dir;
			}
			else if(gc_output.file) {
				sr_outdir = path.dirname(gc_output.file);
			}

			debugger;
			for(const si_entry of a_entries) {
				const g_chunk = h_bundle[si_entry];

				if('chunk' === g_chunk.type) {
					const g_exports: NfpxJson = {
						exports: {
							'.': Object.values(h_entries[si_entry]).reduce((h_out, g_export) => ({
								...h_out,
								[g_export.alias]: g_export.symbol,
							}), {}),
						},
					};

					// write nfp export map
					await fs.writeFile(path.join(sr_outdir, `${gc_nfpm.id}.nfpx.json`), JSON.stringify(g_exports, null, '\t'));
				}
			}
		},
	};
}
