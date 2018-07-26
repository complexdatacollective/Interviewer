const loadProtocol = () => Promise.resolve({ fake: { protocol: { json: true } } });
const preloadWorkers = () => Promise.resolve('blob:http://localhost/abc');
const importProtocol = () => Promise.resolve('/app/data/protocol/path');
const downloadProtocol = () => Promise.resolve('/downloaded/protocol/to/temp/path');
const loadFactoryProtocol = () =>
  Promise.resolve({ fake: { factory: { protocol: { json: true } } } });

export {
  loadProtocol,
  preloadWorkers,
  importProtocol,
  downloadProtocol,
  loadFactoryProtocol,
};
