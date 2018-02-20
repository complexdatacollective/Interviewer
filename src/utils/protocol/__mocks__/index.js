const loadProtocol = () => Promise.resolve({ fake: { protocol: { json: true } } });
const importProtocol = () => Promise.resolve('/app/data/protocol/path');
const downloadProtocol = () => Promise.resolve('/downloaded/protocol/to/temp/path');
const loadFactoryProtocol = () =>
  Promise.resolve({ fake: { factory: { protocol: { json: true } } } });

export {
  loadProtocol,
  importProtocol,
  downloadProtocol,
  loadFactoryProtocol,
};
