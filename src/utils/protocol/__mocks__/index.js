const loadProtocol = () => Promise.resolve({ fake: { protocol: { json: true } } });
const loadWorker = () => Promise.resolve('blob:http://localhost/abc');
const importProtocol = () => Promise.resolve('/app/data/protocol/path');
const downloadProtocol = () => Promise.resolve('/downloaded/protocol/to/temp/path');
const loadFactoryProtocol = () =>
  Promise.resolve({ fake: { factory: { protocol: { json: true } } } });

export {
  loadProtocol,
  loadWorker,
  importProtocol,
  downloadProtocol,
  loadFactoryProtocol,
};
