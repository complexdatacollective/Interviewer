const { writeFileSync, readFileSync } = require('fs');
const { resolve } = require('path');
const { networkInterfaces: getNetworkInterfaces } = require('os');

const capacitorConfig = {
  appId: 'org.codaco.NetworkCanvasInterviewer6',
  appName: 'network-canvas-interviewer',
  webDir: 'www',
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

// Use os.networkInterfaces to get the machine's IP address
const networkInterfaces = getNetworkInterfaces()

// Find the non-internal IPv4 address on either en0 or eth0
const ip = Object.values(networkInterfaces)
  .flat()
  .find(({ family, internal }) => family === 'IPv4' && !internal)

const configPath = resolve(__dirname, '../capacitor.config.json')

const arg = process.argv[2]
if (arg === 'dev') {
  capacitorConfig.server = {
    url: `http://${ip.address}:3000`,
    cleartext: true
  }
} else {
  delete capacitorConfig.server
}

writeFileSync(configPath, JSON.stringify(capacitorConfig, null, 2))
