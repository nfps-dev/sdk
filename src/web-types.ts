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

type HtmlElementProperties<d_element extends Element, w_extra=never> = {
	[si_key in SelectLowerStringKeys<d_element>]?: string;
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


// type test<
// 	si_tag extends keyof SVGElementTagNameMap,
// 	dm_element extends SVGElementTagNameMap[si_tag]=SVGElementTagNameMap[si_tag],
// >= O.MergeAll<{}, [
// 	si_tag extends keyof AugmentationMap? U.Merge<AugmentationMap[si_tag]>: {},
// 	AllSvgElements,
// 	SvgElementProperties<dm_element>,
// ]>;

// type show = test<'path'>['d'];
