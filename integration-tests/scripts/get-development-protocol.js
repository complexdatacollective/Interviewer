const getData = require('../getData');
const { developmentProtocol } = require('../config');

const main = () => {
  getData(developmentProtocol).then(([_fullPath]) => {
    process.exit(0);
  });
};

main();
