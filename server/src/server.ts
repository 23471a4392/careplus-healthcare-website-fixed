import http from 'http';
import { app } from './app.js';
import { initSocket } from './realtime/socket.js';
import { CONFIG } from './config.js';

const httpServer = http.createServer(app);

initSocket(httpServer);

httpServer.listen(CONFIG.PORT, '0.0.0.0', () => {
  console.log(`[CarePlus Server] Running at http://localhost:${CONFIG.PORT}`);
  console.log(`[CarePlus Server] WebSocket Gateway active on port ${CONFIG.PORT}`);
});
