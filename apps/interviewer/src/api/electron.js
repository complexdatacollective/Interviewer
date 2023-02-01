/**
 * ELECTRON API (for desktop app)
 * 
 * This will use electron's ipcRenderer to communicate with the main process.
 * 
 */
const useApi = () => {
  console.info('using electronApi()');

  return {
    getAppVersion: window.api.getAppVersion,
    getApiSource: window.api.getApiSource,
  };
}

export default useApi;
