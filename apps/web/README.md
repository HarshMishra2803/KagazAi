# KagazAi Web Client (`@kagazai/web`)

Next.js App Router frontend for KagazAi, a real-time collaborative document editor.

## Architecture

- **Framework**: Next.js 16 (App Router, React 19, TypeScript strict mode)
- **Editor**: TipTap with StarterKit, Link, and Collaboration extensions
- **Real-time Sync**: Yjs CRDT via `@hocuspocus/provider` WebSocket transport
- **Presence**: Awareness protocol with deterministic color hashing and initials avatars
- **Comments**: Inline TipTap marks (`CommentMark`) with threaded discussion panel
- **Styling**: Tailwind CSS with custom neutral palette, 4px to 8px border radius, and WCAG AA contrast

## Routes

- `/`: Landing page with live editor preview, feature matrix, and architecture summary
- `/login`: User authentication with httpOnly cookie session
- `/register`: Account registration with password hashing and terms acceptance
- `/dashboard`: Document management (create, rename, delete, open)
- `/doc/[id]`: Real-time collaborative editor with toolbar, sharing modal, version history, and comments
- `/privacy`: Data collection and privacy policy
- `/terms`: Terms of service and intellectual property disclaimer

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_WS_URL=ws://localhost:1234
```

## Scripts

```bash
# Run local dev server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint check
npm run lint
```
