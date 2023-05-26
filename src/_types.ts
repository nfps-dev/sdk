import type {RollupTypescriptPluginOptions} from '@rollup/plugin-typescript';
import type {FilterPattern} from '@rollup/pluginutils';
import type {Plugin as RollupPlugin} from 'rollup';

export interface PluginConfig {
	include?: FilterPattern;
	exclude?: FilterPattern;
}

export interface NfpModuleConfig extends PluginConfig, Pick<
	RollupTypescriptPluginOptions,
	| 'tsconfig' | 'compilerOptions' | 'typescript' | 'transformers'
> {
	/**
	 * Specifies the id of this module, should correspond with the name of the output file
	 */
	id: string;

	/**
	 * If `true`, injects a bit of code which defines a global variable on the `window.nfpx` property.
	 * This is necessary in order for the runtime to be able to use NFP modules
	 */
	injectNfpModuleSystem?: boolean;
}

export type Plugin = RollupPlugin;
