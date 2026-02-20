import { z } from "zod/v4";

const LocationResponseSchema = z.object({
	status: z.literal("success"),
	city: z.string(),
	country: z.string(),
	lat: z.number(),
	lon: z.number(),
	timezone: z.string(),
});

export interface LocationData {
	city: string;
	country: string;
	lat: number;
	lon: number;
	timezone: string;
}

export async function detectLocation(): Promise<LocationData | null> {
	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 5000);

		const response = await fetch(
			"http://ip-api.com/json/?fields=status,city,country,lat,lon,timezone",
			{
				signal: controller.signal,
			},
		);
		clearTimeout(timeout);

		if (!response.ok) return null;

		const data = await response.json();
		const parsed = LocationResponseSchema.parse(data);

		return {
			city: parsed.city,
			country: parsed.country,
			lat: parsed.lat,
			lon: parsed.lon,
			timezone: parsed.timezone,
		};
	} catch {
		return null;
	}
}
