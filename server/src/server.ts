import http from 'http';
import { app } from './app.js';
import { initSocket } from './realtime/socket.js';
import { CONFIG } from './config.js';

const httpServer = http.createServer(app);

initSocket(httpServer);

// Main Portal Server on 5000
httpServer.listen(CONFIG.PORT, '0.0.0.0', () => {
  console.log(`[CarePlus Unified Portal] Running at http://localhost:${CONFIG.PORT}`);
  console.log(`  ➜ Patient Portal:       http://localhost:${CONFIG.PORT}/patient`);
  console.log(`  ➜ Doctor Portal:        http://localhost:${CONFIG.PORT}/doctor`);
  console.log(`  ➜ Senior Doctor Portal: http://localhost:${CONFIG.PORT}/senior`);
  console.log(`  ➜ Nurse Portal:         http://localhost:${CONFIG.PORT}/nurse`);
  console.log(`  ➜ Lab Tech Portal:      http://localhost:${CONFIG.PORT}/lab`);
  console.log(`[CarePlus Realtime] WebSocket Gateway active on port ${CONFIG.PORT}`);
});

// Dedicated Local Proxy Ports for 5 Separate Portals
const createPortRedirect = (port: number, targetPath: string, label: string) => {
  const s = http.createServer((req, res) => {
    res.writeHead(302, { Location: `http://localhost:${CONFIG.PORT}${targetPath}` });
    res.end();
  });
  s.listen(port, '0.0.0.0', () => {
    console.log(`[CarePlus ${label}] Dedicated listener on http://localhost:${port}`);
  }).on('error', () => {});
};

createPortRedirect(5001, '/patient', 'Patient Portal');
createPortRedirect(5002, '/doctor', 'Doctor Portal');
createPortRedirect(5003, '/senior', 'Senior Doctor Portal');
createPortRedirect(5004, '/nurse', 'Nurse Portal');
createPortRedirect(5005, '/lab', 'Lab Tech Portal');
