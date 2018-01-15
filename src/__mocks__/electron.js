const app = {
  getPath: () => '/Users/Foo/Library/Application Support/Network Canvas',
};

const electron = {
  app,
  remote: { app },
};

module.exports = electron;
