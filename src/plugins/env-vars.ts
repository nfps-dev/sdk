import type {Plugin, PluginConfig} from '../_types';
import type {Dict} from '@blake.regalia/belt';

import * as dotenv from 'dotenv';
import MagicString from 'magic-string';

export interface DevEnvConfig extends PluginConfig {}

type SafeEnv = Dict & {
	DEV: boolean;
	PROD: boolean;
};

const R_IMPORT_META_ENV = /\bimport\.meta\.env(?:\.([A-Za-z_$][A-Za-z_$0-9]*))?\b/g;

/**
 * Replaces `import.meta.env` usage in user-code only with environment variables prefixed with "NFP_"
 */
export function envVars(gc_export: DevEnvConfig={}): Plugin {
	// 
	let h_env_safe: SafeEnv = {} as SafeEnv;

	return {
		name: 'nfp-env-vars',

		buildStart() {
			// reload env
			dotenv.config();

			h_env_safe = Object.fromEntries(
				Object.entries(process.env)
					.filter(([si_key]) => si_key.startsWith('NFP_'))
					.map(([si_key, s_value]) => [si_key.replace(/^NFP_/, ''), s_value])) as SafeEnv;

			h_env_safe.DEV = 'development' === process.env['NFP_ENV'];
			h_env_safe.PROD = !h_env_safe.DEV;

			console.log(`Environment variables available for substitution during build:`, h_env_safe);
		},

		transform(sx_code, si_module) {
			const y_magic = new MagicString(sx_code);

			let b_replaced = false;

			let m_env: RegExpMatchArray | null;

			// eslint-disable-next-line no-cond-assign
			while(m_env=R_IMPORT_META_ENV.exec(sx_code)) {
				const si_property = m_env[1];

				const w_replacement = si_property? h_env_safe[si_property]: h_env_safe;

				const i_start = m_env.index!;

				y_magic.overwrite(i_start, i_start+m_env[0].length, JSON.stringify(w_replacement));

				b_replaced = true;
			}

			return b_replaced? {
				code: y_magic.toString(),
				map: y_magic.generateMap({hires:true}),
			}: null;
		},
	};
}

export default envVars;
