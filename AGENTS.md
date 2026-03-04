# AGENTS.md

This document provides context, architectural rules, and guidelines for AI agents (e.g., Cursor, Windsurf, Aider, Copilot Workspace) assisting in the development of the "Scrum Training App".
(Format compliant with the [agents.md](https://agents.md/) standard)

---

## Main Commands (Setup & Build)

- **Install Packages**: `npm install`
- **Start Development Server**: `npm run dev`
- **Build for Production**: `npm run build`
- **Local DB Synchronization**: `npx prisma db push` (uses local SQLite db: `dev.db`)
- **Database UI Manager**: `npx prisma studio`

---

## Project Objective

Build a "Scrum Training App", a gamified tool designed for Agile Coaches and Scrum Masters. The application is an open-source tribute to "Murder in the Sprint". The main goal is to allow teams to investigate "cold cases" related to Scrum anti-patterns, solving riddles and practical cases in a Cluedo-like style, and earning points to climb a global leaderboard.

## Tech Stack and Technologies

- **Frontend/Backend Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS v4
- **Animations:** Framer Motion (`framer-motion`)
- **Icons:** Lucide React (`lucide-react`)
- **Database:** SQLite (local: `dev.db`)
- **ORM:** Prisma (`@prisma/client`)
- **Authentication:** Custom (based on API Routes and Context/Local Storage, using `bcryptjs` for password hashing)
- **Email:** Nodemailer (interfaced with Ethereal Email for local development and password recovery)
- **Internationalization (i18n):** Custom management using React Context Provider (supported languages: Italian and English)

## Database Structure (Prisma Schema)

The application relies on the following Prisma schema:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model Team {
  id                  String               @id @default(uuid())
  name                String               @unique // Team nickname
  email               String?              @unique
  password            String?
  isAdmin             Boolean              @default(false)
  totalScore          Int                  @default(0)
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
  playSessions        PlaySession[]
  passwordResetTokens PasswordResetToken[]
}

model PasswordResetToken {
  id        String   @id @default(uuid())
  token     String   @unique
  expiresAt DateTime
  teamId    String
  team      Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
}

model Case {
  id                  String        @id @default(uuid())
  lang                String        @default("it")
  title               String
  story               String
  hint                String?
  correctLocation     String
  explanationLocation String        @default("-")
  locationChoices     String        @default("[]") // JSON array (e.g. ["Meeting Room", "Office"])
  correctSuspect      String
  explanationSuspect  String        @default("-")
  suspectChoices      String        @default("[]") // JSON array (e.g. ["PO", "DEV Team"])
  correctWeapon       String
  explanationWeapon   String        @default("-")
  weaponChoices       String        @default("[]") // JSON array (e.g. ["Jira", "Increment"])
  createdAt           DateTime      @default(now())
  playSessions        PlaySession[]
}

model PlaySession {
  id                String   @id @default(uuid())
  teamId            String
  caseId            String
  team              Team     @relation(fields: [teamId], references: [id])
  caseItem          Case     @relation(fields: [caseId], references: [id])
  isCorrectLocation Boolean  @default(false)
  isCorrectSuspect  Boolean  @default(false)
  isCorrectWeapon   Boolean  @default(false)
  scoreAwarded      Int      @default(0)
  completedAt       DateTime @default(now())
}
```


## Repository Structure

Key paths:
- `src/app/` — Next.js App Router structure. Contains specific routes (`/dashboard`, `/play/[id]`, `/leaderboard`, `/admin`, etc.) and API routes (`/api/...`).
- `src/components/` — Isolated UI components (cards, buttons, forms, modals).
- `src/lib/` — Shared utilities and logic.
- `prisma/` — Database schema (`schema.prisma`) and seed logic (`seed.ts`).
- `cases/` — Contains JSON files defining the available mystery cases (e.g. `scrum-cases-1.json`).


## Architecture Boundaries

1. **Frontend / Backend boundaries**: All data fetching from the Database must be performed exclusively within React Server Components or Next.js `route.ts` API files.
2. **State Management**: Complex UI state (e.g. gameplay selections) must be isolated in Client Components (`"use client"`) leaving wrapping Server Components clean. To prevent re-mounting, UI option renderers (such as `SelectionGroup`) must be defined outside the parent page module.
3. **Database Access**: Must be done through Prisma Client. No raw queries unless strictly necessary.
4. **Cache Management**: The `/api/cases/random` task distribution logic MUST bypass the Next.js cache.


## Coding Standards

- **TypeScript**: Use strict typing and interfaces.
- **Styling**: TailwindCSS v4. Build responsive, mobile-first designs. Add dynamic interactions using Framer Motion.
- **Design Aesthetic**: Use a "Crime/Gamified" dark mode theme. Utilize deep reds/grays, defined borders, and classified documentary effects.
- **Dynamic Options**: Radio/select lists during gameplay MUST NOT rely on hardcoded globals; they must be generated dynamically from `locationChoices`, `suspectChoices`, and `weaponChoices` JSON records.
- **Hints**: Gameplay hints must always be hidden by default behind a UI Toggle mechanism.


## Commits and PRs

Write commit messages focused on user impact and follow a clean structure.
- **Good:** `feat: implement hint toggle in play panel`
- **Good:** `fix: resolve scroll jump when selecting weapon`
- **Bad:** `update code`

Ensure all changes respect the Gamified design principles and the architecture boundaries outlined above before committing.

## Application Structure and Key Pages (App Router)

You will need to create a modern and responsive user interface supporting the following routes:

1. **Home / Auth (`/`)**
   - Public page containing Login and Registration (Signup) forms.
   - Registration: requires a Team Name (Nickname), Email, and Password.
   - User/team session data must be managed centrally in the app (e.g., via Context or localStorage/Cookie).
2. **Dashboard Investigation (`/dashboard`)**
   - Protected page showing the available `Case`s in the database for the selected language.
   - Each case is an investigative "card". It must show a button to start the investigation or an indicator if the case has already been solved by the team.
3. **Play Panel (`/play/[id]`)**
   - Includes the textual "Story/Mystery" to read.
   - Offers a feature to reveal a Hint via a Toggle, hiding it by default to avoid giving players too easy of an advantage.
   - The investigation requires the user to select three elements (Cluedo style):
     - **Location**
     - **Suspect**
     - **Weapon**
   - **IMPORTANT (React State Management):** Sub-components responsible for rendering option lists (e.g., `SelectionGroup`) MUST be defined outside the main component of the protected page `/play/[id]` (at the module level in `page.tsx`). This prevents continuous re-mounting and the painful loss of scroll position every time the user clicks on a radio button.
   - **IMPORTANT (Dynamic Options):** The options for dropdown menus or radio buttons MUST NOT be in global hardcoded files or arrays on the individual page. The menus must be populated dynamically ONLY by reading the properties `locationChoices`, `suspectChoices`, and `weaponChoices` provided by the specific Case JSON structure. These lists, originally inserted and read from the DB as strings using `JSON.stringify([...])`, must be parsed and rendered dynamically for each individual case.
   - On submit, compare the user's choices with the solution and show a score based on accuracy.
   - Show the "Explanations" (`explanationLocation`, `explanationSuspect`, `explanationWeapon`) indicating why an answer was correct or wrong.
   - **IMPORTANT (Cache Update):** Ensure that fetching new cases (`/api/cases/random`) bypasses Next.js' aggressive cache (using `export const dynamic = 'force-dynamic'` on the server side and `headers: { 'Cache-Control': 'no-cache' }` or query parameters with client-side timestamps in `/play`). This ensures that every database fetch always returns the actual up-to-date data.
4. **Leaderboard / Global Rankings (`/leaderboard`)**
   - Displays all teams ordered by `totalScore` in descending order.
   - Appealing design highlighting top positions (e.g., a podium).
5. **Password Recovery (`/forgot-password` and `/reset-password`)**
   - Flow for generating a `PasswordResetToken` sent via email (using Ethereal SMTP in development via `nodemailer`).
6. **Admin Panel (`/admin/...`)**
   - Visible and accessible only to Teams with `isAdmin = true` (e.g., "Admin Team").
   - Includes the "Databank": a complete CRUD to manage (add, edit, delete) `Case`s.
   - Allows a global reset ("Reset Leaderboard") which must physically delete all `PlaySession` records, delete all normal teams excluding Admins, and reset scores to zero.
   - Allows global clearance and JSON import/export of the Cases Database.
   - Form editor to manage all Case fields, including language (`lang`), story, hints, possibility arrays for the game (`locationChoices`, `suspectChoices`, `weaponChoices`), and solutions/explanations for Location, Suspect, and Weapon.

## API Endpoints

The application must expose the following Next.js endpoints (located in `src/app/api/...`):

- `/api/auth/login`: credentials validation
- `/api/auth/signup`: creation of a new team (and sending a dummy welcome email from `noreply@scrumtrainingapp.local`)
- `/api/auth/forgot-password` and `/api/auth/reset-password`: recovery flows management (with links and emails from `noreply@scrumtrainingapp.local`)
- `/api/teams/me`: GET (return secure information for localStorage and DB synchronization bypassing cache).
- `/api/cases`: GET (case list for the dashboard)
- `/api/cases/random`: GET (random assignment of a case with checks on previous plays, _absolutely not cached_ on the Server side!)
- `/api/play/submit`: POST (evaluation of an investigation, saving the `PlaySession` and updating the team's `totalScore`)
- `/api/leaderboard`: GET (calculation of top teams ranking)
- `/api/admin/cases`: GET, POST, PUT, DELETE (restricted access for case Databank CRUD)
- `/api/admin/cases/export` and `/import`: full export and partial JSON upload.
- `/api/admin/leaderboard/reset`: DELETE (restricted access to wipe sessions, delete non-admin players and reset residual scores to 0)

## Design Principles and UI/UX

- **Modern Design:** Use a "Crime/Gamified" theme. The color palette must inspire an investigative atmosphere (dark mode, deep reds/grays, defined borders, "classified documents effect").
- **Animations:** Framer Motion should be used to animate page transitions, modal openings, card hovering, and revealing the game's "verdict" outcome.
- **Reusable Components:** Implement buttons, form panels, and cards as isolated components (inside `/src/components`).
- **Hint Toggle:** In the game interface (`/play/[id]`), the "Hint" field MUST NOT be shown by default. It must be managed with a toggle mechanism (hide/reveal hint button).

## AI Development Instructions

When the AI begins generating code based on this prompt, be sure to tell it to proceed following these steps:

1. Initialize a Next.js (app router) project and configure Tailwind v4 and Framer Motion.
2. Initialize Prisma (`npx prisma init --datasource-provider sqlite`), paste the exact Database model from the prompt, and run the initial migration.
3. Create the basic layouts, navigation (Header/Nav), and the `LanguageSwitcher` configuration file to support UI in EN and IT. Ensure document meta tags use "Scrum Training App".
4. Implement the Auth logic (API and Context/Hooks), ensuring continuous login, registration, and admin checks (the mock admin credentials provided in `prisma/seed.ts` should use the address `admin@scrumtrainingapp.com`).
5. Develop the protected views: Cases Dashboard, Leaderboard, and the Game Page (`/play/[id]`) with scoring logic and answer comparison, managing React scope carefully.
6. Develop the Admin panel (route protection, administration tables for Content Management, leaderboard reset, and DB import).

---

**Note for the receiving AI:** Meticulously follow this prompt. Ensure you don't forget the implementation of the Hint Toggle, that emails (e.g., reset/signup) go through Nodemailer/Ethereal using the virtual sender domain `@scrumtrainingapp.local`, that the aggressive Next.js cache is imperatively disabled (`force-dynamic` / timestamp fetch) for task/score randomization, and that the schema referenced for point assignment correctly updates the `PlaySession` table and the `totalScore` field of the `Team`.
