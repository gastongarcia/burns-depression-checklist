# Burns Depression Checklist

A private, one-question-at-a-time version of the 25-item Burns Depression Checklist by David D. Burns, MD, in English and Spanish.

- Each item is rated 0 (Not at all) to 4 (Extremely), for a total of 0–100. Items, scale labels and score levels match the published English form.
- The Spanish version is an unofficial translation made for this app.
- The score is shown only after every question is answered, along with where it falls on Burns' scale, a breakdown by area, and recent results.
- If any suicidal-urge item is above zero, the results lead with crisis resources.
- Everything stays in the browser (`localStorage`). Nothing is sent to a server.

This is a self-assessment, not a diagnosis.

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000. The checklist (both languages) and score levels live in `app/checklist.js`; interface text lives in `app/strings.js`.
