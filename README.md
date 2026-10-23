# Burns Depression Checklist

A private, one-question-at-a-time version of the 25-item depression checklist from David D. Burns' _Feeling Good_ / _The Feeling Good Handbook_.

- Each item is rated 0 (Not at all) to 4 (Extremely), for a total of 0–100.
- The score is shown only after every question is answered, along with where it falls on Burns' scale, a breakdown by area, and recent results.
- If any suicidal-urge item is above zero, the results lead with crisis resources.
- Everything stays in the browser (`localStorage`). Nothing is sent to a server.

This is a self-assessment, not a diagnosis.

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000. The questions and score bands live in `app/checklist.js`.
