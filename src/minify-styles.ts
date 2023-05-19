import cssnano from 'cssnano';
import postcss from 'postcss';

export async function minify_styles(d_doc: Document): Promise<void> {
	const y_procesor = postcss([
		cssnano({
			preset: 'default',
		}),
	]);

	// each style element
	for(const dm_style of Array.from(d_doc.querySelectorAll('style'))) {
		const sx_css = dm_style.textContent || '';

		const g_result = await y_procesor.process(sx_css, {});

		dm_style.textContent = g_result.css;
	}

	// every element with a style attribute
	for(const dm_elmt of Array.from(d_doc.querySelectorAll('[style]'))) {
		const sx_style = dm_elmt.getAttribute('style') || '';

		const g_result = await y_procesor.process(`a{${sx_style}}`);

		dm_elmt.setAttribute('style', g_result.css.replace(/^a\{(.*)\}$/, '$1'));
	}
}
