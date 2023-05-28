import type {
	JsonValue,
} from '@blake.regalia/belt';

import type {
	SlimTokenLocation, load_script,
} from '@nfps.dev/runtime';

import type {
	AuthSecret,
	SecretContract,
} from '@solar-republic/neutrino';

export type {};

interface NfpxGlobal {
	l: typeof load_script;
	a(si_prop: string, h_data: Dict<any>): Dict<any>;
	i(...a_args: Arguments<typeof load_script>): Dict<any>;
}

declare global {
	function exportNfpx(): void;

	interface ImportCallOptions {
		/**
		 * A {@link SlimTokenLocation} tuple, identifying the location of the NFT
		 */
		location: SlimTokenLocation;

		/**
		 * A {@link SecretContract} instance pointing to a package manager contract
		 */
		contract: SecretContract;

		/**
		 * How to authenticate with the contract (query permit object, viewing key string, or `null`).
		 * Provide `null` if the package is public and authentication is not needed
		 */
		auth: AuthSecret | null;

		/**
		 * Optional arbitrary key/value args to submit with the query; primarily used for selecting a tag
		 */
		query?: {
			[key: string]: JsonValue;
			tag?: string;
		};
	}

	interface Window {
		nfpx: NfpxGlobal;
	}

	const nfpx: NfpxGlobal;

	interface NfpModulesMap {}

	/**
	 * Must be used with a destructuring assignment. Replaced at compile-time with aliases resolved to symbols
	 * @param si_module 
	 */
	function destructureImportedNfpModule<
		si_module extends keyof NfpModulesMap,
	>(si_module: si_module): NfpModulesMap[si_module];
}
