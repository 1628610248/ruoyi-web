/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_GLOB_API_URL: string;
	readonly VITE_APP_API_BASE_URL: string;
	readonly VITE_GLOB_OPEN_LONG_REPLY: string;
	readonly VITE_GLOB_APP_PWA: string;
	readonly VITE_APP_ENCRYPT: string;
	readonly VITE_CHAT_ENABLE_ENCRYPT: string;
	readonly VITE_CHAT_RSA_PUBLIC_KEY: string;
	readonly VITE_CHAT_RSA_PRIVATE_KEY: string;
	readonly VITE_CHAT_APP_CLIENT_ID: string;
}
