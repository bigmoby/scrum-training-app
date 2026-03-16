# 🛠 Developer Documentation

This document contains technical documentation for developers and
contributors.

## 🚀 Quick Start

Clone the repository and start the development server.

``` bash
git clone https://github.com/bigmoby/scrum-training-app.git
cd scrum-training-app
npm install
npm run dev
```

Open the application:

http://localhost:3000

## Requirements

The project requires:

-   Node.js **18+**
-   npm **9+**

## Installation

Install project dependencies:

``` bash
npm install
```

Run the development server:

``` bash
npm run dev
```

## Environment Variables

Create a `.env` file in the project root.

Example:

``` env
DATABASE_URL="file:./dev.db"

SMTP_HOST=smtp.example.com
SMTP_USER=your_user
SMTP_PASS=your_password
```

## Database Setup

The project uses **Prisma** with a local **SQLite database**.

Initialize the database:

``` bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

## 🔐 Admin Access

After running the seed command (`npx prisma db seed`), a default admin team is created with the following credentials:

- **Team Name:** Admin Team
- **Email:** admin@scrumtrainingapp.com
- **Password:** admin123

You can use these credentials to log in and access the Admin Panel at `/admin`.

## Running the Project

Start the development server:

``` bash
npm run dev
```

The application will usually run at:

http://localhost:3000

## Production Build

Create a production build:

``` bash
npm run build
```

The compiled application will be generated in the:

    dist/

directory.

Preview the production build locally:

``` bash
npm run preview
```

## Email Configuration (Production)

In development the application may use **Ethereal email** for testing.

To send real emails configure a real SMTP provider (e.g. Gmail,
SendGrid, Amazon SES).

### Files to modify

    src/app/api/auth/signup/route.ts
    src/app/api/auth/forgot-password/route.ts

Locate the transport configuration:

``` javascript
nodemailer.createTransport({...})
```

Replace with environment variables:

``` javascript
host: process.env.SMTP_HOST,
auth: {
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS
}
```

Save the credentials in the `.env` file.

## Database Management

### Open Prisma Studio

``` bash
npx prisma studio
```

Open:

http://localhost:5555

### Reset Database

``` bash
npx prisma migrate reset
```

⚠️ Warning: this command deletes the entire database.

## Deployment

The application can be deployed to:

-   Vercel
-   Netlify
-   Cloudflare Pages
-   GitHub Pages

Typical workflow:

``` bash
npm run build
```

Deploy the `dist/` folder.

## AI-Agent Integration

The repository includes an **AGENTS.md** file that helps AI coding
assistants understand the project.

It describes:

-   architecture
-   coding conventions
-   project intent
-   contribution rules

Compatible tools include:

-   Cursor
-   GitHub Copilot
-   Claude Code
-   AI development agents

## Contributing

1.  Fork the repository
2.  Create a feature branch
3.  Implement your changes
4.  Submit a pull request

Example:

``` bash
git checkout -b feature/new-case
```

Possible contributions:

-   new investigation cases
-   UI improvements
-   gameplay mechanics
-   translations
-   accessibility improvements

  We have set up a separate document containing our [contribution guidelines](CONTRIBUTING.md).

## Troubleshooting

### Node Version

Check your Node version:

``` bash
node -v
```

Recommended:

    Node 18+

## Support

If you encounter problems or want to discuss improvements, open an issue
in the repository.
