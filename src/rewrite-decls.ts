import type {NfpModuleConfig} from './_types';
import type {SyntaxKindLookup} from './syntax-kinds';
import type {OutputAsset} from 'rollup';
import type {
	LiteralExpression,
	Node,
	SourceFile,
	TransformationContext,
	VisitResult,
	Visitor,
	PropertySignature,
	TransformationResult,
	NamedExports,
	Type,
	Declaration,
	TypeAliasDeclaration,
	Statement,
} from 'typescript';

import path from 'node:path';

import {default as ts} from 'typescript';

// polyfill crypto
// @ts-expect-error node types
if(!globalThis.crypto) globalThis.crypto = (await import('node:crypto')).webcrypto;

const {
	factory,
	SyntaxKind: kind,
} = ts;

type ModuleSpecifying = Node & {moduleSpecifier: Node};

const create = (sx_code: string, si_file?: string, b_parents=true): SourceFile => ts.createSourceFile(si_file || crypto.randomUUID(), sx_code, ts.ScriptTarget.Latest, b_parents, ts.ScriptKind.TS);

const load = (g_entry: OutputAsset): SourceFile => create(g_entry.source as string, g_entry.fileName);

const statement = <y_node extends Node>(sx_statement: string) => create(sx_statement, '', false).statements[0] as unknown as y_node;

const serialize = (y_source: SourceFile): string => ts.createPrinter({
	newLine: ts.NewLineKind.LineFeed,
}).printFile(y_source);

const combine = (a_statements: Statement[]) => factory.updateSourceFile(create('', '', false), a_statements, true);

type VResult = VisitResult<Node | undefined> | null | void;

function traverse_asset(
	g_entry: OutputAsset,
	f_transform: (y_node: Node, g_context: TransformationContext) => VResult
): TransformationResult<Node> {
	// load source from asset
	const y_loaded = load(g_entry);

	// apply transformer
	return ts.transform(y_loaded, [
		// transformer
		g_context => (y_source) => {
			// define visitor
			const f_visit: Visitor = (y_node) => {  // eslint-disable-line arrow-body-style
				// transform callback
				const z_result = f_transform(y_node, g_context);

				// truthy returns; null indicates to stop recursing; any other falsy means continue recursing
				return z_result || (null === z_result? y_node: ts.visitEachChild(y_node, f_visit, g_context));
			};

			// transform the program
			return ts.visitNode(y_source, f_visit) as SourceFile;
		},
	]);
}

function transform_asset(
	g_entry: OutputAsset,
	f_transform: (y_node: Node, g_context: TransformationContext) => VResult
): SourceFile {
	const y_result = traverse_asset(g_entry, f_transform);

	// will always only be a single source file in transformed result
	const y_transformed = y_result.transformed[0] as SourceFile;

	// serialize to .d.ts code
	const y_printer = ts.createPrinter({
		newLine: ts.NewLineKind.LineFeed,
	});

	// overwrite bundle
	const sx_output = g_entry.source = y_printer.printFile(y_transformed);

	// console.log(`wrote to ${g_entry.fileName}::\n${sx_output}`);

	// return transformed source file
	return y_transformed;
}

function neuter_exports(g_subject: OutputAsset): SourceFile {
	return transform_asset(g_subject, (y_node) => {
		// keep all imports
		if(kind.ImportDeclaration === y_node.kind) {
			return y_node;
		}
		// remove anything else
		else if(kind.SourceFile !== y_node.kind) {
			return [];
		}

		// recurse
		return;
	});
}


const map_node = <
	w_out,
>(
	y_node: Node,
	h_kinds: Partial<{
		[xc_kind in keyof SyntaxKindLookup]: (y_cast: SyntaxKindLookup[xc_kind]) => w_out | VResult
	}>
): w_out | VResult => (h_kinds[y_node.kind as keyof SyntaxKindLookup] as ((y_node: Node) => w_out | VResult))?.(y_node);

export class DeclRewriter {
	protected _si_entry_decl: string;

	protected _h_fields: Record<string, string> = {};
	protected _as_exclude = new Set<string>();

	constructor(
		protected _si_entry: string,
		protected _h_bundle: Record<string, OutputAsset>,
		protected _gc_nfpm: NfpModuleConfig
	) {
		const si_entry_decl = this._si_entry_decl = path.basename(_si_entry, '.ts')+'.d.ts';

		const g_entry_decl = _h_bundle[si_entry_decl];
		if('asset' === g_entry_decl.type) {
			// first, capture the NfpxExports interface
			this._capture_nfpx_exports(g_entry_decl);

			// inline all imports
			this._inline_imports(g_entry_decl);

			// append the nfpx exports
			this._append_nfpx_exports(g_entry_decl);

			// do not emit any other .d.ts files
			for(const [si_file] of Object.entries(_h_bundle)) {
				if(si_file.endsWith('.d.ts') && si_file !== si_entry_decl) {
					delete _h_bundle[si_file];
				}
			}

			// rename to align with id
			const si_expect = _gc_nfpm.id+'.d.ts';
			if(si_expect !== si_entry_decl) {
				_h_bundle[si_expect] = _h_bundle[si_entry_decl];
				delete _h_bundle[si_entry_decl];
			}
		}
	}

	protected _asset_from_specifier(y_node: ModuleSpecifying): OutputAsset | void {
		const {
			_h_bundle,
		} = this;

		const sr_specifier = (y_node.moduleSpecifier as LiteralExpression).text;

		// relative specifier
		if(/^\.\.?\//.test(sr_specifier)) {
			// resolve to bundle id
			const si_import = path.relative(path.dirname(y_node.getSourceFile().fileName), sr_specifier);

			// locate the asset by resolving its id
			let g_asset = _h_bundle[si_import];
			if(!g_asset && !si_import.endsWith('.ts')) {
				g_asset = _h_bundle[si_import+'.ts'];
				if(!g_asset) g_asset = _h_bundle[si_import+'.d.ts'];
			}

			// found asset
			if(g_asset) {
				return g_asset;
			}
		}
	}

	protected _inline_imports(g_entry: OutputAsset, a_blocking: OutputAsset[]=[]): void {
		// cycle detected; prevent infinite recursion
		if(a_blocking.includes(g_entry)) {
			throw new Error(`Import dependency cycle detected:${a_blocking.map(g => `\n  ${g.fileName}`).join('')}`);
		}

		const k_self = this;

		// parse
		transform_asset(g_entry, y_node => map_node(y_node, {
			// import [type] ...
			[kind.ImportDeclaration](y_import) {
				// no import clause; drop node
				if(!y_import.importClause) return [];

				// import is relative
				const g_asset = k_self._asset_from_specifier(y_import);
				if(g_asset) {
					// inline the asset
					k_self._inline_imports(g_asset, [...a_blocking, g_entry]);
				}

				// stop recursing
				return null;
			},

			// export [type] ...
			[kind.ExportDeclaration](y_export) {
				// export [type] ... from ...
				if(y_export.moduleSpecifier) {
					// import is relative
					const g_asset = k_self._asset_from_specifier(y_export as ModuleSpecifying);
					if(g_asset) {
						// rewrite the asset to inline all of its imports
						k_self._inline_imports(g_asset, [...a_blocking, g_entry]);

						// neuter all of the asset's own exports
						const y_neutered = neuter_exports(g_asset);
						const sx_neutered = ts.createPrinter().printFile(y_neutered);

						// replace the statement that imports the asset
						const y_recreated = ts.createSourceFile('virtual', sx_neutered, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);

						return y_recreated;
					}
				}

				// stop recursing
				return null;
			},
		}));
	}

	_append_nfpx_exports(g_subject: OutputAsset): void {
		const {_h_fields, _as_exclude} = this;

		transform_asset(g_subject, y_node => map_node(y_node, {
			[kind.SourceFile](y_source) {
				return create([
					serialize(y_source),
					serialize(combine(Object.entries(_h_fields)
						.filter(([si_field]) => !_as_exclude.has(si_field))
						.map(([si_field, sx_type]) => factory.createVariableStatement([
							factory.createModifier(kind.ExportKeyword),
							factory.createModifier(kind.DeclareKeyword),
						], factory.createVariableDeclarationList([
							factory.createVariableDeclaration(si_field, void 0, statement<TypeAliasDeclaration>(sx_type).type, void 0),
						], ts.NodeFlags.Const))))),
				].join('\n'), g_subject.fileName);
			},
		}));
	}

	_capture_nfpx_exports(g_subject: OutputAsset, si_interface='NfpxExports'): void {
		const {
			_h_fields,
			_as_exclude,
		} = this;
		const k_self = this;

		// console.log(`\n\n> Searching for ${si_interface} on ${g_subject.fileName}...`);

		traverse_asset(g_subject, (y_node) => {
			// // debugging
			// if(g_subject.fileName.endsWith('env.d.ts')) {
			// 	let s_text = '';
			// 	try {
			// 		s_text = y_node.getText();
			// 	}
			// 	catch(e_text) {}

			// 	console.log(y_node.kind+': '+s_text);
			// }

			map_node(y_node, {
				// [kind.ImportDeclaration](y_decl: ImportDeclaration) {
				// 	if(y_decl.importClause.nam) {
				// 		y_decl.importClause.
				// 	}
				// },

				// [export] interface {...}
				[kind.InterfaceDeclaration](y_decl) {
					// found it
					if(si_interface === y_decl.name.text) {
						// each member of the interface
						for(const y_mem of y_decl.members) {
							// property signature in interface
							if(kind.PropertySignature === y_mem.kind) {
								// type cast
								const y_prop = y_mem as PropertySignature;

								// identifier property name
								const y_name = y_prop.name;
								if(kind.Identifier === y_name.kind) {
									_h_fields[y_name.text] = `type A = ${y_prop.type?.getText() || 'any'};`;
								}
							}
						}
					}

					// stop recursing
					return [];
				},

				// export [type] {...}
				[kind.ExportDeclaration](y_decl) {
					// ignore `export * from 'foo'`
					if(!y_decl.exportClause) return [];

					// export ... from 'foo'
					if(y_decl.moduleSpecifier) {
						// only interested in type-only re-exports
						if(y_decl.isTypeOnly) {
							map_node(y_decl.exportClause, {
								[kind.NamedExports](y_clause: NamedExports) {
									for(const y_elmt of y_clause.elements) {
										// found matching interface export
										if(si_interface === y_elmt.name.text) {
											// resolve specifier
											const g_asset = k_self._asset_from_specifier(y_decl as ModuleSpecifying);

											// since this is a re-export, resolve interface on source
											if(g_asset) {
												k_self._capture_nfpx_exports(g_asset, si_interface);
											}
										}
									}
								},
							});
						}
					}
					// export ...
					else if(y_decl.exportClause) {
						map_node(y_decl.exportClause, {
							[kind.NamedExports](y_clause) {
								// do not re-declare already exported identifiers
								for(const g_spec of y_clause.elements) {
									_as_exclude.add(g_spec.propertyName?.text || g_spec.name.text);
								}
							},
						});

						// let s_text = '';
						// try {
						// 	s_text = y_node.getText();
						// }
						// catch(e_text) {}

						// console.log(`while searching for ${si_interface} on ${g_subject.fileName}:\n${s_text}`);
					}

					// stop recursing
					return [];
				},
			});
		});
	}
}

