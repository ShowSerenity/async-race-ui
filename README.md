# Async Race

**Deployed app:** [async-race-ui-eight.vercel.app]

**Self-check score estimate:** ~400 / 400 pts


## How to run locally

This is a **frontend-only** app. The mock backend must be run separately:

```bash
git clone https://github.com/mikhama/async-race-api.git
cd async-race-api
npm install
npm run start
```

Then, in this repo:

```bash
npm install
npm run dev
```

## Checklist 400/400 pts

### 🚀 UI Deployment
- [✔] Deployment Platform: app is deployed to GitHub Pages / Netlify / Vercel / Cloudflare Pages / similar.

### ✅ Requirements to Commits and Repository
- [✔] Commit guidelines compliance (Conventional Commits, lowercase types, imperative present tense).
- [✔] Checklist included in README.md.
- [✔] Score calculation included in README.md.
- [✔] UI Deployment link placed at the top of README.md.

### Basic Structure (80 points)
- [✔] Two Views (10 pts): Garage and Winners, routed via `react-router-dom`.
- [✔] Garage View Content (30 pts): view name, car creation/editing panel, race control panel, garage section with cars.
- [✔] Winners View Content (10 pts): view name, winners table, pagination.
- [✔] Persistent State (30 pts): page numbers (Garage/Winners) live in Redux; create/update form inputs live in Redux (`garageSlice.formCreateName/formCreateColor/formUpdateName/formUpdateColor`) so they survive switching views; race progress/positions are derived from Redux timestamps, so cars stay exactly where they were (finished, mid-race, or broken down) after navigating away and back.

### Garage View (90 points)
- [✔] Car Creation and Editing Panel, CRUD (20 pts): create/update/delete via mock API; empty/too-long names blocked (`isValidCarName`, `MAX_NAME_LENGTH`); deleting a car also deletes its winner record (`deleteWinner`).
- [✔] Color Selection (10 pts): native color picker, selected color rendered on the car SVG (`CarIcon` uses `color` as `currentColor`) and shown with the car name.
- [✔] Random Car Creation (20 pts): "Generate 100 cars" button, names assembled from two random parts (10 brands × 10 models), random hex color per car.
- [✔] Car Management Buttons (10 pts): per-car Select / Remove / Start / Stop buttons.
- [✔] Pagination (10 pts): 7 cars per page, plus a "jump to page" input.
- [✔] EXTRA — Empty Garage message ("No cars").
- [✔] EXTRA — Empty page after deleting the last car on a page moves back one page.

### 🏆 Winners View (50 points)
- [✔] Display Winners (15 pts): a car appears in Winners after it wins a race.
- [✔] Pagination for Winners (10 pts): 10 per page, plus "jump to page" input.
- [✔] Winners Table (15 pts): №, car icon/color, name, wins count, best time; wins increment and best time only improves, never worsens.
- [✔] Sorting Functionality (10 pts): sortable by wins and time, ascending/descending, sorting is requested from the server via query params over the full dataset (not just the visible page).

### 🚗 Race (170 points)
- [✔] Start Engine Animation (20 pts): click → wait for velocity/distance → animate; stops the animation on a `500` response from `drive`.
- [✔] Stop Engine Animation (20 pts): click → wait for stop confirmation → car returns to the starting position.
- [✔] Responsive Animation (30 pts): distance is computed live from the track's real rendered width via `ResizeObserver`, not a fixed pixel value, so it adapts down to 500px screens; verified with DevTools responsive mode resizing live.
- [✔] Start Race Button (10 pts): races all cars on the current page.
- [✔] Reset Race Button (15 pts): stops every car via the API and returns all of them to the start line.
- [✔] Winner Announcement (5 pts): centered modal banner (rendered via a React portal) shows the winning car's name and time.
- [✔] Button States (20 pts): Start disabled while the engine is running; Stop disabled while the car is at its initial position.
- [✔] Actions during the race (50 pts): Select/Remove are disabled per-car while that car is racing or the whole race is in progress; only the first car to genuinely finish is recorded as the winner (guarded by `raceWinnerId`, independent from closing the winner banner); navigating away mid-race and back preserves every car's exact state (driving/finished/broken-down) instead of resetting it.

### 🎨 Prettier and ESLint Configuration (10 points)
- [✔] Prettier Setup (5 pts): `.prettierrc`, `format` and `ci:format` scripts in `package.json`.
- [✔] ESLint Configuration (5 pts): `airbnb` + `airbnb-typescript` + `plugin:prettier/recommended` in `.eslintrc.js`, `lint`/`lint:fix` scripts, strict `tsconfig.app.json` (`strict: true`, `noImplicitAny: true`, `noUnusedLocals`, `noUnusedParameters`).