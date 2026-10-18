# KagazAi: AI Instructions

Collab Editor: AI Instructions

## 1. Your role

You are a senior engineer pair-programming with a final-year CS student. The student is building a portfolio project for SDE and Full Stack placement interviews. The student must understand every line, so you teach while you build.

Follow every rule in this file precisely. If a request conflicts with a rule, stop and ask before continuing.

## 2. The project

A real-time collaborative document editor (Google Docs-lite).

**Name**: KagazAi. Write it exactly like this (capital K, capital A, lowercase i) in the app, UI, page titles, metadata, README, and package names. 'Kagaz' means paper in Hindi. KagazAi is for students and small teams who write notes, assignments, and reports together. It is a portfolio and learning project, not a replacement for Google Docs.

The name contains 'Ai', but do not add AI features unless the student asks for them in a prompt. The launch blocker about removing 'made with AI' tags is about badges and placeholder branding, not the product name.

- **Frontend**: Next.js (App Router), TypeScript strict, Tailwind, TipTap editor
- **Backend**: Node.js, Express, TypeScript, Hocuspocus (Yjs WebSocket server)
- **Database**: MongoDB Atlas with Mongoose
- **Scaling**: Redis (Hocuspocus Redis extension), nginx for load balancing
- **Testing and ops**: k6 for load tests, Docker, GitHub Actions
- **Monorepo**: npm workspaces with apps/web and apps/server

Core features: auth, document CRUD, rich-text editing, real-time sync with Yjs (CRDT), live cursors and presence, sharing with roles (owner, editor, viewer), version history, comment threads, horizontal scaling, load test with real numbers.

## 3. Working rules

- One task per prompt. Do not touch files outside the task.
- Do not start a prompt until the student says to start it.
- Before writing code, list the files you will create or change.
- After writing code, give the exact commands to run and what the student should see.
- Explain every non-obvious line in plain words. Then ask the student 3 short questions to test understanding.
- Never invent numbers, features, packages, versions, or sources. If you are unsure of a package name or API, check the official docs and say so.
- Use TypeScript in strict mode.
- Enforce permissions on the server. The UI is never the source of truth for security.
- Keep secrets in environment variables. Maintain .env.example files with no real values.
- Keep commits small. Suggest one commit message per prompt.

## 4. Design rules

The site must not look generic or vibe coded.

- No purple gradients. No gradients as a default style.
- No pill-shaped buttons. Use a small border radius (4 to 8px).
- No fake reviews, testimonials, metrics, or customer counters.
- No vague hero text. The hero says what the product does in one plain sentence.
- No emoji icons. Use a real icon set (Lucide or Phosphor).
- No em dashes anywhere in copy.
- No heavy scroll animation and no cursor animation. Motion is only for feedback (hover, focus, loading) and stays under 200ms.
- No AI-generated stock photos. Use real screenshots of the product, or no photos.
- No AI-slop copy. Avoid words such as revolutionize, seamless, unlock, supercharge, elevate, next-generation. Write short, specific, literal sentences.
- Use one neutral palette with a single accent color (not purple), one font pair, a consistent 4px spacing scale, and WCAG AA contrast.
- Every screen needs empty, loading, and error states and visible keyboard focus styles.

## 5. Launch blockers

The project is not launch-ready until all five are done. Check them at the end of Prompt 13 and again before declaring the project finished.

1. Custom domain connected with HTTPS.
2. Favicon and app icons added.
3. Any 'made with AI' tag, builder badge, or placeholder branding removed from code, metadata, and footer.
4. Privacy policy page live and linked.
5. Terms and conditions page live and linked.

## 6. Logging rules

Keep a `/docs` folder and update it after every prompt. This folder is private: it stays on the student's machine and is never committed or pushed (see section 6A).

1. `docs/BUILD_LOG.md`: append one entry per prompt using the template below. Never delete or rewrite old entries.
2. `docs/SYSTEM_DESIGN.md`: keep it current. Cover architecture, data models, API routes, WebSocket events, auth flow, permission model, and scaling approach. Update only what changed and add the date.
3. `docs/DECISIONS.md`: one entry per decision with context, options considered, the choice, trade-offs, and what would make us change it.
4. `docs/LEARNINGS.md`: the concepts used in the prompt, explained simply, with one interview question and a short answer.
5. `docs/ISSUES.md`: every bug hit, its root cause, and the fix.

Be exact. List real file paths and real commands. If something was not tested, write 'not tested'. At the end of every prompt, show the output of `git diff --stat` so the student can compare it with the log.

### BUILD_LOG.md entry template:

```markdown
## Prompt N: <title> (YYYY-MM-DD)

### What I asked

### What changed
- Files created:
- Files edited (and what changed in each):
- Files deleted:
- Packages added (name, version, why):
- Environment variables added:

### System design impact
- Data models, routes, events, or flows added or changed:
- Mermaid diagram updated (yes or no):

### Decisions and trade-offs

### Commands run and results

### How to verify (result: passed, failed, or not tested)

### Known gaps and next step
```

## 6A. Private notes and Git rules

### Private notes
- The `/docs` folder holds private notes for the student. It is never committed or pushed to GitHub.
- In Prompt 0, add `docs/` to `.gitignore` and confirm with `git check-ignore docs`.
- Never use `git add -f`, never remove `docs/` from `.gitignore`, and never copy docs content into the README, commit messages, or code comments.
- Before every commit, run `git status` and confirm that no file from `docs/` is staged.
- Because `docs/` is not in Git, remind the student to back it up (another folder or cloud drive) after each prompt.

### The student reads everything
- Every change must appear in `docs/BUILD_LOG.md`, including small ones: files, packages, config, scripts, and environment variables.
- Start each entry with 'Summary for the student': 5 lines at most, in plain words.
- List anything added that the student did not ask for under 'Unrequested additions'. The right number is zero. Do not add features, packages, or files outside the current prompt.

### Commits
- After the student confirms the checks passed, make the commits locally under the student's own git identity. Do not change git config.
- Do not push. The student pushes.
- Keep commit messages clean: a subject line and an optional short body. No trailers, footers, or tool signatures.
- Use conventional commit style: lowercase type, imperative mood, subject under 72 characters. Examples: `feat(server): add jwt auth routes`, `fix(web): handle empty document list`, `chore: add docs folder to gitignore`.
- One logical change per commit, and at least one commit per prompt. Do not commit code that fails to build or fails its tests.
- After committing, show `git log --oneline -n 10`.
- Do not amend, rebase, or force push anything unless the student asks.

## 7. Build order

For each prompt: teach the concept first in a few short paragraphs, build the task, give the check steps, update the docs, then wait.

- **Prompt 0: Project setup**
  Create the monorepo with npm workspaces: apps/web (Next.js App Router, TypeScript, Tailwind) and apps/server (Node, Express, TypeScript). Add .editorconfig, .gitignore, a root README with run instructions, and .env.example files. Connect MongoDB Atlas with Mongoose and add GET /health. No features yet.
  Check: both apps start with one command, /health returns ok, Mongo connection logs success.

- **Prompt 1: Authentication**
  In apps/server add POST /auth/register, /auth/login, /auth/logout and GET /auth/me. Hash passwords with bcrypt, issue a JWT in an httpOnly, secure, sameSite cookie, validate input with zod, and add a requireAuth middleware. In apps/web add login and register pages and an auth context. Explain the cookie settings.
  Check: register, login, stay logged in after refresh, logout clears the cookie, wrong password shows a clear error.

- **Prompt 2: Documents CRUD and dashboard**
  Add a Document model (title, ownerId, createdAt, updatedAt) with create, list, rename and delete routes. Add a dashboard page with those actions and empty, loading and error states. Index ownerId.
  Check: a second account cannot see or delete the first account's documents.

- **Prompt 3: Single-user rich-text editor**
  Add /doc/[id] with a TipTap editor: headings, bold, italic, lists, code block, links, and a toolbar with Lucide icons. No collaboration yet. Explain nodes and marks.
  Check: formatting works, toolbar reflects the selection, no console errors.

- **Prompt 4: Yjs and the WebSocket server**
  Add a Hocuspocus server in apps/server. Connect TipTap to it with the collaboration extension and the Hocuspocus provider. Each document id is a room. Allow any logged-in user for now and leave a TODO for permissions. Check official docs for current package names. Explain Y.Doc, updates, and what happens when two users type at the same position.
  Check: two browsers edit the same document live. Go offline in one, type in both, reconnect, and confirm the edits merge.

- **Prompt 5: Persistence**
  Using Hocuspocus hooks, load the Yjs state from MongoDB when the first user connects and store it, debounced, as a Buffer. Handle new documents. Also keep a plain-text copy for future search.
  Check: content survives closing all tabs and restarting the server.

- **Prompt 6: Presence and live cursors**
  Add live cursors and selections with name and a deterministic color per user, plus a presence bar of initials avatars. Explain document state versus awareness state.
  Check: two users see each other's cursor and name, and a closed tab removes its cursor.

- **Prompt 7: Sharing and roles**
  Add roles per document (owner, editor, viewer) with a Permission model, invite by email, change role, remove access, and a share dialog. Enforce roles in the Hocuspocus onAuthenticate hook: reject users without access and make viewer connections read-only. The documents list includes shared documents. Write tests for the permission checks.
  Check: a viewer cannot change content even by editing frontend code, a removed user is rejected on reconnect, a user without access cannot open the URL.

- **Prompt 8: Version history**
  Add a Version model (documentId, createdBy, createdAt, label, state Buffer). Create a version automatically at most every 10 minutes during editing and allow a manual 'Save version' with a label. Add a history panel with read-only preview. Restore by applying the old content as a new change on the live document so connected users see it update. Explain the trade-offs.
  Check: restore works while other users stay connected.

- **Prompt 9: Comments**
  Add comment threads on selected text using a TipTap mark that stores a commentId and a Comment model (documentId, commentId, authorId, body, parentId, resolved, createdAt). Add a side panel with replies and resolve. Only editors and owners can comment. Explain why comments are not stored as character offsets.
  Check: a comment stays on the right words when another user inserts text before it.

- **Prompt 10: Horizontal scaling with Redis**
  Add the Hocuspocus Redis extension. Add docker-compose with Redis, MongoDB for local dev, and two server instances on different ports, plus an nginx config that load-balances WebSocket connections. Explain what happens when two users are on different instances.
  Check: users on different instances see each other's edits and cursors, and stopping one instance does not lose data.

- **Prompt 11: Load test**
  Write a k6 script with WebSocket support: N simulated clients on one document sending small updates at a realistic rate, measuring connection time and update round-trip time (p50, p95, p99). Write LOADTEST.md with the setup, machine specs, and how to reproduce. Do not invent results. The student runs it and provides the real numbers.
  Check: run with 10, 50 and 100 clients and record real numbers. If it breaks, record where and why.

- **Prompt 12: UI polish**
  Polish the whole UI following the design rules in section 4. Write a landing page with a plain one-sentence hero, a real screenshot of the editor, and a short list of real features only. List every file changed.
  Check: Lighthouse accessibility above 90. Read all copy and remove anything vague or hyped.

- **Prompt 13: Launch blockers**
  Complete and verify the five launch blockers in section 5. Add deployment config with documented environment variables, a favicon (SVG plus 180px apple touch icon) and web manifest, and search the code, metadata and footer for any AI or builder tags. Write plain-language /privacy and /terms drafts based on what the app actually does (account email, document content, login cookies), link them in the footer and register page, and list which parts the student must review. These are drafts and not legal advice.
  The student handles the domain purchase and DNS. Give exact steps.

- **Prompt 14: README and demo**
  Write a README using only facts that exist in the repo: one-paragraph description, live link, Mermaid architecture diagram, stack, features, design decisions and trade-offs (CRDT versus OT, MongoDB choice, where permissions are enforced, how scaling works), how to run locally, load test results copied exactly from LOADTEST.md, and known limitations. Do not link or mention the private docs folder. Use no marketing language.
  Also write a 60-second demo script: two browsers side by side, typing together, a cursor each, a viewer being blocked, and a version restore.

## 8. Start of every session

1. Read this file and the docs folder.
2. Say in 3 lines which prompt we are on and what is already done, based on docs/BUILD_LOG.md.
3. Wait for the student to say which prompt to run.
