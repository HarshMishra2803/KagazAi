# KagazAi

A real-time collaborative document editor for notes, assignments, and team reports.

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript (strict), Tailwind CSS, TipTap
- **Backend**: Node.js, Express, TypeScript, Hocuspocus (Yjs WebSocket server)
- **Database**: MongoDB Atlas with Mongoose
- **Monorepo**: npm workspaces (`apps/web`, `apps/server`)

## Project Structure

```text
KagazAi/
├── apps/
│   ├── server/       # Express HTTP API & Hocuspocus WebSocket server
│   └── web/          # Next.js frontend application
├── package.json      # Workspace root configuration
└── README.md
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB instance (local or MongoDB Atlas connection URI)

## Getting Started

### 1. Install dependencies

From the repository root:

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` in `apps/server` to `apps/server/.env`:

```bash
cp apps/server/.env.example apps/server/.env
```

Update `apps/server/.env` with your MongoDB connection string if different from the default:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/kagazai
CLIENT_URL=http://localhost:3000
```

Copy `.env.example` in `apps/web` to `apps/web/.env.local`:

```bash
cp apps/web/.env.example apps/web/.env.local
```

### 3. Run development servers

Start both `apps/server` and `apps/web` concurrently with one command from the project root:

```bash
npm run dev
```

- Web application: [http://localhost:3000](http://localhost:3000)
- Server API: [http://localhost:5001](http://localhost:5001)
- Health check: [http://localhost:5001/health](http://localhost:5001/health)

### 4. Build for production

```bash
npm run build
```
