import Conf from "conf";

export interface AppConfig {
	city: string;
	country: string;
	method: number;
	school: number;
	shafaq: string;
	detectedLat: number;
	detectedLon: number;
	timezone: string;
}

const config = new Conf<AppConfig>({
	projectName: "awqat-cli",
	schema: {
		city: { type: "string" },
		country: { type: "string" },
		method: { type: "number", default: 3 },
		school: { type: "number", default: 1 },
		shafaq: { type: "string", default: "general" },
		detectedLat: { type: "number" },
		detectedLon: { type: "number" },
		timezone: { type: "string" },
	},
});

export function getConfig(): AppConfig | null {
	if (!config.has("city") || !config.has("country")) {
		return null;
	}
	return {
		city: config.get("city"),
		country: config.get("country"),
		method: config.get("method"),
		school: config.get("school"),
		shafaq: config.get("shafaq"),
		detectedLat: config.get("detectedLat"),
		detectedLon: config.get("detectedLon"),
		timezone: config.get("timezone"),
	};
}

export function saveConfig(values: AppConfig): void {
	for (const [key, value] of Object.entries(values)) {
		config.set(key as keyof AppConfig, value);
	}
}

export function isConfigured(): boolean {
	return config.has("city") && config.has("country");
}

export function clearConfig(): void {
	config.clear();
}
