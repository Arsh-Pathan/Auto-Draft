# AutoReport

AutoReport generates AI & ML Club activity reports for Dhole Patil College of Engineering in PDF and DOCX format.

The app takes rough event notes plus photographs, rewrites the narrative with Gemini, and renders the output into the college-style report shell used by the live preview, PDF export, and DOCX export.

## Features

- Gemini-based structured report generation
- Live A4 preview in the browser
- Shared report format across preview and PDF
- DOCX export with the same metadata, photographs, and signatories
- Official college header asset and logo support
- Editable AI output before download

## Tech stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Gemini API (`models.generateContent`)
- Puppeteer
- `docx`
- Zod

## Project layout

```text
src/
  app/                   Next.js App Router pages and API routes
  backend/               server-only integrations (gemini, pdf, docx)
  components/ui/         shared form primitives
  frontend/              client components
  services/              orchestration and image processing
  templates/             shared report HTML and CSS
  types/                 Zod schema and payload types
  utils/                 constants, date helpers, filenames
public/
  report-header.png      official report header banner
  college-logo.svg       official college logo
example/                 user-provided reference assets
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the example env file:

```bash
cp .env.local.example .env.local
```

3. Fill in `.env.local`:

```env
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-2.0-flash
PUPPETEER_CACHE_DIR=./.cache/puppeteer
```

4. Start the app:

```bash
npm run dev
```

## Report flow

1. The user enters event details, raw notes, and optional photographs.
2. `POST /api/generate` calls Gemini and requests strict JSON output.
3. The response is validated with Zod and shown in editable textareas.
4. The live preview renders the same HTML template used by the PDF route.
5. The PDF route uses Puppeteer and the DOCX route uses `docx`.

## Format notes

The report format is aligned to the provided college references:

- top header banner
- metadata table
- centered event title
- overview, program details, and overall outcome sections
- photograph grid with captions
- three-signature footer

If the format changes, update both `src/templates/report.html.ts` and `src/backend/docx.ts`.

## Commands

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## Commit convention

Use professional conventional commits in this repo, for example:

- `feat: switch report generation to gemini`
- `fix: align pdf and docx header layout`
- `docs: update claude guidance for commit style`

## Notes

- Node 20+ is required.
- There is no test runner configured.
- For Windows, keeping `PUPPETEER_CACHE_DIR` inside the repo helps avoid OneDrive and antivirus cache issues.
