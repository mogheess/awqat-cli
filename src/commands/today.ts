import ora from "ora";
import pc from "picocolors";
import { fetchTodayTimings } from "../lib/api.js";
import type { AppConfig } from "../lib/config.js";
import { renderJson, renderNext, renderToday } from "../lib/display.js";

interface TodayOptions {
	config: AppConfig;
	json?: boolean;
	next?: boolean;
	cityOverride?: string;
	countryOverride?: string;
}

export async function runToday(options: TodayOptions): Promise<void> {
	const city = options.cityOverride ?? options.config.city;
	const country = options.countryOverride ?? options.config.country;
	const { method, school, shafaq } = options.config;

	const spinner = options.json
		? null
		: ora({ text: "Fetching prayer times...", color: "green" }).start();

	try {
		const data = await fetchTodayTimings(city, country, method, school, shafaq);

		spinner?.stop();

		if (options.json) {
			console.log(renderJson(data, city, country, method, school));
			return;
		}

		if (options.next) {
			console.log(renderNext(data));
			return;
		}

		console.log(renderToday(data, city, country));
	} catch (error) {
		spinner?.stop();

		const message = error instanceof Error ? error.message : "Unknown error";

		if (message.includes("fetch") || message.includes("network") || message.includes("ENOTFOUND")) {
			console.error(
				pc.red("\n  ✖ Could not fetch prayer times. Check your internet connection.\n"),
			);
		} else {
			console.error(pc.red(`\n  ✖ ${message}`));
			console.error(pc.dim("  Try running `awqat --setup` to update your city.\n"));
		}

		process.exit(1);
	}
}
