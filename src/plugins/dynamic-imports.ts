import type {Dependencies, NfpModulesJson} from './nfpx';
import type {Literal, Node, ObjectPattern} from 'estree';
import type {SourceMap} from 'magic-string';

import * as acorn from 'acorn';
// @ts-expect-error stupid
import * as ais from 'acorn-import-assertions';
import * as astring from 'astring';
import {walk} from 'estree-walker';

import MagicString from 'magic-string';

import {loadNfpModulesJson} from './nfpx.js';

function default_error(s_err: string, yn?: Node): never {
	throw new Error(s_err);
}

const SI_DESTRUCTURE_CALL = 'destructureImportedNfpModule';

function uncle_declarator(yn_parent: Node | null, f_error: typeof default_error): ObjectPattern | null {
	let yn_pattern: Node;

	// must use destructuring assignment
	if('VariableDeclarator' === yn_parent?.type) {
		yn_pattern = yn_parent.id;
	}
	else if('AssignmentExpression' === yn_parent?.type) {
		yn_pattern = yn_parent.left;
	}
	// call is by itself, no assignment or use
	else if('ExpressionStatement' === yn_parent?.type) {
		return null;
	}
	else {
		return f_error(`Awaited dynamic import must use destructuring assignment or be by itself`);
	}

	if('ObjectPattern' !== yn_pattern.type) {
		return f_error(`Awaited dynamic import must use destructuring assignment or be by itself`);
	}

	return yn_pattern;
}

export function checkNodeForDynamicImport(yn_self: Node, yn_parent: Node | null, {
	f_error,
	f_replace,
}: {
	f_error: typeof default_error;
	f_replace(y_node: Node, sx_write: string): any;
}, g_nfp_modules_json: NfpModulesJson, h_dependencies?: Dependencies): void {
	// destructuring import
	if('CallExpression' === yn_self.type && 'Identifier' === yn_self.callee.type && SI_DESTRUCTURE_CALL === yn_self.callee.name) {
		const a_args = yn_self.arguments;

		if(1 !== a_args.length || 'Literal' !== a_args[0].type || 'string' !== typeof a_args[0].value) {
			f_error(`${SI_DESTRUCTURE_CALL} call requires exactly 1 argument; that argument must be a string literal`);
		}

		const si_module = (a_args[0] as Literal).value as string;
		const g_import = g_nfp_modules_json.modules[si_module];

		// assignment
		const a_assignments: string[] = [];
		ASSIGNMENT: {
			const yn_pattern = uncle_declarator(yn_parent, f_error);

			if(!yn_pattern) break ASSIGNMENT;

			const h_aliases = g_import.exports['.'];

			for(const yn_prop of yn_pattern.properties) {
				if('Property' !== yn_prop.type || 'Identifier' !== yn_prop.key.type || 'Identifier' !== yn_prop.value.type) {
					return f_error(`Awaited dynamic import must exclusively use identifiers in destructuring assignment`, yn_prop);
				}

				const si_alias = yn_prop.key.name;
				if(!h_aliases[si_alias]) {
					return f_error(`"${si_alias}" export not found in ${si_module} module`);
				}

				// encode destructure
				a_assignments.push(`\n  ${h_aliases[si_alias].symbol}: ${yn_prop.value.name},`);
			}
		}

		f_replace(yn_parent!, (a_assignments.length? `{${a_assignments.join('')}\n} = `: '')+`nfpx_${si_module}`);
	}
	// find all dynamic imports using `await import(...)`
	else if('AwaitExpression' === yn_self.type && 'ImportExpression' === yn_self.argument.type) {
		const yn_import = yn_self.argument;

		// options arg
		const y_args = (yn_import as any)['arguments']?.[0] as Node;
		if('ObjectExpression' !== y_args?.type) {
			return f_error(`Must provide object literal options to dynamic import: {location:SlimTokenLocation; contract:SecretContract; auth:AuthSecret; query?:{}}`, y_args);
		}

		// prep property node struct
		const g_props = {} as {
			location: Node;
			contract: Node;
			auth: Node;
			query?: Node;
		};

		// identify properties
		for(const y_prop of y_args.properties) {
			// not a recognized identifier property
			if('Property' !== y_prop.type
				|| 'Identifier' !== y_prop.key.type
				|| !['location', 'contract', 'auth', 'query'].includes(y_prop.key.name)
			) {
				return f_error(`Top-level property in dynamic import options must be identifier and one of: [location, contract, auth, query]`, y_prop);
			}

			// set property node
			g_props[y_prop.key.name as keyof typeof g_props] = y_prop.value;
		}

		// missing required properties
		if(!g_props.contract) return f_error(`Dynamic import options missing required property 'contract'`);
		if(!g_props.location) return f_error(`Dynamic import options missing required property 'location'`);
		if(!g_props.auth) console.warn(`Dynamic import options missing property 'auth'; defaulting to null`);

		// serialize args in correct order
		const a_args = [
			g_props.query || {
				type: 'ObjectExpression',
				properties: [],
			} as Node,
			g_props.contract,
			g_props.location,
			g_props.auth || {
				type: 'Literal',
				value: null,
				raw: 'null',
			},
		].map(yn => astring.generate(yn));

		const yn_source = yn_import.source;

		// token for the runtime import specifier
		let sx_module = astring.generate(yn_source);

		// resolved module id
		let si_module: string;
		let g_import: NfpModulesJson['modules'][string];

		// string literal
		if('Literal' === yn_source.type && 'string' === typeof yn_source.value) {
			const si_specifier = yn_source.value;
			si_module = si_specifier.replace(/^nfpx:/, '').replace(/(\.js)?$/, '');
			g_import = g_nfp_modules_json.modules[si_module];

			// use resolved module id for package id
			sx_module = `"${si_module}.js"`;

			if(h_dependencies) {
				h_dependencies[si_module] = Object.assign(h_dependencies[si_module] || {}, {
					version: g_import?.version || '*',
					hash: g_import?.hash || '*',
					dynamic: true,
					imports: h_dependencies[si_module]?.imports || {},
				});
			}
		}
		else {
			return f_error('Computed dynamic import specifiers not yet supported', yn_source);

			// // concatenation
			// else if('BinaryExpression' === y_source.type) {
			// 	const y_left = y_source.left;
			// 	if('Literal' === y_left.type && 'string' === typeof y_left.value && y_left.value.startsWith(SI_NFPX_SPECIFIER_PREFIX)) {
			// 		return f_error(S_ERR_PREFIX_IMPORT);
			// 	}
			// }
			// // tempalte literal
			// else if('TemplateLiteral' === y_source.type) {
			// 	const y_quasi = y_source.quasis[0];

			// 	if(y_quasi?.value.raw.startsWith(SI_NFPX_SPECIFIER_PREFIX)) {
			// 		return f_error(S_ERR_PREFIX_IMPORT);
			// 	}
			// }
		}

		// assignment
		const a_assignments: string[] = [];
		ASSIGNMENT: {
			const yn_pattern = uncle_declarator(yn_parent, f_error);

			if(!yn_pattern) break ASSIGNMENT;

			const h_aliases = g_import.exports['.'];

			for(const yn_prop of yn_pattern.properties) {
				if('Property' !== yn_prop.type || 'Identifier' !== yn_prop.key.type || 'Identifier' !== yn_prop.value.type) {
					return f_error(`Awaited dynamic import must exclusively use identifiers in destructuring assignment`, yn_prop);
				}

				const si_alias = yn_prop.key.name;
				if(!h_aliases[si_alias]) {
					return f_error(`"${si_alias}" export not found in ${si_module} module`);
				}

				// encode destructure
				a_assignments.push(`\n  ${h_aliases[si_alias].symbol}: ${yn_prop.value.name},`);
			}
		}

		// serialize call to global inject API
		f_replace(yn_parent!, (a_assignments.length? `{${a_assignments.join('')}\n} = `: '')+`await nfpx.i(${sx_module}, ${a_args.join(', ')})`);
	}
}


export async function transformCode(sx_code: string, si_module: string, f_error=default_error): Promise<{
	code: string;
	map: SourceMap;
}> {
	const g_nfp_modules_json = await loadNfpModulesJson({
		error: f_error,
	});

	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	const y_ast = acorn.Parser.extend(ais.importAssertions).parse(sx_code, {
		ecmaVersion: 'latest',
		sourceType: 'module',
	});

	const y_magic = new MagicString(sx_code);

	walk(y_ast as Node, {
		enter(yn_self, yn_parent, si_prop, i_index): void {
			checkNodeForDynamicImport(yn_self, yn_parent, {
				f_error(s_err) {
					throw new Error(s_err);
				},
				f_replace(yn_subject, sx_write) {
					y_magic.overwrite((yn_subject as any as {start: number}).start, (yn_subject as any as {end: number}).end, sx_write);
				},
			}, g_nfp_modules_json);
		},
	});

	return {
		code: y_magic.toString(),
		map: y_magic.generateMap({
			hires: true,
		}),
	};
}

