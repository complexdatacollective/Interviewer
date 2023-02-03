const parseProtocol = () => Promise.resolve({ fake: { protocol: { json: true } } });
const preloadWorkers = () => Promise.resolve('blob:http://localhost/abc');
const extractProtocol = () => Promise.resolve('/app/data/protocol/path');
const downloadProtocol = () => Promise.resolve('/downloaded/protocol/to/temp/path');

export {
  parseProtocol,
  preloadWorkers,
  extractProtocol,
  downloadProtocol,
};
