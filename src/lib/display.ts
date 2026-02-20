import figlet from "figlet";
import pc from "picocolors";
import {
	getMethodName,
	getSchoolName,
	PRAYER_NAMES,
	type PrayerName,
} from "../constants/methods.js";
import type { DayData, PrayerTimings } from "./api.js";
import {
	formatGregorianDate,
	formatHijriDate,
	formatTo12Hour,
	getPrayerStatus,
	isPast,
	type PrayerStatus,
} from "./time.js";

function renderHeader(): string {
	const art = figlet.textSync("AWQAT", {
		font: "ANSI Shadow",
		horizontalLayout: "default",
	});

	const coloredArt = art
		.split("\n")
		.map((line) => pc.greenBright(line))
		.join("\n");

	const subtitle = pc.dim("🕌 awqat-cli  •  Prayer times in your terminal");

	return `\n${coloredArt}\n\n  ${subtitle}\n`;
}

function renderLocationLine(city: string, country: string, hijri: DayData["hijri"]): string {
	const location = `  📍 ${city}, ${country}`;
	const hijriStr = pc.dim(formatHijriDate(hijri.day, hijri.month, hijri.year));
	const gregorian = pc.dim(formatGregorianDate());
	return `${location}${pc.dim("              ")}${hijriStr}  ${pc.dim("•")}  ${gregorian}`;
}

function getStatusIndicator(
	prayerName: PrayerName,
	status: PrayerStatus,
	timings: PrayerTimings,
): string {
	if (status.current === prayerName) return pc.green(" ⏳ ← current");
	if (isPast(timings[prayerName])) return pc.dim(" ✅");
	return "";
}

function formatPrayerRow(
	name: PrayerName,
	time: string,
	status: PrayerStatus,
	timings: PrayerTimings,
): string {
	const time12 = formatTo12Hour(time);
	const indicator = getStatusIndicator(name, status, timings);

	const nameStr = name.padEnd(12);
	const timeStr = time12.padEnd(12);

	if (status.current === name) {
		return `  ${pc.green(pc.bold(nameStr))}${pc.green(pc.bold(timeStr))}${indicator}`;
	}
	if (isPast(time)) {
		return `  ${pc.dim(nameStr)}${pc.dim(timeStr)}${indicator}`;
	}
	return `  ${pc.white(nameStr)}${pc.white(timeStr)}${indicator}`;
}

function renderStatusLine(status: PrayerStatus): string {
	const lines: string[] = [];

	if (status.current) {
		lines.push(`  ${pc.green(`Status: ${status.current} in progress`)}`);
	}

	if (status.next && status.countdown) {
		lines.push(
			`  ${pc.white("Up next:")} ${pc.yellow(pc.bold(`${status.next} in ${status.countdown}`))}`,
		);
	}

	return lines.join("\n");
}

export function renderToday(data: DayData, city: string, country: string): string {
	const status = getPrayerStatus(data.timings);
	const lines: string[] = [];

	lines.push(renderHeader());
	lines.push(`  ${pc.white(pc.bold("Today's Prayers"))}`);
	lines.push(renderLocationLine(city, country, data.hijri));
	lines.push("");
	lines.push(`  ${pc.dim("Prayer")}      ${pc.dim("Adhan")}`);
	lines.push(`  ${pc.dim("─".repeat(40))}`);

	for (const name of PRAYER_NAMES) {
		lines.push(formatPrayerRow(name, data.timings[name], status, data.timings));
	}

	lines.push("");
	lines.push(renderStatusLine(status));
	lines.push("");
	const now = new Date();
	const timeNow = now.toLocaleTimeString("en-US", {
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
	lines.push(`  ${pc.dim(`🕐 Current time: ${timeNow}`)}`);
	lines.push("");

	return lines.join("\n");
}

export function renderNext(data: DayData): string {
	const status = getPrayerStatus(data.timings);
	const lines: string[] = [];

	lines.push(renderHeader());

	if (status.next && status.countdown) {
		lines.push(`  ${pc.white(pc.bold("Next Prayer"))}`);
		lines.push("");
		lines.push(
			`  ${pc.green(pc.bold(status.next))}  ${pc.dim("at")}  ${pc.white(pc.bold(formatTo12Hour(data.timings[status.next as PrayerName])))}`,
		);
		lines.push(`  ${pc.dim("in")} ${pc.yellow(pc.bold(status.countdown))}`);
	} else {
		lines.push(`  ${pc.dim("All prayers for today have passed.")}`);
	}

	lines.push("");
	return lines.join("\n");
}

export function renderWeek(days: DayData[], city: string, country: string): string {
	const lines: string[] = [];

	lines.push(renderHeader());

	if (days.length === 0) {
		lines.push(`  ${pc.dim("No data available.")}`);
		return lines.join("\n");
	}

	const firstDate = parseGregDate(days[0].gregorianDate);
	const lastDate = parseGregDate(days[days.length - 1].gregorianDate);

	const rangeStr = `${formatShort(firstDate)} – ${formatShort(lastDate)}`;
	lines.push(`  ${pc.white(pc.bold(`Week of ${rangeStr}`))}`);
	lines.push(`  📍 ${city}, ${country}`);
	lines.push("");

	const header = `  ${"Date".padEnd(16)}${"Fajr".padEnd(9)}${"Dhuhr".padEnd(9)}${"Asr".padEnd(9)}${"Maghrib".padEnd(9)}${"Isha".padEnd(9)}`;
	lines.push(pc.dim(header));
	lines.push(`  ${pc.dim("─".repeat(60))}`);

	for (const day of days) {
		const d = parseGregDate(day.gregorianDate);
		const dateStr = d.toLocaleDateString("en-GB", {
			weekday: "short",
			day: "numeric",
			month: "short",
		});

		const t = day.timings;
		const row = `  ${pc.white(dateStr.padEnd(16))}${t.Fajr.padEnd(9)}${t.Dhuhr.padEnd(9)}${t.Asr.padEnd(9)}${t.Maghrib.padEnd(9)}${t.Isha.padEnd(9)}`;
		lines.push(row);
	}

	lines.push("");
	return lines.join("\n");
}

export function renderJson(
	data: DayData,
	city: string,
	country: string,
	method: number,
	school: number,
): string {
	const status = getPrayerStatus(data.timings);

	const output = {
		date: toISO(parseGregDate(data.gregorianDate)),
		hijri: formatHijriDate(data.hijri.day, data.hijri.month, data.hijri.year),
		location: { city, country },
		method: getMethodName(method),
		school: getSchoolName(school),
		prayers: data.timings,
		next: status.next ? { prayer: status.next, in: status.countdown } : null,
	};

	return JSON.stringify(output, null, 2);
}

function parseGregDate(dateStr: string): Date {
	const [day, month, year] = dateStr.split("-").map(Number);
	return new Date(year, month - 1, day);
}

function formatShort(date: Date): string {
	return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function toISO(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}
