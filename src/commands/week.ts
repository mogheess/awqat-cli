import ora from "ora";
import pc from "picocolors";
import { fetchWeekTimings } from "../lib/api.js";
import type { AppConfig } from "../lib/config.js";
import { renderWeek } from "../lib/display.js";

interface WeekOptions {
	config: AppConfig;
	cityOverride?: string;
	countryOverride?: string;
}

export async function runWeek(options: WeekOptions): Promise<void> {
	const city = options.cityOverride ?? options.config.city;
	const country = options.countryOverride ?? options.config.country;
	const { method, school, shafaq } = options.config;

	const spinner = ora({ text: "Fetching weekly prayer times...", color: "green" }).start();

	try {
		const days = await fetchWeekTimings(city, country, method, school, shafaq);
		spinner.stop();
		console.log(renderWeek(days, city, country));
	} catch (error) {
		spinner.stop();

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
