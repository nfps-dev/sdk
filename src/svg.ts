
import type {HtmlNodeCreator, SvgNodeCreator} from './web-types';
import type {Dict, Promisable} from '@blake.regalia/belt';

import {JSDOM} from 'jsdom';
import {optimize} from 'svgo';
import xmlFormat from 'xml-formatter';

import {minify_styles} from './plugins/minify-styles.js';


interface NfpNodes {
	web: {
		lcds?: string;
		comcs?: string;
	};
	self: {
		chain: string;
		contract: string;
		token: string;
	};
	script: {
		src: string;
	};
	style: {
		src: string;
	};
}

type NfpNodeCreator = (
	si_tag: keyof NfpNodes,
	h_attrs?: NfpNodes[typeof si_tag],
	a_children?: (Element | string)[]
) => Element;

export interface Context {
	document: Document;
	create: {
		svg: SvgNodeCreator;
		html: HtmlNodeCreator;
	};
}

export interface MacroContext extends Context {
	node: Element;
	body: ChildNode[];
}


export type MacroProcessor = (g_context: MacroContext) => (Element | ChildNode | string)[];

export type PostProcesor = (g_context: Context) => void;


type UrlString = `http${'' | 's'}://${string}`;

export interface BuildConfig {
	/**
	 * The source XML to process
	 */
	source: string;

	/**
	 * Whether or not to minify the output (defaults to 'development' !== NFP_ENV)
	 */
	minify: boolean;

	/**
	 * Add/overwrite NFP metadata to the SVG
	 */
	metadata?: {
		web?: {
			lcds?: UrlString[];
			comcs?: UrlString[];
		};

		self?: {
			chain?: string;
			contract?: string;
			token?: string;
		};
	};

	/**
	 * Process <nfp:macro> tags that have been placed in the SVG source by their `nfp:id` attribute
	 */
	macros?: Record<string, MacroProcessor>;

	/**
	 * Hook to inspect/mutate the document in-place before it is serialized
	 */
	closeDocument?: PostProcesor;

	/**
	 * Hook to inspect/mutate the final output string
	 */
	postProcess?: (sx_code: string) => Promisable<string>;
}

export const P_NS_SVG = 'http://www.w3.org/2000/svg';
export const P_NS_NFP = 'https://nfps.dev/';
export const P_NS_XHTML = 'http://www.w3.org/1999/xhtml';

export async function build(gc_build: BuildConfig): Promise<string> {
	const {
		source: sx_xml,
		macros: h_macros,
	} = gc_build;

	// minification flag
	const b_minify = gc_build.minify ?? 'development' !== process.env['NFP_ENV'];

	// parse
	const y_dom = new JSDOM(sx_xml, {
		contentType: 'application/xml',
	});

	// ref doc
	const d_doc = y_dom.window.document;

	// missing nfp namespace
	if(P_NS_NFP !== d_doc.documentElement.getAttribute('xmlns:nfp')) {
		throw new Error(`Must declare 'xmlns:nfp="${P_NS_NFP}"' as an attribute on the document element`);
	}

	// <metadata> element
	{
		// existing metadata element(s), do not use svg namespace since it must be in default ns
		const a_metadata = Array.from(d_doc.getElementsByTagName('metadata'));
		if(a_metadata.length > 1) {
			throw new Error(`Multiple <metadata> elements not allowed`);
		}

		// ref/create metadata element
		const dm_metadata = a_metadata[0] || d_doc.createElementNS(P_NS_SVG, 'metadata');

		// refs/creates single nfp metadata element
		const f_metadata = (si_tag: string) => {
			// fetch existing
			const a_tags = Array.from(dm_metadata.getElementsByTagNameNS(P_NS_NFP, si_tag));

			// multiple elements
			if(a_tags.length > 1) {
				throw new Error(`Multiple <nfp:${si_tag}> elements not allowed in <metadata>`);
			}

			// ref/create element
			const dm_tag = a_tags[0] || d_doc.createElementNS(P_NS_NFP, si_tag);

			// move to top
			dm_metadata.prepend(dm_tag);

			// return element
			return dm_tag;
		};

		// ref/create nfp metadata elements
		const dm_self = f_metadata('self');
		const dm_web = f_metadata('web');

		// metadata config
		const gc_metadata = gc_build.metadata;
		if(gc_metadata) {
			// nfp:web config
			const gc_web = gc_metadata.web;
			if(gc_web) {
				// lcds
				if(gc_web.lcds?.length) dm_web.setAttributeNS(P_NS_NFP, 'lcds', gc_web.lcds.join(','));

				// comcs
				if(gc_web.comcs?.length) dm_web.setAttributeNS(P_NS_NFP, 'comcs', gc_web.comcs.join(','));
			}

			// nfp:self config
			const gc_self = gc_metadata.self;
			if(gc_self) {
				// chain
				if(gc_self.chain) dm_self.setAttributeNS(P_NS_NFP, 'chain', gc_self.chain);

				// contract
				if(gc_self.contract) dm_self.setAttributeNS(P_NS_NFP, 'contract', gc_self.contract);

				// token
				if(gc_self.token) dm_self.setAttributeNS(P_NS_NFP, 'token', gc_self.token);
			}
		}

		// assert required attributes
		{
			if(!dm_self.getAttributeNS(P_NS_NFP, 'chain')) {
				throw new Error(`<nfp:self> missing required 'nfp:chain' attribute`);
			}

			if(!dm_self.getAttributeNS(P_NS_NFP, 'contract')) {
				throw new Error(`<nfp:self> missing required 'nfp:contract' attribute`);
			}

			if(!dm_self.getAttributeNS(P_NS_NFP, 'chain')) {
				throw new Error(`<nfp:self> missing required 'nfp:token' attribute`);
			}
		}

		// warn about others
		{
			if(!dm_web.getAttributeNS(P_NS_NFP, 'lcds')) {
				console.warn(`<nfp:web> missing 'nfp:lcds' attribute`);
			}

			if(!dm_web.getAttributeNS(P_NS_NFP, 'comcs')) {
				console.warn(`<nfp:web> missing 'nfp:comcs' attribute`);
			}
		}

		// move metadata element to top
		d_doc.documentElement.prepend(dm_metadata);
	}


	// svg node creator
	const f_svg = ((si_tag, h_attrs, a_children) => {
		const dm_elmt = d_doc.createElementNS(P_NS_SVG, si_tag) as unknown as SVGElement;

		for(const [si_attr, s_value] of Object.entries(h_attrs as Dict || {})) {
			dm_elmt.setAttribute(si_attr, s_value);
		}

		for(const w_child of a_children || []) {
			dm_elmt.append(w_child);
		}

		return dm_elmt;
	}) as SvgNodeCreator;

	// html node creator
	const f_html = ((si_tag, h_attrs, a_children) => {
		const dm_elmt = d_doc.createElementNS(P_NS_XHTML, si_tag);

		for(const [si_attr, s_value] of Object.entries(h_attrs as Dict || {})) {
			dm_elmt.setAttribute(si_attr, s_value);
		}

		for(const w_child of a_children || []) {
			dm_elmt.append(w_child);
		}

		return dm_elmt;
	}) as HtmlNodeCreator;

	// nfp node creator
	const f_nfp: NfpNodeCreator = (si_tag, h_attrs, a_children) => {
		const dm_elmt = d_doc.createElementNS(P_NS_NFP, si_tag);

		for(const [si_attr, s_value] of Object.entries(h_attrs as Dict || {})) {
			dm_elmt.setAttributeNS(P_NS_NFP, si_attr, s_value);
		}

		for(const w_child of a_children || []) {
			dm_elmt.append(w_child);
		}

		return dm_elmt;
	};

	// context struct
	const g_context = {
		document: d_doc,
		create: {
			svg: f_svg,
			html: f_html,
			nfp: f_nfp,
		},
	};

	// macro processing
	{
		// each macro element
		for(const dm_macro of Array.from(d_doc.getElementsByTagNameNS(P_NS_NFP, 'macro'))) {
			const si_macro = dm_macro.getAttributeNS(P_NS_NFP, 'id') || '';

			// resolve macro
			const f_macro = h_macros?.[si_macro];

			// no macro handler
			if(!f_macro) {
				throw new Error(`Missing macro handler for '${si_macro}'`);
			}

			// call handler
			const a_inserts = f_macro({
				...g_context,
				node: dm_macro,
				body: Array.from(dm_macro.childNodes),
			});

			// insert replacements above macro node
			for(const w_ins of a_inserts) {
				const dm_ins = 'string' === typeof w_ins? d_doc.createTextNode(w_ins): w_ins;

				dm_macro.parentNode!.insertBefore(dm_ins, dm_macro);
			}

			// then remove the macro node placeholder
			dm_macro.remove();
		}
	}

	// close document
	gc_build.closeDocument?.(g_context);

	// pre-svgo optimizations
	if(b_minify) {
		await minify_styles(d_doc);
	}

	// serialize
	let sx_out = y_dom.serialize();

	// svgo
	if(b_minify) {
		const g_result = optimize(sx_out, {
			multipass: true,
			plugins: [
				'cleanupAttrs',
				'cleanupEnableBackground',
				// 'cleanupIds',  // id mangling handled elsewhere
				'cleanupListOfValues',
				'cleanupNumericValues',
				'collapseGroups',
				'convertColors',
				'convertEllipseToCircle',
				'convertPathData',
				'convertShapeToPath',
				// 'convertStyleToAttrs',  // can result in larger output
				'convertTransform',
				// 'inlineStyles', // handled by pre-opts
				'mergePaths',
				// 'minifyStyles',  // handled by pre-opts
				'moveElemsAttrsToGroup',
				// 'moveGroupAttrsToElems',  // can result in larger output?
				// 'prefixIds',  // not needed
				'removeComments',
				'removeDesc',
				'removeDoctype',
				'removeEditorsNSData',
				'removeEmptyAttrs',
				'removeEmptyContainers',
				'removeEmptyText',
				{
					name: 'removeHiddenElems',
					params: {
						displayNone: false,
						opacity0: false,
					},
				},
				// 'removeMetadata',  // crucial for nfp
				'removeNonInheritableGroupAttrs',
				// 'removeOffCanvasPaths',  // may be intentional
				// 'removeTitle',  // used in standalone mode
				{
					name: 'removeUnknownsAndDefaults',
					params: {
						unknownContent: false,
						unknownAttrs: false,
					},
				},
				'removeUnusedNS',
				'removeUselessDefs',
				'removeUselessStrokeAndFill',
				'removeViewBox',
				'removeXMLProcInst',
				'reusePaths',
				// 'sortAttrs',  // human can optimize better
				'sortDefsChildren',

				// minify_styles(),
			],
		});

		sx_out = g_result.data;
	}
	// pretty-print
	else {
		sx_out = xmlFormat(sx_out);
	}

	// post-process
	sx_out = await gc_build.postProcess?.(sx_out) ?? sx_out;

	// return
	return sx_out;
}
