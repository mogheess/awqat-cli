import * as p from "@clack/prompts";
import ora from "ora";
import pc from "picocolors";
import {
	CALCULATION_METHODS,
	MOONSIGHTING_METHOD_ID,
	SCHOOLS,
	SHAFAQ_OPTIONS,
} from "../constants/methods.js";
import { type AppConfig, saveConfig } from "../lib/config.js";
import { detectLocation } from "../lib/location.js";

export async function runSetup(): Promise<AppConfig> {
	p.intro(pc.green("🕌 Welcome to awqat-cli"));
	console.log(pc.dim("  Prayer times in your terminal\n"));

	const spinner = ora({ text: "Detecting your location...", color: "green" }).start();
	const location = await detectLocation();
	spinner.stop();

	let city: string;
	let country: string;
	let lat = 0;
	let lon = 0;
	let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	if (location) {
		console.log(pc.green(`  ✓ Detected: ${location.city}, ${location.country}\n`));

		const correct = await p.confirm({
			message: "Is this correct?",
			initialValue: true,
		});

		if (p.isCancel(correct)) {
			p.cancel("Setup cancelled.");
			process.exit(0);
		}

		if (correct) {
			city = location.city;
			country = location.country;
			lat = location.lat;
			lon = location.lon;
			timezone = location.timezone;
		} else {
			const manualCity = await p.text({
				message: "Enter your city:",
				placeholder: "e.g. London",
				validate: (val) => (!val?.length ? "City is required" : undefined),
			});

			if (p.isCancel(manualCity)) {
				p.cancel("Setup cancelled.");
				process.exit(0);
			}

			const manualCountry = await p.text({
				message: "Enter your country:",
				placeholder: "e.g. United Kingdom",
				validate: (val) => (!val?.length ? "Country is required" : undefined),
			});

			if (p.isCancel(manualCountry)) {
				p.cancel("Setup cancelled.");
				process.exit(0);
			}

			city = manualCity;
			country = manualCountry;
		}
	} else {
		console.log(pc.yellow("  ⚠ Could not detect location automatically.\n"));

		const manualCity = await p.text({
			message: "Enter your city:",
			placeholder: "e.g. London",
			validate: (val) => (!val?.length ? "City is required" : undefined),
		});

		if (p.isCancel(manualCity)) {
			p.cancel("Setup cancelled.");
			process.exit(0);
		}

		const manualCountry = await p.text({
			message: "Enter your country:",
			placeholder: "e.g. United Kingdom",
			validate: (val) => (!val?.length ? "Country is required" : undefined),
		});

		if (p.isCancel(manualCountry)) {
			p.cancel("Setup cancelled.");
			process.exit(0);
		}

		city = manualCity;
		country = manualCountry;
	}

	const method = await p.select({
		message: "Select calculation method:",
		options: CALCULATION_METHODS.map((m) => ({
			value: m.id,
			label: m.name,
			hint: m.region,
		})),
	});

	if (p.isCancel(method)) {
		p.cancel("Setup cancelled.");
		process.exit(0);
	}

	const school = await p.select({
		message: "School of thought for Asr prayer:",
		options: SCHOOLS.map((s) => ({
			value: s.id,
			label: s.name,
			hint: s.description,
		})),
	});

	if (p.isCancel(school)) {
		p.cancel("Setup cancelled.");
		process.exit(0);
	}

	let shafaq = "general";
	if ((method as number) === MOONSIGHTING_METHOD_ID) {
		const shafaqChoice = await p.select({
			message: "Shafaq (twilight type) for Isha calculation:",
			options: SHAFAQ_OPTIONS.map((s) => ({
				value: s.value,
				label: s.label,
				hint: s.description,
			})),
		});

		if (p.isCancel(shafaqChoice)) {
			p.cancel("Setup cancelled.");
			process.exit(0);
		}

		shafaq = shafaqChoice as string;
	}

	const config: AppConfig = {
		city,
		country,
		method: method as number,
		school: school as number,
		shafaq,
		detectedLat: lat,
		detectedLon: lon,
		timezone,
	};

	saveConfig(config);

	p.outro(pc.green("Setup complete!"));

	return config;
}
