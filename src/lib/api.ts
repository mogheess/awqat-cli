import { z } from "zod/v4";

const TimingsSchema = z.object({
	Fajr: z.string(),
	Sunrise: z.string(),
	Dhuhr: z.string(),
	Asr: z.string(),
	Maghrib: z.string(),
	Isha: z.string(),
});

const HijriDateSchema = z.object({
	day: z.string(),
	month: z.object({ en: z.string() }),
	year: z.string(),
});

const GregorianDateSchema = z.object({
	date: z.string(),
});

const DateSchema = z.object({
	hijri: HijriDateSchema,
	gregorian: GregorianDateSchema,
});

const DayDataSchema = z.object({
	timings: TimingsSchema,
	date: DateSchema,
});

const SingleDayResponseSchema = z.object({
	code: z.number(),
	data: DayDataSchema,
});

const CalendarResponseSchema = z.object({
	code: z.number(),
	data: z.array(DayDataSchema),
});

export interface PrayerTimings {
	Fajr: string;
	Sunrise: string;
	Dhuhr: string;
	Asr: string;
	Maghrib: string;
	Isha: string;
}

export interface HijriDate {
	day: string;
	month: string;
	year: string;
}

export interface DayData {
	timings: PrayerTimings;
	hijri: HijriDate;
	gregorianDate: string;
}

const BASE_URL = "https://api.aladhan.com/v1";

function stripTimezone(time: string): string {
	return time.replace(/\s*\(.*\)/, "").trim();
}

function parseDayData(raw: z.infer<typeof DayDataSchema>): DayData {
	const timings: PrayerTimings = {
		Fajr: stripTimezone(raw.timings.Fajr),
		Sunrise: stripTimezone(raw.timings.Sunrise),
		Dhuhr: stripTimezone(raw.timings.Dhuhr),
		Asr: stripTimezone(raw.timings.Asr),
		Maghrib: stripTimezone(raw.timings.Maghrib),
		Isha: stripTimezone(raw.timings.Isha),
	};

	return {
		timings,
		hijri: {
			day: raw.date.hijri.day,
			month: raw.date.hijri.month.en,
			year: raw.date.hijri.year,
		},
		gregorianDate: raw.date.gregorian.date,
	};
}

export async function fetchTodayTimings(
	city: string,
	country: string,
	method: number,
	school: number,
	shafaq?: string,
): Promise<DayData> {
	const params = new URLSearchParams({
		city,
		country,
		method: String(method),
		school: String(school),
	});
	if (shafaq && method === 15) {
		params.set("shafaq", shafaq);
	}

	const response = await fetch(`${BASE_URL}/timingsByCity?${params}`);

	if (!response.ok) {
		throw new Error(`API request failed with status ${response.status}`);
	}

	const json = await response.json();
	const parsed = SingleDayResponseSchema.parse(json);

	if (parsed.code !== 200) {
		throw new Error(`API returned error code ${parsed.code}`);
	}

	return parseDayData(parsed.data);
}

export async function fetchWeekTimings(
	city: string,
	country: string,
	method: number,
	school: number,
	shafaq?: string,
): Promise<DayData[]> {
	const now = new Date();
	const params = new URLSearchParams({
		city,
		country,
		method: String(method),
		school: String(school),
		month: String(now.getMonth() + 1),
		year: String(now.getFullYear()),
	});
	if (shafaq && method === 15) {
		params.set("shafaq", shafaq);
	}

	const response = await fetch(`${BASE_URL}/calendarByCity?${params}`);

	if (!response.ok) {
		throw new Error(`API request failed with status ${response.status}`);
	}

	const json = await response.json();
	const parsed = CalendarResponseSchema.parse(json);

	if (parsed.code !== 200) {
		throw new Error(`API returned error code ${parsed.code}`);
	}

	const todayDate = now.getDate();
	const allDays = parsed.data.map(parseDayData);

	return allDays.slice(todayDate - 1, todayDate + 6);
}
