/**
 * ELECTRON API (for desktop app)
 * 
 * This will use electron's ipcRenderer to communicate with the main process.
 * 
 */
console.info('using electronApi()');
const getAppVersion = async () => {
  const response = await window.api.getAppVersion();
  return response;
};

const electronApi = {
  getAppVersion,
  getApiSource: window.api.getApiSource,
};

export default electronApi;
