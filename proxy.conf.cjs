const { execSync } = require('node:child_process');
const os = require('node:os');

// Sous WSL2 (mode NAT), le backend Windows n'est pas joignable via `localhost`
// depuis WSL : il l'est via la passerelle par défaut (IP variable, résolue ici).
// Ailleurs (ou en cas d'échec), on retombe sur `localhost`.
function backendHost() {
  if (!os.release().toLowerCase().includes('microsoft')) return 'localhost';
  try {
    return execSync("ip route show default | awk '{print $3}'").toString().trim() || 'localhost';
  } catch {
    return 'localhost';
  }
}

module.exports = {
  '/api': {
    target: `http://${backendHost()}:8080`,
    changeOrigin: true,
    rewrite: path => path.replace(/^\/api/, ''),
  },
};
