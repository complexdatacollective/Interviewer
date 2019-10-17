const getData = require('../getData');
const { developmentProtocol } = require('../config');

const main = () => {
  console.log(`Fetching ${developmentProtocol}`);

  getData(developmentProtocol)
    .then(([fullPath]) => {
      console.log(`Successfully downloaded to '${fullPath}', or found cached version.`);
      process.exit(0);
    });
};

main();
