interface ImportMetaEnv {
	[si_key: string]: any;
	DEV: boolean;
	PROD: boolean;

	WEB_LCDS?: string;
	WEB_COMCS?: string;
	SELF_CHAIN?: string;
	SELF_CONTRACT?: string;
	SELF_TOKEN?: string;
	WALLET_PRIVATE_KEY?: string;
	VIEWING_KEY?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
