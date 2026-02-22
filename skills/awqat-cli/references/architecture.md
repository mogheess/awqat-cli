# Architecture Reference

## Source Layout

```
src/
  index.ts                # entry point, commander flag definitions and routing
  commands/
    setup.ts              # @clack/prompts wizard, returns AppConfig
    today.ts              # default view, --json, --next
    week.ts               # --week table
  lib/
    api.ts                # Aladhan API calls + zod response schemas
    config.ts             # conf-based local storage (read/write/clear)
    display.ts            # all terminal rendering (header, rows, tables, JSON)
    location.ts           # IP geolocation via ip-api.com
    time.ts               # prayer status detection, countdown math, 12h formatting
  constants/
    methods.ts            # calculation method list, school options, shafaq options
```

## Aladhan API

Base: `https://api.aladhan.com/v1`

| Endpoint | Use |
|----------|-----|
| `/timingsByCity?city=X&country=X&method=N&school=N` | Single day |
| `/calendarByCity?city=X&country=X&method=N&school=N&month=M&year=Y` | Full month (sliced to 7 days for week view) |
| `/methods` | List all calculation methods |

Method 15 (Moonsighting Committee) requires an additional `shafaq` param (general, ahmer, or abyad).

Raw timings arrive as `"HH:MM (TZ)"`. The `stripTimezone` function in `api.ts` trims them to `"HH:MM"`.

All responses are validated through zod schemas before use.

## Calculation Methods

| ID | Name |
|----|------|
| 3 | Muslim World League |
| 2 | ISNA |
| 5 | Egyptian General Authority |
| 15 | Moonsighting Committee Worldwide |
| 4 | Umm Al-Qura, Makkah |
| 1 | Univ. of Islamic Sciences, Karachi |
| 7 | Inst. of Geophysics, Tehran |
| 8 | Gulf Region |
| 9 | Kuwait |
| 10 | Qatar |
| 11 | Majlis Ugama Islam Singapura |
| 12 | Union des Organisations Islamiques de France |
| 13 | Diyanet Isleri Baskanligi |
| 14 | Spiritual Admin. of Muslims of Russia |

School: `0` = Shafi/Maliki/Hanbali, `1` = Hanafi.

## Config Schema

```json
{
  "city": "string",
  "country": "string",
  "method": "number (default 3)",
  "school": "number (default 1)",
  "shafaq": "string (default 'general')",
  "detectedLat": "number",
  "detectedLon": "number",
  "timezone": "string"
}
```

## Key Patterns

- Display functions in `display.ts` return strings. Commands call `console.log` on them.
- `setup.ts` returns `AppConfig` so the caller can immediately fetch and show prayers.
- `--json` bypasses all rendering and outputs raw `JSON.stringify`.
- The figlet header uses "ANSI Shadow" font, colored with `picocolors.greenBright`.
- Past prayers render dim with a checkmark. Current prayer renders green. Upcoming prayers render white.

## Adding a Calculation Method

1. Add to `CALCULATION_METHODS` in `src/constants/methods.ts`
2. If it needs a special API param, add conditional logic in `fetchTodayTimings` and `fetchWeekTimings` in `src/lib/api.ts`
3. If the wizard needs an extra question for it, add after the method select in `src/commands/setup.ts`
4. Add the new field to `AppConfig` and the conf schema in `src/lib/config.ts`

## Adding a CLI Flag

1. Add `.option()` to the commander chain in `src/index.ts`
2. Handle it in the `.action()` callback
3. Add rendering logic in `src/lib/display.ts` if needed
4. Add API logic in `src/lib/api.ts` if needed
