import type {HtmlNodeCreator, SvgNodeCreator} from '../src/web-types';

let f_create_html!: HtmlNodeCreator;

f_create_html('a', {
	_click(d_event) {
		d_event;
	},
});


let f_create_svg!: SvgNodeCreator;

f_create_svg('animate', {
	_beforeinput(d_event) {
		d_event;
	},
});

f_create_svg('pattern', {
	_click(d_event) {
		this.width;
		d_event;
	},
	_transitioncancel: [
		function(d_event) {
			this.height;
			d_event;
		},
		{
			capture: true,
		},
	],
});


