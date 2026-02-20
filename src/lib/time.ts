import { PRAYER_NAMES, type PrayerName } from "../constants/methods.js";
import type { PrayerTimings } from "./api.js";

export function parseTime(timeStr: string): Date {
	const [hours, minutes] = timeStr.split(":").map(Number);
	const now = new Date();
	now.setHours(hours, minutes, 0, 0);
	return now;
}

export interface PrayerStatus {
	current: PrayerName | null;
	next: PrayerName | null;
	nextTime: Date | null;
	countdown: string;
}

export function getPrayerStatus(timings: PrayerTimings): PrayerStatus {
	const now = new Date();
	const times: [PrayerName, Date][] = PRAYER_NAMES.map((name) => [name, parseTime(timings[name])]);

	let current: PrayerName | null = null;
	let next: PrayerName | null = null;
	let nextTime: Date | null = null;

	for (let i = 0; i < times.length; i++) {
		const [name, time] = times[i];
		if (now >= time) {
			current = name;
		} else {
			next = name;
			nextTime = time;
			break;
		}
	}

	if (!next) {
		next = "Fajr";
		const tomorrow = new Date(now);
		tomorrow.setDate(tomorrow.getDate() + 1);
		const [h, m] = timings.Fajr.split(":").map(Number);
		tomorrow.setHours(h, m, 0, 0);
		nextTime = tomorrow;
	}

	const countdown = nextTime ? formatCountdown(nextTime.getTime() - now.getTime()) : "";

	return { current, next, nextTime, countdown };
}

export function formatCountdown(ms: number): string {
	if (ms <= 0) return "now";

	const totalMinutes = Math.floor(ms / 60000);
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	if (hours > 0) {
		return `${hours}h ${String(minutes).padStart(2, "0")}m`;
	}
	return `${minutes}m`;
}

export function isPast(timeStr: string): boolean {
	return new Date() >= parseTime(timeStr);
}

export function isCurrent(prayerName: PrayerName, status: PrayerStatus): boolean {
	return status.current === prayerName;
}

export function formatTo12Hour(time24: string): string {
	const [hours, minutes] = time24.split(":").map(Number);
	const period = hours >= 12 ? "PM" : "AM";
	const displayHours = hours % 12 || 12;
	return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function formatHijriDate(day: string, month: string, year: string): string {
	return `${day} ${month} ${year}`;
}

export function formatGregorianDate(date?: Date): string {
	const d = date ?? new Date();
	return d.toLocaleDateString("en-GB", {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}
