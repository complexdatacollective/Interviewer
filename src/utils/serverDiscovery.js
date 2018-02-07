/* eslint-disable global-require */

import inEnvironment from './Environment';
import environments from './environments';

const serverDiscoverer = inEnvironment((environment) => {
  if (environment === environments.ELECTRON) {
    const diont = window.require('diont')({
      onClose: () => console.log('server discovery socket closed'),
    });

    diont.on('serviceAnnounced', (serviceInfo) => {
      // A service was announced
      // This function triggers for services not yet available in diont.getServiceInfos()
      // serviceInfo is an Object { isOurService : Boolean, service: Object }
      // service.name, service.host and service.port are always filled
      console.log('A new service was announced', serviceInfo.service);
      // List currently known services
      console.log('All known services', diont.getServiceInfos());
    });

    return () => ({
      getServiceInfos: diont.getServiceInfos,
      stopListening: diont.closeSocket,
    });
  }

  if (environment === environments.CORDOVA) {
    return new Promise((resolve) => {
      const diont = window.Diont();

      resolve({
        getServiceInfos: diont.getServiceInfos,
        stopListening: diont.closeSocket,
      });
    });
  }

  return () => Promise.reject('Environment not recognised');
});

export default serverDiscoverer;
