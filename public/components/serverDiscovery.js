/**
 * serverDiscovery.js
 *
 * Main communication functionality between Server and Network Canvas
 * Uses the library "cote" that spins up microservices on the server end
 * for communication and pairing
 */

const diont = require('diont')();

diont.on('serviceAnnounced', (serviceInfo) => {
  // A service was announced
  // This function triggers for services not yet available in diont.getServiceInfos()
  // serviceInfo is an Object { isOurService : Boolean, service: Object }
  // service.name, service.host and service.port are always filled
  console.log('A new service was announced', serviceInfo.service);
  // List currently known services
  console.log('All known services', diont.getServiceInfos());
});

setInterval(() => {
  console.log('All known services', diont.getServiceInfos());
}, 3000);
