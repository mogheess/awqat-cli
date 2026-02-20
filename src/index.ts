import { Command } from "commander";
import pc from "picocolors";
import { runSetup } from "./commands/setup.js";
import { runToday } from "./commands/today.js";
import { runWeek } from "./commands/week.js";
import { getMethodName, getSchoolName, MOONSIGHTING_METHOD_ID } from "./constants/methods.js";
import { clearConfig, getConfig, isConfigured } from "./lib/config.js";

const program = new Command();

program
	.name("awqat")
	.description("🕌 Prayer times in your terminal — أوقات")
	.version("1.0.0")
	.option("--setup", "Re-run the setup wizard")
	.option("--reset", "Reset all config and re-run setup")
	.option("--week", "Show the full week's prayer times")
	.option("--json", "Output today's prayers as JSON")
	.option("--next", "Show only the next prayer + countdown")
	.option("--info", "Show your saved configuration")
	.option("--city <city>", "Override city for this run (not saved)")
	.option("--country <country>", "Override country for this run (not saved)")
	.action(async (options) => {
		if (options.reset) {
			clearConfig();
			const config = await runSetup();
			await runToday({ config });
			return;
		}

		if (options.setup) {
			const config = await runSetup();
			await runToday({ config });
			return;
		}

		if (options.info) {
			const config = getConfig();
			if (!config) {
				console.log(pc.yellow("\n  No config found. Run `awqat --setup` to get started.\n"));
				return;
			}
			console.log("");
			console.log(`  ${pc.white(pc.bold("awqat-cli config"))}`);
			console.log(`  ${pc.dim("─".repeat(35))}`);
			console.log(`  ${pc.dim("City:")}          ${config.city}`);
			console.log(`  ${pc.dim("Country:")}       ${config.country}`);
			console.log(`  ${pc.dim("Method:")}        ${getMethodName(config.method)}`);
			console.log(`  ${pc.dim("School:")}        ${getSchoolName(config.school)}`);
			if (config.method === MOONSIGHTING_METHOD_ID) {
				console.log(`  ${pc.dim("Shafaq:")}        ${config.shafaq}`);
			}
			console.log(`  ${pc.dim("Timezone:")}      ${config.timezone}`);
			if (config.detectedLat && config.detectedLon) {
				console.log(`  ${pc.dim("Coordinates:")}   ${config.detectedLat}, ${config.detectedLon}`);
			}
			console.log("");
			return;
		}

		if (!isConfigured()) {
			const config = await runSetup();
			await runToday({ config });
			return;
		}

		const config = getConfig();
		if (!config) {
			const freshConfig = await runSetup();
			await runToday({ config: freshConfig });
			return;
		}

		if (options.week) {
			await runWeek({
				config,
				cityOverride: options.city,
				countryOverride: options.country,
			});
			return;
		}

		await runToday({
			config,
			json: options.json,
			next: options.next,
			cityOverride: options.city,
			countryOverride: options.country,
		});
	});

program.parse();
