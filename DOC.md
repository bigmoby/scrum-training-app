# Scrum Training App --- Development & Deployment Guide

This document contains **technical documentation for developers and
contributors**. It is intentionally separated from the main README to
keep the repository landing page focused on the project vision.

---

## Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/bigmoby/scrum-training-app.git
cd scrum-training-app
```

### 2. Install dependencies

The project uses Node.js and npm.

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

The application will start in development mode and typically be
available at:

    http://localhost:5173

(The exact port depends on the configuration of the Vite dev server.)

---

## Project Structure

Typical structure of the project:

    scrum-training-app
    │
    ├── public/                 # Static assets
    │   └── docs/               # Screenshots and documentation images
    │
    ├── src/                    # Application source code
    │
    ├── prisma/                 # Prisma schema and database
    │
    ├── AGENTS.md               # Instructions for AI coding agents
    │
    ├── README.md               # Project overview
    │
    └── package.json            # Project dependencies and scripts

---

## Production Build

To create a production-ready build:

```bash
npm run build
```

The compiled application will be generated in the:

    dist/

directory.

---

## Database Setup

This project uses **SQLite** for zero‑configuration local development
and **Prisma** as ORM.

Initialize the database with:

```bash
# Generate the Prisma Client
npx prisma generate

# Create the database and push the schema
npx prisma db push

# (Optional) Seed the database with the initial Cases and Admin user
npx prisma db seed
```

---

## Environment Variables

Create a `.env` file in the project root.

Example:

```env
DATABASE_URL="file:./dev.db"

SMTP_USER=your_user
SMTP_PASS=your_password
```

These variables are required when switching from development email
testing to real SMTP providers.

---

## Running the Production Build

You can preview the production build locally with:

```bash
npm run preview
```

This simulates how the application will behave once deployed.

---

## Email Configuration (Production)

In development the application may use **Ethereal email** for testing.

To send **real emails** to users you must configure a real SMTP provider
(e.g., Gmail, SendGrid, Amazon SES).

Steps:

1.  Open

```{=html}
<!-- -->
```

    src/app/api/auth/signup/route.ts
    src/app/api/auth/forgot-password/route.ts

2.  Locate the configuration:

```javascript
nodemailer.createTransport({...})
```

3.  Replace the Ethereal configuration with environment variables:

```javascript
host: process.env.SMTP_HOST,
auth: {
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS
}
```

4.  Save your credentials inside the `.env` file.

---

## Database Management (Prisma)

The project uses **Prisma** with a local **SQLite database**.

Database file:

    prisma/dev.db

### Clearing the database (Reset)

If you want to delete all registered teams and start from scratch during
testing, you have two options.

### Option 1 --- Prisma Studio (Recommended)

1.  Open a **new terminal** in the project folder.
2.  Run:

```bash
npx prisma studio
```

3.  Prisma Studio will open in your browser:

```{=html}
<!-- -->
```

    http://localhost:5555

4.  From the UI you can inspect and delete records in tables like:

- Team
- PlaySession

5.  When finished press **CTRL + C** in the terminal to stop the
    service.

---

### Option 2 --- Terminal Reset

If you want a **complete reset of the database**:

```bash
npx prisma migrate reset
```

⚠️ **Warning:**\
This command deletes the entire database and all existing data.

It will then recreate the database and run the seed file automatically.

---

## Deployment

Because the application is a **static web application**, it can be
deployed easily on:

- GitHub Pages
- Vercel
- Netlify
- Cloudflare Pages
- any static hosting platform

Typical deployment workflow:

    npm run build
    deploy the dist/ folder

---

## AI-Agent Integration

The repository includes an **AGENTS.md** file that helps AI coding
assistants understand the project.

It provides structured guidance about:

- project architecture
- coding conventions
- contribution rules
- project intent

Tools that can benefit from this file include:

- Cursor
- GitHub Copilot
- Claude Code
- AI-assisted development agents

---

## Contributing

If you want to contribute:

1.  Fork the repository
2.  Create a feature branch
3.  Implement your changes
4.  Submit a pull request

Example:

```bash
git checkout -b feature/new-case
```

Possible contributions:

- new investigation cases
- UI improvements
- gameplay mechanics
- translations
- accessibility improvements

We have set up a separate document containing our [contribution guidelines](CONTRIBUTING.md).

---

## Troubleshooting

### Node Version

If you experience dependency issues verify your Node version:

```bash
node -v
```

Recommended:

    Node 18+
