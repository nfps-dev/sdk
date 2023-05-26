import type {NfpModuleConfig, Plugin} from '../_types';

import type {
	BaseNode,
	CallExpression,
	Node,
	Identifier,
	AssignmentProperty,
} from 'estree';

import type {PluginContext} from 'rollup';

import fs from 'node:fs/promises';
import path from 'node:path';

import {sha256, type Dict, text_to_buffer, buffer_to_base93, ode, odv, buffer_to_hex, oderom, fodemtv, fold, ofe} from '@blake.regalia/belt';

import {attachScopes, createFilter, makeLegalIdentifier} from '@rollup/pluginutils';
import * as astring from 'astring';
import {walk} from 'estree-walker';
import MagicString from 'magic-string';

import {checkNodeForDynamicImport} from './dynamic-imports.js';

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

const SI_SUFFIX = '?nfpx-entry';
const SI_NFPX_EXPORT = '\0nfpx-export?';
const SI_NFPX_IMPORT = '\0nfpx-import?';
const SI_NFPX_IMPORT_DYNAMIC = '\0nfpx-import-dynamic?';
const SI_NFPX_SPECIFIER_PREFIX = 'nfpx:';
const SI_GLOBAL_RUNTIME_PREFIX = 'nfpx_';

const SR_NFP_MODULES_JSON = '.nfp-modules.json';


const S_ERR_PREFIX_IMPORT = `The "${SI_NFPX_SPECIFIER_PREFIX}" prefix is only for static imports; for dynamic imports, you need to use the package id, e.g., "main.js"`;

const identifier_for_module = (si_file: string) => makeLegalIdentifier(SI_GLOBAL_RUNTIME_PREFIX+path.parse(si_file).name);

const unindent = (s_src: string, s_unit='    ') => {
	let nl_indent = Infinity;
	let s_indent = '';

	const a_lines = s_src.split(/\n/g);

	for(const s_line of a_lines) {
		if(/^\s*$/.test(s_line)) continue;
		const m_indent = /^(\s*)[\S]/.exec(s_line);
		if(m_indent) {
			const nl_indent_local = m_indent[1].length;
			if(nl_indent_local < nl_indent) {
				nl_indent = nl_indent_local;
				s_indent = m_indent[1];
			}
		}
	}

	const r_indent = new RegExp('^'+s_indent);
	return a_lines.map(s_line => s_line
		.replace(r_indent, '')
		.replaceAll('\t', s_unit)
		.replace(/^\s+$/, '')
	).join('\n');
};

interface ExportEntry {
	symbol: string;
	dynamic?: boolean;
}

// intermediate storage (not serialized)
interface WorkingExportEntry extends ExportEntry {
	// alias: string;
	init?: string;
}

export type Dependencies = Dict<{
	version: string;
	hash: string;
	dynamic?: boolean;
	imports: Dict<ExportEntry>;
}>;

export interface NfpModulesJson {
	schema: string;
	comment?: string;
	modules: Record<string, {
		version: `${bigint}.${bigint}`;
		hash: string;
		exports: {
			[si_other: string]: Dict<ExportEntry>;
			'.': Dict<ExportEntry>;
		};
		dependencies: Dependencies;
	}>;
}

export interface NfpxWindowConfig extends NfpModuleConfig {
	importsOnly?: boolean;
}


// loads nfp module json
export async function loadNfpModulesJson({
	error: f_error,
}: {
	error: PluginContext['error'] | ((s_msg: string, y_node?: Node) => never);
}): Promise<NfpModulesJson> {
	// read .nfp-modules.json
	let sx_json = '';
	try {
		sx_json = await fs.readFile(SR_NFP_MODULES_JSON, 'utf-8');
	}
	catch(e_access) {
		if('ENOENT' !== (e_access as {code: string}).code) {
			return f_error(`Failed to read ${SR_NFP_MODULES_JSON}`);
		}
	}

	// prep structure
	let g_json: NfpModulesJson = {
		schema: '1',
		comment: 'Do not edit or delete this generated file! It should also be committed to version control.',
		modules: {},
	};

	// parse file contents
	if(sx_json.trim()) {
		try {
			g_json = JSON.parse(sx_json) as unknown as NfpModulesJson;

			if(!g_json.modules) {
				throw new Error('Missing modules key');
			}
		}
		catch(e_parse) {
			return f_error(`Corrupt ${SR_NFP_MODULES_JSON} file: ${(e_parse as Error).stack!}`);
		}
	}

	// update fields
	return g_json;

	// g_nfp_module = g_nfp_modules_json.modules[si_export];
}

export function nfpxWindow(gc_nfpm: NfpxWindowConfig): Plugin {
	const si_export = gc_nfpm.id;
	if(!si_export) {
		throw new Error(`Must supply an 'id' option to nfpxWindow()`);
	}

	const si_export_identifier = identifier_for_module(si_export);

	const f_filter = createFilter(gc_nfpm.include ?? './**/*.ts', gc_nfpm.exclude);

	// list of entrypoint files
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

	// stored module data
	let g_nfp_modules_json: NfpModulesJson;
	let g_nfp_module: NfpModulesJson['modules'][string];

	// working module data
	let h_exports: Dict<WorkingExportEntry>;
	let h_dependencies: Dependencies;

	const load_nfp_modules_json = async(y_context: PluginContext) => {
		const g_json = g_nfp_modules_json = await loadNfpModulesJson(y_context);

		// ensure module def exists
		if(!g_json.modules[si_export]) {
			g_json.modules[si_export] = {
				version: '0.0',
				hash: '',
				exports: {
					'.': {},
				},
				dependencies: {},
			};
		}

		g_nfp_module = g_json.modules[si_export];
	};

	return {
		name: 'nfpx-modules',

		// for exporting
		async buildStart(gc_opts) {
			a_entries = [];

			// load nfp modules json
			await load_nfp_modules_json(this);

			// reset working data, copy the exports from the json so as not to overwrite stored version
			h_exports = fodemtv(g_nfp_module.exports['.'], g_entry => ({...g_entry}));
			h_dependencies = {};

			if(gc_nfpm.importsOnly) return;

			// parse inputs
			if(Array.isArray(gc_opts.input)) {
				a_entries = gc_opts.input.map(sr_file => path.resolve(sr_file));
			}
			else if('object' === typeof gc_opts.input) {
				for(const [, sr_file] of ode(gc_opts.input)) {
					a_entries.push(path.resolve(sr_file));
				}
			}
			else {
				throw new Error(`Failed to determine type of RollupOptions.input; expected string[] or object`);
			}
		},

		// for importing
		async resolveId(si_specifier, si_importer, gc_resolve) {
			if(SI_NFPX_EXPORT === si_specifier) {
				return {
					id: SI_NFPX_EXPORT,
					moduleSideEffects: true,
				};
			}
			// importer is attempting to statically import an nfp module
			else if(si_specifier.startsWith(SI_NFPX_SPECIFIER_PREFIX)) {
				// mark the specifier as a module to import
				return {
					id: SI_NFPX_IMPORT+si_specifier.slice(SI_NFPX_SPECIFIER_PREFIX.length),
					moduleSideEffects: true,
				};
			}
			// the entry file
			else if(gc_resolve.isEntry) {
				const g_resolution = await this.resolve(si_specifier, si_importer, {
					skipSelf: true,
					...gc_resolve,
				});

				if(!g_resolution || g_resolution.external) return g_resolution;

				const g_module = await this.load(g_resolution);

				g_module.moduleSideEffects = true;

				// mark the entry file
				return si_specifier+SI_SUFFIX;
			}

			return null;
		},

		resolveDynamicImport(si_specifier, p_importer, g_assertions) {
			const s_err = `In ${p_importer} at 'import(${si_specifier})': Cannot use dynamic import statements in NFPs except for import("${SI_NFPX_SPECIFIER_PREFIX}:[MODULE_NAME]", {...})`;

			this.error(s_err);

			// if('string' !== typeof si_specifier) this.error(s_err);

			// if(!si_specifier.startsWith(SI_NFPX_SPECIFIER_PREFIX)) this.error(s_err);

			// // importer is attempting to dynamically import an nfp module
			// return {
			// 	id: SI_NFPX_IMPORT_DYNAMIC,
			// 	moduleSideEffects: true,
			// 	meta: {
			// 		nfpx: g_assertions,
			// 	},
			// };
		},

		// for importing
		load(si_module) {
			const {
				f_error,
			} = f_hooks(this);

			if(si_module === SI_NFPX_EXPORT) {
				// inject module system
				if(true === gc_nfpm.injectNfpModuleSystem) {
					return unindent(/* js */`
						import {load_script} from '@nfps.dev/runtime';

						window.nfpx = {
							// assign/overwrite/extend an arbitrary global window value
							a: (si_prop, h_data) => window[si_prop] = {...window[si_prop], ...h_data},

							// default to sdk loader
							l: load_script,

							// inject a module into the current document, allow it to load, then destructure its static exports
							i(si_module, ...a_args) {
								// prep global identifier
								const si_ident = '${SI_GLOBAL_RUNTIME_PREFIX}'+si_module.replace(/\\.[cm]?js$/, '');

								// return module if its already loaded; otherwise attempt to load the pacakge from chain
								return window[si_ident] || nfpx.l(si_module, ...a_args).then(dm_script => {
									// failed
									if(!dm_script) throw Error('Failed to load '+si_module);
		
									// go async
									return new Promise((fk_resolve) => {
										// wait for script to load; return module's exports
										dm_script.addEventListener('load', () => fk_resolve(window[si_ident]));
		
										// add the script to the page to start loading
										document.documentElement.append(dm_script);
									});
								}, (e_load) => {
									throw e_load;
								});
							},
						};
					`);
				}
				else {
					return '';
				}
			}
			// statically importing an nfp module
			else if(si_module.startsWith(SI_NFPX_IMPORT)) {
				// get the module's id
				const si_nfpx = si_module.slice(SI_NFPX_IMPORT.length);

				// lookup its exports
				const g_nfpx_json = g_nfp_modules_json.modules[si_nfpx];

				// not found
				if(!g_nfpx_json) {
					return f_error(`Failed to read NFP module exports for ${si_nfpx}; did you build the module first?`);
				}

				// debugger;
				h_dependencies[si_nfpx] = Object.assign(h_dependencies[si_nfpx] || {}, {
					version: g_nfpx_json.version,
					hash: g_nfpx_json.hash,
					// imports: h_dependencies[si_import].imports || {},
				});

				const a_destructures: string[] = [];
				const a_aliases: string[] = [];

				// exports for this module
				const h_module = g_nfpx_json.exports['.'];

				if(!h_module) {
					return f_error(`Corrupt nfpx json file ${SR_NFP_MODULES_JSON}; missing default exports for ${si_nfpx} module`);
				}

				for(const [si_alias, g_entry] of ode(h_module)) {
					a_destructures.push('\n'+'\t'.repeat(6)+`${g_entry.symbol}:${si_alias}`);
					a_aliases.push(si_alias);
				}

				// create the virtual module with exports to be bundled into the importer
				return unindent(`
					// load exports from module via its reserved property id on window
					const h_exports = window.${identifier_for_module(si_nfpx)};

					// destructure exports
					const {${a_destructures.join(',')}
					} = h_exports;

					// default export
					export default h_exports;

					// tree-shakeable export
					export {${a_aliases.join(',')}};
				`);
			}
			// // dynamically importing an nfp module
			// else if(si_module.startsWith(SI_NFPX_IMPORT_DYNAMIC)) {
			// 	const g_nfpx = this.getModuleInfo(si_module)?.meta['nfpx'] || {};
			// 	debugger;

			// 	return `
			// 		const {readOwner} = await fetch('module.js?tag=latest', ${JSON.stringify(g_nfpx)});

			// 		export {readOwner};
			// 	`;
			// }
			// 
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

		// for exporting and dynamic import
		transform(sx_code, p_file) {
			if(!f_filter(p_file)) return;

			const b_entry = a_entries.includes(p_file);

			const y_ast = this.parse(sx_code);

			let y_scope = attachScopes(y_ast, 'scope');

			const y_magic = new MagicString(sx_code);

			const {
				f_replace,
				f_warn,
				f_error,
			} = f_hooks(this, y_magic);

			function add_export(s_alias: string, s_init?: string) {
				const g_entry = h_exports[s_alias];

				// alias already defined
				if(g_entry) {
					// update init if set (replace dynamic exports with static ones wherever they occur)
					if('string' === typeof s_init) {
						g_entry.init = s_init;
						delete g_entry.dynamic;
					}

					return g_entry.symbol;
				}

				// create new symbol
				const i_symbol = Object.keys(h_exports).length;

				// add to export map
				return (h_exports[s_alias] = {
					symbol: encode_symbol(i_symbol),
					...'string' === typeof s_init
						? {init:s_init}
						: {dynamic:true},
				}).symbol;
			}

			walk(y_ast as Node, {
				enter(yn_self, yn_parent, si_prop, i_index): void {
					// @ts-expect-error scope
					if(yn_self.scope) y_scope = yn_self.scope;

					// find all dynamic exports `exportNfpx(...)`
					if('CallExpression' === yn_self.type) {
						// type-cast call node
						const yn_call = yn_self as CallExpression;

						// exportNfpx callee
						const y_callee = yn_call.callee;
						if('Identifier' === y_callee.type && 'exportNfpx' === y_callee.name) {
							const nl_args = yn_call.arguments.length;

							// no-args is a no-op
							if(!nl_args) {
								// issue warning
								f_warn('No-arg call to `exportNfpx()` is a no-op and has no effect', yn_call);

								// delete call
								f_replace(yn_call, '');
							}
							// correct number of args
							else if(1 === yn_call.arguments.length) {
								const yn_arg = yn_call.arguments[0];

								if('ObjectExpression' !== yn_arg.type) {
									return f_error('Call to exportNfpx()` must pass an object literal expression');
								}

								const a_export_pairs: string[] = [];

								// each property in expr
								for(const yn_prop of yn_arg.properties) {
									if('Property' !== yn_prop.type) {
										return f_error(`${yn_prop.type} not allowed in call to exportNfpx()`);
									}

									if('init' !== yn_prop.kind) {
										return f_error(`${yn_prop.kind} property not allowed in call to exportNfpx()`);
									}

									if('Identifier' !== yn_prop.key.type) {
										return f_error(`${yn_prop.key.type} is not an identifier; All keys must be identifiers in call to exportNfpx()`);
									}

									// create/lookup id from alias
									const si_alias = yn_prop.key.name;

									// declare dynamic export
									const si_symbol = add_export(si_alias);

									// add serialized code to list
									a_export_pairs.push(`\n  ${si_symbol}: ${astring.generate(yn_prop.value)},`);
								}

								// serialize object literal
								const sx_exports_object = `{${a_export_pairs.join('')}\n}`;

								// replace call with merge
								f_replace(yn_call, `nfpx.a('${si_export_identifier}', ${sx_exports_object});\n`);
							}
							// too many arguments
							else {
								return f_error('Call to `exportNfpx()` passed too many arguments', yn_call);
							}
						}
					}
					// export expression
					else if('ExportNamedDeclaration' === yn_self.type) {
						// onnly replace exports of the entry file
						if(!b_entry) return;

						// single entry
						if(yn_self.declaration) {
							const yn_decl = yn_self.declaration;
							switch(yn_decl.type) {
								case 'VariableDeclaration': {
									if('const' !== yn_decl.kind) {
										return f_error('Export variable must be const', yn_decl);
									}

									for(const yn_var of yn_decl.declarations) {
										add_export((yn_var.id as Identifier).name, astring.generate(yn_var.init!));
									}

									break;
								}

								case 'FunctionDeclaration': {
									add_export(yn_decl.id!.name, astring.generate(yn_decl));
									break;
								}

								case 'ClassDeclaration': {
									add_export(yn_decl.id!.name, astring.generate(yn_decl));
									break;
								}

								default: {
									return f_error(`Unsupported export type`, yn_decl);
								}
							}

							// replace export with declaration
							f_replace(yn_self, astring.generate(yn_decl));
						}
						// specifier group
						else {
							const a_exports: {
								local: string;
								alias: string;
							}[] = [];

							// each specifier
							for(const yn_spec of yn_self.specifiers) {
								a_exports.push({
									local: yn_spec.local.name,
									alias: yn_spec.exported.name,
								});

								add_export(yn_spec.exported.name, yn_spec.local.name);
							}

							// remove export
							f_replace(yn_self, '');
						}
					}
					// find all dynamic imports using `await import(...)`
					else {
						checkNodeForDynamicImport(yn_self, yn_parent, {f_error, f_replace}, g_nfp_modules_json, h_dependencies);
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
				const a_encoded = odv(h_exports)
					.filter(g => !g.dynamic)
					.map(g => `\n  ${g.symbol}: ${g.init || 'void 0'},`);

				// append exports
				y_magic.append(`window.${si_export_identifier} = {${a_encoded.join('')}\n};`);
			}

			// console.log(y_magic.toString());

			return {
				code: y_magic.toString(),
				map: y_magic.generateMap({
					hires: true,
				}),
			};
		},

		// for exporting
		async generateBundle(gc_output, h_bundle) {
			if(gc_nfpm.importsOnly) return;

			// update json before serializing
			await load_nfp_modules_json(this);

			// search bundle for entry chunk
			for(const [, g_chunk] of ode(h_bundle)) {
				// found it
				if('chunk' === g_chunk.type && g_chunk.isEntry) {
					// locate the corresponding entry path
					for(const p_entry of a_entries) {
						const si_facade = g_chunk.facadeModuleId;

						// matched facade to path
						if(si_facade && p_entry.endsWith(si_facade.replace(/\?.*$/, ''))) {
							const h_exports_stored = g_nfp_module.exports['.'];

							// detect non-breaking minor changes
							let b_feature = false;

							// compare exports from stored to live
							for(const [si_alias, g_entry_stored] of ode(h_exports_stored)) {
								const g_entry_live = h_exports[si_alias];

								// export was deleted
								if(!g_entry_live) {
									return this.error(`Breaking change detected; the ${si_export} module used to export ${si_alias} but the source no longer appears to include this member.`);
								}
								// export changed from static to dynamic
								else if(!g_entry_stored.dynamic && g_entry_live.dynamic) {
									return this.error(`Breaking change detected; the ${si_export} module used to statically export ${si_alias} but now appears to export it dynamically.`);
								}
								// symbol changed
								else if(g_entry_stored.symbol !== g_entry_live.symbol) {
									return this.error(`Something went wrong, stopped before overwriting the ${si_alias} export symbol from "${g_entry_stored.symbol}" to "${g_entry_live.symbol}" in the ${si_export} module`);
								}
							}

							// compare exports from live to stored
							for(const [si_alias, g_entry_live] of ode(h_exports)) {
								const g_entry_stored = h_exports_stored[si_alias];

								// new export
								if(!g_entry_stored) {
									b_feature = true;
									break;
								}
								// change from dynamic to static
								else if(g_entry_stored.dynamic !== g_entry_live.dynamic) {
									b_feature = true;
									break;
								}
							}

							// remove working data
							for(const [si_alias, g_entry_live] of Object.entries(h_exports)) {
								delete g_entry_live.init;
							}

							// overwrite exports, preserving existing order
							h_exports = Object.assign(g_nfp_module.exports['.'], h_exports);

							// compute hash
							g_nfp_module.hash = buffer_to_hex(await sha256(text_to_buffer(JSON.stringify(h_exports)))).slice(0, 12);

							// parse version and then re-serialize
							const [n_major, n_minor] = g_nfp_module.version.split('.').map(s => +s);
							g_nfp_module.version = [n_major, n_minor + (b_feature? 1: 0)].join('.') as `${bigint}.${bigint}`;

							// update dependencies
							g_nfp_module.dependencies = h_dependencies;

							// can stop searching
							break;
						}
					}
				}
			}

			// replace file
			await fs.writeFile(SR_NFP_MODULES_JSON, JSON.stringify(g_nfp_modules_json, null, '\t'));

			return;
		},
	};
}

export default nfpxWindow;
