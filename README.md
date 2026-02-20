# awqat-cli

Awqat (أوقات) is Arabic for "times". Here, it's referring to the five daily prayer times in Islam.

A terminal tool that shows prayer times for your city.

```
 █████╗ ██╗    ██╗ ██████╗  █████╗ ████████╗
██╔══██╗██║    ██║██╔═══██╗██╔══██╗╚══██╔══╝
███████║██║ █╗ ██║██║   ██║███████║   ██║
██╔══██║██║███╗██║██║▄▄ ██║██╔══██║   ██║
██║  ██║╚███╔███╔╝╚██████╔╝██║  ██║   ██║
╚═╝  ╚═╝ ╚══╝╚══╝  ╚══▀▀═╝ ╚═╝  ╚═╝   ╚═╝
```

## Install

```bash
npx awqat-cli

# or install globally
npm install -g awqat-cli
awqat
```

## Commands

```bash
awqat                                      # today's prayer times
awqat --setup                              # run the setup wizard
awqat --reset                              # clear config and re-run setup
awqat --week                               # full week of prayer times
awqat --next                               # next prayer + countdown
awqat --json                               # output as JSON
awqat --info                               # show saved configuration
awqat --city "Dubai" --country "UAE"       # one-off location override
awqat --help                               # list all options
```

## Setup

On first run, `awqat` walks you through setup:

1. Detects your location via IP geolocation
2. Lets you pick a calculation method (MWL, ISNA, Moonsighting Committee, etc.)
3. Lets you pick a school of thought for Asr (Hanafi or Shafi/Maliki/Hanbali)

Config is saved locally. Run `awqat --setup` to change it, or `awqat --reset` to start over.

## Calculation Methods

| ID | Method | Region |
|----|--------|--------|
| 3 | Muslim World League | Europe, Far East, parts of US |
| 2 | ISNA | North America |
| 5 | Egyptian General Authority | Africa, Syria, Lebanon, Malaysia |
| 15 | Moonsighting Committee Worldwide | Global, based on moon sighting |
| 4 | Umm Al-Qura University, Makkah | Arabian Peninsula |
| 1 | University of Islamic Sciences, Karachi | Pakistan, Bangladesh, India, Afghanistan |
| 7 | Institute of Geophysics, Tehran | Iran |
| 8 | Gulf Region | Gulf countries |
| 9 | Kuwait | Kuwait |
| 10 | Qatar | Qatar |
| 11 | Majlis Ugama Islam Singapura | Singapore |
| 12 | Union des Organisations Islamiques de France | France |
| 13 | Diyanet İşleri Başkanlığı | Turkey |
| 14 | Spiritual Administration of Muslims of Russia | Russia |

The Moonsighting Committee method also lets you choose a shafaq (twilight type) for Isha calculation: general, ahmer (red), or abyad (white).

## JSON Output

`awqat --json` prints structured JSON with no extra formatting:

```json
{
  "date": "2026-02-20",
  "hijri": "3 Ramadan 1447",
  "location": { "city": "London", "country": "United Kingdom" },
  "method": "Muslim World League",
  "school": "Hanafi",
  "prayers": {
    "Fajr": "05:13",
    "Sunrise": "07:05",
    "Dhuhr": "12:14",
    "Asr": "15:32",
    "Maghrib": "17:25",
    "Isha": "19:10"
  },
  "next": {
    "prayer": "Dhuhr",
    "in": "1h 10m"
  }
}
```

## API

Prayer times come from the [Aladhan Prayer Times API](https://aladhan.com/prayer-times-api). Free, no API key needed.

## Tech Stack

- TypeScript, Node.js
- [Commander](https://github.com/tj/commander.js) for CLI parsing
- [@clack/prompts](https://github.com/bombshell-dev/clack) for the setup wizard
- [Figlet](https://github.com/patorjk/figlet.js) for ASCII art
- [Picocolors](https://github.com/alexeyraspopov/picocolors) for terminal colors
- [Ora](https://github.com/sindresorhus/ora) for spinners
- [Zod](https://github.com/colinhacks/zod) for API response validation
- [Conf](https://github.com/sindresorhus/conf) for local config storage
- [tsup](https://github.com/egoist/tsup) for bundling

## Contributing

1. Fork the repo
2. Create a branch (`git checkout -b my-feature`)
3. Commit your changes
4. Push and open a pull request

## License

MIT
