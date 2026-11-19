# Leonida Ledger — GTA VI Trophy Guide & Tracker

An offline guide and tracker for all **55 PlayStation 5 trophies of Grand Theft Auto VI** — 1 platinum, 2 gold, 6 silver and 46 bronze, 28 of them hidden — built for the make.fun bounty [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01).

![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)
![entry rank](https://make.fun/badge/gta6-trophy-guide-01/mietrea519-cyber/gta6-trophy-guide-01/rank.svg)
![entry reward](https://make.fun/badge/gta6-trophy-guide-01/mietrea519-cyber/gta6-trophy-guide-01/reward.svg)

## What it does

- **Checklist of all 55 trophies** with the official name, description and grade exactly as PlayStation publishes them, a hidden-on-PSN marker, and the progress count PlayStation tracks where it tracks one (for example 0 / 42 Shooting Range challenges, 0 / 250 stunts, 0 / 500 choices).
- **A guide to every trophy, in this guide's own words**: what to do, where and how as far as the official description supports, and when it can be missed. Each guide carries a **Sources** line naming where its facts come from — the official trophy list as listed by [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi). Where a step is inferred from the description rather than stated by it, the guide says so in plain words.
- **Roadmap to the platinum** in seven stages built from the official descriptions: story first with the flagged moments called out, then the stranger strands, the collectible sweep, activities and scores, the money stage, and cleanup to 100%.
- **Missable flags**, derived from the official descriptions and labelled as inferences with their reasons: Catch Me If You Can (an unscheduled departure at VCIA), In The Beginning… (a cocktail on Ocean Beach, early on) and Capital Offense (the showroom smash "in classic style").
- **Tracker**: check trophies off, nudge the tracked counters, and progress is saved in the browser's localStorage — overall percentage plus per-grade counts. Export progress to a JSON file and import it back on any machine.
- **Filters** by kind (story, missable, collectibles, activities, online — the official list has no online trophies, and the app says so), by grade, and by search.
- **Spoiler shield**: a setting that hides the names and descriptions of story trophies until they are earned.
- **Fully offline**: static files only, no build step, no network request at run time. The look is original — no Rockstar Games logo, artwork or game screenshots anywhere.

## Run it

Serve `app/` with any static file server, or use the bundled one:

```sh
node serve.ts   # then open http://localhost:8080
```

Node.js 22.18 or later runs the `.ts` files as they are.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts` (the kit's library, byte-identical — the scorer rebuilds the dossier with its own copy and compares).

## Layout

- `app/index.html` — the page shell: progress panel, filters, checklist, guide pane, roadmap.
- `app/css/style.css` — the dusk-ledger look; system fonts only, nothing external.
- `app/js/main.js` — boot, controls, and the `?shot=` screenshot scenes.
- `app/js/store.js` — localStorage progress, counters, export/import.
- `app/js/filters.js` — kind/grade/search filtering and the spoiler-shield rule.
- `app/js/views.js` — checklist, guide card and roadmap rendering.
- `app/data/trophies.json` — the official list plus this guide's guides, kinds, flags, stages and sources.
- `screenshots/` — renders of the app itself (see `shots.json` for the scenes).
- `main.ts`, `serve.ts`, `vendor/makefun-frontend.ts` — the hand-in program, a local server, and the kit's dossier library.

## Screenshot scenes

The four screenshots in `screenshots/` are renders of fixed scenes of the real app, listed in `shots.json`. Each scene is a URL of the served app; the `?shot=` mode seeds a demo progress state (13 of 55 earned, counters part-way) and never touches a reader's saved progress:

| File | URL | Scene |
| --- | --- | --- |
| `1-cover.jpg` | `/?shot=cover` | Checklist with demo progress; the guide for Catch Me If You Can open — missable flag, official description, guide and Sources in frame |
| `2-roadmap.jpg` | `/?shot=roadmap` | The seven-stage roadmap with stage progress and missable warnings |
| `3-tracker.jpg` | `/?shot=tracker` | Missable filter active, spoiler shield on, demo progress checked |
| `4-guide.jpg` | `/?shot=guide` | One full guide open: The Shootist, counter at 19 / 42, Sources listed |

## Data notes

- Names, descriptions and grades in `app/data/trophies.json` match the official list character for character (verified programmatically against the kit's starter data before hand-in), including the asterisks in "T**s Ass Drug Money" and the curly apostrophe in "Let’s Go Bowling".
- Counts (250 stunts, 42 range challenges, 500 choices, $250,000 laundered, and the rest) are the progress targets PlayStation tracks, as listed by PSNProfiles.
- Hidden flags mark the 28 trophies PlayStation lists as hidden; the app shows them with a "Hidden on PSN" badge. This is separate from the spoiler shield, which masks story trophies by kind.
- Missable flags are this guide's inferences from the official descriptions — each carries its reason in the data (`missableReason`) and in its guide, and none is stated as confirmed: the game launched the day this guide was written, and the guides claim nothing that has not been checked.

## License

MIT — see `LICENSE`. The trophy names and descriptions are PlayStation's, reproduced as published; everything else here is original.

---

Entered on make.fun — find more bounties at [make.fun](https://make.fun/?ref=1e3qpbvy).
