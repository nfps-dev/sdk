import type {RollupTypescriptPluginOptions} from '@rollup/plugin-typescript';
import type {FilterPattern} from '@rollup/pluginutils';

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
}
