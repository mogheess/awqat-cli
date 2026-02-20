export interface CalculationMethod {
	id: number;
	name: string;
	region: string;
}

export const CALCULATION_METHODS: CalculationMethod[] = [
	{ id: 3, name: "Muslim World League", region: "Europe, Far East, parts of US" },
	{ id: 2, name: "Islamic Society of North America (ISNA)", region: "North America" },
	{
		id: 5,
		name: "Egyptian General Authority of Survey",
		region: "Africa, Syria, Lebanon, Malaysia",
	},
	{
		id: 15,
		name: "Moonsighting Committee Worldwide",
		region: "Global — based on moon sighting",
	},
	{ id: 4, name: "Umm Al-Qura University, Makkah", region: "Arabian Peninsula" },
	{
		id: 1,
		name: "University of Islamic Sciences, Karachi",
		region: "Pakistan, Bangladesh, India, Afghanistan",
	},
	{ id: 7, name: "Institute of Geophysics, University of Tehran", region: "Iran" },
	{ id: 8, name: "Gulf Region", region: "Gulf countries" },
	{ id: 9, name: "Kuwait", region: "Kuwait" },
	{ id: 10, name: "Qatar", region: "Qatar" },
	{ id: 11, name: "Majlis Ugama Islam Singapura", region: "Singapore" },
	{
		id: 12,
		name: "Union des Organisations Islamiques de France",
		region: "France",
	},
	{ id: 13, name: "Diyanet İşleri Başkanlığı", region: "Turkey" },
	{
		id: 14,
		name: "Spiritual Administration of Muslims of Russia",
		region: "Russia",
	},
];

export const MOONSIGHTING_METHOD_ID = 15;

export const SHAFAQ_OPTIONS = [
	{ value: "general", label: "General", description: "General twilight (default)" },
	{ value: "ahmer", label: "Ahmer", description: "Red twilight — earlier Isha" },
	{ value: "abyad", label: "Abyad", description: "White twilight — later Isha" },
] as const;

export type ShafaqValue = (typeof SHAFAQ_OPTIONS)[number]["value"];

export const SCHOOLS = [
	{ id: 1, name: "Hanafi (recommended)", description: "Later Asr time" },
	{ id: 0, name: "Shafi / Maliki / Hanbali", description: "Standard Asr time" },
] as const;

export const PRAYER_NAMES = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
export type PrayerName = (typeof PRAYER_NAMES)[number];

export function getMethodName(id: number): string {
	return CALCULATION_METHODS.find((m) => m.id === id)?.name ?? `Method ${id}`;
}

export function getSchoolName(id: number): string {
	return SCHOOLS.find((s) => s.id === id)?.name ?? "Standard";
}
