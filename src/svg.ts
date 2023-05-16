import type {Dict} from '@blake.regalia/belt';

import type { HtmlNodeCreator, SvgNodeCreator } from './web-types';

const xmlFormat = require('xml-formatter');
import {JSDOM} from 'jsdom';


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
};


export type MacroProcessor = (g_context: Context) => (Element | string)[];

export type PostProcesor = (g_context: Context) => void;


type UrlString = `http${'' | 's'}://${string}`;

export interface BuildConfig {
	/**
	 * The source XML to process
	 */
	source: string;

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
	macros?: {
		[si_macro: string]: MacroProcessor;
	};

	/**
	 * Perform custom post-processing on the document in-place before it is serialized
	 */
	postProcess?: PostProcesor;
}

export const P_NS_SVG = 'http://www.w3.org/2000/svg';
export const P_NS_NFP = 'https://nfps.dev/';
export const P_NS_XHTML = 'http://www.w3.org/1999/xhtml';

export function build(gc_build: BuildConfig): string {
	const {
		source: sx_xml,
		macros: h_macros,
	} = gc_build;

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
		let dm_metadata = a_metadata[0] || d_doc.createElementNS(P_NS_SVG, 'metadata');

		// refs/creates single nfp metadata element
		const f_metadata = (si_tag: string) => {
			// fetch existing
			const a_tags = Array.from(dm_metadata.getElementsByTagNameNS(P_NS_NFP, si_tag));

			// multiple elements
			if(a_tags.length > 1) {
				throw new Error(`Multiple <nfp:${si_tag}> elements not allowed in <metadata>`);
			}

			// ref/create element
			let dm_tag = a_tags[0] || d_doc.createElementNS(P_NS_NFP, si_tag);

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
	const f_svg: SvgNodeCreator = (si_tag, h_attrs, a_children) => {
		const dm_elmt = d_doc.createElementNS(P_NS_SVG, si_tag) as unknown as SVGElement;

		for(const [si_attr, s_value] of Object.entries(h_attrs as Dict || {})) {
			dm_elmt.setAttribute(si_attr, s_value!);
		}

		for(const w_child of a_children || []) {
			dm_elmt.append(w_child);
		}

		return dm_elmt;
	};

	// html node creator
	const f_html: HtmlNodeCreator = (si_tag, h_attrs, a_children) => {
		const dm_elmt = d_doc.createElementNS(P_NS_XHTML, si_tag);

		for(const [si_attr, s_value] of Object.entries(h_attrs as Dict || {})) {
			dm_elmt.setAttributeNS(P_NS_XHTML, si_attr, s_value);
		}

		for(const w_child of a_children || []) {
			dm_elmt.append(w_child);
		}

		return dm_elmt;
	};

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
			const a_inserts = f_macro(g_context);

			// insert replacements above macro node
			for(const w_ins of a_inserts) {
				const dm_ins = 'string' === typeof w_ins? d_doc.createTextNode(w_ins): w_ins;

				dm_macro.parentNode!.insertBefore(dm_ins, dm_macro);
			}

			// then remove the macro node placeholder
			dm_macro.remove();
		}
	}

	// post-processing
	gc_build.postProcess?.(g_context);

	// serialize
	const sx_out = y_dom.serialize();

	// return sx_out;

	// pretty-print
	return xmlFormat(sx_out);
}
