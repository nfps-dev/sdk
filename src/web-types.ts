import type {L, O, S, U} from 'ts-toolbelt';

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

export type SvgNodeCreator = (
	si_tag: keyof SVGElementTagNameMap,
	h_attrs?: SvgElementProperties<SVGElementTagNameMap[typeof si_tag]>,
	a_children?: (Node | string)[]
) => SVGElement;


type HtmlElementProperties<d_element extends Element, w_extra=never> = {
	[si_key in OmitCapsU<O.SelectKeys<d_element, string>>]: string;
}

export type HtmlNodeCreator = (
	si_tag: keyof HTMLElementTagNameMap,
	h_attrs?: HtmlElementProperties<HTMLElementTagNameMap[typeof si_tag]>,
	a_children?: (Node | string)[]
) => HTMLElement;
