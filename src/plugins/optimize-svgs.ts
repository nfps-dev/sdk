import type {Plugin} from 'rollup';

import type {NfpModuleConfig} from 'src/_types';

import fs from 'node:fs/promises';

import {text_to_base64} from '@blake.regalia/belt';
import * as svgo from 'svgo';

export function optimize_svgs(gc_nfpm: NfpModuleConfig, b_dev: boolean): Plugin {
	return {
		name: 'svgo',

		async load(si_specifier) {
			// specifier matches svg file pattern
			const m_svg = /^(.*\.svg)(?:\?(.*))?$/.exec(si_specifier);
			if(m_svg) {
				// destructure specifier
				const [p_file, s_query] = m_svg;

				// load source
				let sx_svg = '';
				try {
					sx_svg = await fs.readFile(p_file, 'utf-8');
				}
				catch(e_read) {
					return this.error(`Failed to read SVG import ${si_specifier}`);
				}

				// run through optimizer
				svgo.optimize(sx_svg, {
					multipass: !b_dev,
					...gc_nfpm.svgo,
					path: p_file,
				});

				if('raw' === s_query) {
					return `export default ${JSON.stringify(sx_svg)}`;
				}
				else if('base64' === s_query) {
					return `export default ${JSON.stringify(`data:image/svg+xml;base64,${text_to_base64(sx_svg)}`)}`;
				}
				else {
					return this.error(`Must explicitly set an import mode for SVGs; either ?raw or ?base64`);
				}
			}

			return;
		},
	};
}
