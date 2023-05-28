import type {L, O, U} from 'ts-toolbelt';


type StrInt = `${bigint}`;

type Numeric = `${number}`;


type LengthUnit = string;

type StrLength = `${number}${LengthUnit}`;
type StrPercentage = `${'+' | '-' | ''}${number}%`;

type StrLengthPercentage = StrLength | StrPercentage;

type ClockValue = `${`${bigint}:` | ''}${bigint}:${number}`;

type UnitSpace = 'userSpaceOnUse' | 'objectBoundingBox';


interface CoreAnimationElements {
	animate: {};
	animateMotion: {};
	animateTransform: {};
}

interface SetInclusiveCoreAnimationElements extends CoreAnimationElements {
	set: {};
}

interface AnimationElements extends SetInclusiveCoreAnimationElements {
	mpath: {};
}

interface ContainerElements {
	a: {};
	defs: {};
	g: {};
	marker: {};
	mask: {};
	/** @deprecated */'missing-glyph': {};
	pattern: {};
	svg: {};
	switch: {};
	symbol: {};
}

interface DescriptiveElements {
	desc: {};
	metadata: {};
	title: {};
}

interface FilterFunctionElements {
	feFuncA: {};
	feFuncB: {};
	feFuncG: {};
	feFuncR: {};
}

interface ShiftableFilterPrimitiveElements {
	feDropShadow: {};
	feOffset: {};
}

interface LightingElements {
	feDiffuseLighting: {};
	feSpecularLighting: {};
}

interface FilterPrimitiveElements extends FilterFunctionElements, ShiftableFilterPrimitiveElements, LightingElements {
	feBlend: {};
	feColorMatrix: {};
	feComponentTransfer: {};
	feComposite: {};
	feConvolveMatrix: {};
	feDisplacementMap: {};
	feFlood: {};
	feGaussianBlur: {};
	feImage: {};
	feMerge: {};
	feMergeNode: {};
	feMorphology: {};
	feTile: {};
	feTurbulence: {};
}

interface FontElements {
	/** @deprecated */font: {};
	/** @deprecated */'font-face': {};
	/** @deprecated */'font-face-format': {};
	/** @deprecated */'font-face-name': {};
	/** @deprecated */'font-face-src': {};
	/** @deprecated */'font-face-uri': {};
	/** @deprecated */hkern: {};
	/** @deprecated */vkern: {};
}

interface CircularElements {
	circle: {};
	ellipse: {};
	radialGradient: {};
}

interface BasicShapes extends Omit<CircularElements, 'radialGradient'> {
	line: {};
	polygon: {};
	polyline: {};
	rect: {};
}

interface Shapes extends BasicShapes {
	path: {};
}

interface GraphicsElements extends Shapes {
	image: {};
	text: {};
	use: {};
}

interface GraphicsReferencingElements {
	use: {};
}

interface LightSourceElements {
	feDistantLight: {};
	fePointLight: {};
	feSpotLight: {};
}

interface GradientElements {
	linearGradient: {};
	radialGradient: {};
}

interface PaintServerElements extends GradientElements {
	hatch: {};
	pattern: {};
	solidcolor: {};
}

interface NeverRenderedElements extends PaintServerElements {
	clipPath: {};
	defs: {};
	marker: {};
	mask: {};
	metadata: {};
	script: {};
	style: {};
	symbol: {};
	title: {};
}


interface TextContentChildElements {
	textPath: {};
	/** @deprecated */tref: {};
	tspan: {};
}

interface RenderableElements extends GraphicsElements, GraphicsReferencingElements, TextContentChildElements {
	a: {};
	foreignObject: {};
	g: {};
	svg: {};
	switch: {};
	symbol: {};
	text: {};
}

interface StructuralElements {
	g: {};
	defs: {};
	svg: {};
	symbol: {};
	use: {};
}


interface TextContentElements extends TextContentChildElements {
	/** @deprecated */glyph: {};
	/** @deprecated */glyphRef: {};
	text: {};
}

interface UncategorizedElements {
	clipPath: {};
	/** @deprecated */cursor: {};
	filter: {};
	foreignObject: {};
	hatchpath: {};
	script: {};
	style: {};
	view: {};
}

//
//
//

interface ClippableElements extends
	Omit<StructuralElements, 'defs'>,
	Omit<RenderableElements, 'foriegnObject' | 'switch'> {}

interface ShiftableElements extends TextContentElements, ShiftableFilterPrimitiveElements {}

type EdgeableFilterElements = Pick<FilterPrimitiveElements, 'feConvolveMatrix' | 'feGaussianBlur'>;

interface FillableElements extends Shapes, TextContentElements {}

type FloodableFilterElements = Pick<FilterPrimitiveElements, 'feFlood' | 'feDropShadow'>;

interface DimensionableElements extends FilterPrimitiveElements {
	filter: {};
	mask: {};
}

interface AutoDimensionableElements {
	foreignObject: {};
	image: {};
	rect: {};
	svg: {};
	use: {};
}

interface HrefableElements extends AnimationElements, GradientElements {
	a: {};
	feImage: {};
	image: {};
	pattern: {};
	script: {};
	textPath: {};
}

interface In2ableElements extends Pick<FilterPrimitiveElements, 'feBlend' | 'feComposite' | 'feDisplacementMap'> {}

interface LinearElement {
	line: {};
	linearGradient: {};
}


interface XYable extends DimensionableElements, AutoDimensionableElements {}

interface VisibilityElements extends TextContentElements, XYable {
	a: {};
}

interface TypableElements extends FilterFunctionElements {
	animateTransform: {};
	feColorMatrix: {};
	feTurbulence: {};
	script: {};
	style: {};
}

interface ViewBoxable {
	marker: {};
	pattern: [];
	svg: {};
	symbol: {};
	view: {};
}


type ShallowMerge<h_base extends object, a_merges extends L.List<object>> = O.Merge<{
	[i_each in keyof a_merges]: a_merges[i_each] extends infer h_set
		? {
			[si_key in keyof h_set]: h_set[si_key] extends object
				? si_key extends keyof h_base
					? h_base[si_key] extends object
						? O.Merge<h_set[si_key], h_base[si_key]>
						: never
					: h_set[si_key]
				: never;
		}
		: never;
}[number], h_base>;


export type AugmentationMap = ShallowMerge<{
	a: {
		target: '_self' | '_parent' | '_top' | '_blank' | string;
	};

	feComposite: {
		k1: Numeric;
		k2: Numeric;
		k3: Numeric;
		k4: Numeric;
	};

	feConvolveMatrix: {
		bias: Numeric;
		divisor: Numeric;
		kernelMatrix: string;
		targetX: StrInt;
		targetY: StrInt;
	};

	feDisplacementMap: {
		yChannelSelector: 'R' | 'G' | 'B' | 'A';
	};

	feDistantLight: {
		azimuth: Numeric;
		elevation: Numeric;
	};

	feTurbulence: {
		baseFrequency: Numeric;
		stitchTiles: 'noStitch' | 'sticth';
	};

	clipPath: {
		clipPathUnits: UnitSpace;
		filter: string;
	};

	path: {
		d: string;
	};

	feDiffuseLighting: {
		diffuseConstant: Numeric;
	};

	filter: {
		filterUnits: UnitSpace;
	};

	radialGradient: {
		fr: StrLength;
		fx: Numeric;
		fy: Numeric;
	};

	pattern: {
		height: Numeric;
		width: Numeric;
	};

	image: {
		'image-rednering': 'auto' | 'optimizeSpeed' | 'optimizeQuality';
	};

	feSpotLight: {
		limitingConeAngle: Numeric;
	};

	stop: {
		'stop-color': string;
		'stop-opacity': Numeric | StrPercentage;
	};
}, [
	{
		[si_tag in keyof CoreAnimationElements]: {
			accumulate: 'sum' | 'none';
			addition: 'replace' | 'sum';
			by: string;
			calcMode: 'discrete' | 'linear' | 'paced' | 'spline';
			from: Numeric;
			keySplines: string;
			keyTimes: string;
		};
	},
	{
		[si_tag in keyof SetInclusiveCoreAnimationElements]: {
			dur: ClockValue | 'media' | 'indefinite';
			end: string;
			keyPoints: string;
			to: Numeric;
		};
	},
	{
		[si_tag in keyof TextContentChildElements]: {
			'alignment-baseline': 'auto' | 'baseline' | 'before-edge' | 'text-before-edge' | 'middle' | 'central' | 'after-edge' | 'text-after-edge' | 'ideographic' | 'alphabetic' | 'hanging' | 'mathematical' | 'top' | 'center' | 'bottom';
			'baseline-shift': 'sub' | 'super' | StrLengthPercentage;
		};
	},
	{
		[si_tag in keyof FilterFunctionElements]: {
			amplitude: Numeric;
			exponent: Numeric;
			intercept: Numeric;
			tableValues: string;
		};
	},
	{
		[si_tag in keyof ClippableElements]: {
			'clip-path': string;

			// only applies to elements contained within a clipPath element
			'clip-rule': 'nonzero' | 'evenodd' | 'inherit';
		};
	},
	{
		[si_tag in keyof CircularElements]: {
			cx: string;
			cy: string;
		};
	},
	{
		[si_tag in keyof TextContentElements]: {
			direction: 'ltr' | 'rtl';
			'dominant-baseline': 'auto' | 'text-bottom' | 'alphabetic' | 'ideographic' | 'middle' | 'central' | 'mathematical' | 'hanging' | 'text-top';
			'font-family': string;
			'font-size': string;
			'font-size-adjust': 'none' | Numeric;
			'font-strecth': string;
			'font-style': 'normal' | 'italic' | 'oblique';
			'font-variant': string;
			'font-weight': `${bigint}` | 'normal' | 'bold' | 'bolder' | ' lighter';
			lengthAdjust: 'spacing' | 'spacingAndGlyphs';
			'letter-spacing': 'normal' | StrLength;
			textLength: StrLengthPercentage | Numeric;
		};
	},
	{
		[si_tag in keyof ShiftableElements]: {
			dx: Numeric;
			dy: Numeric;
		};
	},
	{
		[si_tag in keyof EdgeableFilterElements]: {
			edgeMode: 'duplicate' | 'wrap' | 'none';
		};
	},
	{
		[si_tag in keyof FillableElements]: {
			fill: string;
			'fill-opacity': Numeric | StrPercentage;
			'fill-rule': string;

			stroke: string;
			'stroke-dasharray': string;
			'stroke-dashoffset': StrLengthPercentage;
			'stroke-linecap': 'butt' | 'round' | 'square';
			'stroke-linejoin': 'arcs' | 'bevel' | 'miter' | 'miter-clip' | 'round';
			'stroke-miterlimit': Numeric;
			'stroke-opacity': Numeric | StrPercentage;
			'stroke-width': StrLengthPercentage;
		};
	},
	{
		[si_tag in keyof FloodableFilterElements]: {
			'flood-color': string;
			'flood-opacity': Numeric;
		};
	},
	{
		[si_tag in keyof GradientElements]: {
			gradientTransform: string;
			gradientUnits: UnitSpace;
		};
	},
	{
		[si_tag in keyof FilterPrimitiveElements]: {
			in: string;
		};
	},
	{
		[si_tag in keyof DimensionableElements]: {
			height: StrLengthPercentage;
			width: StrLengthPercentage;
		};
	},
	{
		[si_tag in keyof AutoDimensionableElements]: {
			height: 'auto' | StrLengthPercentage;
			width: 'auto' | StrLengthPercentage;
		};
	},
	{
		[si_tag in keyof HrefableElements]: {
			href: string;
		};
	},
	{
		[si_tag in keyof In2ableElements]: {
			in2: string;
		};
	},
	{
		[si_tag in keyof LightingElements]: {
			'lighting-color': string;
			surfaceScale: Numeric;
			z: Numeric;
		};
	},
	{
		[si_tag in keyof VisibilityElements]: {
			visibility: 'visible' | 'hidden' | 'collapse';
		};
	},
	{
		[si_tag in keyof LinearElement]: {
			x1: Numeric;
			x2: Numeric;
			y1: Numeric;
			y2: Numeric;
		};
	},
	{
		[si_tag in keyof XYable]: {
			x: Numeric;
			y: Numeric;
		};
	},
	{
		[si_tag in keyof ViewBoxable]: {
			viewBox: string;
		};
	},
	{
		[si_tag in keyof TypableElements]: {
			type: string;
		};
	},
	{
		[si_tag in 'ellipse' | 'rect']: {
			rx: 'auto' | StrLengthPercentage;
			ry: 'auto' | StrLengthPercentage;
		};
	},
	{
		[si_tag in 'circle' | 'radialGradient']: {
			r: Numeric;
		};
	},
	{
		[si_tag in 'polyline' | 'polygon']: {
			points: string;
		};
	},
]>;

export type AllSvgElements = O.Merge<{
	[si_attr in `data-${string}`]: string;
}, {
	class: string;
	cursor: string;
	display: string;
	id: string;
	lang: string;

	onclick: string;
	opacity: string;
	style: string;
	tabindex: StrInt;
	transform: string;
	'transform-origin': string;

	// 'xml:base': string;
	// 'xml:lang': string;
	// 'xml:space': string;
}>;


// deferred
// vector-effect
// values
// unerline-thickness
// underline-position
// text-rendering
// text-decoration
// text-anchor
// systemLanguage
// strikethrough-thickness
// strikethrough-position
// stdDeviation
// startOffset
// spreadMethod
// specularExponent
// specularConstant
// spacing
// shape-rendering
// seed
// scale
// side
// rotate
// result
// restart
// repeatDur
// repeatCount
// refX
// refY
// radius
// primitiveUnits
// preserveAspectRatio
// preserveAlpha
// marker-end
// marker-mid
// marker-start
// markerHeight
// markerUnits
// markerWidth
// mask
// maskContentUnits
// maskUnits
// max
// media
// method // Experimental
// min
// mode
// numOctaves
// onclick

// operator
// order
// orient
// origin
// overflow
// overline-position
// overline-thickness
// paint-order
// path
// pathLength
// patternContentUnits
// patternTransform
// patternUnits
// pointer-events
// pointsAtX
// pointsAtY
// pointsAtZ



