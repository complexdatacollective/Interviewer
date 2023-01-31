/**
 * WEB API (for browser based app)
 * 
 * This will eventually use react query (or similar) for caching and suspenseful data fetching.
 * 
 */


const useApi = () => {
  console.info('using webApi()');
  const getAppVersion = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/version');
      const json = await response.json();
      return json;
    } catch (error) {
      console.warn(error);
      return "error fetching app version";
    }
  };

  const getApiSource = () => 'web';

  return {
    getAppVersion,
    getApiSource,
  };
};

export default useApi;
