# KagazAi 60-Second Interview Demo Script

This script provides an exact 60-second pair-programming and portfolio demo walkthrough designed for Software Development Engineer (SDE) and Full Stack placement interviews.

## Preparation (Before the Interview)

1. Open two browser windows side by side:
   - **Window 1 (Left)**: Chrome signed in as User A (`alice@example.com`).
   - **Window 2 (Right)**: Safari or Chrome Incognito signed in as User B (`bob@example.com`).
2. Have one document opened in both windows:
   - Example document URL: `http://localhost:3000/doc/<documentId>`
3. Set User B's role initially to **Editor**.

---

## 60-Second Walkthrough Breakdown

```
[0:00 - 0:15] Real-Time CRDT Sync & Ephemeral Presence
[0:15 - 0:30] Conflict-Free Concurrent Typing
[0:30 - 0:45] Server-Enforced RBAC & Viewer Read-Only Security
[0:45 - 1:00] Live Version Snapshot & Forward-Delta Restore
```

---

### Step 1: Real-Time CRDT Sync & Live Presence (0:00 - 0:15)

- **Action**: Click into the editor in Window 1 (Alice). Move the mouse cursor around and select a word.
- **Visual in Window 2 (Bob)**: Bob immediately sees Alice's colored cursor with her name badge ("Alice") following her movement, plus her initials in the top-right presence bar.
- **What to say**:
  > "KagazAi is a real-time collaborative document editor. Here on the left is Alice, and on the right is Bob. As Alice moves her cursor, Bob sees her live presence and selection over WebSockets. We derive deterministic colors from the user ID and manage presence using the Yjs awareness protocol, completely separate from document state."

---

### Step 2: Conflict-Free Concurrent Typing (0:15 - 0:30)

- **Action**: Type simultaneously in both windows on the exact same paragraph.
  - In Window 1, Alice types: `"Distributed systems "`
  - In Window 2, Bob types: `"scale horizontally."`
- **Visual in Both Windows**: Both streams of text merge seamlessly into the text flow without cursor jumping or overwrite glitches.
- **What to say**:
  > "Rather than using traditional Operational Transformation with central lock bottlenecks, KagazAi uses Yjs Conflict-Free Replicated Data Types (CRDTs). Edits merge deterministically on both clients using run-length encoded state vectors, guaranteeing convergence even if network packets arrive out of order."

---

### Step 3: Server-Enforced Role Security (0:30 - 0:45)

- **Action**:
  1. In Window 1 (Alice, Owner), click the **Share** button.
  2. Locate Bob in the collaborators list and change his role from **Editor** to **Viewer**.
  3. In Window 2 (Bob), the toolbar immediately updates to show a "Viewing only" badge.
  4. Attempt to type in Window 2 using the keyboard.
- **Visual in Window 2**: No keystrokes appear.
- **What to say**:
  > "Permissions are enforced strictly on the server. The moment Alice changes Bob's role to Viewer, the Hocuspocus WebSocket server flags Bob's socket as read-only. Even if a user attempts to bypass frontend controls via DevTools or a raw socket script, the server silently drops incoming update frames at the protocol boundary."

---

### Step 4: Live Version Snapshot & Forward-Delta Restore (0:45 - 1:00)

- **Action**:
  1. In Window 1, open the **History** drawer.
  2. Click on a previously saved version milestone.
  3. Show the read-only preview of the older text.
  4. Click **Restore version**.
- **Visual in Both Windows**: While both users remain actively connected, the entire document instantly reverts to the older text in a single smooth update.
- **What to say**:
  > "Finally, we maintain version history. When Alice restores an older snapshot, KagazAi does not overwrite database timestamps or disconnect clients. We compute the difference as a forward CRDT delta on the live in-memory Y.Doc. This guarantees that all connected collaborators see the document revert in real time without losing active sessions."

---

## 3 Follow-Up Questions Interviewers Will Ask (and How to Answer)

1. **"What happens when the backend server crashes or needs to scale?"**
   - *Answer*: "We scale horizontally using the Hocuspocus Redis pub/sub extension. Servers publish updates to Redis channels keyed by document ID. Nginx load balances REST requests via `least_conn` and persistent WebSockets via `ip_hash`. If a node crashes, surviving nodes hold the state in Redis and flush debounced buffers to MongoDB with zero data loss."

2. **"Why did you choose CRDTs over Operational Transformation?"**
   - *Answer*: "OT requires an authoritative central server to transform operations against an ordered log. If clients disconnect or the central sequencer lags, transformation becomes computationally expensive. CRDTs are commutative and idempotent: operations can arrive out of order, making offline synchronization and multi-node scaling straightforward."

3. **"How did you verify your performance claims?"**
   - *Answer*: "We wrote a synthetic load test in Grafana k6 testing 100 concurrent clients collaborating on a single document room. Handshake latency had a p95 of 9.00ms, and the system sustained 65 messages per second with 0% socket drops."
