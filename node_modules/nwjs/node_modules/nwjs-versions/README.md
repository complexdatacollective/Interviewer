# nwjs-versions [![NPM version](https://img.shields.io/npm/v/nwjs-versions.svg)](https://npmjs.com/package/nwjs-versions) [![NPM downloads](https://img.shields.io/npm/dm/nwjs-versions.svg)](https://npmjs.com/package/nwjs-versions) [![Build Status](https://img.shields.io/circleci/project/egoist/nwjs-versions/master.svg)](https://circleci.com/gh/egoist/nwjs-versions)

> Get all available nw.js versions.

## Install

```
$ npm install --save nwjs-versions
```

## Usage

```js
const nwjsVersions = require('nwjs-versions')

nwjsVersions()
//=> returns a Promise which resolves array ['0.8.0', '0.8.1', ... '0.12.0', ...]
```

## License

MIT © [EGOIST](https://github.com/egoist)
