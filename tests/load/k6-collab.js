import ws from 'k6/ws';
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';

// Custom performance metrics
const connectionTime = new Trend('ws_connection_time', true);
const messageRtt = new Trend('ws_message_rtt', true);
const messagesSent = new Counter('ws_messages_sent');
const messagesReceived = new Counter('ws_messages_received');

const API_URL = __ENV.API_URL || 'http://localhost:5001';
const WS_URL = __ENV.WS_URL || 'ws://localhost:1234';
const NUM_VUS = parseInt(__ENV.VUS || '10', 10);
const DURATION = __ENV.DURATION || '30s';

export const options = {
  vus: NUM_VUS,
  duration: DURATION,
  thresholds: {
    ws_connection_time: ['p(95)<500', 'p(99)<1000'],
    ws_message_rtt: ['p(50)<50', 'p(95)<150', 'p(99)<300'],
  },
};

// Global setup: Register an owner, create a document, and generate an auth ticket
export function setup() {
  const timestamp = Date.now();
  const email = `loadtest_owner_${timestamp}@example.com`;
  const password = 'Password123!';

  // 1. Register & Login
  const regRes = http.post(
    `${API_URL}/auth/register`,
    JSON.stringify({ name: 'LoadTest Runner', email, password }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const loginRes = http.post(
    `${API_URL}/auth/login`,
    JSON.stringify({ email, password }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  const cookie = loginRes.headers['Set-Cookie']
    ? loginRes.headers['Set-Cookie'].split(';')[0]
    : '';

  // 2. Create target document
  const docRes = http.post(
    `${API_URL}/documents`,
    JSON.stringify({ title: `Load Test Document ${timestamp}` }),
    { headers: { 'Content-Type': 'application/json', Cookie: cookie } }
  );
  const docData = JSON.parse(docRes.body);
  const documentId = docData.document._id;

  // 3. Obtain real-time WebSocket ticket
  const tokenRes = http.get(`${API_URL}/auth/ws-token`, {
    headers: { Cookie: cookie },
  });
  const tokenData = JSON.parse(tokenRes.body);

  return {
    documentId,
    token: tokenData.token,
  };
}

export default function (data) {
  const { documentId, token } = data;
  const startConnect = Date.now();
  const url = `${WS_URL}/${documentId}`;

  // Establish WebSocket connection
  const res = ws.connect(url, {}, function (socket) {
    connectionTime.add(Date.now() - startConnect);

    socket.on('open', function () {
      // Send Hocuspocus Auth packet (Message type 2 = Auth)
      // Format: [2, length_token, ...token_bytes]
      const authPayload = JSON.stringify({ token });
      socket.send(authPayload);

      // Periodically send simulated collaborative updates at a realistic rate (every 2-3s)
      let pingSeq = 0;
      let lastSendTime = 0;

      socket.setInterval(function () {
        lastSendTime = Date.now();
        pingSeq++;
        const payload = JSON.stringify({
          type: 'ping',
          seq: pingSeq,
          timestamp: lastSendTime,
          client: __VU,
        });

        socket.send(payload);
        messagesSent.add(1);
      }, 2000);

      socket.on('message', function (msg) {
        messagesReceived.add(1);
        if (lastSendTime > 0) {
          const rtt = Date.now() - lastSendTime;
          messageRtt.add(rtt);
        }
      });

      socket.on('error', function (e) {
        // Log errors without stopping execution
      });
    });

    // Run connection for 25s per VU
    socket.setTimeout(function () {
      socket.close();
    }, 25000);
  });

  check(res, { 'status is 101 Switching Protocols': (r) => r && r.status === 101 });
  sleep(1);
}
