---
name: awqat-cli
description: Run and interact with awqat-cli, a Muslim prayer times CLI. Use when the user asks to check prayer times, run awqat, debug awqat output, modify awqat config, or develop features for awqat-cli.
---

# awqat-cli

Muslim prayer times in the terminal. Powered by the Aladhan API.

## Running

```bash
awqat                                      # today's prayers
awqat --week                               # 7-day schedule
awqat --next                               # next prayer + countdown
awqat --json                               # machine-readable output
awqat --info                               # show saved config
awqat --setup                              # re-run setup wizard
awqat --reset                              # wipe config, start over
awqat --city "Dubai" --country "UAE"        # temporary location override
```

Local dev fallback: `node dist/index.js`
Package exec: `npx awqat-cli`

## First Run

No config triggers the setup wizard automatically:

1. Detects location via IP (ip-api.com)
2. User confirms or enters city/country manually
3. User picks calculation method (15 available)
4. User picks school of thought (Hanafi default)
5. If method 15 (Moonsighting Committee), asks for shafaq (general/ahmer/abyad)
6. Saves config, then immediately shows today's prayers

## Output Modes

| Flag | Output |
|------|--------|
| (none) | Colored table with ASCII header, status, countdown, current time |
| `--next` | Next prayer name, time, countdown |
| `--week` | 7-row table of all prayer times |
| `--json` | Pure JSON to stdout, no colors or formatting |
| `--info` | Saved config summary |

`--json` is the only mode safe for piping or parsing. All other modes include ANSI colors.

## Exit Codes

- `0` success
- `1` network error, unknown city, or API failure

Errors go to stderr. Data goes to stdout.

## Config

Stored via `conf` at OS-default paths:

- macOS: `~/Library/Preferences/awqat-cli-nodejs/config.json`
- Linux: `~/.config/awqat-cli-nodejs/config.json`
- Windows: `%APPDATA%/awqat-cli-nodejs/config.json`

Fields: city, country, method, school, shafaq, detectedLat, detectedLon, timezone.

`--city` and `--country` flags are one-off overrides. They do not modify saved config.

## Validating Changes

After any code change, run:

```bash
npm run build
npm run typecheck
npx @biomejs/biome check --write src/
```

Then verify:

```bash
node dist/index.js --help
node dist/index.js --json --city "London" --country "UK"
node dist/index.js --week --city "London" --country "UK"
node dist/index.js --next --city "London" --country "UK"
node dist/index.js --info
```

CRITICAL: `--json` must return valid parseable JSON with zero extra output.

## Troubleshooting

### "Could not fetch prayer times"

Network issue. Check internet connection. The Aladhan API requires no auth.

### Unknown city error

The Aladhan API could not resolve the city/country pair. Run `awqat --setup` to reconfigure.

### No output, just exits

Config is missing. The wizard should launch automatically. If not, run `awqat --reset`.

### Shafaq not taking effect

Only applies when method is 15 (Moonsighting Committee). Other methods ignore it.

## Additional Resources

- For API details and project structure, see [references/architecture.md](references/architecture.md)
