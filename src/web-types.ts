import type {L, O, S, U} from 'ts-toolbelt';

import type {AllSvgElements, AugmentationMap} from './svg-types';

type OmitCaps<s_test extends string> = Uppercase<s_test> extends s_test? never: s_test;

type OmitCapsL<a_test extends readonly string[]> = {
	[i_each in keyof a_test]: OmitCaps<a_test[i_each]>;
};

type OmitCapsU<s_test extends string> = L.UnionOf<OmitCapsL<U.ListOf<s_test>>>;


type SvgElementProperties<d_element extends Element> = {
	[si_key in O.SelectKeys<d_element,
		| string
		| DOMPointReadOnly
		| SVGAnimatedBoolean
		| SVGAnimatedEnumeration
		| SVGAnimatedInteger
		| SVGAnimatedLength
		| SVGAnimatedLengthList
		| SVGAnimatedNumber
		| SVGAnimatedNumberList
		| SVGAnimatedPreserveAspectRatio
		| SVGAnimatedString
		| SVGAnimatedTransformList
		| DOMTokenList
		| SVGElement
	>]?: string;
};

export type SvgNodeCreator = <
	si_tag extends keyof SVGElementTagNameMap,
	dm_element extends SVGElementTagNameMap[si_tag],
>(
	si_tag: si_tag,
	h_attrs?: O.MergeAll<{}, [
		si_tag extends keyof AugmentationMap? U.Merge<AugmentationMap[si_tag]>: {},
		AllSvgElements,
		SvgElementProperties<dm_element>,
	]>,
	a_children?: (Node | string)[]
) => dm_element;

type SelectLowerStringKeys<h_object extends object> = Extract<keyof h_object, string> extends infer as_keys
	? as_keys extends string
		? OmitCapsU<as_keys>
		: string
	: string;

type SelectStrings<
	h_object extends object,
	as_keys extends string,
> = O.SelectKeys<{
	[si_key in Extract<keyof h_object, as_keys>]: h_object[si_key] extends string
		? 1
		: 0
}, 1>;

type StandardHtmlAttributes =
	| 'accept'
	| 'accesskey'
	| 'action'
	| 'align'
	| 'alt'
	| 'async'
	| 'autocomplete'
	| 'autofocus'
	| 'autoplay'
	| 'bgcolor'
	| 'border'
	| 'charset'
	| 'checked'
	| 'cite'
	| 'class'
	| 'color'
	| 'cols'
	| 'colspan'
	| 'content'
	| 'contenteditable'
	| 'controls'
	| 'coords'
	| 'data'
	| 'datetime'
	| 'default'
	| 'defer'
	| 'dir'
	| 'disabled'
	| 'download'
	| 'draggable'
	| 'dropzone'
	| 'enctype'
	| 'for'
	| 'form'
	| 'headers'
	| 'height'
	| 'hidden'
	| 'high'
	| 'href'
	| 'hreflang'
	| 'http-equiv'
	| 'id'
	| 'ismap'
	| 'kind'
	| 'label'
	| 'lang'
	| 'list'
	| 'loop'
	| 'low'
	| 'max'
	| 'maxlength'
	| 'media'
	| 'method'
	| 'min'
	| 'multiple'
	| 'muted'
	| 'name'
	| 'novalidate'
	| 'open'
	| 'optimum'
	| 'pattern'
	| 'placeholder'
	| 'poster'
	| 'preload'
	| 'readonly'
	| 'rel'
	| 'required'
	| 'reversed'
	| 'rows'
	| 'rowspan'
	| 'sandbox'
	| 'scope'
	| 'selected'
	| 'shape'
	| 'size'
	| 'sizes'
	| 'span'
	| 'spellcheck'
	| 'src'
	| 'srcdoc'
	| 'srclang'
	| 'srcset'
	| 'start'
	| 'step'
	| 'style'
	| 'tabindex'
	| 'target'
	| 'title'
	| 'type'
	| 'usemap'
	| 'value'
	| 'width'
	| 'wrap'
	| `aria-${string}`
	| `data-${string}`
	| `on${string}`;

type HtmlElementProperties<d_element extends Element, w_extra=never> = {
	[si_key in StandardHtmlAttributes | SelectStrings<d_element, SelectLowerStringKeys<d_element>>]?: string;
};

export type HtmlNodeCreator = <
	si_tag extends keyof HTMLElementTagNameMap,
>(
	si_tag: si_tag,
	h_attrs?: si_tag extends keyof HTMLElementTagNameMap
		? HtmlElementProperties<HTMLElementTagNameMap[si_tag]>
		: HtmlElementProperties<HTMLElement>,
	a_children?: (Node | string)[]
) => si_tag extends keyof HTMLElementTagNameMap? HTMLElementTagNameMap[si_tag]: HTMLElement;

// type wtf = HTMLElementTagNameMap['a'];
// type sho = wtf['toString']
// type expo = HtmlElementProperties<wtf>;
// type ss = expo['toString']
// let test!: HtmlNodeCreator;
// test('a', {
// 	href: 'yes',
// 	class: 'hi',
// });

// type test<
// 	si_tag extends keyof SVGElementTagNameMap,
// 	dm_element extends SVGElementTagNameMap[si_tag]=SVGElementTagNameMap[si_tag],
// >= O.MergeAll<{}, [
// 	si_tag extends keyof AugmentationMap? U.Merge<AugmentationMap[si_tag]>: {},
// 	AllSvgElements,
// 	SvgElementProperties<dm_element>,
// ]>;

// type show = test<'path'>['d'];
